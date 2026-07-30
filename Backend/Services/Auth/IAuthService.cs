using Backend.Contracts.Auth;
using Backend.Contracts.Users;

namespace Backend.Services.Auth;

public interface IAuthService
{
    Task<AuthSessionResult> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken
    );

    Task<AuthSessionResult> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken
    );

    Task<AuthSessionResult> RefreshAsync(
        string refreshToken,
        CancellationToken cancellationToken
    );

    Task LogoutAsync(
        string? refreshToken,
        CancellationToken cancellationToken
    );

    Task<UserResponse> GetMeAsync(
        Guid userId,
        CancellationToken cancellationToken
    );

    Task<PasswordResetResult> ForgotPasswordAsync(
        ForgotPasswordRequest request,
        CancellationToken cancellationToken
    );

    Task ResetPasswordAsync(
        ResetPasswordRequest request,
        CancellationToken cancellationToken
    );
}
