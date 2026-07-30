namespace Backend.Models;

public sealed class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string OrderNumber { get; set; } = string.Empty;

    public Guid CustomerId { get; set; }

    public Guid StoreId { get; set; }

    public Guid? DeliveryAddressId { get; set; }

    public Guid? PaymentMethodId { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    public PaymentStatus PaymentStatus { get; set; } =
        PaymentStatus.Pending;

    public decimal Subtotal { get; set; }

    public decimal DeliveryFee { get; set; }

    public decimal ServiceFee { get; set; }

    public decimal DiscountAmount { get; set; }

    public decimal Total { get; set; }

    public string DeliveryRecipientName { get; set; } = string.Empty;

    public string DeliveryPhoneNumber { get; set; } = string.Empty;

    public string DeliveryStreet { get; set; } = string.Empty;

    public string DeliveryExteriorNumber { get; set; } = string.Empty;

    public string? DeliveryInteriorNumber { get; set; }

    public string DeliveryNeighborhood { get; set; } = string.Empty;

    public string DeliveryCity { get; set; } = string.Empty;

    public string DeliveryState { get; set; } = string.Empty;

    public string DeliveryPostalCode { get; set; } = string.Empty;

    public string? DeliveryReferences { get; set; }

    public decimal? DeliveryLatitude { get; set; }

    public decimal? DeliveryLongitude { get; set; }

    public string? CustomerNotes { get; set; }

    public string? CancellationReason { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ConfirmedAt { get; set; }

    public DateTime? DeliveredAt { get; set; }

    public DateTime? CancelledAt { get; set; }

    public User Customer { get; set; } = null!;

    public Store Store { get; set; } = null!;

    public Address? DeliveryAddress { get; set; }

    public PaymentMethod? PaymentMethod { get; set; }

    public ICollection<OrderItem> Items { get; set; } =
        new List<OrderItem>();
        public ICollection<DeliveryAssignment> DeliveryAssignments { get; set; } =
    new List<DeliveryAssignment>();
    
}
