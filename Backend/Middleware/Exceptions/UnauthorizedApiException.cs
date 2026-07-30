namespace Backend.Middleware.Exceptions;

public sealed class UnauthorizedApiException(
    string detail = "Las credenciales proporcionadas no son válidas."
) : ApiException(
    StatusCodes.Status401Unauthorized,
    "No autorizado",
    detail,
    "unauthorized"
);
