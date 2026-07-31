using Backend.Authorization;
using Backend.Contracts.Deliveries;
using Backend.Services.Deliveries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/tracking")]
public sealed class TrackingController(
    ITrackingService trackingService,
    ICurrentUserService currentUser
) : ControllerBase
{
    [HttpGet("orders/{orderId:guid}")]
    public async Task<ActionResult<OrderTrackingResponse>> GetOrder(
        Guid orderId,
        CancellationToken cancellationToken
    )
    {
        var response = await trackingService.GetAsync(
            currentUser.UserId,
            orderId,
            User.IsInRole("Admin"),
            cancellationToken
        );
        return Ok(response);
    }
}
