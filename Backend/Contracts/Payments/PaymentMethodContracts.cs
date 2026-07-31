using System.ComponentModel.DataAnnotations;
using Backend.Models;

namespace Backend.Contracts.Payments;

public sealed class SavePaymentMethodRequest
{
    [EnumDataType(typeof(PaymentMethodType))]
    public PaymentMethodType Type { get; init; } = PaymentMethodType.Card;

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string DisplayName { get; init; } = string.Empty;

    [StringLength(50)]
    public string? Provider { get; init; }

    [StringLength(50)]
    public string? CardBrand { get; init; }

    [RegularExpression(@"^\d{4}$")]
    public string? LastFourDigits { get; init; }

    [Range(1, 12)]
    public byte? ExpirationMonth { get; init; }

    [Range(2026, 2100)]
    public short? ExpirationYear { get; init; }

    public bool IsDefault { get; init; }
}

public sealed record PaymentMethodResponse(
    Guid Id,
    PaymentMethodType Type,
    string DisplayName,
    string? Provider,
    string? CardBrand,
    string? LastFourDigits,
    byte? ExpirationMonth,
    short? ExpirationYear,
    bool IsDefault,
    DateTime CreatedAt
);
