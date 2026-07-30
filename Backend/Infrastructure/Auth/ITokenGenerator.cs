namespace Backend.Infrastructure.Auth;

public interface ITokenGenerator
{
    TokenValue Create();

    string Hash(string plainText);
}
