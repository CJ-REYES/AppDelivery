using Backend.Contracts.Users;
using Backend.Models;

namespace Backend.Services.Users;

public static class UserMapper
{
    public static UserResponse ToResponse(User user)
    {
        var roles = user.UserRoles
            .Select(userRole => userRole.Role.Name)
            .OrderBy(role => role)
            .ToArray();

        return new UserResponse(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            user.PhoneNumber,
            user.EmailConfirmed,
            roles,
            user.CreatedAt,
            user.UpdatedAt
        );
    }
}
