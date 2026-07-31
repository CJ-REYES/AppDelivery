using System.ComponentModel.DataAnnotations;

namespace Backend.Contracts.Addresses;

public sealed class SaveAddressRequest
{
    [Required(ErrorMessage = "La etiqueta es obligatoria.")]
    [StringLength(50, MinimumLength = 2)]
    public string Label { get; init; } = string.Empty;

    [Required(ErrorMessage = "La calle es obligatoria.")]
    [StringLength(150, MinimumLength = 2)]
    public string Street { get; init; } = string.Empty;

    [Required(ErrorMessage = "El número exterior es obligatorio.")]
    [StringLength(20)]
    public string ExteriorNumber { get; init; } = string.Empty;

    [StringLength(20)]
    public string? InteriorNumber { get; init; }

    [Required(ErrorMessage = "La colonia es obligatoria.")]
    [StringLength(100, MinimumLength = 2)]
    public string Neighborhood { get; init; } = string.Empty;

    [Required(ErrorMessage = "La ciudad es obligatoria.")]
    [StringLength(100, MinimumLength = 2)]
    public string City { get; init; } = string.Empty;

    [Required(ErrorMessage = "El estado es obligatorio.")]
    [StringLength(100, MinimumLength = 2)]
    public string State { get; init; } = string.Empty;

    [Required(ErrorMessage = "El código postal es obligatorio.")]
    [RegularExpression(@"^\d{5}$", ErrorMessage = "El código postal debe tener 5 dígitos.")]
    public string PostalCode { get; init; } = string.Empty;

    [Required(ErrorMessage = "El país es obligatorio.")]
    [StringLength(80, MinimumLength = 2)]
    public string Country { get; init; } = "México";

    [StringLength(500)]
    public string? References { get; init; }

    [Required(ErrorMessage = "Selecciona la ubicación en el mapa.")]
    [Range(typeof(decimal), "-90", "90")]
    public decimal? Latitude { get; init; }

    [Required(ErrorMessage = "Selecciona la ubicación en el mapa.")]
    [Range(typeof(decimal), "-180", "180")]
    public decimal? Longitude { get; init; }

    public bool IsDefault { get; init; }
}
