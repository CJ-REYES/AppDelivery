namespace Backend.Models;

public sealed class PaymentMethod
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    public PaymentMethodType Type { get; set; }

    public string DisplayName { get; set; } = string.Empty;

    public string? Provider { get; set; }

    public string? ProviderPaymentMethodId { get; set; }

    public string? CardBrand { get; set; }

    public string? LastFourDigits { get; set; }

    public byte? ExpirationMonth { get; set; }

    public short? ExpirationYear { get; set; }

    public bool IsDefault { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;

    public ICollection<Order> Orders { get; set; } =
        new List<Order>();
}
