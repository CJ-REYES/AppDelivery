using Backend.Contracts.Drivers;
using Backend.Data;
using Backend.Middleware.Exceptions;
using Backend.Models;
using Backend.Services.Deliveries;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.Drivers;

public sealed class DriverService(
    AppDbContext database,
    TimeProvider timeProvider,
    ITrackingNotifier trackingNotifier
) : IDriverService
{
    public async Task<DriverProfileResponse> GetProfileAsync(
        Guid userId,
        CancellationToken cancellationToken
    )
    {
        var profile = await FindProfileAsync(
            userId,
            asTracking: false,
            cancellationToken
        );
        return ToResponse(profile);
    }

    public async Task<DriverProfileResponse> RegisterAsync(
        Guid userId,
        SaveDriverProfileRequest request,
        CancellationToken cancellationToken
    )
    {
        if (await database.DriverProfiles.AnyAsync(
            profile => profile.UserId == userId,
            cancellationToken
        ))
        {
            throw new ConflictApiException(
                "La cuenta ya tiene un perfil de repartidor.",
                "driver_profile_already_exists"
            );
        }

        ValidateVehicle(request);
        var user = await database.Users
            .Include(entity => entity.UserRoles)
            .SingleOrDefaultAsync(
                entity => entity.Id == userId && entity.IsActive,
                cancellationToken
            ) ?? throw new NotFoundApiException(
                "No se encontró la cuenta del usuario."
            );
        var driverRole = await database.Roles.SingleOrDefaultAsync(
            role => role.Name == "Driver",
            cancellationToken
        ) ?? throw new InvalidOperationException(
            "No se encontró el rol Driver en la base de datos."
        );
        var utcNow = timeProvider.GetUtcNow().UtcDateTime;
        var profile = new DriverProfile
        {
            UserId = userId,
            User = user,
            ApprovalStatus = DriverApprovalStatus.Approved,
            AvailabilityStatus = DriverAvailabilityStatus.Offline,
            IsActive = true,
            CreatedAt = utcNow,
            UpdatedAt = utcNow
        };

        Apply(request, profile);
        database.DriverProfiles.Add(profile);

        if (!user.UserRoles.Any(userRole =>
            userRole.RoleId == driverRole.Id
        ))
        {
            database.UserRoles.Add(new UserRole
            {
                UserId = userId,
                RoleId = driverRole.Id,
                AssignedAt = utcNow
            });
        }

        await database.SaveChangesAsync(cancellationToken);
        return ToResponse(profile);
    }

    public async Task<DriverProfileResponse> UpdateAsync(
        Guid userId,
        SaveDriverProfileRequest request,
        CancellationToken cancellationToken
    )
    {
        ValidateVehicle(request);
        var profile = await FindProfileAsync(
            userId,
            asTracking: true,
            cancellationToken
        );
        Apply(request, profile);
        profile.UpdatedAt = timeProvider.GetUtcNow().UtcDateTime;

        await database.SaveChangesAsync(cancellationToken);
        return ToResponse(profile);
    }

    public async Task<DriverProfileResponse> SetAvailabilityAsync(
        Guid userId,
        DriverAvailabilityRequest request,
        CancellationToken cancellationToken
    )
    {
        var profile = await FindProfileAsync(
            userId,
            asTracking: true,
            cancellationToken
        );

        if (profile.ApprovalStatus != DriverApprovalStatus.Approved)
        {
            throw new ConflictApiException(
                "El perfil todavía no está aprobado para recibir entregas.",
                "driver_not_approved"
            );
        }

        if (request.Status == DriverAvailabilityStatus.OnDelivery)
        {
            throw new BadRequestApiException(
                "El estado En entrega se asigna al aceptar un pedido.",
                "driver_status_managed_by_delivery"
            );
        }

        var hasActiveDelivery = await database.DeliveryAssignments.AnyAsync(
            assignment =>
                assignment.DriverProfileId == profile.Id
                && assignment.Status != DeliveryAssignmentStatus.Delivered
                && assignment.Status != DeliveryAssignmentStatus.Rejected
                && assignment.Status != DeliveryAssignmentStatus.Cancelled,
            cancellationToken
        );

        if (hasActiveDelivery)
        {
            throw new ConflictApiException(
                "No puedes cambiar la disponibilidad durante una entrega.",
                "driver_has_active_delivery"
            );
        }

        profile.AvailabilityStatus = request.Status;
        profile.UpdatedAt = timeProvider.GetUtcNow().UtcDateTime;
        await database.SaveChangesAsync(cancellationToken);
        return ToResponse(profile);
    }

    public async Task<DriverProfileResponse> UpdateLocationAsync(
        Guid userId,
        DriverLocationRequest request,
        CancellationToken cancellationToken
    )
    {
        var profile = await FindProfileAsync(
            userId,
            asTracking: true,
            cancellationToken
        );
        var utcNow = timeProvider.GetUtcNow().UtcDateTime;
        profile.CurrentLatitude = request.Latitude;
        profile.CurrentLongitude = request.Longitude;
        profile.LocationUpdatedAt = utcNow;
        profile.UpdatedAt = utcNow;

        await database.SaveChangesAsync(cancellationToken);
        var activeOrderId = await database.DeliveryAssignments
            .AsNoTracking()
            .Where(assignment =>
                assignment.DriverProfileId == profile.Id
                && assignment.Status != DeliveryAssignmentStatus.Delivered
                && assignment.Status != DeliveryAssignmentStatus.Rejected
                && assignment.Status != DeliveryAssignmentStatus.Cancelled
            )
            .Select(assignment => (Guid?)assignment.OrderId)
            .FirstOrDefaultAsync(cancellationToken);

        if (activeOrderId is Guid orderId)
        {
            await trackingNotifier.NotifyOrderUpdatedAsync(
                orderId,
                "driver_location_updated",
                cancellationToken
            );
        }

        return ToResponse(profile);
    }

    public async Task<DriverSummaryResponse> GetSummaryAsync(
        Guid userId,
        CancellationToken cancellationToken
    )
    {
        var profile = await FindProfileAsync(
            userId,
            asTracking: false,
            cancellationToken
        );
        var utcNow = timeProvider.GetUtcNow().UtcDateTime;
        var today = utcNow.Date;
        var weekStart = today.AddDays(
            -(((int)today.DayOfWeek + 6) % 7)
        );
        var delivered = database.DeliveryAssignments
            .AsNoTracking()
            .Where(assignment =>
                assignment.DriverProfileId == profile.Id
                && assignment.Status == DeliveryAssignmentStatus.Delivered
            );

        return new DriverSummaryResponse(
            await delivered.CountAsync(cancellationToken),
            await delivered.CountAsync(
                assignment => assignment.DeliveredAt >= today,
                cancellationToken
            ),
            await delivered
                .Where(assignment => assignment.DeliveredAt >= today)
                .SumAsync(
                    assignment => assignment.DriverEarnings,
                    cancellationToken
                ),
            await delivered
                .Where(assignment => assignment.DeliveredAt >= weekStart)
                .SumAsync(
                    assignment => assignment.DriverEarnings,
                    cancellationToken
                ),
            profile.RatingAverage,
            profile.RatingCount
        );
    }

    private async Task<DriverProfile> FindProfileAsync(
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

    private static void ValidateVehicle(SaveDriverProfileRequest request)
    {
        if (
            request.VehicleType != VehicleType.Bicycle
            && string.IsNullOrWhiteSpace(request.VehiclePlate)
        )
        {
            throw new BadRequestApiException(
                "La placa es obligatoria para motocicletas y automóviles.",
                "vehicle_plate_required"
            );
        }
    }

    private static void Apply(
        SaveDriverProfileRequest request,
        DriverProfile profile
    )
    {
        profile.VehicleType = request.VehicleType;
        profile.VehicleBrand = Normalize(request.VehicleBrand);
        profile.VehicleModel = Normalize(request.VehicleModel);
        profile.VehicleColor = Normalize(request.VehicleColor);
        profile.VehiclePlate = Normalize(request.VehiclePlate)?.ToUpperInvariant();
        profile.DriverLicenseNumber = Normalize(
            request.DriverLicenseNumber
        );
        profile.ProfilePhotoUrl = Normalize(request.ProfilePhotoUrl);
        profile.IdentificationDocumentUrl = Normalize(
            request.IdentificationDocumentUrl
        );
        profile.DriverLicenseDocumentUrl = Normalize(
            request.DriverLicenseDocumentUrl
        );
    }

    private static DriverProfileResponse ToResponse(DriverProfile profile) =>
        new(
            profile.Id,
            profile.UserId,
            profile.User.FirstName,
            profile.User.LastName,
            profile.User.Email,
            profile.User.PhoneNumber,
            profile.VehicleType,
            profile.ApprovalStatus,
            profile.AvailabilityStatus,
            profile.VehicleBrand,
            profile.VehicleModel,
            profile.VehicleColor,
            profile.VehiclePlate,
            profile.DriverLicenseNumber,
            profile.ProfilePhotoUrl,
            profile.IdentificationDocumentUrl,
            profile.DriverLicenseDocumentUrl,
            profile.RatingAverage,
            profile.RatingCount,
            profile.CurrentLatitude,
            profile.CurrentLongitude,
            profile.LocationUpdatedAt,
            profile.IsActive,
            profile.CreatedAt,
            profile.UpdatedAt
        );

    private static string? Normalize(string? value)
    {
        var normalized = value?.Trim();
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }
}
