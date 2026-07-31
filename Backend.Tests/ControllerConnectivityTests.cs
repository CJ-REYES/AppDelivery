using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace Backend.Tests;

public sealed class ControllerConnectivityTests
    : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public ControllerConnectivityTests(
        CustomWebApplicationFactory factory
    )
    {
        _factory = factory;
    }

    [Fact]
    public async Task Auth_and_user_profile_endpoints_complete_the_session_flow()
    {
        using var client = _factory.CreateSecureClient();
        var registration = await RegisterAndAuthorizeAsync(client);

        var authMe = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, authMe.StatusCode);

        var userMe = await client.GetAsync("/api/users/me");
        Assert.Equal(HttpStatusCode.OK, userMe.StatusCode);

        var update = await client.PutAsJsonAsync(
            "/api/users/me",
            new
            {
                firstName = "Carlos Alberto",
                lastName = "Reyes",
                phoneNumber = "9995550101"
            }
        );
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);
        var updatedUser = await ReadJsonAsync(update);
        Assert.Equal(
            "Carlos Alberto",
            updatedUser.GetProperty("firstName").GetString()
        );

        var refresh = await client.PostAsync("/api/auth/refresh", null);
        Assert.Equal(HttpStatusCode.OK, refresh.StatusCode);
        var refreshedToken = (await ReadJsonAsync(refresh))
            .GetProperty("accessToken")
            .GetString()!;
        SetAccessToken(
            client,
            refreshedToken
        );

        var logout = await client.PostAsync("/api/auth/logout", null);
        Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);

        var refreshAfterLogout = await client.PostAsync(
            "/api/auth/refresh",
            null
        );
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            refreshAfterLogout.StatusCode
        );

        Assert.Equal(
            HttpStatusCode.Created,
            registration.StatusCode
        );
    }

    [Fact]
    public async Task Address_controller_supports_the_complete_owned_crud_flow()
    {
        using var client = _factory.CreateSecureClient();
        await RegisterAndAuthorizeAsync(client);

        var createFirst = await client.PostAsJsonAsync(
            "/api/addresses",
            ValidAddress("Casa", "425", isDefault: true)
        );
        Assert.Equal(HttpStatusCode.Created, createFirst.StatusCode);
        var firstId = (await ReadJsonAsync(createFirst))
            .GetProperty("id")
            .GetGuid();

        var getAll = await client.GetAsync("/api/addresses");
        Assert.Equal(HttpStatusCode.OK, getAll.StatusCode);
        Assert.Single((await ReadJsonAsync(getAll)).EnumerateArray());

        var getById = await client.GetAsync($"/api/addresses/{firstId}");
        Assert.Equal(HttpStatusCode.OK, getById.StatusCode);

        var update = await client.PutAsJsonAsync(
            $"/api/addresses/{firstId}",
            ValidAddress("Casa actualizada", "426", isDefault: true)
        );
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);
        Assert.Equal(
            "426",
            (await ReadJsonAsync(update))
                .GetProperty("exteriorNumber")
                .GetString()
        );

        var createSecond = await client.PostAsJsonAsync(
            "/api/addresses",
            ValidAddress("Trabajo", "310", isDefault: false)
        );
        Assert.Equal(HttpStatusCode.Created, createSecond.StatusCode);
        var secondId = (await ReadJsonAsync(createSecond))
            .GetProperty("id")
            .GetGuid();

        var setDefault = await client.PatchAsync(
            $"/api/addresses/{secondId}/default",
            null
        );
        Assert.Equal(HttpStatusCode.OK, setDefault.StatusCode);
        Assert.True(
            (await ReadJsonAsync(setDefault))
                .GetProperty("isDefault")
                .GetBoolean()
        );

        var delete = await client.DeleteAsync(
            $"/api/addresses/{secondId}"
        );
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);

        var remaining = await client.GetAsync("/api/addresses");
        var remainingAddresses = (await ReadJsonAsync(remaining))
            .EnumerateArray()
            .ToArray();
        var remainingAddress = Assert.Single(remainingAddresses);
        Assert.Equal(firstId, remainingAddress.GetProperty("id").GetGuid());
        Assert.True(
            remainingAddress.GetProperty("isDefault").GetBoolean()
        );
    }

    [Fact]
    public async Task Merchant_controller_supports_complete_catalog_lifecycle()
    {
        using var client = _factory.CreateSecureClient();
        await RegisterAndAuthorizeAsync(client);

        var createStore = await client.PostAsJsonAsync(
            "/api/merchant/store",
            ValidStore("Mercado Conectado")
        );
        Assert.Equal(HttpStatusCode.Created, createStore.StatusCode);
        var storeId = (await ReadJsonAsync(createStore))
            .GetProperty("id")
            .GetGuid();

        var refresh = await client.PostAsync("/api/auth/refresh", null);
        Assert.Equal(HttpStatusCode.OK, refresh.StatusCode);
        var refreshedToken = (await ReadJsonAsync(refresh))
            .GetProperty("accessToken")
            .GetString()!;
        SetAccessToken(
            client,
            refreshedToken
        );

        var getStore = await client.GetAsync("/api/merchant/store");
        Assert.Equal(HttpStatusCode.OK, getStore.StatusCode);

        var updateStore = await client.PutAsJsonAsync(
            "/api/merchant/store",
            ValidStore("Mercado Conectado Actualizado")
        );
        Assert.Equal(HttpStatusCode.OK, updateStore.StatusCode);

        var createCategory = await client.PostAsJsonAsync(
            "/api/merchant/categories",
            new
            {
                name = "Bebidas",
                displayOrder = 1,
                isActive = true
            }
        );
        Assert.Equal(
            HttpStatusCode.Created,
            createCategory.StatusCode
        );
        var categoryId = (await ReadJsonAsync(createCategory))
            .GetProperty("id")
            .GetGuid();

        var categories = await client.GetAsync(
            "/api/merchant/categories"
        );
        Assert.Equal(HttpStatusCode.OK, categories.StatusCode);
        Assert.Single((await ReadJsonAsync(categories)).EnumerateArray());

        var updateCategory = await client.PutAsJsonAsync(
            $"/api/merchant/categories/{categoryId}",
            new
            {
                name = "Bebidas frías",
                displayOrder = 2,
                isActive = true
            }
        );
        Assert.Equal(HttpStatusCode.OK, updateCategory.StatusCode);

        var createProduct = await client.PostAsJsonAsync(
            "/api/merchant/products",
            ValidProduct(categoryId, "Agua de chaya")
        );
        Assert.Equal(
            HttpStatusCode.Created,
            createProduct.StatusCode
        );
        var productId = (await ReadJsonAsync(createProduct))
            .GetProperty("id")
            .GetGuid();

        var products = await client.GetAsync("/api/merchant/products");
        Assert.Equal(HttpStatusCode.OK, products.StatusCode);
        Assert.Single((await ReadJsonAsync(products)).EnumerateArray());

        var updateProduct = await client.PutAsJsonAsync(
            $"/api/merchant/products/{productId}",
            ValidProduct(categoryId, "Agua de chaya grande")
        );
        Assert.Equal(HttpStatusCode.OK, updateProduct.StatusCode);

        client.DefaultRequestHeaders.Authorization = null;
        var publicStore = await client.GetAsync(
            $"/api/catalog/stores/{storeId}"
        );
        Assert.Equal(HttpStatusCode.OK, publicStore.StatusCode);
        var publicProducts = await client.GetAsync(
            $"/api/catalog/stores/{storeId}/products"
        );
        Assert.Equal(HttpStatusCode.OK, publicProducts.StatusCode);
        Assert.Single(
            (await ReadJsonAsync(publicProducts)).EnumerateArray()
        );

        SetAccessToken(
            client,
            refreshedToken
        );
        var deleteProduct = await client.DeleteAsync(
            $"/api/merchant/products/{productId}"
        );
        Assert.Equal(
            HttpStatusCode.NoContent,
            deleteProduct.StatusCode
        );

        var deleteCategory = await client.DeleteAsync(
            $"/api/merchant/categories/{categoryId}"
        );
        Assert.Equal(
            HttpStatusCode.NoContent,
            deleteCategory.StatusCode
        );

        var deactivateStore = await client.DeleteAsync(
            "/api/merchant/store"
        );
        Assert.Equal(
            HttpStatusCode.NoContent,
            deactivateStore.StatusCode
        );

        client.DefaultRequestHeaders.Authorization = null;
        var hiddenStore = await client.GetAsync(
            $"/api/catalog/stores/{storeId}"
        );
        Assert.Equal(HttpStatusCode.NotFound, hiddenStore.StatusCode);
    }

    private static async Task<HttpResponseMessage>
        RegisterAndAuthorizeAsync(HttpClient client)
    {
        var response = await client.PostAsJsonAsync(
            "/api/auth/register",
            new
            {
                firstName = "Carlos",
                lastName = "Reyes",
                email = $"controller-{Guid.NewGuid():N}@example.com",
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
        return response;
    }

    private static object ValidAddress(
        string label,
        string exteriorNumber,
        bool isDefault
    ) => new
    {
        label,
        street = "Calle 60",
        exteriorNumber,
        interiorNumber = (string?)null,
        neighborhood = "Centro",
        city = "Mérida",
        state = "Yucatán",
        postalCode = "97000",
        country = "México",
        references = "Portón verde",
        latitude = 20.9674m,
        longitude = -89.5926m,
        isDefault
    };

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

    private static object ValidProduct(Guid categoryId, string name) =>
        new
        {
            productCategoryId = categoryId,
            name,
            description = "Bebida preparada con ingredientes locales.",
            price = 45m,
            imageUrl = "https://example.com/product.jpg",
            isAvailable = true,
            isFeatured = false,
            preparationTimeMinutes = 10
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
