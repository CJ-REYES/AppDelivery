using Backend.Contracts.Routing;

namespace Backend.Services.Routing;

public interface IRoutingService
{
    Task<RouteResponse> CalculateAsync(
        IReadOnlyCollection<RoutePointResponse> points,
        string? profile,
        CancellationToken cancellationToken
    );
}
