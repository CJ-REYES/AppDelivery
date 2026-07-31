namespace Backend.Models;

public sealed class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid StoreId { get; set; }

    public Guid ProductCategoryId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public string? ImageUrl { get; set; }

    public bool IsAvailable { get; set; } = true;

    public bool IsFeatured { get; set; }

    public int StockQuantity { get; set; } = 100;

    public int PreparationTimeMinutes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Store Store { get; set; } = null!;

    public ProductCategory ProductCategory { get; set; } = null!;
    public ICollection<OrderItem> OrderItems { get; set; } =
    new List<OrderItem>();
}
