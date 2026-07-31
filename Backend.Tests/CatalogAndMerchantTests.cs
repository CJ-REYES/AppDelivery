using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace Backend.Tests;

public sealed class CatalogAndMerchantTests
    : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public CatalogAndMerchantTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Public_catalog_exposes_seeded_store_categories()
    {
        using var client = _factory.CreateSecureClient();

        var response = await client.GetAsync(
            "/api/catalog/store-categories"
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var categories = await ReadJsonAsync(response);
        Assert.Contains(
            categories.EnumerateArray(),
            category => category.GetProperty("slug").GetString()
                == "restaurantes"
        );
    }

    [Fact]
    public async Task Merchant_can_publish_product_and_customer_can_find_it()
    {
        using var client = _factory.CreateSecureClient();
        var storeName = $"Cocina del Mayab {Guid.NewGuid():N}";
        await CreateMerchantAsync(client, storeName);

        var categoryResponse = await client.PostAsJsonAsync(
            "/api/merchant/categories",
            new
            {
                name = "Platillos",
                displayOrder = 1,
                isActive = true
            }
        );
        Assert.Equal(HttpStatusCode.Created, categoryResponse.StatusCode);
        var categoryId = (await ReadJsonAsync(categoryResponse))
            .GetProperty("id")
            .GetGuid();

        var productName = $"Poc chuc {Guid.NewGuid():N}";
        var productResponse = await client.PostAsJsonAsync(
            "/api/merchant/products",
            new
            {
                productCategoryId = categoryId,
                name = productName,
                description = "Cerdo marinado acompañado de guarniciones locales.",
                price = 165.50m,
                imageUrl = "https://example.com/poc-chuc.jpg",
                isAvailable = true,
                isFeatured = true,
                preparationTimeMinutes = 25
            }
        );
        Assert.Equal(HttpStatusCode.Created, productResponse.StatusCode);
        var productId = (await ReadJsonAsync(productResponse))
            .GetProperty("id")
            .GetGuid();

        client.DefaultRequestHeaders.Authorization = null;
        var storesResponse = await client.GetAsync(
            $"/api/catalog/stores?search={Uri.EscapeDataString(productName)}"
        );
        Assert.Equal(HttpStatusCode.OK, storesResponse.StatusCode);
        var stores = await ReadJsonAsync(storesResponse);
        var store = Assert.Single(stores.EnumerateArray());
        var storeId = store.GetProperty("id").GetGuid();
        Assert.Equal(storeName, store.GetProperty("name").GetString());

        var productsResponse = await client.GetAsync(
            $"/api/catalog/stores/{storeId}/products"
        );
        Assert.Equal(HttpStatusCode.OK, productsResponse.StatusCode);
        var products = await ReadJsonAsync(productsResponse);
        Assert.Contains(
            products.EnumerateArray(),
            product =>
                product.GetProperty("id").GetGuid() == productId
                && product.GetProperty("name").GetString() == productName
        );
    }

    [Fact]
    public async Task Customer_without_merchant_role_cannot_manage_catalog()
    {
        using var client = _factory.CreateSecureClient();
        var registration = await RegisterAsync(client);
        SetAccessToken(client, await AccessTokenAsync(registration));

        var response = await client.GetAsync("/api/merchant/store");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Merchant_cannot_update_another_merchants_product()
    {
        using var firstClient = _factory.CreateSecureClient();
        await CreateMerchantAsync(
            firstClient,
            $"Primer comercio {Guid.NewGuid():N}"
        );
        var firstCategoryId = await CreateCategoryAsync(firstClient);
        var firstProductResponse = await firstClient.PostAsJsonAsync(
            "/api/merchant/products",
            ValidProduct(firstCategoryId, "Producto protegido")
        );
        Assert.Equal(
            HttpStatusCode.Created,
            firstProductResponse.StatusCode
        );
        var firstProductId = (await ReadJsonAsync(firstProductResponse))
            .GetProperty("id")
            .GetGuid();

        using var secondClient = _factory.CreateSecureClient();
        await CreateMerchantAsync(
            secondClient,
            $"Segundo comercio {Guid.NewGuid():N}"
        );
        var secondCategoryId = await CreateCategoryAsync(secondClient);

        var response = await secondClient.PutAsJsonAsync(
            $"/api/merchant/products/{firstProductId}",
            ValidProduct(secondCategoryId, "Intento ajeno")
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private async Task CreateMerchantAsync(
        HttpClient client,
        string storeName
    )
    {
        var registration = await RegisterAsync(client);
        SetAccessToken(client, await AccessTokenAsync(registration));

        var createStore = await client.PostAsJsonAsync(
            "/api/merchant/store",
            ValidStore(storeName)
        );
        Assert.Equal(HttpStatusCode.Created, createStore.StatusCode);

        var refresh = await client.PostAsync("/api/auth/refresh", null);
        Assert.Equal(HttpStatusCode.OK, refresh.StatusCode);
        var refreshedPayload = await ReadJsonAsync(refresh);
        SetAccessToken(
            client,
            refreshedPayload.GetProperty("accessToken").GetString()!
        );
        Assert.Contains(
            refreshedPayload
                .GetProperty("user")
                .GetProperty("roles")
                .EnumerateArray(),
            role => role.GetString() == "Merchant"
        );
    }

    private static async Task<Guid> CreateCategoryAsync(HttpClient client)
    {
        var response = await client.PostAsJsonAsync(
            "/api/merchant/categories",
            new
            {
                name = $"Categoría {Guid.NewGuid():N}",
                displayOrder = 1,
                isActive = true
            }
        );
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return (await ReadJsonAsync(response)).GetProperty("id").GetGuid();
    }

    private static Task<HttpResponseMessage> RegisterAsync(
        HttpClient client
    ) =>
        client.PostAsJsonAsync("/api/auth/register", new
        {
            firstName = "Carlos",
            lastName = "Reyes",
            email = $"merchant-{Guid.NewGuid():N}@example.com",
            password = "AppDelivery2026!",
            phoneNumber = "9991234567"
        });

    private static object ValidStore(string name) => new
    {
        storeCategoryId = 1,
        name,
        description =
            "Comercio local con productos preparados todos los días.",
        phoneNumber = "9991234567",
        email = "comercio@example.com",
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

    private static object ValidProduct(Guid categoryId, string name) => new
    {
        productCategoryId = categoryId,
        name,
        description = "Producto preparado con ingredientes locales.",
        price = 120m,
        imageUrl = "https://example.com/product.jpg",
        isAvailable = true,
        isFeatured = false,
        preparationTimeMinutes = 20
    };

    private static void SetAccessToken(HttpClient client, string token)
    {
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
    }

    private static async Task<string> AccessTokenAsync(
        HttpResponseMessage response
    ) =>
        (await ReadJsonAsync(response))
            .GetProperty("accessToken")
            .GetString()!;

    private static async Task<JsonElement> ReadJsonAsync(
        HttpResponseMessage response
    ) =>
        await response.Content.ReadFromJsonAsync<JsonElement>();
}
