namespace Backend.Authorization;

public interface ICurrentUserService
{
    Guid UserId { get; }
}
