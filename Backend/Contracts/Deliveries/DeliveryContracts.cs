using System.ComponentModel.DataAnnotations;
using Backend.Contracts.Routing;
using Backend.Models;

namespace Backend.Contracts.Deliveries;

public sealed class AdvanceDeliveryRequest
{
    [EnumDataType(typeof(DeliveryAssignmentStatus))]
    public DeliveryAssignmentStatus Status { get; init; }

    [StringLength(500)]
    public string? DriverNotes { get; init; }
}

public sealed class RejectDeliveryRequest
{
    [StringLength(500)]
    public string? Reason { get; init; }
}

public sealed record DeliveryStopResponse(
    string Name,
    string? PhoneNumber,
    string Address,
    decimal Latitude,
    decimal Longitude
);

public sealed record AvailableDeliveryResponse(
    Guid OrderId,
    string OrderNumber,
    DeliveryStopResponse Pickup,
    DeliveryStopResponse Dropoff,
    int ItemCount,
    decimal DriverEarnings,
    double DistanceToPickupMeters,
    double TotalDistanceMeters,
    int EstimatedMinutes,
    double EfficiencyScore,
    bool IsRecommended
);

public sealed record ActiveDeliveryResponse(
    Guid AssignmentId,
    Guid OrderId,
    string OrderNumber,
    DeliveryAssignmentStatus Status,
    DeliveryStopResponse Pickup,
    DeliveryStopResponse Dropoff,
    int ItemCount,
    decimal DriverEarnings,
    DateTime AssignedAt,
    DateTime? AcceptedAt,
    RouteResponse Route
);

public sealed record DeliveryHistoryResponse(
    Guid AssignmentId,
    Guid OrderId,
    string OrderNumber,
    string StoreName,
    string CustomerName,
    double DistanceMeters,
    decimal DriverEarnings,
    decimal? CustomerRating,
    DateTime DeliveredAt
);

public sealed record OrderTrackingResponse(
    Guid OrderId,
    string OrderNumber,
    OrderStatus OrderStatus,
    DeliveryAssignmentStatus? DeliveryStatus,
    DeliveryStopResponse Pickup,
    DeliveryStopResponse Dropoff,
    string? DriverName,
    string? DriverPhoneNumber,
    decimal? DriverLatitude,
    decimal? DriverLongitude,
    DateTime? DriverLocationUpdatedAt,
    RouteResponse Route
);
