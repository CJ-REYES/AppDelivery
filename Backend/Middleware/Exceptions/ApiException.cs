namespace Backend.Middleware.Exceptions;

public abstract class ApiException(
    int statusCode,
    string title,
    string detail,
    string errorCode
) : Exception(detail)
{
    public int StatusCode { get; } = statusCode;

    public string Title { get; } = title;

    public string ErrorCode { get; } = errorCode;
}
