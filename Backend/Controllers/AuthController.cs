using Backend.Authorization;
using Backend.Contracts.Auth;
using Backend.Middleware.Exceptions;
using Backend.Services.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    IAuthService authService,
    ICurrentUserService currentUser,
    IWebHostEnvironment environment
) : ControllerBase
{
    private const string RefreshCookieName = "appdelivery.refresh_token";

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Register(
        RegisterRequest request,
        CancellationToken cancellationToken
    )
    {
        var session = await authService.RegisterAsync(
            request,
            cancellationToken
        );

        SetRefreshCookie(session);
        return CreatedAtAction(nameof(Me), session.Response);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login(
        LoginRequest request,
        CancellationToken cancellationToken
    )
    {
        var session = await authService.LoginAsync(
            request,
            cancellationToken
        );

        SetRefreshCookie(session);
        return Ok(session.Response);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Refresh(
        CancellationToken cancellationToken
    )
    {
        if (!Request.Cookies.TryGetValue(
            RefreshCookieName,
            out var refreshToken
        ) || string.IsNullOrWhiteSpace(refreshToken))
        {
            throw new UnauthorizedApiException(
                "No se encontró un refresh token válido."
            );
        }

        var session = await authService.RefreshAsync(
            refreshToken,
            cancellationToken
        );

        SetRefreshCookie(session);
        return Ok(session.Response);
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<IActionResult> Logout(
        CancellationToken cancellationToken
    )
    {
        Request.Cookies.TryGetValue(
            RefreshCookieName,
            out var refreshToken
        );

        await authService.LogoutAsync(refreshToken, cancellationToken);
        DeleteRefreshCookie();
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        var response = await authService.GetMeAsync(
            currentUser.UserId,
            cancellationToken
        );

        return Ok(response);
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword(
        ForgotPasswordRequest request,
        CancellationToken cancellationToken
    )
    {
        var result = await authService.ForgotPasswordAsync(
            request,
            cancellationToken
        );

        const string message =
            "Si el correo está registrado, se generó una solicitud de recuperación.";

        return Accepted(new ForgotPasswordResponse(
            message,
            environment.IsDevelopment() ? result.Token : null
        ));
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword(
        ResetPasswordRequest request,
        CancellationToken cancellationToken
    )
    {
        await authService.ResetPasswordAsync(request, cancellationToken);
        return NoContent();
    }

    private void SetRefreshCookie(AuthSessionResult session)
    {
        Response.Cookies.Append(
            RefreshCookieName,
            session.RefreshToken,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = Request.IsHttps,
                SameSite = SameSiteMode.Strict,
                Path = "/api/auth",
                Expires = new DateTimeOffset(
                    session.RefreshTokenExpiresAt,
                    TimeSpan.Zero
                )
            }
        );
    }

    private void DeleteRefreshCookie()
    {
        Response.Cookies.Delete(
            RefreshCookieName,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = Request.IsHttps,
                SameSite = SameSiteMode.Strict,
                Path = "/api/auth"
            }
        );
    }
}
