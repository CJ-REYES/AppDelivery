using System.Data;
using Backend.Contracts.Orders;
using Backend.Data;
using Backend.Middleware.Exceptions;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Backend.Services.Orders;

public sealed class OrderService(
    AppDbContext database,
    TimeProvider timeProvider
) : IOrderService
{
    private static readonly OrderStatus[] TrackableStatuses =
    [
        OrderStatus.Pending,
        OrderStatus.Confirmed,
        OrderStatus.Preparing,
        OrderStatus.ReadyForPickup,
        OrderStatus.OutForDelivery
    ];

    public Task<OrderResponse> CreateAsync(
        Guid customerId,
        CreateOrderRequest request,
        CancellationToken cancellationToken
    )
    {
        var executionStrategy = database.Database.CreateExecutionStrategy();

        return executionStrategy.ExecuteAsync(
            strategyCancellationToken =>
                CreateWithinTransactionAsync(
                    customerId,
                    request,
                    strategyCancellationToken
                ),
            cancellationToken
        );
    }

    private async Task<OrderResponse> CreateWithinTransactionAsync(
        Guid customerId,
        CreateOrderRequest request,
        CancellationToken cancellationToken
    )
    {
        IDbContextTransaction? transaction = null;
        if (database.Database.IsRelational())
        {
            transaction = await database.Database.BeginTransactionAsync(
                IsolationLevel.Serializable,
                cancellationToken
            );
        }

        try
        {
            var store = await database.Stores.SingleOrDefaultAsync(
                entity =>
                    entity.Id == request.StoreId
                    && entity.IsActive
                    && entity.IsOpen,
                cancellationToken
            ) ?? throw new BadRequestApiException(
                "El comercio no está disponible para recibir pedidos.",
                "store_not_available"
            );

            var address = await database.Addresses.SingleOrDefaultAsync(
                entity =>
                    entity.Id == request.DeliveryAddressId
                    && entity.UserId == customerId,
                cancellationToken
            ) ?? throw new BadRequestApiException(
                "La dirección de entrega no pertenece a tu cuenta.",
                "invalid_delivery_address"
            );

            if (address.Latitude is null || address.Longitude is null)
            {
                throw new BadRequestApiException(
                    "Marca el punto exacto de la dirección en el mapa.",
                    "delivery_location_required"
                );
            }

            if (request.PaymentMethodId is not null)
            {
                var validPaymentMethod = await database.PaymentMethods.AnyAsync(
                    method =>
                        method.Id == request.PaymentMethodId
                        && method.UserId == customerId
                        && method.IsActive,
                    cancellationToken
                );
                if (!validPaymentMethod)
                {
                    throw new BadRequestApiException(
                        "El método de pago no pertenece a tu cuenta.",
                        "invalid_payment_method"
                    );
                }
            }

            var requestedItems = request.Items
                .GroupBy(item => item.ProductId)
                .Select(group => new
                {
                    ProductId = group.Key,
                    Quantity = group.Sum(item => item.Quantity),
                    Notes = Normalize(group.Last().Notes)
                })
                .ToArray();

            if (requestedItems.Any(item => item.Quantity > 99))
            {
                throw new BadRequestApiException(
                    "La cantidad máxima por producto es 99.",
                    "invalid_order_quantity"
                );
            }

            var productIds = requestedItems
                .Select(item => item.ProductId)
                .ToArray();
            var products = await database.Products
                .Where(product => productIds.Contains(product.Id))
                .ToDictionaryAsync(product => product.Id, cancellationToken);

            if (products.Count != requestedItems.Length)
            {
                throw new BadRequestApiException(
                    "Uno o más productos ya no existen.",
                    "invalid_order_products"
                );
            }

            var customer = await database.Users.SingleAsync(
                user => user.Id == customerId,
                cancellationToken
            );
            var orderId = Guid.NewGuid();
            var utcNow = timeProvider.GetUtcNow().UtcDateTime;
            var order = new Order
            {
                Id = orderId,
                OrderNumber =
                    $"AD-{utcNow:yyyyMMdd}-{orderId.ToString("N")[..8].ToUpperInvariant()}",
                CustomerId = customerId,
                StoreId = store.Id,
                DeliveryAddressId = address.Id,
                PaymentMethodId = request.PaymentMethodId,
                Status = OrderStatus.Pending,
                PaymentStatus = PaymentStatus.Pending,
                DeliveryFee = store.DeliveryFee,
                ServiceFee = 0m,
                DiscountAmount = 0m,
                DeliveryRecipientName =
                    $"{customer.FirstName} {customer.LastName}".Trim(),
                DeliveryPhoneNumber = customer.PhoneNumber ?? string.Empty,
                DeliveryStreet = address.Street,
                DeliveryExteriorNumber = address.ExteriorNumber,
                DeliveryInteriorNumber = address.InteriorNumber,
                DeliveryNeighborhood = address.Neighborhood,
                DeliveryCity = address.City,
                DeliveryState = address.State,
                DeliveryPostalCode = address.PostalCode,
                DeliveryReferences = address.References,
                DeliveryLatitude = address.Latitude,
                DeliveryLongitude = address.Longitude,
                CustomerNotes = Normalize(request.CustomerNotes),
                CreatedAt = utcNow,
                UpdatedAt = utcNow
            };

            foreach (var requested in requestedItems)
            {
                var product = products[requested.ProductId];
                if (
                    product.StoreId != store.Id
                    || !product.IsAvailable
                )
                {
                    throw new BadRequestApiException(
                        $"“{product.Name}” no está disponible en este comercio.",
                        "product_not_available"
                    );
                }

                if (product.StockQuantity < requested.Quantity)
                {
                    throw new ConflictApiException(
                        $"Solo quedan {product.StockQuantity} unidades de “{product.Name}”.",
                        "insufficient_stock"
                    );
                }

                product.StockQuantity -= requested.Quantity;
                product.UpdatedAt = utcNow;
                order.Items.Add(new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = product.Id,
                    ProductName = product.Name,
                    Quantity = requested.Quantity,
                    UnitPrice = product.Price,
                    TotalPrice = product.Price * requested.Quantity,
                    Notes = requested.Notes
                });
            }

            order.Subtotal = order.Items.Sum(item => item.TotalPrice);
            if (order.Subtotal < store.MinimumOrderAmount)
            {
                throw new BadRequestApiException(
                    $"El pedido mínimo del comercio es ${store.MinimumOrderAmount:0.00} MXN.",
                    "minimum_order_not_met"
                );
            }

            order.ServiceFee = decimal.Round(order.Subtotal * 0.05m, 2);
            order.Total =
                order.Subtotal
                + order.DeliveryFee
                + order.ServiceFee
                - order.DiscountAmount;
            AddHistory(
                order,
                OrderStatus.Pending,
                customerId,
                "Customer",
                "Pedido creado desde el checkout.",
                utcNow
            );

            database.Orders.Add(order);
            await database.SaveChangesAsync(cancellationToken);

            var response = await LoadResponseAsync(
                order.Id,
                customerId,
                ownerId: null,
                cancellationToken
            );

            if (transaction is not null)
            {
                await transaction.CommitAsync(cancellationToken);
            }

            return response;
        }
        catch
        {
            if (transaction is not null)
            {
                await transaction.RollbackAsync(cancellationToken);
            }

            database.ChangeTracker.Clear();
            throw;
        }
        finally
        {
            if (transaction is not null)
            {
                await transaction.DisposeAsync();
            }
        }
    }

    public async Task<IReadOnlyCollection<OrderResponse>>
        GetCustomerOrdersAsync(
            Guid customerId,
            CancellationToken cancellationToken
        )
    {
        var orders = await OrdersQuery()
            .Where(order => order.CustomerId == customerId)
            .OrderByDescending(order => order.CreatedAt)
            .Take(100)
            .ToListAsync(cancellationToken);
        return orders.Select(ToResponse).ToArray();
    }

    public Task<OrderResponse> GetCustomerOrderAsync(
        Guid customerId,
        Guid orderId,
        CancellationToken cancellationToken
    ) =>
        LoadResponseAsync(
            orderId,
            customerId,
            ownerId: null,
            cancellationToken
        );

    public async Task<OrderResponse?> GetLatestCustomerOrderAsync(
        Guid customerId,
        bool trackableOnly,
        CancellationToken cancellationToken
    )
    {
        var query = OrdersQuery()
            .Where(order => order.CustomerId == customerId);
        if (trackableOnly)
        {
            query = query.Where(order =>
                TrackableStatuses.Contains(order.Status)
            );
        }

        var order = await query
            .OrderByDescending(entity => entity.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
        return order is null ? null : ToResponse(order);
    }

    public async Task<OrderResponse> CancelCustomerOrderAsync(
        Guid customerId,
        Guid orderId,
        CancelOrderRequest request,
        CancellationToken cancellationToken
    )
    {
        var order = await OrdersQuery(asTracking: true)
            .SingleOrDefaultAsync(
                entity =>
                    entity.Id == orderId
                    && entity.CustomerId == customerId,
                cancellationToken
            ) ?? throw new NotFoundApiException(
                "No se encontró el pedido solicitado."
            );

        if (order.Status is not (OrderStatus.Pending or OrderStatus.Confirmed))
        {
            throw new ConflictApiException(
                "El pedido ya no puede cancelarse desde el perfil del cliente.",
                "order_cannot_be_cancelled"
            );
        }

        await CancelAsync(
            order,
            customerId,
            "Customer",
            request.Reason,
            cancellationToken
        );
        return ToResponse(order);
    }

    public async Task<IReadOnlyCollection<OrderResponse>>
        GetMerchantOrdersAsync(
            Guid ownerId,
            CancellationToken cancellationToken
        )
    {
        var orders = await OrdersQuery()
            .Where(order => order.Store.OwnerId == ownerId)
            .OrderByDescending(order => order.CreatedAt)
            .Take(200)
            .ToListAsync(cancellationToken);
        return orders.Select(ToResponse).ToArray();
    }

    public Task<OrderResponse> GetMerchantOrderAsync(
        Guid ownerId,
        Guid orderId,
        CancellationToken cancellationToken
    ) =>
        LoadResponseAsync(
            orderId,
            customerId: null,
            ownerId,
            cancellationToken
        );

    public async Task<MerchantSalesSummaryResponse> GetMerchantSummaryAsync(
        Guid ownerId,
        CancellationToken cancellationToken
    )
    {
        var today = timeProvider.GetUtcNow().UtcDateTime.Date;
        var orders = await database.Orders
            .AsNoTracking()
            .Where(order => order.Store.OwnerId == ownerId)
            .Select(order => new
            {
                order.Status,
                order.Total,
                order.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new MerchantSalesSummaryResponse(
            orders.Count,
            orders.Count(order => order.Status == OrderStatus.Pending),
            orders.Count(order =>
                order.Status is OrderStatus.Confirmed
                    or OrderStatus.Preparing
                    or OrderStatus.ReadyForPickup
                    or OrderStatus.OutForDelivery
            ),
            orders.Count(order => order.Status == OrderStatus.Delivered),
            orders.Count(order => order.Status == OrderStatus.Cancelled),
            orders
                .Where(order => order.Status == OrderStatus.Delivered)
                .Sum(order => order.Total),
            orders
                .Where(order =>
                    order.Status == OrderStatus.Delivered
                    && order.CreatedAt >= today
                )
                .Sum(order => order.Total)
        );
    }

    public async Task<OrderResponse> UpdateMerchantStatusAsync(
        Guid ownerId,
        Guid orderId,
        UpdateMerchantOrderStatusRequest request,
        CancellationToken cancellationToken
    )
    {
        var order = await OrdersQuery(asTracking: true)
            .SingleOrDefaultAsync(
                entity =>
                    entity.Id == orderId
                    && entity.Store.OwnerId == ownerId,
                cancellationToken
            ) ?? throw new NotFoundApiException(
                "No se encontró el pedido solicitado."
            );

        if (request.Status == OrderStatus.Cancelled)
        {
            if (
                order.Status is not (
                    OrderStatus.Pending
                    or OrderStatus.Confirmed
                    or OrderStatus.Preparing
                )
            )
            {
                throw InvalidTransition(order.Status, request.Status);
            }

            await CancelAsync(
                order,
                ownerId,
                "Merchant",
                Normalize(request.Note) ?? "Cancelado por el comercio.",
                cancellationToken
            );
            return ToResponse(order);
        }

        var expected = order.Status switch
        {
            OrderStatus.Pending => OrderStatus.Confirmed,
            OrderStatus.Confirmed => OrderStatus.Preparing,
            OrderStatus.Preparing => OrderStatus.ReadyForPickup,
            _ => throw InvalidTransition(order.Status, request.Status)
        };
        if (request.Status != expected)
        {
            throw InvalidTransition(order.Status, request.Status);
        }

        var utcNow = timeProvider.GetUtcNow().UtcDateTime;
        order.Status = request.Status;
        order.UpdatedAt = utcNow;
        if (request.Status == OrderStatus.Confirmed)
        {
            order.ConfirmedAt = utcNow;
        }
        AddHistory(
            order,
            request.Status,
            ownerId,
            "Merchant",
            Normalize(request.Note),
            utcNow
        );
        await database.SaveChangesAsync(cancellationToken);
        return ToResponse(order);
    }

    private async Task CancelAsync(
        Order order,
        Guid changedByUserId,
        string role,
        string reason,
        CancellationToken cancellationToken
    )
    {
        var utcNow = timeProvider.GetUtcNow().UtcDateTime;
        foreach (var item in order.Items)
        {
            item.Product.StockQuantity += item.Quantity;
            item.Product.UpdatedAt = utcNow;
        }

        order.Status = OrderStatus.Cancelled;
        order.CancellationReason = reason.Trim();
        order.CancelledAt = utcNow;
        order.UpdatedAt = utcNow;
        AddHistory(
            order,
            OrderStatus.Cancelled,
            changedByUserId,
            role,
            order.CancellationReason,
            utcNow
        );
        await database.SaveChangesAsync(cancellationToken);
    }

    private async Task<OrderResponse> LoadResponseAsync(
        Guid orderId,
        Guid? customerId,
        Guid? ownerId,
        CancellationToken cancellationToken
    )
    {
        var order = await OrdersQuery()
            .SingleOrDefaultAsync(
                entity =>
                    entity.Id == orderId
                    && (
                        customerId != null
                            ? entity.CustomerId == customerId
                            : entity.Store.OwnerId == ownerId
                    ),
                cancellationToken
            ) ?? throw new NotFoundApiException(
                "No se encontró el pedido solicitado."
            );
        return ToResponse(order);
    }

    private IQueryable<Order> OrdersQuery(bool asTracking = false)
    {
        var query = database.Orders
            .Include(order => order.Store)
            .Include(order => order.Items)
                .ThenInclude(item => item.Product)
            .Include(order => order.StatusHistory);
        return asTracking ? query : query.AsNoTracking();
    }

    private static OrderResponse ToResponse(Order order) =>
        new(
            order.Id,
            order.OrderNumber,
            order.StoreId,
            order.Store.Name,
            order.Store.LogoUrl,
            order.Status,
            order.PaymentStatus,
            order.Subtotal,
            order.DeliveryFee,
            order.ServiceFee,
            order.DiscountAmount,
            order.Total,
            order.DeliveryRecipientName,
            order.DeliveryPhoneNumber,
            JoinAddress(order),
            order.DeliveryLatitude,
            order.DeliveryLongitude,
            order.CustomerNotes,
            order.CancellationReason,
            order.CreatedAt,
            order.UpdatedAt,
            order.DeliveredAt,
            order.Items
                .Select(item => new OrderItemResponse(
                    item.Id,
                    item.ProductId,
                    item.ProductName,
                    item.Quantity,
                    item.UnitPrice,
                    item.TotalPrice,
                    item.Notes
                ))
                .ToArray(),
            order.StatusHistory
                .OrderBy(history => history.CreatedAt)
                .Select(history => new OrderStatusHistoryResponse(
                    history.Status,
                    history.ChangedByRole,
                    history.Note,
                    history.CreatedAt
                ))
                .ToArray()
        );

    private void AddHistory(
        Order order,
        OrderStatus status,
        Guid? userId,
        string role,
        string? note,
        DateTime createdAt
    )
    {
        var history = new OrderStatusHistory
        {
            OrderId = order.Id,
            Order = order,
            Status = status,
            ChangedByUserId = userId,
            ChangedByRole = role,
            Note = note,
            CreatedAt = createdAt
        };
        order.StatusHistory.Add(history);
        database.OrderStatusHistory.Add(history);
    }

    private static ConflictApiException InvalidTransition(
        OrderStatus current,
        OrderStatus requested
    ) =>
        new(
            $"No se puede cambiar el pedido de {current} a {requested}.",
            "invalid_order_transition"
        );

    private static string JoinAddress(Order order) =>
        string.Join(
            ", ",
            new[]
            {
                $"{order.DeliveryStreet} #{order.DeliveryExteriorNumber}"
                    + (
                        string.IsNullOrWhiteSpace(
                            order.DeliveryInteriorNumber
                        )
                            ? string.Empty
                            : $" Int. {order.DeliveryInteriorNumber}"
                    ),
                order.DeliveryNeighborhood,
                order.DeliveryCity,
                order.DeliveryState,
                order.DeliveryPostalCode
            }.Where(value => !string.IsNullOrWhiteSpace(value))
        );

    private static string? Normalize(string? value)
    {
        var normalized = value?.Trim();
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }
}
