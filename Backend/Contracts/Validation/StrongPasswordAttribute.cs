using System.ComponentModel.DataAnnotations;

namespace Backend.Contracts.Validation;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class StrongPasswordAttribute : ValidationAttribute
{
    public StrongPasswordAttribute()
    {
        ErrorMessage =
            "La contraseña debe tener al menos 8 caracteres e incluir mayúscula, " +
            "minúscula, número y carácter especial.";
    }

    public override bool IsValid(object? value)
    {
        if (value is not string password)
        {
            return true;
        }

        return password.Length >= 8
            && password.Any(char.IsUpper)
            && password.Any(char.IsLower)
            && password.Any(char.IsDigit)
            && password.Any(character => !char.IsLetterOrDigit(character));
    }
}
