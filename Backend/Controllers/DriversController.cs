using Backend.Authorization;
using Backend.Contracts.Drivers;
using Backend.Services.Drivers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/drivers")]
public sealed class DriversController(
    IDriverService driverService,
    ICurrentUserService currentUser
) : ControllerBase
{
    [HttpGet("me")]
    public async Task<ActionResult<DriverProfileResponse>> GetMe(
        CancellationToken cancellationToken
    )
    {
        var response = await driverService.GetProfileAsync(
            currentUser.UserId,
            cancellationToken
        );
        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<DriverProfileResponse>> Register(
        SaveDriverProfileRequest request,
        CancellationToken cancellationToken
    )
    {
        var response = await driverService.RegisterAsync(
            currentUser.UserId,
            request,
            cancellationToken
        );
        return CreatedAtAction(nameof(GetMe), response);
    }

    [HttpPut("me")]
    [Authorize(Policy = "DriverOnly")]
    public async Task<ActionResult<DriverProfileResponse>> Update(
        SaveDriverProfileRequest request,
        CancellationToken cancellationToken
    )
    {
        var response = await driverService.UpdateAsync(
            currentUser.UserId,
            request,
            cancellationToken
        );
        return Ok(response);
    }

    [HttpPatch("me/availability")]
    [Authorize(Policy = "DriverOnly")]
    public async Task<ActionResult<DriverProfileResponse>> SetAvailability(
        DriverAvailabilityRequest request,
        CancellationToken cancellationToken
    )
    {
        var response = await driverService.SetAvailabilityAsync(
            currentUser.UserId,
            request,
            cancellationToken
        );
        return Ok(response);
    }

    [HttpPut("me/location")]
    [Authorize(Policy = "DriverOnly")]
    public async Task<ActionResult<DriverProfileResponse>> UpdateLocation(
        DriverLocationRequest request,
        CancellationToken cancellationToken
    )
    {
        var response = await driverService.UpdateLocationAsync(
            currentUser.UserId,
            request,
            cancellationToken
        );
        return Ok(response);
    }

    [HttpGet("me/summary")]
    [Authorize(Policy = "DriverOnly")]
    public async Task<ActionResult<DriverSummaryResponse>> GetSummary(
        CancellationToken cancellationToken
    )
    {
        var response = await driverService.GetSummaryAsync(
            currentUser.UserId,
            cancellationToken
        );
        return Ok(response);
    }
}
