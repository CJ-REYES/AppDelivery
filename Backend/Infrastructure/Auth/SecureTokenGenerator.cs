using System.Security.Cryptography;
using System.Text;

namespace Backend.Infrastructure.Auth;

public sealed class SecureTokenGenerator : ITokenGenerator
{
    public TokenValue Create()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        var plainText = Convert.ToBase64String(bytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');

        return new TokenValue(plainText, Hash(plainText));
    }

    public string Hash(string plainText)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(plainText);

        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(plainText));
        return Convert.ToHexString(hash);
    }
}
