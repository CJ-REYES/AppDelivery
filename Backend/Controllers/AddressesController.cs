using Backend.Authorization;
using Backend.Contracts.Addresses;
using Backend.Services.Addresses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/addresses")]
public sealed class AddressesController(
    ICurrentUserService currentUser,
    IAddressService addressService
) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        CancellationToken cancellationToken
    )
    {
        var response = await addressService.GetAllAsync(
            currentUser.UserId,
            cancellationToken
        );

        return Ok(response);
    }

    [HttpGet("{addressId:guid}")]
    public async Task<IActionResult> GetById(
        Guid addressId,
        CancellationToken cancellationToken
    )
    {
        var response = await addressService.GetByIdAsync(
            currentUser.UserId,
            addressId,
            cancellationToken
        );

        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        SaveAddressRequest request,
        CancellationToken cancellationToken
    )
    {
        var response = await addressService.CreateAsync(
            currentUser.UserId,
            request,
            cancellationToken
        );

        return CreatedAtAction(
            nameof(GetById),
            new { addressId = response.Id },
            response
        );
    }

    [HttpPut("{addressId:guid}")]
    public async Task<IActionResult> Update(
        Guid addressId,
        SaveAddressRequest request,
        CancellationToken cancellationToken
    )
    {
        var response = await addressService.UpdateAsync(
            currentUser.UserId,
            addressId,
            request,
            cancellationToken
        );

        return Ok(response);
    }

    [HttpDelete("{addressId:guid}")]
    public async Task<IActionResult> Delete(
        Guid addressId,
        CancellationToken cancellationToken
    )
    {
        await addressService.DeleteAsync(
            currentUser.UserId,
            addressId,
            cancellationToken
        );

        return NoContent();
    }

    [HttpPatch("{addressId:guid}/default")]
    public async Task<IActionResult> SetDefault(
        Guid addressId,
        CancellationToken cancellationToken
    )
    {
        var response = await addressService.SetDefaultAsync(
            currentUser.UserId,
            addressId,
            cancellationToken
        );

        return Ok(response);
    }
}
