using System.ComponentModel.DataAnnotations;

namespace Backend.Contracts.Catalog;

public sealed class SaveStoreRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Selecciona una categoría válida.")]
    public int StoreCategoryId { get; init; }

    [Required(ErrorMessage = "El nombre del comercio es obligatorio.")]
    [StringLength(150, MinimumLength = 2)]
    public string Name { get; init; } = string.Empty;

    [Required(ErrorMessage = "La descripción es obligatoria.")]
    [StringLength(1000, MinimumLength = 10)]
    public string Description { get; init; } = string.Empty;

    [Required(ErrorMessage = "El teléfono es obligatorio.")]
    [Phone(ErrorMessage = "El teléfono no tiene un formato válido.")]
    [StringLength(20)]
    public string PhoneNumber { get; init; } = string.Empty;

    [EmailAddress(ErrorMessage = "El correo no tiene un formato válido.")]
    [StringLength(256)]
    public string? Email { get; init; }

    [Url(ErrorMessage = "La URL del logotipo no es válida.")]
    [StringLength(2048)]
    public string? LogoUrl { get; init; }

    [Url(ErrorMessage = "La URL de portada no es válida.")]
    [StringLength(2048)]
    public string? CoverImageUrl { get; init; }

    [Required(ErrorMessage = "La calle es obligatoria.")]
    [StringLength(150)]
    public string Street { get; init; } = string.Empty;

    [Required(ErrorMessage = "El número exterior es obligatorio.")]
    [StringLength(20)]
    public string ExteriorNumber { get; init; } = string.Empty;

    [StringLength(20)]
    public string? InteriorNumber { get; init; }

    [Required(ErrorMessage = "La colonia es obligatoria.")]
    [StringLength(100)]
    public string Neighborhood { get; init; } = string.Empty;

    [Required(ErrorMessage = "La ciudad es obligatoria.")]
    [StringLength(100)]
    public string City { get; init; } = string.Empty;

    [Required(ErrorMessage = "El estado es obligatorio.")]
    [StringLength(100)]
    public string State { get; init; } = string.Empty;

    [Required(ErrorMessage = "El código postal es obligatorio.")]
    [StringLength(10, MinimumLength = 4)]
    public string PostalCode { get; init; } = string.Empty;

    [Required(ErrorMessage = "Selecciona la ubicación del comercio en el mapa.")]
    [Range(typeof(decimal), "-90", "90")]
    public decimal? Latitude { get; init; }

    [Required(ErrorMessage = "Selecciona la ubicación del comercio en el mapa.")]
    [Range(typeof(decimal), "-180", "180")]
    public decimal? Longitude { get; init; }

    [Range(typeof(decimal), "0", "999999")]
    public decimal DeliveryFee { get; init; }

    [Range(typeof(decimal), "0", "999999")]
    public decimal MinimumOrderAmount { get; init; }

    [Range(5, 240)]
    public int EstimatedDeliveryMinutesMin { get; init; } = 20;

    [Range(5, 240)]
    public int EstimatedDeliveryMinutesMax { get; init; } = 40;

    public bool IsOpen { get; init; } = true;
}
