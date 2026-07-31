using Backend.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Services.Deliveries;

public sealed class SignalRTrackingNotifier(
    IHubContext<TrackingHub> hubContext,
    TimeProvider timeProvider
) : ITrackingNotifier
{
    public Task NotifyOrderUpdatedAsync(
        Guid orderId,
        string reason,
        CancellationToken cancellationToken
    ) => hubContext.Clients
        .Group(TrackingHub.OrderGroup(orderId))
        .SendAsync(
            "orderUpdated",
            new
            {
                orderId,
                reason,
                occurredAt = timeProvider.GetUtcNow().UtcDateTime
            },
            cancellationToken
        );
}
