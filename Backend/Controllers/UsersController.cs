using Backend.Authorization;
using Backend.Contracts.Users;
using Backend.Services.Auth;
using Backend.Services.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/users")]
public sealed class UsersController(
    ICurrentUserService currentUser,
    IAuthService authService,
    IUserProfileService userProfileService
) : ControllerBase
{
    [HttpGet("me")]
    public async Task<IActionResult> GetMe(
        CancellationToken cancellationToken
    )
    {
        var response = await authService.GetMeAsync(
            currentUser.UserId,
            cancellationToken
        );

        return Ok(response);
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe(
        UpdateProfileRequest request,
        CancellationToken cancellationToken
    )
    {
        var response = await userProfileService.UpdateAsync(
            currentUser.UserId,
            request,
            cancellationToken
        );

        return Ok(response);
    }
}
