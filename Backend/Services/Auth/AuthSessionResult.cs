using Backend.Contracts.Auth;

namespace Backend.Services.Auth;

public sealed record AuthSessionResult(
    AuthResponse Response,
    string RefreshToken,
    DateTime RefreshTokenExpiresAt
);
