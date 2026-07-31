using Backend.Contracts.Payments;

namespace Backend.Services.Payments;

public interface IPaymentMethodService
{
    Task<IReadOnlyCollection<PaymentMethodResponse>> GetAllAsync(
        Guid userId,
        CancellationToken cancellationToken
    );

    Task<PaymentMethodResponse> CreateAsync(
        Guid userId,
        SavePaymentMethodRequest request,
        CancellationToken cancellationToken
    );

    Task<PaymentMethodResponse> SetDefaultAsync(
        Guid userId,
        Guid paymentMethodId,
        CancellationToken cancellationToken
    );

    Task DeleteAsync(
        Guid userId,
        Guid paymentMethodId,
        CancellationToken cancellationToken
    );
}
