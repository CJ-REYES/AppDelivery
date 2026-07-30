namespace Backend.Models;

public sealed class Store
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid OwnerId { get; set; }

    public int StoreCategoryId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? LogoUrl { get; set; }

    public string? CoverImageUrl { get; set; }

    public string Street { get; set; } = string.Empty;

    public string ExteriorNumber { get; set; } = string.Empty;

    public string? InteriorNumber { get; set; }

    public string Neighborhood { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string State { get; set; } = string.Empty;

    public string PostalCode { get; set; } = string.Empty;

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    public decimal DeliveryFee { get; set; }

    public decimal MinimumOrderAmount { get; set; }

    public int EstimatedDeliveryMinutesMin { get; set; } = 20;

    public int EstimatedDeliveryMinutesMax { get; set; } = 40;

    public decimal RatingAverage { get; set; }

    public int RatingCount { get; set; }

    public bool IsOpen { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User Owner { get; set; } = null!;

    public StoreCategory StoreCategory { get; set; } = null!;

    public ICollection<ProductCategory> ProductCategories { get; set; } =
        new List<ProductCategory>();

    public ICollection<Product> Products { get; set; } =
        new List<Product>();
        public ICollection<Order> Orders { get; set; } =
    new List<Order>();
}
