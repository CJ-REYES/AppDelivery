using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Backend.Tests;

public sealed class AuthAndAuthorizationTests
    : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public AuthAndAuthorizationTests(
        CustomWebApplicationFactory factory
    )
    {
        _factory = factory;
    }

    [Fact]
    public async Task Register_creates_customer_and_allows_me()
    {
        using var client = _factory.CreateSecureClient();
        var email = UniqueEmail();
        var registration = await RegisterAsync(client, email);

        Assert.Equal(HttpStatusCode.Created, registration.StatusCode);

        var payload = await ReadJsonAsync(registration);
        var accessToken = payload.GetProperty("accessToken").GetString();
        var roles = payload.GetProperty("user").GetProperty("roles");

        Assert.False(string.IsNullOrWhiteSpace(accessToken));
        Assert.Contains(
            roles.EnumerateArray(),
            role => role.GetString() == "Customer"
        );

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", accessToken);

        var me = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);

        var mePayload = await ReadJsonAsync(me);
        Assert.Equal(email, mePayload.GetProperty("email").GetString());
    }

    [Fact]
    public async Task Invalid_password_returns_problem_details()
    {
        using var client = _factory.CreateSecureClient();
        var email = UniqueEmail();
        await RegisterAsync(client, email);

        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email,
            password = "ContraseñaIncorrecta2026!"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal(
            "application/problem+json",
            response.Content.Headers.ContentType?.MediaType
        );

        var problem = await ReadJsonAsync(response);
        Assert.Equal(
            "unauthorized",
            problem.GetProperty("errorCode").GetString()
        );
    }

    [Fact]
    public async Task Protected_endpoint_rejects_anonymous_requests()
    {
        using var client = _factory.CreateSecureClient();

        var response = await client.GetAsync("/api/addresses");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Role_policies_reject_customer_and_accept_admin()
    {
        using var scope = _factory.Services.CreateScope();
        var authorization = scope.ServiceProvider
            .GetRequiredService<IAuthorizationService>();

        var customer = PrincipalWithRole("Customer");
        var admin = PrincipalWithRole("Admin");

        var customerResult = await authorization.AuthorizeAsync(
            customer,
            resource: null,
            policyName: "AdminOnly"
        );
        var adminResult = await authorization.AuthorizeAsync(
            admin,
            resource: null,
            policyName: "AdminOnly"
        );

        Assert.False(customerResult.Succeeded);
        Assert.True(adminResult.Succeeded);
    }

    [Fact]
    public async Task User_cannot_read_another_users_address()
    {
        using var firstClient = _factory.CreateSecureClient();
        using var secondClient = _factory.CreateSecureClient();

        var firstRegistration = await RegisterAsync(
            firstClient,
            UniqueEmail()
        );
        var firstToken = (await ReadJsonAsync(firstRegistration))
            .GetProperty("accessToken")
            .GetString();

        firstClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", firstToken);

        var createAddress = await firstClient.PostAsJsonAsync(
            "/api/addresses",
            ValidAddress()
        );
        Assert.Equal(HttpStatusCode.Created, createAddress.StatusCode);

        var addressId = (await ReadJsonAsync(createAddress))
            .GetProperty("id")
            .GetGuid();

        var secondRegistration = await RegisterAsync(
            secondClient,
            UniqueEmail()
        );
        var secondToken = (await ReadJsonAsync(secondRegistration))
            .GetProperty("accessToken")
            .GetString();

        secondClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", secondToken);

        var forbiddenRead = await secondClient.GetAsync(
            $"/api/addresses/{addressId}"
        );

        Assert.Equal(HttpStatusCode.NotFound, forbiddenRead.StatusCode);
    }

    [Fact]
    public async Task Password_recovery_invalidates_old_password()
    {
        using var client = _factory.CreateSecureClient();
        var email = UniqueEmail();
        await RegisterAsync(client, email);

        var forgot = await client.PostAsJsonAsync(
            "/api/auth/forgot-password",
            new { email }
        );
        Assert.Equal(HttpStatusCode.Accepted, forgot.StatusCode);

        var resetToken = (await ReadJsonAsync(forgot))
            .GetProperty("resetToken")
            .GetString();
        Assert.False(string.IsNullOrWhiteSpace(resetToken));

        var reset = await client.PostAsJsonAsync(
            "/api/auth/reset-password",
            new
            {
                token = resetToken,
                newPassword = "NuevaClave2026!"
            }
        );
        Assert.Equal(HttpStatusCode.NoContent, reset.StatusCode);

        var oldLogin = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email,
            password = "AppDelivery2026!"
        });
        Assert.Equal(HttpStatusCode.Unauthorized, oldLogin.StatusCode);

        var newLogin = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email,
            password = "NuevaClave2026!"
        });
        Assert.Equal(HttpStatusCode.OK, newLogin.StatusCode);
    }

    [Fact]
    public async Task Weak_password_returns_validation_problem()
    {
        using var client = _factory.CreateSecureClient();

        var response = await client.PostAsJsonAsync(
            "/api/auth/register",
            new
            {
                firstName = "Carlos",
                lastName = "Reyes",
                email = UniqueEmail(),
                password = "1234",
                phoneNumber = "9991234567"
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await ReadJsonAsync(response);
        Assert.Equal(
            "validation_error",
            problem.GetProperty("errorCode").GetString()
        );
    }

    private static Task<HttpResponseMessage> RegisterAsync(
        HttpClient client,
        string email
    ) =>
        client.PostAsJsonAsync("/api/auth/register", new
        {
            firstName = "Carlos",
            lastName = "Reyes",
            email,
            password = "AppDelivery2026!",
            phoneNumber = "9991234567"
        });

    private static object ValidAddress() => new
    {
        label = "Casa",
        street = "Calle 60",
        exteriorNumber = "425",
        interiorNumber = (string?)null,
        neighborhood = "Centro",
        city = "Mérida",
        state = "Yucatán",
        postalCode = "97000",
        country = "México",
        references = "Portón negro",
        latitude = 20.9674m,
        longitude = -89.5926m,
        isDefault = true
    };

    private static async Task<JsonElement> ReadJsonAsync(
        HttpResponseMessage response
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
        return payload;
    }

    private static string UniqueEmail() =>
        $"carlos-{Guid.NewGuid():N}@example.com";

    private static ClaimsPrincipal PrincipalWithRole(string role)
    {
        var identity = new ClaimsIdentity(
            new[] { new Claim(ClaimTypes.Role, role) },
            authenticationType: "Test"
        );

        return new ClaimsPrincipal(identity);
    }
}
