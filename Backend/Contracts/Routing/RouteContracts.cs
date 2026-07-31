using System.ComponentModel.DataAnnotations;

namespace Backend.Contracts.Routing;

public sealed class RoutePointRequest
{
    [Range(typeof(decimal), "-90", "90")]
    public decimal Latitude { get; init; }

    [Range(typeof(decimal), "-180", "180")]
    public decimal Longitude { get; init; }
}

public sealed class RoutePreviewRequest
{
    [Required]
    public RoutePointRequest Origin { get; init; } = null!;

    public RoutePointRequest? Waypoint { get; init; }

    [Required]
    public RoutePointRequest Destination { get; init; } = null!;

    [RegularExpression(
        "^(driving|cycling|walking)$",
        ErrorMessage = "El perfil debe ser driving, cycling o walking."
    )]
    public string Profile { get; init; } = "driving";
}

public sealed record RoutePointResponse(
    decimal Latitude,
    decimal Longitude
);

public sealed record RouteResponse(
    double DistanceMeters,
    double DurationSeconds,
    IReadOnlyCollection<RoutePointResponse> Geometry,
    bool IsEstimated,
    string Profile
);
