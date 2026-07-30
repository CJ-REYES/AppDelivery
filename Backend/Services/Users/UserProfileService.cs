using Backend.Contracts.Users;
using Backend.Data;
using Backend.Middleware.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.Users;

public sealed class UserProfileService(
    AppDbContext database,
    TimeProvider timeProvider
) : IUserProfileService
{
    public async Task<UserResponse> UpdateAsync(
        Guid userId,
        UpdateProfileRequest request,
        CancellationToken cancellationToken
    )
    {
        var user = await database.Users
            .Include(entity => entity.UserRoles)
                .ThenInclude(userRole => userRole.Role)
            .SingleOrDefaultAsync(
                entity => entity.Id == userId && entity.IsActive,
                cancellationToken
            ) ?? throw new NotFoundApiException(
                "No se encontró el perfil del usuario."
            );

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber)
            ? null
            : request.PhoneNumber.Trim();
        user.UpdatedAt = timeProvider.GetUtcNow().UtcDateTime;

        await database.SaveChangesAsync(cancellationToken);
        return UserMapper.ToResponse(user);
    }
}
