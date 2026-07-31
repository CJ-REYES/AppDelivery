using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Backend.Data;
using Backend.Models;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Backend.Tests;

public sealed class DriverAndTrackingTests
    : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public DriverAndTrackingTests(
        CustomWebApplicationFactory factory
    )
    {
        _factory = factory;
    }

    [Fact]
    public async Task Driver_registration_location_and_availability_are_connected()
    {
        using var client = _factory.CreateSecureClient();
        await RegisterAndAuthorizeAsync(client, "driver-profile");

        var create = await client.PostAsJsonAsync(
            "/api/drivers",
            ValidDriver()
        );
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);

        await RefreshAndAuthorizeAsync(client, expectedRole: "Driver");

        var location = await client.PutAsJsonAsync(
            "/api/drivers/me/location",
            new
            {
                latitude = 20.9674m,
                longitude = -89.5926m
            }
        );
        Assert.Equal(HttpStatusCode.OK, location.StatusCode);

        var availability = await client.PatchAsJsonAsync(
            "/api/drivers/me/availability",
            new { status = "Available" }
        );
        Assert.Equal(HttpStatusCode.OK, availability.StatusCode);
        Assert.Equal(
            "Available",
            (await ReadJsonAsync(availability))
                .GetProperty("availabilityStatus")
                .GetString()
        );

        var profile = await client.GetAsync("/api/drivers/me");
        var summary = await client.GetAsync("/api/drivers/me/summary");
        Assert.Equal(HttpStatusCode.OK, profile.StatusCode);
        Assert.Equal(HttpStatusCode.OK, summary.StatusCode);
    }

    [Fact]
    public async Task Rejected_delivery_is_hidden_only_for_current_driver()
    {
        using var driverClient = _factory.CreateSecureClient();
        await RegisterAndAuthorizeAsync(driverClient, "driver-reject");
        Assert.Equal(
            HttpStatusCode.Created,
            (
                await driverClient.PostAsJsonAsync(
                    "/api/drivers",
                    ValidDriver()
                )
            ).StatusCode
        );
        await RefreshAndAuthorizeAsync(driverClient, "Driver");
        await driverClient.PutAsJsonAsync(
            "/api/drivers/me/location",
            new { latitude = 20.9700m, longitude = -89.6100m }
        );
        await driverClient.PatchAsJsonAsync(
            "/api/drivers/me/availability",
            new { status = "Available" }
        );

        using var merchantClient = _factory.CreateSecureClient();
        await RegisterAndAuthorizeAsync(
            merchantClient,
            "reject-merchant"
        );
        var storeResponse = await merchantClient.PostAsJsonAsync(
            "/api/merchant/store",
            ValidStore()
        );
        var storeId = (await ReadJsonAsync(storeResponse))
            .GetProperty("id")
            .GetGuid();

        using var customerClient = _factory.CreateSecureClient();
        var customerRegistration = await RegisterAndAuthorizeAsync(
            customerClient,
            "reject-customer"
        );
        var customerId = customerRegistration
            .GetProperty("user")
            .GetProperty("id")
            .GetGuid();
        var orderId = await SeedReadyOrderAsync(customerId, storeId);

        var rejection = await driverClient.PostAsJsonAsync(
            $"/api/delivery-assignments/orders/{orderId}/reject",
            new { reason = "Ruta no conveniente" }
        );
        Assert.Equal(HttpStatusCode.NoContent, rejection.StatusCode);

        var available = await driverClient.GetAsync(
            "/api/delivery-assignments/available"
        );
        Assert.DoesNotContain(
            (await ReadJsonAsync(available)).EnumerateArray(),
            item => item.GetProperty("orderId").GetGuid() == orderId
        );

        using var scope = _factory.Services.CreateScope();
        var database = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();
        Assert.Contains(
            database.DeliveryAssignments,
            assignment =>
                assignment.OrderId == orderId
                && assignment.Status == DeliveryAssignmentStatus.Rejected
        );
    }

    [Fact]
    public async Task Driver_can_accept_complete_and_customer_can_track_delivery()
    {
        using var driverClient = _factory.CreateSecureClient();
        await RegisterAndAuthorizeAsync(driverClient, "driver-flow");
        var driverCreate = await driverClient.PostAsJsonAsync(
            "/api/drivers",
            ValidDriver()
        );
        Assert.Equal(HttpStatusCode.Created, driverCreate.StatusCode);
        await RefreshAndAuthorizeAsync(driverClient, "Driver");
        await driverClient.PutAsJsonAsync(
            "/api/drivers/me/location",
            new { latitude = 20.9700m, longitude = -89.6100m }
        );
        await driverClient.PatchAsJsonAsync(
            "/api/drivers/me/availability",
            new { status = "Available" }
        );

        using var merchantClient = _factory.CreateSecureClient();
        await RegisterAndAuthorizeAsync(merchantClient, "driver-merchant");
        var storeResponse = await merchantClient.PostAsJsonAsync(
            "/api/merchant/store",
            ValidStore()
        );
        Assert.Equal(HttpStatusCode.Created, storeResponse.StatusCode);
        var storeId = (await ReadJsonAsync(storeResponse))
            .GetProperty("id")
            .GetGuid();

        using var customerClient = _factory.CreateSecureClient();
        var customerRegistration = await RegisterAndAuthorizeAsync(
            customerClient,
            "driver-customer"
        );
        var customerId = customerRegistration
            .GetProperty("user")
            .GetProperty("id")
            .GetGuid();
        var orderId = await SeedReadyOrderAsync(customerId, storeId);

        var available = await driverClient.GetAsync(
            "/api/delivery-assignments/available"
        );
        Assert.Equal(HttpStatusCode.OK, available.StatusCode);
        var availableItems = (await ReadJsonAsync(available))
            .EnumerateArray()
            .ToArray();
        Assert.Contains(
            availableItems,
            item => item.GetProperty("orderId").GetGuid() == orderId
        );

        var accept = await driverClient.PostAsync(
            $"/api/delivery-assignments/orders/{orderId}/accept",
            null
        );
        Assert.Equal(HttpStatusCode.OK, accept.StatusCode);
        var assignmentId = (await ReadJsonAsync(accept))
            .GetProperty("assignmentId")
            .GetGuid();

        var tracking = await customerClient.GetAsync(
            $"/api/tracking/orders/{orderId}"
        );
        Assert.Equal(HttpStatusCode.OK, tracking.StatusCode);
        Assert.NotEmpty(
            (await ReadJsonAsync(tracking))
                .GetProperty("route")
                .GetProperty("geometry")
                .EnumerateArray()
        );

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
            var transition = await driverClient.PatchAsJsonAsync(
                $"/api/delivery-assignments/{assignmentId}/status",
                new { status, driverNotes = (string?)null }
            );
            Assert.Equal(HttpStatusCode.OK, transition.StatusCode);
        }

        var history = await driverClient.GetAsync(
            "/api/delivery-assignments/history"
        );
        Assert.Equal(HttpStatusCode.OK, history.StatusCode);
        Assert.Contains(
            (await ReadJsonAsync(history)).EnumerateArray(),
            item => item.GetProperty("orderId").GetGuid() == orderId
        );

        var finalTracking = await customerClient.GetAsync(
            $"/api/tracking/orders/{orderId}"
        );
        Assert.Equal(HttpStatusCode.OK, finalTracking.StatusCode);
        Assert.Equal(
            "Delivered",
            (await ReadJsonAsync(finalTracking))
                .GetProperty("orderStatus")
                .GetString()
        );
    }

    private async Task<Guid> SeedReadyOrderAsync(
        Guid customerId,
        Guid storeId
    )
    {
        using var scope = _factory.Services.CreateScope();
        var database = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();
        var order = new Order
        {
            OrderNumber = $"AD-{Guid.NewGuid():N}"[..16],
            CustomerId = customerId,
            StoreId = storeId,
            Status = OrderStatus.ReadyForPickup,
            PaymentStatus = PaymentStatus.Paid,
            Subtotal = 180m,
            DeliveryFee = 30m,
            ServiceFee = 8m,
            Total = 218m,
            DeliveryRecipientName = "Cliente de prueba",
            DeliveryPhoneNumber = "9995550102",
            DeliveryStreet = "Calle 47",
            DeliveryExteriorNumber = "120",
            DeliveryNeighborhood = "Centro",
            DeliveryCity = "Mérida",
            DeliveryState = "Yucatán",
            DeliveryPostalCode = "97000",
            DeliveryLatitude = 20.9600m,
            DeliveryLongitude = -89.6200m
        };

        database.Orders.Add(order);
        await database.SaveChangesAsync();
        return order.Id;
    }

    private static async Task<JsonElement> RegisterAndAuthorizeAsync(
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
        var payload = await ReadJsonAsync(response);
        SetAccessToken(
            client,
            payload.GetProperty("accessToken").GetString()!
        );
        return payload;
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

    private static object ValidDriver() => new
    {
        vehicleType = "Motorcycle",
        vehicleBrand = "Honda",
        vehicleModel = "Cargo",
        vehicleColor = "Rojo",
        vehiclePlate = "YUC123A",
        driverLicenseNumber = "LIC-2026-001",
        profilePhotoUrl = "https://example.com/driver.jpg",
        identificationDocumentUrl =
            "https://example.com/identification.pdf",
        driverLicenseDocumentUrl =
            "https://example.com/license.pdf"
    };

    private static object ValidStore() => new
    {
        storeCategoryId = 1,
        name = $"Restaurante Ruta {Guid.NewGuid():N}",
        description =
            "Restaurante local preparado para las pruebas de reparto.",
        phoneNumber = "9991234567",
        email = "ruta@example.com",
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
        deliveryFee = 30m,
        minimumOrderAmount = 100m,
        estimatedDeliveryMinutesMin = 20,
        estimatedDeliveryMinutesMax = 35,
        isOpen = true
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
}
