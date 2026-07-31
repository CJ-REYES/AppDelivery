using Backend.Contracts.Users;

namespace Backend.Contracts.Auth;

public sealed record AuthResponse(
    string AccessToken,
    DateTime ExpiresAt,
    UserResponse User
);
