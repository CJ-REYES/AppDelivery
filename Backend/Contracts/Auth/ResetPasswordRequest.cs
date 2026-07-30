using System.ComponentModel.DataAnnotations;
using Backend.Contracts.Validation;

namespace Backend.Contracts.Auth;

public sealed class ResetPasswordRequest
{
    [Required(ErrorMessage = "El token es obligatorio.")]
    public string Token { get; init; } = string.Empty;

    [Required(ErrorMessage = "La nueva contraseña es obligatoria.")]
    [StrongPassword]
    public string NewPassword { get; init; } = string.Empty;
}
