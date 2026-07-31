using System.Globalization;
using System.Text.Json;
using Backend.Contracts.Routing;
using Microsoft.Extensions.Options;

namespace Backend.Services.Routing;

public sealed class OsrmRoutingService(
    HttpClient httpClient,
    IOptions<RoutingOptions> options,
    ILogger<OsrmRoutingService> logger
) : IRoutingService
{
    private readonly RoutingOptions _options = options.Value;

    public async Task<RouteResponse> CalculateAsync(
        IReadOnlyCollection<RoutePointResponse> points,
        string? profile,
        CancellationToken cancellationToken
    )
    {
        var normalizedPoints = points.ToArray();
        var normalizedProfile = NormalizeProfile(profile);

        if (normalizedPoints.Length < 2)
        {
            throw new ArgumentException(
                "Una ruta necesita por lo menos un origen y un destino.",
                nameof(points)
            );
        }

        var coordinates = string.Join(
            ";",
            normalizedPoints.Select(point =>
                $"{Format(point.Longitude)},{Format(point.Latitude)}"
            )
        );
        var requestUri =
            $"route/v1/{normalizedProfile}/{coordinates}"
            + "?overview=full&geometries=geojson&steps=false";

        try
        {
            using var response = await httpClient.GetAsync(
                requestUri,
                cancellationToken
            );
            response.EnsureSuccessStatusCode();

            await using var stream = await response.Content.ReadAsStreamAsync(
                cancellationToken
            );
            using var document = await JsonDocument.ParseAsync(
                stream,
                cancellationToken: cancellationToken
            );
            var route = document.RootElement
                .GetProperty("routes")[0];
            var geometry = route
                .GetProperty("geometry")
                .GetProperty("coordinates")
                .EnumerateArray()
                .Select(coordinate => new RoutePointResponse(
                    Latitude: coordinate[1].GetDecimal(),
                    Longitude: coordinate[0].GetDecimal()
                ))
                .ToArray();

            return new RouteResponse(
                route.GetProperty("distance").GetDouble(),
                route.GetProperty("duration").GetDouble(),
                geometry,
                IsEstimated: false,
                normalizedProfile
            );
        }
        catch (Exception exception) when (
            exception is HttpRequestException
                or TaskCanceledException
                or JsonException
                or InvalidOperationException
        )
        {
            logger.LogWarning(
                exception,
                "El proveedor de rutas no respondió; se usará una estimación geográfica."
            );
            return Estimate(normalizedPoints, normalizedProfile);
        }
    }

    private string NormalizeProfile(string? profile)
    {
        var value = string.IsNullOrWhiteSpace(profile)
            ? _options.DefaultProfile
            : profile.Trim().ToLowerInvariant();

        return value is "driving" or "cycling" or "walking"
            ? value
            : _options.DefaultProfile;
    }

    private static RouteResponse Estimate(
        IReadOnlyList<RoutePointResponse> points,
        string profile
    )
    {
        var distance = 0d;

        for (var index = 1; index < points.Count; index++)
        {
            distance += HaversineMeters(points[index - 1], points[index]);
        }

        var speedKilometersPerHour = profile switch
        {
            "walking" => 4.5d,
            "cycling" => 15d,
            _ => 25d
        };
        var duration = distance / (speedKilometersPerHour * 1000d / 3600d);

        return new RouteResponse(
            distance,
            duration,
            points.ToArray(),
            IsEstimated: true,
            profile
        );
    }

    public static double HaversineMeters(
        RoutePointResponse first,
        RoutePointResponse second
    )
    {
        const double earthRadiusMeters = 6_371_000d;
        var firstLatitude = DegreesToRadians((double)first.Latitude);
        var secondLatitude = DegreesToRadians((double)second.Latitude);
        var latitudeDifference = secondLatitude - firstLatitude;
        var longitudeDifference = DegreesToRadians(
            (double)(second.Longitude - first.Longitude)
        );
        var a =
            Math.Pow(Math.Sin(latitudeDifference / 2d), 2d)
            + Math.Cos(firstLatitude)
            * Math.Cos(secondLatitude)
            * Math.Pow(Math.Sin(longitudeDifference / 2d), 2d);

        return earthRadiusMeters
            * 2d
            * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1d - a));
    }

    private static double DegreesToRadians(double degrees) =>
        degrees * Math.PI / 180d;

    private static string Format(decimal value) =>
        value.ToString(CultureInfo.InvariantCulture);
}
