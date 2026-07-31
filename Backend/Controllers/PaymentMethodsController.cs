using Backend.Authorization;
using Backend.Contracts.Payments;
using Backend.Services.Payments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/payment-methods")]
public sealed class PaymentMethodsController(
    IPaymentMethodService paymentMethodService,
    ICurrentUserService currentUser
) : ControllerBase
{
    [HttpGet]
    public async Task<
        ActionResult<IReadOnlyCollection<PaymentMethodResponse>>
    > GetAll(CancellationToken cancellationToken)
    {
        var response = await paymentMethodService.GetAllAsync(
            currentUser.UserId,
            cancellationToken
        );
        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<PaymentMethodResponse>> Create(
        SavePaymentMethodRequest request,
        CancellationToken cancellationToken
    )
    {
        var response = await paymentMethodService.CreateAsync(
            currentUser.UserId,
            request,
            cancellationToken
        );
        return Created($"/api/payment-methods/{response.Id}", response);
    }

    [HttpPatch("{paymentMethodId:guid}/default")]
    public async Task<ActionResult<PaymentMethodResponse>> SetDefault(
        Guid paymentMethodId,
        CancellationToken cancellationToken
    )
    {
        var response = await paymentMethodService.SetDefaultAsync(
            currentUser.UserId,
            paymentMethodId,
            cancellationToken
        );
        return Ok(response);
    }

    [HttpDelete("{paymentMethodId:guid}")]
    public async Task<IActionResult> Delete(
        Guid paymentMethodId,
        CancellationToken cancellationToken
    )
    {
        await paymentMethodService.DeleteAsync(
            currentUser.UserId,
            paymentMethodId,
            cancellationToken
        );
        return NoContent();
    }
}
