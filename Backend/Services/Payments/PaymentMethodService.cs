using Backend.Contracts.Payments;
using Backend.Data;
using Backend.Middleware.Exceptions;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.Payments;

public sealed class PaymentMethodService(
    AppDbContext database,
    TimeProvider timeProvider
) : IPaymentMethodService
{
    public async Task<IReadOnlyCollection<PaymentMethodResponse>> GetAllAsync(
        Guid userId,
        CancellationToken cancellationToken
    )
    {
        var methods = await database.PaymentMethods
            .AsNoTracking()
            .Where(method => method.UserId == userId && method.IsActive)
            .OrderByDescending(method => method.IsDefault)
            .ThenByDescending(method => method.CreatedAt)
            .ToListAsync(cancellationToken);
        return methods.Select(ToResponse).ToArray();
    }

    public async Task<PaymentMethodResponse> CreateAsync(
        Guid userId,
        SavePaymentMethodRequest request,
        CancellationToken cancellationToken
    )
    {
        if (
            request.Type == PaymentMethodType.Card
            && (
                string.IsNullOrWhiteSpace(request.CardBrand)
                || string.IsNullOrWhiteSpace(request.LastFourDigits)
                || request.ExpirationMonth is null
                || request.ExpirationYear is null
            )
        )
        {
            throw new BadRequestApiException(
                "Completa los datos visibles de la tarjeta.",
                "invalid_card_metadata"
            );
        }

        var existing = await database.PaymentMethods
            .Where(method => method.UserId == userId && method.IsActive)
            .ToListAsync(cancellationToken);
        var makeDefault = request.IsDefault || existing.Count == 0;
        if (makeDefault)
        {
            foreach (var method in existing)
            {
                method.IsDefault = false;
            }
        }

        var paymentMethod = new PaymentMethod
        {
            UserId = userId,
            Type = request.Type,
            DisplayName = request.DisplayName.Trim(),
            Provider = Normalize(request.Provider),
            CardBrand = Normalize(request.CardBrand),
            LastFourDigits = Normalize(request.LastFourDigits),
            ExpirationMonth = request.ExpirationMonth,
            ExpirationYear = request.ExpirationYear,
            IsDefault = makeDefault,
            IsActive = true,
            CreatedAt = timeProvider.GetUtcNow().UtcDateTime
        };
        database.PaymentMethods.Add(paymentMethod);
        await database.SaveChangesAsync(cancellationToken);
        return ToResponse(paymentMethod);
    }

    public async Task<PaymentMethodResponse> SetDefaultAsync(
        Guid userId,
        Guid paymentMethodId,
        CancellationToken cancellationToken
    )
    {
        var methods = await database.PaymentMethods
            .Where(method => method.UserId == userId && method.IsActive)
            .ToListAsync(cancellationToken);
        var selected = methods.SingleOrDefault(
            method => method.Id == paymentMethodId
        ) ?? throw new NotFoundApiException(
            "No se encontró el método de pago solicitado."
        );

        foreach (var method in methods)
        {
            method.IsDefault = method.Id == selected.Id;
        }
        await database.SaveChangesAsync(cancellationToken);
        return ToResponse(selected);
    }

    public async Task DeleteAsync(
        Guid userId,
        Guid paymentMethodId,
        CancellationToken cancellationToken
    )
    {
        var method = await database.PaymentMethods.SingleOrDefaultAsync(
            entity =>
                entity.Id == paymentMethodId
                && entity.UserId == userId
                && entity.IsActive,
            cancellationToken
        ) ?? throw new NotFoundApiException(
            "No se encontró el método de pago solicitado."
        );
        method.IsActive = false;
        method.IsDefault = false;

        var replacement = await database.PaymentMethods
            .Where(entity =>
                entity.UserId == userId
                && entity.Id != paymentMethodId
                && entity.IsActive
            )
            .OrderByDescending(entity => entity.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
        if (replacement is not null)
        {
            replacement.IsDefault = true;
        }
        await database.SaveChangesAsync(cancellationToken);
    }

    private static PaymentMethodResponse ToResponse(PaymentMethod method) =>
        new(
            method.Id,
            method.Type,
            method.DisplayName,
            method.Provider,
            method.CardBrand,
            method.LastFourDigits,
            method.ExpirationMonth,
            method.ExpirationYear,
            method.IsDefault,
            method.CreatedAt
        );

    private static string? Normalize(string? value)
    {
        var normalized = value?.Trim();
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }
}
