using System.ComponentModel.DataAnnotations;

namespace Backend.Contracts.Auth;

public sealed class ForgotPasswordRequest
{
    [Required(ErrorMessage = "El correo es obligatorio.")]
    [EmailAddress(ErrorMessage = "El correo no tiene un formato válido.")]
    [StringLength(256)]
    public string Email { get; init; } = string.Empty;
}
