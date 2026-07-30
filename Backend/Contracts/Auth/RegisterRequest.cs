using System.ComponentModel.DataAnnotations;
using Backend.Contracts.Validation;

namespace Backend.Contracts.Auth;

public sealed class RegisterRequest
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(100, MinimumLength = 2)]
    public string FirstName { get; init; } = string.Empty;

    [Required(ErrorMessage = "El apellido es obligatorio.")]
    [StringLength(100, MinimumLength = 2)]
    public string LastName { get; init; } = string.Empty;

    [Required(ErrorMessage = "El correo es obligatorio.")]
    [EmailAddress(ErrorMessage = "El correo no tiene un formato válido.")]
    [StringLength(256)]
    public string Email { get; init; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    [StrongPassword]
    public string Password { get; init; } = string.Empty;

    [Phone(ErrorMessage = "El teléfono no tiene un formato válido.")]
    [StringLength(20)]
    public string? PhoneNumber { get; init; }
}
