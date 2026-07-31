using Backend.Authorization;
using Backend.Contracts.Orders;
using Backend.Services.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize(Policy = "MerchantOnly")]
[Route("api/merchant/orders")]
public sealed class MerchantOrdersController(
    IOrderService orderService,
    ICurrentUserService currentUser
) : ControllerBase
{
    [HttpGet]
    public async Task<
        ActionResult<IReadOnlyCollection<OrderResponse>>
    > GetAll(CancellationToken cancellationToken)
    {
        var response = await orderService.GetMerchantOrdersAsync(
            currentUser.UserId,
            cancellationToken
        );
        return Ok(response);
    }

    [HttpGet("summary")]
    public async Task<ActionResult<MerchantSalesSummaryResponse>> GetSummary(
        CancellationToken cancellationToken
    )
    {
        var response = await orderService.GetMerchantSummaryAsync(
            currentUser.UserId,
            cancellationToken
        );
        return Ok(response);
    }

    [HttpGet("{orderId:guid}")]
    public async Task<ActionResult<OrderResponse>> Get(
        Guid orderId,
        CancellationToken cancellationToken
    )
    {
        var response = await orderService.GetMerchantOrderAsync(
            currentUser.UserId,
            orderId,
            cancellationToken
        );
        return Ok(response);
    }

    [HttpPatch("{orderId:guid}/status")]
    public async Task<ActionResult<OrderResponse>> UpdateStatus(
        Guid orderId,
        UpdateMerchantOrderStatusRequest request,
        CancellationToken cancellationToken
    )
    {
        var response = await orderService.UpdateMerchantStatusAsync(
            currentUser.UserId,
            orderId,
            request,
            cancellationToken
        );
        return Ok(response);
    }
}
