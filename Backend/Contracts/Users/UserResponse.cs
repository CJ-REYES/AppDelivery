namespace Backend.Contracts.Users;

public sealed record UserResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    bool EmailConfirmed,
    IReadOnlyCollection<string> Roles,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
