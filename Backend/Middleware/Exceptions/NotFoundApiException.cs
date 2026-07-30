namespace Backend.Middleware.Exceptions;

public sealed class NotFoundApiException(
    string detail,
    string errorCode = "not_found"
) : ApiException(
    StatusCodes.Status404NotFound,
    "Recurso no encontrado",
    detail,
    errorCode
);
