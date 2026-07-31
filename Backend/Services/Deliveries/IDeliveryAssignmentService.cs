using Backend.Contracts.Deliveries;

namespace Backend.Services.Deliveries;

public interface IDeliveryAssignmentService
{
    Task<IReadOnlyCollection<AvailableDeliveryResponse>>
        GetAvailableAsync(
            Guid userId,
            CancellationToken cancellationToken
        );

    Task<ActiveDeliveryResponse> AcceptAsync(
        Guid userId,
        Guid orderId,
        CancellationToken cancellationToken
    );

    Task RejectAsync(
        Guid userId,
        Guid orderId,
        RejectDeliveryRequest request,
        CancellationToken cancellationToken
    );

    Task<ActiveDeliveryResponse> GetActiveAsync(
        Guid userId,
        CancellationToken cancellationToken
    );

    Task<ActiveDeliveryResponse> AdvanceAsync(
        Guid userId,
        Guid assignmentId,
        AdvanceDeliveryRequest request,
        CancellationToken cancellationToken
    );

    Task<IReadOnlyCollection<DeliveryHistoryResponse>> GetHistoryAsync(
        Guid userId,
        CancellationToken cancellationToken
    );
}
