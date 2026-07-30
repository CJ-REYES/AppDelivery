namespace Backend.Models;

public enum OrderStatus
{
    Pending,
    Confirmed,
    Preparing,
    ReadyForPickup,
    OutForDelivery,
    Delivered,
    Cancelled
}
