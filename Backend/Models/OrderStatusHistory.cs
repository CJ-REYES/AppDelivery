namespace Backend.Models;

public sealed class OrderStatusHistory
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid OrderId { get; set; }

    public OrderStatus Status { get; set; }

    public Guid? ChangedByUserId { get; set; }

    public string ChangedByRole { get; set; } = string.Empty;

    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Order Order { get; set; } = null!;
}
