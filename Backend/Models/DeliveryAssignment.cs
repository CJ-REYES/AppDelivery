namespace Backend.Models;

public sealed class DeliveryAssignment
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid OrderId { get; set; }

    public Guid DriverProfileId { get; set; }

    public DeliveryAssignmentStatus Status { get; set; } =
        DeliveryAssignmentStatus.Assigned;

    public decimal DriverEarnings { get; set; }

    public string? RejectionReason { get; set; }

    public string? CancellationReason { get; set; }

    public string? DriverNotes { get; set; }

    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    public DateTime? AcceptedAt { get; set; }

    public DateTime? PickedUpAt { get; set; }

    public DateTime? DeliveredAt { get; set; }

    public DateTime? RejectedAt { get; set; }

    public DateTime? CancelledAt { get; set; }

    public Order Order { get; set; } = null!;

    public DriverProfile DriverProfile { get; set; } = null!;
}
