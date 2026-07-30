namespace Backend.Models;

public sealed class ProductCategory
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid StoreId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public Store Store { get; set; } = null!;

    public ICollection<Product> Products { get; set; } =
        new List<Product>();
}
