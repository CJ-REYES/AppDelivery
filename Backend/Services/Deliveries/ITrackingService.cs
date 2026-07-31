using Backend.Contracts.Deliveries;

namespace Backend.Services.Deliveries;

public interface ITrackingService
{
    Task<OrderTrackingResponse> GetAsync(
        Guid userId,
        Guid orderId,
        bool isAdmin,
        CancellationToken cancellationToken
    );
}
