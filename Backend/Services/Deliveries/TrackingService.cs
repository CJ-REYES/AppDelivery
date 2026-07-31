using Backend.Contracts.Deliveries;
using Backend.Contracts.Routing;
using Backend.Data;
using Backend.Middleware.Exceptions;
using Backend.Models;
using Backend.Services.Routing;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.Deliveries;

public sealed class TrackingService(
    AppDbContext database,
    IRoutingService routingService
) : ITrackingService
{
    public async Task<OrderTrackingResponse> GetAsync(
        Guid userId,
        Guid orderId,
        bool isAdmin,
        CancellationToken cancellationToken
    )
    {
        var order = await database.Orders
            .AsNoTracking()
            .Include(entity => entity.Customer)
            .Include(entity => entity.Store)
            .Include(entity => entity.DeliveryAssignments)
                .ThenInclude(assignment => assignment.DriverProfile)
                    .ThenInclude(profile => profile.User)
            .SingleOrDefaultAsync(
                entity => entity.Id == orderId,
                cancellationToken
            ) ?? throw new NotFoundApiException(
                "No se encontró el pedido solicitado."
            );
        var assignment = order.DeliveryAssignments
            .OrderByDescending(entity => entity.AssignedAt)
            .FirstOrDefault(entity =>
                entity.Status != DeliveryAssignmentStatus.Rejected
                && entity.Status != DeliveryAssignmentStatus.Cancelled
            );
        var canRead =
            isAdmin
            || order.CustomerId == userId
            || order.Store.OwnerId == userId
            || assignment?.DriverProfile.UserId == userId;

        if (!canRead)
        {
            throw new NotFoundApiException(
                "No se encontró el pedido solicitado."
            );
        }

        var pickup = ToPickup(order);
        var dropoff = ToDropoff(order);
        var points = BuildRoutePoints(order, assignment);
        var route = await routingService.CalculateAsync(
            points,
            assignment?.DriverProfile.VehicleType == VehicleType.Bicycle
                ? "cycling"
                : "driving",
            cancellationToken
        );

        return new OrderTrackingResponse(
            order.Id,
            order.OrderNumber,
            order.Status,
            assignment?.Status,
            pickup,
            dropoff,
            assignment is null
                ? null
                : $"{assignment.DriverProfile.User.FirstName} "
                    + assignment.DriverProfile.User.LastName,
            assignment?.DriverProfile.User.PhoneNumber,
            assignment?.DriverProfile.CurrentLatitude,
            assignment?.DriverProfile.CurrentLongitude,
            assignment?.DriverProfile.LocationUpdatedAt,
            route
        );
    }

    private static IReadOnlyCollection<RoutePointResponse> BuildRoutePoints(
        Order order,
        DeliveryAssignment? assignment
    )
    {
        var pickup = StorePoint(order);
        var dropoff = DropoffPoint(order);

        if (
            assignment is null
            || assignment.DriverProfile.CurrentLatitude
                is not decimal latitude
            || assignment.DriverProfile.CurrentLongitude
                is not decimal longitude
        )
        {
            return [pickup, dropoff];
        }

        var driver = new RoutePointResponse(latitude, longitude);

        return (
            assignment.Status is DeliveryAssignmentStatus.PickedUp
                or DeliveryAssignmentStatus.OutForDelivery
                or DeliveryAssignmentStatus.Delivered
        )
            ? [driver, dropoff]
            : [driver, pickup, dropoff];
    }

    private static DeliveryStopResponse ToPickup(Order order)
    {
        var point = StorePoint(order);
        return new DeliveryStopResponse(
            order.Store.Name,
            order.Store.PhoneNumber,
            $"{order.Store.Street} #{order.Store.ExteriorNumber}, "
                + $"{order.Store.Neighborhood}, {order.Store.City}",
            point.Latitude,
            point.Longitude
        );
    }

    private static DeliveryStopResponse ToDropoff(Order order)
    {
        var point = DropoffPoint(order);
        return new DeliveryStopResponse(
            order.DeliveryRecipientName,
            order.DeliveryPhoneNumber,
            $"{order.DeliveryStreet} #{order.DeliveryExteriorNumber}, "
                + $"{order.DeliveryNeighborhood}, {order.DeliveryCity}",
            point.Latitude,
            point.Longitude
        );
    }

    private static RoutePointResponse StorePoint(Order order)
    {
        if (
            order.Store.Latitude is null
            || order.Store.Longitude is null
        )
        {
            throw new ConflictApiException(
                "El comercio no tiene coordenadas para calcular la ruta.",
                "store_location_required"
            );
        }

        return new RoutePointResponse(
            order.Store.Latitude.Value,
            order.Store.Longitude.Value
        );
    }

    private static RoutePointResponse DropoffPoint(Order order)
    {
        if (
            order.DeliveryLatitude is null
            || order.DeliveryLongitude is null
        )
        {
            throw new ConflictApiException(
                "La dirección de entrega no tiene coordenadas.",
                "delivery_location_required"
            );
        }

        return new RoutePointResponse(
            order.DeliveryLatitude.Value,
            order.DeliveryLongitude.Value
        );
    }
}
