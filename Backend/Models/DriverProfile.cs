namespace Backend.Models;

public sealed class DriverProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    public VehicleType VehicleType { get; set; }

    public DriverApprovalStatus ApprovalStatus { get; set; } =
        DriverApprovalStatus.Pending;

    public DriverAvailabilityStatus AvailabilityStatus { get; set; } =
        DriverAvailabilityStatus.Offline;

    public string? VehicleBrand { get; set; }

    public string? VehicleModel { get; set; }

    public string? VehicleColor { get; set; }

    public string? VehiclePlate { get; set; }

    public string? DriverLicenseNumber { get; set; }

    public string? ProfilePhotoUrl { get; set; }

    public string? IdentificationDocumentUrl { get; set; }

    public string? DriverLicenseDocumentUrl { get; set; }

    public decimal RatingAverage { get; set; }

    public int RatingCount { get; set; }

    public decimal? CurrentLatitude { get; set; }

    public decimal? CurrentLongitude { get; set; }

    public DateTime? LocationUpdatedAt { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;

    public ICollection<DeliveryAssignment> DeliveryAssignments { get; set; } =
        new List<DeliveryAssignment>();
}
