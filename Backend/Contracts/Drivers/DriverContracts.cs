using System.ComponentModel.DataAnnotations;
using Backend.Models;

namespace Backend.Contracts.Drivers;

public sealed class SaveDriverProfileRequest
{
    [EnumDataType(typeof(VehicleType))]
    public VehicleType VehicleType { get; init; }

    [StringLength(100)]
    public string? VehicleBrand { get; init; }

    [StringLength(100)]
    public string? VehicleModel { get; init; }

    [StringLength(50)]
    public string? VehicleColor { get; init; }

    [StringLength(20)]
    public string? VehiclePlate { get; init; }

    [StringLength(100)]
    public string? DriverLicenseNumber { get; init; }

    [Url]
    [StringLength(2048)]
    public string? ProfilePhotoUrl { get; init; }

    [Url]
    [StringLength(2048)]
    public string? IdentificationDocumentUrl { get; init; }

    [Url]
    [StringLength(2048)]
    public string? DriverLicenseDocumentUrl { get; init; }
}

public sealed class DriverAvailabilityRequest
{
    [EnumDataType(typeof(DriverAvailabilityStatus))]
    public DriverAvailabilityStatus Status { get; init; }
}

public sealed class DriverLocationRequest
{
    [Range(typeof(decimal), "-90", "90")]
    public decimal Latitude { get; init; }

    [Range(typeof(decimal), "-180", "180")]
    public decimal Longitude { get; init; }
}

public sealed record DriverProfileResponse(
    Guid Id,
    Guid UserId,
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    VehicleType VehicleType,
    DriverApprovalStatus ApprovalStatus,
    DriverAvailabilityStatus AvailabilityStatus,
    string? VehicleBrand,
    string? VehicleModel,
    string? VehicleColor,
    string? VehiclePlate,
    string? DriverLicenseNumber,
    string? ProfilePhotoUrl,
    string? IdentificationDocumentUrl,
    string? DriverLicenseDocumentUrl,
    decimal RatingAverage,
    int RatingCount,
    decimal? CurrentLatitude,
    decimal? CurrentLongitude,
    DateTime? LocationUpdatedAt,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public sealed record DriverSummaryResponse(
    int CompletedDeliveries,
    int CompletedToday,
    decimal EarningsToday,
    decimal EarningsThisWeek,
    decimal RatingAverage,
    int RatingCount
);
