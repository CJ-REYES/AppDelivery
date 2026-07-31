using System.ComponentModel.DataAnnotations;

namespace Backend.Contracts.Catalog;

public sealed class SaveProductCategoryRequest
{
    [Required(ErrorMessage = "El nombre de la categoría es obligatorio.")]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; init; } = string.Empty;

    [Range(0, 10_000)]
    public int DisplayOrder { get; init; }

    public bool IsActive { get; init; } = true;
}
