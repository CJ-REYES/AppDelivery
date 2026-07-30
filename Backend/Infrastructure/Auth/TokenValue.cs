namespace Backend.Infrastructure.Auth;

public sealed record TokenValue(string PlainText, string Hash);
