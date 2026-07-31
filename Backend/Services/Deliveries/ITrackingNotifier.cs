namespace Backend.Services.Deliveries;

public interface ITrackingNotifier
{
    Task NotifyOrderUpdatedAsync(
        Guid orderId,
        string reason,
        CancellationToken cancellationToken
    );
}
