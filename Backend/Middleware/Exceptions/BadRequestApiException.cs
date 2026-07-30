namespace Backend.Middleware.Exceptions;

public sealed class BadRequestApiException(
    string detail,
    string errorCode = "bad_request"
) : ApiException(
    StatusCodes.Status400BadRequest,
    "Solicitud inválida",
    detail,
    errorCode
);
