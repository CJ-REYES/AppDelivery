namespace Backend.Contracts.Auth;

public sealed record ForgotPasswordResponse(
    string Message,
    string? ResetToken = null
);
