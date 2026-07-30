namespace Backend.Models;

public sealed class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public bool EmailConfirmed { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserRole> UserRoles { get; set; } =
        new List<UserRole>();

    public ICollection<Address> Addresses { get; set; } =
        new List<Address>();

    public ICollection<Store> OwnedStores { get; set; } =
    new List<Store>();    
    public ICollection<PaymentMethod> PaymentMethods { get; set; } =
    new List<PaymentMethod>();

public ICollection<Order> Orders { get; set; } =
    new List<Order>();
}