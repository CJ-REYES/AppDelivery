using Backend.Models;

namespace Backend.Infrastructure.Auth;

public interface IJwtTokenService
{
    AccessTokenResult CreateAccessToken(
        User user,
        IReadOnlyCollection<string> roles
    );
}
