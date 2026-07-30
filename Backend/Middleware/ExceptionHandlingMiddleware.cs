using Backend.Middleware.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Middleware;

public sealed class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger
)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (OperationCanceledException)
            when (context.RequestAborted.IsCancellationRequested)
        {
            throw;
        }
        catch (ApiException exception)
        {
            logger.LogWarning(
                exception,
                "La solicitud falló con el código {ErrorCode}.",
                exception.ErrorCode
            );

            await WriteProblemAsync(
                context,
                exception.StatusCode,
                exception.Title,
                exception.Message,
                exception.ErrorCode
            );
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Ocurrió un error no controlado.");

            await WriteProblemAsync(
                context,
                StatusCodes.Status500InternalServerError,
                "Error interno del servidor",
                "Ocurrió un error inesperado al procesar la solicitud.",
                "internal_error"
            );
        }
    }

    private static Task WriteProblemAsync(
        HttpContext context,
        int statusCode,
        string title,
        string detail,
        string errorCode
    )
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path
        };

        problem.Extensions["errorCode"] = errorCode;
        problem.Extensions["traceId"] = context.TraceIdentifier;

        return context.Response.WriteAsJsonAsync(
            problem,
            options: null,
            contentType: "application/problem+json",
            cancellationToken: context.RequestAborted
        );
    }
}
