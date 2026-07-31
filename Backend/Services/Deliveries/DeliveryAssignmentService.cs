using Backend.Contracts.Deliveries;
using Backend.Contracts.Routing;
using Backend.Data;
using Backend.Middleware.Exceptions;
using Backend.Models;
using Backend.Services.Routing;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.Deliveries;

public sealed class DeliveryAssignmentService(
    AppDbContext database,
    IRoutingService routingService,
    TimeProvider timeProvider,
    ITrackingNotifier trackingNotifier
) : IDeliveryAssignmentService
{
    private static readonly DeliveryAssignmentStatus[] ActiveStatuses =
    [
        DeliveryAssignmentStatus.Assigned,
        DeliveryAssignmentStatus.Accepted,
        DeliveryAssignmentStatus.HeadingToStore,
        DeliveryAssignmentStatus.PickedUp,
        DeliveryAssignmentStatus.OutForDelivery
    ];

    public async Task<IReadOnlyCollection<AvailableDeliveryResponse>>
        GetAvailableAsync(
            Guid userId,
            CancellationToken cancellationToken
        )
    {
        var driver = await FindDriverAsync(
            userId,
            asTracking: false,
            cancellationToken
        );
        EnsureCanReceiveDeliveries(driver);
        var driverPoint = GetDriverPoint(driver);

        var orders = await database.Orders
            .AsNoTracking()
            .Include(order => order.Store)
            .Include(order => order.Customer)
            .Include(order => order.Items)
            .Include(order => order.DeliveryAssignments)
            .Where(order =>
                order.Status == OrderStatus.ReadyForPickup
                && order.Store.IsActive
                && order.Store.IsOpen
                && order.Store.Latitude != null
                && order.Store.Longitude != null
                && order.DeliveryLatitude != null
                && order.DeliveryLongitude != null
                && !order.DeliveryAssignments.Any(assignment =>
                    assignment.DriverProfileId == driver.Id
                    && assignment.Status == DeliveryAssignmentStatus.Rejected
                )
            )
            .OrderBy(order => order.CreatedAt)
            .Take(30)
            .ToListAsync(cancellationToken);

        var candidates = orders
            .Where(order => !order.DeliveryAssignments.Any(
                assignment => ActiveStatuses.Contains(assignment.Status)
            ))
            .Select(order =>
            {
                var pickup = GetStorePoint(order);
                var dropoff = GetDropoffPoint(order);
                var distanceToPickup = OsrmRoutingService.HaversineMeters(
                    driverPoint,
                    pickup
                );
                var deliveryDistance = OsrmRoutingService.HaversineMeters(
                    pickup,
                    dropoff
                );
                var totalDistance = distanceToPickup + deliveryDistance;
                var earnings = EstimateEarnings(order, totalDistance);
                var efficiencyScore =
                    totalDistance / Math.Max((double)earnings, 1d);

                return new
                {
                    Order = order,
                    DistanceToPickup = distanceToPickup,
                    TotalDistance = totalDistance,
                    Earnings = earnings,
                    EfficiencyScore = efficiencyScore
                };
            })
            .OrderBy(candidate => candidate.EfficiencyScore)
            .ThenBy(candidate => candidate.DistanceToPickup)
            .Take(12)
            .ToArray();

        return candidates
            .Select((candidate, index) => new AvailableDeliveryResponse(
                candidate.Order.Id,
                candidate.Order.OrderNumber,
                ToPickup(candidate.Order),
                ToDropoff(candidate.Order),
                candidate.Order.Items.Count,
                candidate.Earnings,
                candidate.DistanceToPickup,
                candidate.TotalDistance,
                EstimatedMinutes(candidate.TotalDistance),
                candidate.EfficiencyScore,
                IsRecommended: index == 0
            ))
            .ToArray();
    }

    public async Task<ActiveDeliveryResponse> AcceptAsync(
        Guid userId,
        Guid orderId,
        CancellationToken cancellationToken
    )
    {
        var driver = await FindDriverAsync(
            userId,
            asTracking: true,
            cancellationToken
        );
        EnsureCanReceiveDeliveries(driver);
        _ = GetDriverPoint(driver);

        if (await database.DeliveryAssignments.AnyAsync(
            assignment =>
                assignment.DriverProfileId == driver.Id
                && ActiveStatuses.Contains(assignment.Status),
            cancellationToken
        ))
        {
            throw new ConflictApiException(
                "Ya tienes una entrega activa.",
                "driver_active_delivery_exists"
            );
        }

        var order = await OrdersWithDetails(asTracking: true)
            .SingleOrDefaultAsync(
                entity => entity.Id == orderId,
                cancellationToken
            ) ?? throw new NotFoundApiException(
                "No se encontró el pedido solicitado."
            );

        EnsureOrderCanBeAccepted(order);
        var distance =
            OsrmRoutingService.HaversineMeters(
                GetDriverPoint(driver),
                GetStorePoint(order)
            )
            + OsrmRoutingService.HaversineMeters(
                GetStorePoint(order),
                GetDropoffPoint(order)
            );
        var utcNow = timeProvider.GetUtcNow().UtcDateTime;
        var assignment = new DeliveryAssignment
        {
            OrderId = order.Id,
            Order = order,
            DriverProfileId = driver.Id,
            DriverProfile = driver,
            Status = DeliveryAssignmentStatus.Accepted,
            DriverEarnings = EstimateEarnings(order, distance),
            AssignedAt = utcNow,
            AcceptedAt = utcNow
        };

        database.DeliveryAssignments.Add(assignment);
        driver.AvailabilityStatus = DriverAvailabilityStatus.OnDelivery;
        driver.UpdatedAt = utcNow;

        try
        {
            await database.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            throw new ConflictApiException(
                "La entrega ya fue tomada por otro repartidor.",
                "delivery_already_assigned"
            );
        }

        await trackingNotifier.NotifyOrderUpdatedAsync(
            order.Id,
            "delivery_accepted",
            cancellationToken
        );

        return await ToActiveResponseAsync(
            assignment,
            cancellationToken
        );
    }

    public async Task<ActiveDeliveryResponse> GetActiveAsync(
        Guid userId,
        CancellationToken cancellationToken
    )
    {
        var assignment = await FindActiveAssignmentAsync(
            userId,
            asTracking: false,
            cancellationToken
        );
        return await ToActiveResponseAsync(
            assignment,
            cancellationToken
        );
    }

    public async Task RejectAsync(
        Guid userId,
        Guid orderId,
        RejectDeliveryRequest request,
        CancellationToken cancellationToken
    )
    {
        var driver = await FindDriverAsync(
            userId,
            asTracking: true,
            cancellationToken
        );
        EnsureCanReceiveDeliveries(driver);
        var order = await database.Orders
            .Include(entity => entity.DeliveryAssignments)
            .SingleOrDefaultAsync(
                entity => entity.Id == orderId,
                cancellationToken
            ) ?? throw new NotFoundApiException(
                "No se encontró el pedido solicitado."
            );

        if (order.Status != OrderStatus.ReadyForPickup)
        {
            throw new ConflictApiException(
                "El pedido ya no está disponible para reparto.",
                "delivery_not_available"
            );
        }

        if (order.DeliveryAssignments.Any(assignment =>
            assignment.DriverProfileId == driver.Id
            && assignment.Status == DeliveryAssignmentStatus.Rejected
        ))
        {
            return;
        }

        var utcNow = timeProvider.GetUtcNow().UtcDateTime;
        database.DeliveryAssignments.Add(new DeliveryAssignment
        {
            OrderId = order.Id,
            Order = order,
            DriverProfileId = driver.Id,
            DriverProfile = driver,
            Status = DeliveryAssignmentStatus.Rejected,
            DriverEarnings = 0m,
            RejectionReason = Normalize(request.Reason),
            AssignedAt = utcNow,
            RejectedAt = utcNow
        });
        await database.SaveChangesAsync(cancellationToken);
    }

    public async Task<ActiveDeliveryResponse> AdvanceAsync(
        Guid userId,
        Guid assignmentId,
        AdvanceDeliveryRequest request,
        CancellationToken cancellationToken
    )
    {
        var assignment = await FindActiveAssignmentAsync(
            userId,
            asTracking: true,
            cancellationToken
        );

        if (assignment.Id != assignmentId)
        {
            throw new NotFoundApiException(
                "No se encontró la entrega activa solicitada."
            );
        }

        var expectedStatus = assignment.Status switch
        {
            DeliveryAssignmentStatus.Accepted =>
                DeliveryAssignmentStatus.HeadingToStore,
            DeliveryAssignmentStatus.HeadingToStore =>
                DeliveryAssignmentStatus.PickedUp,
            DeliveryAssignmentStatus.PickedUp =>
                DeliveryAssignmentStatus.OutForDelivery,
            DeliveryAssignmentStatus.OutForDelivery =>
                DeliveryAssignmentStatus.Delivered,
            _ => throw new ConflictApiException(
                "La entrega no admite otro cambio de estado.",
                "delivery_transition_not_available"
            )
        };

        if (request.Status != expectedStatus)
        {
            throw new BadRequestApiException(
                $"El siguiente estado válido es {expectedStatus}.",
                "invalid_delivery_transition"
            );
        }

        var utcNow = timeProvider.GetUtcNow().UtcDateTime;
        assignment.Status = request.Status;
        assignment.DriverNotes = Normalize(request.DriverNotes);

        switch (request.Status)
        {
            case DeliveryAssignmentStatus.PickedUp:
                assignment.PickedUpAt = utcNow;
                assignment.Order.Status = OrderStatus.OutForDelivery;
                assignment.Order.UpdatedAt = utcNow;
                database.OrderStatusHistory.Add(new OrderStatusHistory
                {
                    OrderId = assignment.OrderId,
                    Status = OrderStatus.OutForDelivery,
                    ChangedByUserId = userId,
                    ChangedByRole = "Driver",
                    Note = "El repartidor recogió el pedido.",
                    CreatedAt = utcNow
                });
                break;
            case DeliveryAssignmentStatus.Delivered:
                assignment.DeliveredAt = utcNow;
                assignment.Order.Status = OrderStatus.Delivered;
                assignment.Order.DeliveredAt = utcNow;
                assignment.Order.UpdatedAt = utcNow;
                database.OrderStatusHistory.Add(new OrderStatusHistory
                {
                    OrderId = assignment.OrderId,
                    Status = OrderStatus.Delivered,
                    ChangedByUserId = userId,
                    ChangedByRole = "Driver",
                    Note = "Pedido entregado al cliente.",
                    CreatedAt = utcNow
                });
                assignment.DriverProfile.AvailabilityStatus =
                    DriverAvailabilityStatus.Available;
                assignment.DriverProfile.UpdatedAt = utcNow;
                break;
        }

        await database.SaveChangesAsync(cancellationToken);
        await trackingNotifier.NotifyOrderUpdatedAsync(
            assignment.OrderId,
            $"delivery_{request.Status.ToString().ToLowerInvariant()}",
            cancellationToken
        );
        return await ToActiveResponseAsync(
            assignment,
            cancellationToken
        );
    }

    public async Task<IReadOnlyCollection<DeliveryHistoryResponse>>
        GetHistoryAsync(
            Guid userId,
            CancellationToken cancellationToken
        )
    {
        var driver = await FindDriverAsync(
            userId,
            asTracking: false,
            cancellationToken
        );
        var assignments = await OrdersForAssignments(asTracking: false)
            .Where(assignment =>
                assignment.DriverProfileId == driver.Id
                && assignment.Status == DeliveryAssignmentStatus.Delivered
                && assignment.DeliveredAt != null
            )
            .OrderByDescending(assignment => assignment.DeliveredAt)
            .Take(100)
            .ToListAsync(cancellationToken);

        return assignments.Select(assignment =>
        {
            var distance = OsrmRoutingService.HaversineMeters(
                GetStorePoint(assignment.Order),
                GetDropoffPoint(assignment.Order)
            );
            return new DeliveryHistoryResponse(
                assignment.Id,
                assignment.OrderId,
                assignment.Order.OrderNumber,
                assignment.Order.Store.Name,
                CustomerName(assignment.Order),
                distance,
                assignment.DriverEarnings,
                CustomerRating: null,
                assignment.DeliveredAt!.Value
            );
        }).ToArray();
    }

    private async Task<ActiveDeliveryResponse> ToActiveResponseAsync(
        DeliveryAssignment assignment,
        CancellationToken cancellationToken
    )
    {
        var points = new List<RoutePointResponse>();
        var driverPoint = GetDriverPoint(assignment.DriverProfile);
        points.Add(driverPoint);

        if (
            assignment.Status
                is DeliveryAssignmentStatus.Accepted
                or DeliveryAssignmentStatus.HeadingToStore
        )
        {
            points.Add(GetStorePoint(assignment.Order));
        }

        points.Add(GetDropoffPoint(assignment.Order));
        var route = await routingService.CalculateAsync(
            points,
            VehicleProfile(assignment.DriverProfile.VehicleType),
            cancellationToken
        );

        return new ActiveDeliveryResponse(
            assignment.Id,
            assignment.OrderId,
            assignment.Order.OrderNumber,
            assignment.Status,
            ToPickup(assignment.Order),
            ToDropoff(assignment.Order),
            assignment.Order.Items.Count,
            assignment.DriverEarnings,
            assignment.AssignedAt,
            assignment.AcceptedAt,
            route
        );
    }

    private async Task<DriverProfile> FindDriverAsync(
        Guid userId,
        bool asTracking,
        CancellationToken cancellationToken
    )
    {
        var query = database.DriverProfiles
            .Include(profile => profile.User)
            .Where(profile => profile.UserId == userId && profile.IsActive);

        if (!asTracking)
        {
            query = query.AsNoTracking();
        }

        return await query.SingleOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundApiException(
                "No se encontró el perfil de repartidor."
            );
    }

    private async Task<DeliveryAssignment> FindActiveAssignmentAsync(
        Guid userId,
        bool asTracking,
        CancellationToken cancellationToken
    )
    {
        var query = OrdersForAssignments(asTracking)
            .Where(assignment =>
                assignment.DriverProfile.UserId == userId
                && ActiveStatuses.Contains(assignment.Status)
            );

        return await query.SingleOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundApiException(
                "No tienes una entrega activa."
            );
    }

    private IQueryable<Order> OrdersWithDetails(bool asTracking)
    {
        var query = database.Orders
            .Include(order => order.Store)
            .Include(order => order.Customer)
            .Include(order => order.Items)
            .Include(order => order.DeliveryAssignments);

        return asTracking ? query : query.AsNoTracking();
    }

    private IQueryable<DeliveryAssignment> OrdersForAssignments(
        bool asTracking
    )
    {
        var query = database.DeliveryAssignments
            .Include(assignment => assignment.DriverProfile)
                .ThenInclude(profile => profile.User)
            .Include(assignment => assignment.Order)
                .ThenInclude(order => order.Store)
            .Include(assignment => assignment.Order)
                .ThenInclude(order => order.Customer)
            .Include(assignment => assignment.Order)
                .ThenInclude(order => order.Items);

        return asTracking ? query : query.AsNoTracking();
    }

    private static void EnsureCanReceiveDeliveries(DriverProfile driver)
    {
        if (driver.ApprovalStatus != DriverApprovalStatus.Approved)
        {
            throw new ConflictApiException(
                "El perfil todavía no está aprobado.",
                "driver_not_approved"
            );
        }

        if (driver.AvailabilityStatus != DriverAvailabilityStatus.Available)
        {
            throw new ConflictApiException(
                "Activa tu disponibilidad antes de consultar entregas.",
                "driver_not_available"
            );
        }
    }

    private static void EnsureOrderCanBeAccepted(Order order)
    {
        if (
            order.Status != OrderStatus.ReadyForPickup
            || order.DeliveryAssignments.Any(assignment =>
                ActiveStatuses.Contains(assignment.Status)
            )
        )
        {
            throw new ConflictApiException(
                "La entrega ya no está disponible.",
                "delivery_not_available"
            );
        }

        _ = GetStorePoint(order);
        _ = GetDropoffPoint(order);
    }

    private static RoutePointResponse GetDriverPoint(DriverProfile driver)
    {
        if (
            driver.CurrentLatitude is null
            || driver.CurrentLongitude is null
        )
        {
            throw new ConflictApiException(
                "Comparte tu ubicación antes de recibir entregas.",
                "driver_location_required"
            );
        }

        return new RoutePointResponse(
            driver.CurrentLatitude.Value,
            driver.CurrentLongitude.Value
        );
    }

    private static RoutePointResponse GetStorePoint(Order order)
    {
        if (
            order.Store.Latitude is null
            || order.Store.Longitude is null
        )
        {
            throw new ConflictApiException(
                "El comercio no tiene una ubicación geográfica válida.",
                "store_location_required"
            );
        }

        return new RoutePointResponse(
            order.Store.Latitude.Value,
            order.Store.Longitude.Value
        );
    }

    private static RoutePointResponse GetDropoffPoint(Order order)
    {
        if (
            order.DeliveryLatitude is null
            || order.DeliveryLongitude is null
        )
        {
            throw new ConflictApiException(
                "La entrega no tiene una ubicación geográfica válida.",
                "delivery_location_required"
            );
        }

        return new RoutePointResponse(
            order.DeliveryLatitude.Value,
            order.DeliveryLongitude.Value
        );
    }

    private static DeliveryStopResponse ToPickup(Order order) =>
        new(
            order.Store.Name,
            order.Store.PhoneNumber,
            JoinAddress(
                order.Store.Street,
                order.Store.ExteriorNumber,
                order.Store.InteriorNumber,
                order.Store.Neighborhood,
                order.Store.City,
                order.Store.State
            ),
            order.Store.Latitude!.Value,
            order.Store.Longitude!.Value
        );

    private static DeliveryStopResponse ToDropoff(Order order) =>
        new(
            CustomerName(order),
            order.DeliveryPhoneNumber,
            JoinAddress(
                order.DeliveryStreet,
                order.DeliveryExteriorNumber,
                order.DeliveryInteriorNumber,
                order.DeliveryNeighborhood,
                order.DeliveryCity,
                order.DeliveryState
            ),
            order.DeliveryLatitude!.Value,
            order.DeliveryLongitude!.Value
        );

    private static decimal EstimateEarnings(
        Order order,
        double totalDistanceMeters
    )
    {
        var distanceComponent = (decimal)(totalDistanceMeters / 1000d) * 4m;
        return decimal.Round(
            Math.Max(30m, order.DeliveryFee * 0.8m + distanceComponent),
            2
        );
    }

    private static int EstimatedMinutes(double distanceMeters) =>
        Math.Max(5, (int)Math.Ceiling(distanceMeters / 350d));

    private static string CustomerName(Order order) =>
        string.IsNullOrWhiteSpace(order.DeliveryRecipientName)
            ? $"{order.Customer.FirstName} {order.Customer.LastName}".Trim()
            : order.DeliveryRecipientName;

    private static string JoinAddress(
        string street,
        string exteriorNumber,
        string? interiorNumber,
        string neighborhood,
        string city,
        string state
    ) =>
        string.Join(
            ", ",
            new[]
            {
                $"{street} #{exteriorNumber}"
                    + (string.IsNullOrWhiteSpace(interiorNumber)
                        ? string.Empty
                        : $" Int. {interiorNumber}"),
                neighborhood,
                city,
                state
            }
            .Where(value => !string.IsNullOrWhiteSpace(value))
        );

    private static string VehicleProfile(VehicleType vehicleType) =>
        vehicleType == VehicleType.Bicycle ? "cycling" : "driving";

    private static string? Normalize(string? value)
    {
        var normalized = value?.Trim();
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }
}
