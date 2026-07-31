using System.ComponentModel.DataAnnotations;
using Backend.Models;

namespace Backend.Contracts.Orders;

public sealed class CreateOrderRequest
{
    [Required]
    public Guid StoreId { get; init; }

    [Required]
    public Guid DeliveryAddressId { get; init; }

    public Guid? PaymentMethodId { get; init; }

    [StringLength(500)]
    public string? CustomerNotes { get; init; }

    [Required]
    [MinLength(1)]
    [MaxLength(50)]
    public IReadOnlyCollection<CreateOrderItemRequest> Items { get; init; } =
        [];
}

public sealed class CreateOrderItemRequest
{
    [Required]
    public Guid ProductId { get; init; }

    [Range(1, 99)]
    public int Quantity { get; init; }

    [StringLength(500)]
    public string? Notes { get; init; }
}

public sealed class CancelOrderRequest
{
    [Required]
    [StringLength(500, MinimumLength = 3)]
    public string Reason { get; init; } = string.Empty;
}

public sealed class UpdateMerchantOrderStatusRequest
{
    [EnumDataType(typeof(OrderStatus))]
    public OrderStatus Status { get; init; }

    [StringLength(500)]
    public string? Note { get; init; }
}

public sealed record OrderItemResponse(
    Guid Id,
    Guid ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice,
    string? Notes
);

public sealed record OrderStatusHistoryResponse(
    OrderStatus Status,
    string ChangedByRole,
    string? Note,
    DateTime CreatedAt
);

public sealed record OrderResponse(
    Guid Id,
    string OrderNumber,
    Guid StoreId,
    string StoreName,
    string? StoreLogoUrl,
    OrderStatus Status,
    PaymentStatus PaymentStatus,
    decimal Subtotal,
    decimal DeliveryFee,
    decimal ServiceFee,
    decimal DiscountAmount,
    decimal Total,
    string DeliveryRecipientName,
    string DeliveryPhoneNumber,
    string DeliveryAddress,
    decimal? DeliveryLatitude,
    decimal? DeliveryLongitude,
    string? CustomerNotes,
    string? CancellationReason,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime? DeliveredAt,
    IReadOnlyCollection<OrderItemResponse> Items,
    IReadOnlyCollection<OrderStatusHistoryResponse> StatusHistory
);

public sealed record MerchantSalesSummaryResponse(
    int TotalOrders,
    int PendingOrders,
    int ActiveOrders,
    int DeliveredOrders,
    int CancelledOrders,
    decimal GrossSales,
    decimal SalesToday
);
