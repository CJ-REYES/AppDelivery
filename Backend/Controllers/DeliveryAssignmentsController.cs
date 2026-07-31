using Backend.Authorization;
using Backend.Contracts.Deliveries;
using Backend.Services.Deliveries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize(Policy = "DriverOnly")]
[Route("api/delivery-assignments")]
public sealed class DeliveryAssignmentsController(
    IDeliveryAssignmentService deliveryService,
    ICurrentUserService currentUser
) : ControllerBase
{
    [HttpGet("available")]
    public async Task<
        ActionResult<IReadOnlyCollection<AvailableDeliveryResponse>>
    > GetAvailable(CancellationToken cancellationToken)
    {
        var response = await deliveryService.GetAvailableAsync(
            currentUser.UserId,
            cancellationToken
        );
        return Ok(response);
    }

    [HttpPost("orders/{orderId:guid}/accept")]
    public async Task<ActionResult<ActiveDeliveryResponse>> Accept(
        Guid orderId,
        CancellationToken cancellationToken
    )
    {
        var response = await deliveryService.AcceptAsync(
            currentUser.UserId,
            orderId,
            cancellationToken
        );
        return Ok(response);
    }

    [HttpPost("orders/{orderId:guid}/reject")]
    public async Task<IActionResult> Reject(
        Guid orderId,
        RejectDeliveryRequest request,
        CancellationToken cancellationToken
    )
    {
        await deliveryService.RejectAsync(
            currentUser.UserId,
            orderId,
            request,
            cancellationToken
        );
        return NoContent();
    }

    [HttpGet("active")]
    public async Task<ActionResult<ActiveDeliveryResponse>> GetActive(
        CancellationToken cancellationToken
    )
    {
        var response = await deliveryService.GetActiveAsync(
            currentUser.UserId,
            cancellationToken
        );
        return Ok(response);
    }

    [HttpPatch("{assignmentId:guid}/status")]
    public async Task<ActionResult<ActiveDeliveryResponse>> Advance(
        Guid assignmentId,
        AdvanceDeliveryRequest request,
        CancellationToken cancellationToken
    )
    {
        var response = await deliveryService.AdvanceAsync(
            currentUser.UserId,
            assignmentId,
            request,
            cancellationToken
        );
        return Ok(response);
    }

    [HttpGet("history")]
    public async Task<
        ActionResult<IReadOnlyCollection<DeliveryHistoryResponse>>
    > GetHistory(CancellationToken cancellationToken)
    {
        var response = await deliveryService.GetHistoryAsync(
            currentUser.UserId,
            cancellationToken
        );
        return Ok(response);
    }
}
