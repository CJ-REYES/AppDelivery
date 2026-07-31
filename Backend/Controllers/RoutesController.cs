using Backend.Contracts.Routing;
using Backend.Services.Routing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/routes")]
public sealed class RoutesController(
    IRoutingService routingService
) : ControllerBase
{
    [HttpPost("best")]
    public async Task<ActionResult<RouteResponse>> BestRoute(
        RoutePreviewRequest request,
        CancellationToken cancellationToken
    )
    {
        var points = new List<RoutePointResponse>
        {
            new(
                request.Origin.Latitude,
                request.Origin.Longitude
            )
        };

        if (request.Waypoint is not null)
        {
            points.Add(new RoutePointResponse(
                request.Waypoint.Latitude,
                request.Waypoint.Longitude
            ));
        }

        points.Add(new RoutePointResponse(
            request.Destination.Latitude,
            request.Destination.Longitude
        ));

        return Ok(await routingService.CalculateAsync(
            points,
            request.Profile,
            cancellationToken
        ));
    }
}
