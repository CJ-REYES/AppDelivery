namespace Backend.Middleware.Exceptions;

public sealed class ConflictApiException(
    string detail,
    string errorCode = "conflict"
) : ApiException(
    StatusCodes.Status409Conflict,
    "Conflicto",
    detail,
    errorCode
);
