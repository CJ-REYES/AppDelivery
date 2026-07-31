using Backend.Contracts.Orders;

namespace Backend.Services.Orders;

public interface IOrderService
{
    Task<OrderResponse> CreateAsync(
        Guid customerId,
        CreateOrderRequest request,
        CancellationToken cancellationToken
    );

    Task<IReadOnlyCollection<OrderResponse>> GetCustomerOrdersAsync(
        Guid customerId,
        CancellationToken cancellationToken
    );

    Task<OrderResponse> GetCustomerOrderAsync(
        Guid customerId,
        Guid orderId,
        CancellationToken cancellationToken
    );

    Task<OrderResponse?> GetLatestCustomerOrderAsync(
        Guid customerId,
        bool trackableOnly,
        CancellationToken cancellationToken
    );

    Task<OrderResponse> CancelCustomerOrderAsync(
        Guid customerId,
        Guid orderId,
        CancelOrderRequest request,
        CancellationToken cancellationToken
    );

    Task<IReadOnlyCollection<OrderResponse>> GetMerchantOrdersAsync(
        Guid ownerId,
        CancellationToken cancellationToken
    );

    Task<OrderResponse> GetMerchantOrderAsync(
        Guid ownerId,
        Guid orderId,
        CancellationToken cancellationToken
    );

    Task<MerchantSalesSummaryResponse> GetMerchantSummaryAsync(
        Guid ownerId,
        CancellationToken cancellationToken
    );

    Task<OrderResponse> UpdateMerchantStatusAsync(
        Guid ownerId,
        Guid orderId,
        UpdateMerchantOrderStatusRequest request,
        CancellationToken cancellationToken
    );
}
