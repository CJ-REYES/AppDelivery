using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Backend.Tests;

public sealed class OrderWorkflowTests
    : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public OrderWorkflowTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Checkout_persists_order_history_and_restores_stock_on_cancel()
    {
        using var merchant = _factory.CreateSecureClient();
        var catalog = await CreateMerchantCatalogAsync(
            merchant,
            stockQuantity: 5
        );

        using var customer = _factory.CreateSecureClient();
        await RegisterAndAuthorizeAsync(customer, "order-customer");
        var addressId = await CreateAddressAsync(customer);
        var paymentMethod = await customer.PostAsJsonAsync(
            "/api/payment-methods",
            new
            {
                type = "Card",
                displayName = "Visa •••• 4242",
                provider = (string?)null,
                cardBrand = "Visa",
                lastFourDigits = "4242",
                expirationMonth = 8,
                expirationYear = 2029,
                isDefault = true
            }
        );
        Assert.Equal(HttpStatusCode.Created, paymentMethod.StatusCode);
        var paymentMethodId = (await ReadJsonAsync(paymentMethod))
            .GetProperty("id")
            .GetGuid();

        var create = await customer.PostAsJsonAsync("/api/orders", new
        {
            storeId = catalog.StoreId,
            deliveryAddressId = addressId,
            paymentMethodId,
            customerNotes = "Sin cebolla.",
            items = new[]
            {
                new
                {
                    productId = catalog.ProductId,
                    quantity = 2,
                    notes = (string?)null
                }
            }
        });

        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        var created = await ReadJsonAsync(create);
        var orderId = created.GetProperty("id").GetGuid();
        Assert.Equal(240m, created.GetProperty("subtotal").GetDecimal());
        Assert.Equal(25m, created.GetProperty("deliveryFee").GetDecimal());
        Assert.Equal(12m, created.GetProperty("serviceFee").GetDecimal());
        Assert.Equal(277m, created.GetProperty("total").GetDecimal());
        Assert.Equal(
            "Pending",
            created.GetProperty("status").GetString()
        );

        var customerHistory = await customer.GetAsync("/api/orders");
        Assert.Equal(HttpStatusCode.OK, customerHistory.StatusCode);
        Assert.Contains(
            (await ReadJsonAsync(customerHistory)).EnumerateArray(),
            order => order.GetProperty("id").GetGuid() == orderId
        );

        var merchantHistory = await merchant.GetAsync(
            "/api/merchant/orders"
        );
        Assert.Equal(HttpStatusCode.OK, merchantHistory.StatusCode);
        Assert.Contains(
            (await ReadJsonAsync(merchantHistory)).EnumerateArray(),
            order => order.GetProperty("id").GetGuid() == orderId
        );

        using (var scope = _factory.Services.CreateScope())
        {
            var database = scope.ServiceProvider
                .GetRequiredService<AppDbContext>();
            Assert.Equal(
                3,
                await database.Products
                    .Where(product => product.Id == catalog.ProductId)
                    .Select(product => product.StockQuantity)
                    .SingleAsync()
            );
            Assert.Equal(
                1,
                await database.OrderStatusHistory.CountAsync(
                    history => history.OrderId == orderId
                )
            );
            Assert.Equal(
                paymentMethodId,
                await database.Orders
                    .Where(order => order.Id == orderId)
                    .Select(order => order.PaymentMethodId)
                    .SingleAsync()
            );
        }

        var cancel = await customer.PatchAsJsonAsync(
            $"/api/orders/{orderId}/cancel",
            new { reason = "Ya no podré recibirlo." }
        );
        Assert.Equal(HttpStatusCode.OK, cancel.StatusCode);
        var cancelled = await ReadJsonAsync(cancel);
        Assert.Equal(
            "Cancelled",
            cancelled.GetProperty("status").GetString()
        );
        Assert.Equal(
            2,
            cancelled.GetProperty("statusHistory").GetArrayLength()
        );

        using (var scope = _factory.Services.CreateScope())
        {
            var database = scope.ServiceProvider
                .GetRequiredService<AppDbContext>();
            Assert.Equal(
                5,
                await database.Products
                    .Where(product => product.Id == catalog.ProductId)
                    .Select(product => product.StockQuantity)
                    .SingleAsync()
            );
        }
    }

    [Fact]
    public async Task Order_moves_through_merchant_driver_and_all_histories()
    {
        using var merchant = _factory.CreateSecureClient();
        var catalog = await CreateMerchantCatalogAsync(
            merchant,
            stockQuantity: 10
        );

        using var customer = _factory.CreateSecureClient();
        await RegisterAndAuthorizeAsync(customer, "flow-customer");
        var addressId = await CreateAddressAsync(customer);
        var create = await customer.PostAsJsonAsync("/api/orders", new
        {
            storeId = catalog.StoreId,
            deliveryAddressId = addressId,
            paymentMethodId = (Guid?)null,
            customerNotes = (string?)null,
            items = new[]
            {
                new
                {
                    productId = catalog.ProductId,
                    quantity = 1,
                    notes = (string?)null
                }
            }
        });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        var orderId = (await ReadJsonAsync(create))
            .GetProperty("id")
            .GetGuid();

        foreach (
            var status in new[]
            {
                "Confirmed",
                "Preparing",
                "ReadyForPickup"
            }
        )
        {
            var transition = await merchant.PatchAsJsonAsync(
                $"/api/merchant/orders/{orderId}/status",
                new { status, note = (string?)null }
            );
            Assert.Equal(HttpStatusCode.OK, transition.StatusCode);
        }

        using var driver = _factory.CreateSecureClient();
        await RegisterAndAuthorizeAsync(driver, "flow-driver");
        var registerDriver = await driver.PostAsJsonAsync(
            "/api/drivers",
            ValidDriver()
        );
        Assert.Equal(HttpStatusCode.Created, registerDriver.StatusCode);
        await RefreshAndAuthorizeAsync(driver, "Driver");
        Assert.Equal(
            HttpStatusCode.OK,
            (
                await driver.PutAsJsonAsync(
                    "/api/drivers/me/location",
                    new
                    {
                        latitude = 20.9700m,
                        longitude = -89.6100m
                    }
                )
            ).StatusCode
        );
        Assert.Equal(
            HttpStatusCode.OK,
            (
                await driver.PatchAsJsonAsync(
                    "/api/drivers/me/availability",
                    new { status = "Available" }
                )
            ).StatusCode
        );

        var available = await driver.GetAsync(
            "/api/delivery-assignments/available"
        );
        Assert.Equal(HttpStatusCode.OK, available.StatusCode);
        Assert.Contains(
            (await ReadJsonAsync(available)).EnumerateArray(),
            item => item.GetProperty("orderId").GetGuid() == orderId
        );

        var accept = await driver.PostAsync(
            $"/api/delivery-assignments/orders/{orderId}/accept",
            null
        );
        Assert.Equal(HttpStatusCode.OK, accept.StatusCode);
        var assignmentId = (await ReadJsonAsync(accept))
            .GetProperty("assignmentId")
            .GetGuid();

        foreach (
            var status in new[]
            {
                "HeadingToStore",
                "PickedUp",
                "OutForDelivery",
                "Delivered"
            }
        )
        {
            var transition = await driver.PatchAsJsonAsync(
                $"/api/delivery-assignments/{assignmentId}/status",
                new { status, driverNotes = (string?)null }
            );
            Assert.Equal(HttpStatusCode.OK, transition.StatusCode);
        }

        var customerOrders = await customer.GetAsync("/api/orders");
        var deliveredOrder = Assert.Single(
            (await ReadJsonAsync(customerOrders)).EnumerateArray(),
            order => order.GetProperty("id").GetGuid() == orderId
        );
        Assert.Equal(
            "Delivered",
            deliveredOrder.GetProperty("status").GetString()
        );
        Assert.Equal(
            6,
            deliveredOrder.GetProperty("statusHistory").GetArrayLength()
        );

        var merchantOrders = await merchant.GetAsync(
            "/api/merchant/orders"
        );
        Assert.Contains(
            (await ReadJsonAsync(merchantOrders)).EnumerateArray(),
            order =>
                order.GetProperty("id").GetGuid() == orderId
                && order.GetProperty("status").GetString() == "Delivered"
        );
        var sales = await merchant.GetAsync(
            "/api/merchant/orders/summary"
        );
        Assert.Equal(HttpStatusCode.OK, sales.StatusCode);
        Assert.True(
            (await ReadJsonAsync(sales))
                .GetProperty("grossSales")
                .GetDecimal() > 0m
        );

        var driverHistory = await driver.GetAsync(
            "/api/delivery-assignments/history"
        );
        Assert.Contains(
            (await ReadJsonAsync(driverHistory)).EnumerateArray(),
            item => item.GetProperty("orderId").GetGuid() == orderId
        );

        var tracking = await customer.GetAsync(
            $"/api/tracking/orders/{orderId}"
        );
        Assert.Equal(HttpStatusCode.OK, tracking.StatusCode);
        Assert.Equal(
            "Delivered",
            (await ReadJsonAsync(tracking))
                .GetProperty("orderStatus")
                .GetString()
        );
    }

    private async Task<CatalogIds> CreateMerchantCatalogAsync(
        HttpClient client,
        int stockQuantity
    )
    {
        await RegisterAndAuthorizeAsync(client, "order-merchant");
        var store = await client.PostAsJsonAsync(
            "/api/merchant/store",
            ValidStore()
        );
        Assert.Equal(HttpStatusCode.Created, store.StatusCode);
        var storeId = (await ReadJsonAsync(store))
            .GetProperty("id")
            .GetGuid();
        await RefreshAndAuthorizeAsync(client, "Merchant");

        var category = await client.PostAsJsonAsync(
            "/api/merchant/categories",
            new
            {
                name = $"Pedidos {Guid.NewGuid():N}",
                displayOrder = 1,
                isActive = true
            }
        );
        Assert.Equal(HttpStatusCode.Created, category.StatusCode);
        var categoryId = (await ReadJsonAsync(category))
            .GetProperty("id")
            .GetGuid();

        var product = await client.PostAsJsonAsync(
            "/api/merchant/products",
            new
            {
                productCategoryId = categoryId,
                name = $"Producto {Guid.NewGuid():N}",
                description = "Producto preparado para probar pedidos reales.",
                price = 120m,
                imageUrl = "https://example.com/order-product.jpg",
                isAvailable = true,
                isFeatured = false,
                stockQuantity,
                preparationTimeMinutes = 15
            }
        );
        Assert.Equal(HttpStatusCode.Created, product.StatusCode);
        var productId = (await ReadJsonAsync(product))
            .GetProperty("id")
            .GetGuid();
        return new CatalogIds(storeId, productId);
    }

    private static async Task<Guid> CreateAddressAsync(HttpClient client)
    {
        var response = await client.PostAsJsonAsync("/api/addresses", new
        {
            label = "Casa",
            street = "Calle 47",
            exteriorNumber = "120",
            interiorNumber = (string?)null,
            neighborhood = "Centro",
            city = "Mérida",
            state = "Yucatán",
            postalCode = "97000",
            country = "México",
            references = "Portón verde",
            latitude = 20.9600m,
            longitude = -89.6200m,
            isDefault = true
        });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return (await ReadJsonAsync(response)).GetProperty("id").GetGuid();
    }

    private static async Task RegisterAndAuthorizeAsync(
        HttpClient client,
        string prefix
    )
    {
        var response = await client.PostAsJsonAsync(
            "/api/auth/register",
            new
            {
                firstName = "Carlos",
                lastName = "Reyes",
                email = $"{prefix}-{Guid.NewGuid():N}@example.com",
                password = "AppDelivery2026!",
                phoneNumber = "9991234567"
            }
        );
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        SetAccessToken(
            client,
            (await ReadJsonAsync(response))
                .GetProperty("accessToken")
                .GetString()!
        );
    }

    private static async Task RefreshAndAuthorizeAsync(
        HttpClient client,
        string expectedRole
    )
    {
        var response = await client.PostAsync("/api/auth/refresh", null);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var payload = await ReadJsonAsync(response);
        SetAccessToken(
            client,
            payload.GetProperty("accessToken").GetString()!
        );
        Assert.Contains(
            payload
                .GetProperty("user")
                .GetProperty("roles")
                .EnumerateArray(),
            role => role.GetString() == expectedRole
        );
    }

    private static object ValidStore() => new
    {
        storeCategoryId = 1,
        name = $"Comercio Pedidos {Guid.NewGuid():N}",
        description = "Comercio para validar el flujo completo de pedidos.",
        phoneNumber = "9991234567",
        email = "pedidos@example.com",
        logoUrl = "https://example.com/logo.jpg",
        coverImageUrl = "https://example.com/cover.jpg",
        street = "Calle 60",
        exteriorNumber = "425",
        interiorNumber = (string?)null,
        neighborhood = "Centro",
        city = "Mérida",
        state = "Yucatán",
        postalCode = "97000",
        latitude = 20.9674m,
        longitude = -89.5926m,
        deliveryFee = 25m,
        minimumOrderAmount = 100m,
        estimatedDeliveryMinutesMin = 20,
        estimatedDeliveryMinutesMax = 35,
        isOpen = true
    };

    private static object ValidDriver() => new
    {
        vehicleType = "Motorcycle",
        vehicleBrand = "Honda",
        vehicleModel = "Cargo",
        vehicleColor = "Rojo",
        vehiclePlate = "YUC123A",
        driverLicenseNumber = "LIC-ORDER-2026",
        profilePhotoUrl = "https://example.com/driver.jpg",
        identificationDocumentUrl =
            "https://example.com/identification.pdf",
        driverLicenseDocumentUrl =
            "https://example.com/license.pdf"
    };

    private static void SetAccessToken(HttpClient client, string token)
    {
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
    }

    private static async Task<JsonElement> ReadJsonAsync(
        HttpResponseMessage response
    ) =>
        await response.Content.ReadFromJsonAsync<JsonElement>();

    private sealed record CatalogIds(Guid StoreId, Guid ProductId);
}
