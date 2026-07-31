using Backend.Authorization;
using Backend.Contracts.Orders;
using Backend.Services.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/orders")]
public sealed class OrdersController(
    IOrderService orderService,
    ICurrentUserService currentUser
) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<OrderResponse>> Create(
        CreateOrderRequest request,
        CancellationToken cancellationToken
    )
    {
        var response = await orderService.CreateAsync(
            currentUser.UserId,
            request,
            cancellationToken
        );
        return Created($"/api/orders/{response.Id}", response);
    }

    [HttpGet]
    public async Task<
        ActionResult<IReadOnlyCollection<OrderResponse>>
    > GetMine(CancellationToken cancellationToken)
    {
        var response = await orderService.GetCustomerOrdersAsync(
            currentUser.UserId,
            cancellationToken
        );
        return Ok(response);
    }

    [HttpGet("latest")]
    public async Task<ActionResult<OrderResponse>> GetLatest(
        [FromQuery] bool trackableOnly,
        CancellationToken cancellationToken
    )
    {
        var response = await orderService.GetLatestCustomerOrderAsync(
            currentUser.UserId,
            trackableOnly,
            cancellationToken
        );
        return response is null ? NoContent() : Ok(response);
    }

    [HttpGet("{orderId:guid}")]
    public async Task<ActionResult<OrderResponse>> Get(
        Guid orderId,
        CancellationToken cancellationToken
    )
    {
        var response = await orderService.GetCustomerOrderAsync(
            currentUser.UserId,
            orderId,
            cancellationToken
        );
        return Ok(response);
    }

    [HttpPatch("{orderId:guid}/cancel")]
    public async Task<ActionResult<OrderResponse>> Cancel(
        Guid orderId,
        CancelOrderRequest request,
        CancellationToken cancellationToken
    )
    {
        var response = await orderService.CancelCustomerOrderAsync(
            currentUser.UserId,
            orderId,
            request,
            cancellationToken
        );
        return Ok(response);
    }
}
