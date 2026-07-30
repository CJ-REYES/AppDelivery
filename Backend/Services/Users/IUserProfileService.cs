using Backend.Contracts.Users;

namespace Backend.Services.Users;

public interface IUserProfileService
{
    Task<UserResponse> UpdateAsync(
        Guid userId,
        UpdateProfileRequest request,
        CancellationToken cancellationToken
    );
}
