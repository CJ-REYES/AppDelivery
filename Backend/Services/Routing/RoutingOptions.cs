namespace Backend.Services.Routing;

public sealed class RoutingOptions
{
    public const string SectionName = "Routing";

    public string BaseUrl { get; init; } =
        "https://router.project-osrm.org/";

    public int TimeoutSeconds { get; init; } = 8;

    public string DefaultProfile { get; init; } = "driving";
}
