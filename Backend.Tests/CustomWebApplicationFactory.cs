using Backend.Data;
using Backend.Contracts.Routing;
using Backend.Services.Routing;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;

namespace Backend.Tests;

public sealed class CustomWebApplicationFactory
    : WebApplicationFactory<Program>
{
    private readonly string _databaseName =
        $"appdelivery-tests-{Guid.NewGuid()}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        builder.ConfigureAppConfiguration((_, configuration) =>
        {
            configuration.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] =
                    "Server=localhost;Database=appdelivery_tests;User=test;Password=test;",
                ["Jwt:Issuer"] = "AppDelivery.Tests",
                ["Jwt:Audience"] = "AppDelivery.Tests.Client",
                ["Jwt:Key"] =
                    "appdelivery-tests-key-with-more-than-thirty-two-bytes-2026"
            });
        });

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<AppDbContext>();
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.RemoveAll<IRoutingService>();

            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase(_databaseName)
            );
            services.AddSingleton<IRoutingService>(
                new TestRoutingService()
            );
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);

        using var scope = host.Services.CreateScope();
        var database = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        database.Database.EnsureCreated();

        return host;
    }

    public HttpClient CreateSecureClient() =>
        CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost"),
            AllowAutoRedirect = false,
            HandleCookies = true
        });

    private sealed class TestRoutingService : IRoutingService
    {
        public Task<RouteResponse> CalculateAsync(
            IReadOnlyCollection<RoutePointResponse> points,
            string? profile,
            CancellationToken cancellationToken
        )
        {
            var geometry = points.ToArray();
            var distance = 0d;

            for (var index = 1; index < geometry.Length; index++)
            {
                distance += OsrmRoutingService.HaversineMeters(
                    geometry[index - 1],
                    geometry[index]
                );
            }

            return Task.FromResult(new RouteResponse(
                distance,
                distance / 7d,
                geometry,
                IsEstimated: false,
                profile ?? "driving"
            ));
        }
    }
}
