using System.ComponentModel.DataAnnotations;

namespace Backend.Contracts.Catalog;

public sealed class SaveProductRequest
{
    [Required(ErrorMessage = "Selecciona una categoría de producto.")]
    public Guid ProductCategoryId { get; init; }

    [Required(ErrorMessage = "El nombre del producto es obligatorio.")]
    [StringLength(150, MinimumLength = 2)]
    public string Name { get; init; } = string.Empty;

    [Required(ErrorMessage = "La descripción es obligatoria.")]
    [StringLength(1000, MinimumLength = 5)]
    public string Description { get; init; } = string.Empty;

    [Range(typeof(decimal), "0.01", "999999")]
    public decimal Price { get; init; }

    [Url(ErrorMessage = "La URL de la imagen no es válida.")]
    [StringLength(2048)]
    public string? ImageUrl { get; init; }

    public bool IsAvailable { get; init; } = true;

    public bool IsFeatured { get; init; }

    [Range(0, 999999)]
    public int StockQuantity { get; init; } = 100;

    [Range(0, 240)]
    public int PreparationTimeMinutes { get; init; }
}
