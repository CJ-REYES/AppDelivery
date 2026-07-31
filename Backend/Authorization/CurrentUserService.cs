using System.Security.Claims;
using Backend.Middleware.Exceptions;

namespace Backend.Authorization;

public sealed class CurrentUserService(
    IHttpContextAccessor httpContextAccessor
) : ICurrentUserService
{
    public Guid UserId
    {
        get
        {
            var value = httpContextAccessor.HttpContext?.User
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (!Guid.TryParse(value, out var userId))
            {
                throw new UnauthorizedApiException(
                    "La sesión no contiene un identificador de usuario válido."
                );
            }

            return userId;
        }
    }
}
