namespace Backend.Infrastructure.Auth;

public sealed record AccessTokenResult(string Token, DateTime ExpiresAt);
