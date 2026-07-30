namespace Backend.Models;

public sealed class StoreCategory
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string? IconName { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<Store> Stores { get; set; } = new List<Store>();
}
