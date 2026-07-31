using Backend.Contracts.Auth;
using Backend.Contracts.Users;
using Backend.Data;
using Backend.Infrastructure.Auth;
using Backend.Middleware.Exceptions;
using Backend.Models;
using Backend.Services.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Backend.Services.Auth;

public sealed class AuthService(
    AppDbContext database,
    IPasswordHasher<User> passwordHasher,
    IJwtTokenService jwtTokenService,
    ITokenGenerator tokenGenerator,
    IOptions<JwtOptions> jwtOptions,
    TimeProvider timeProvider
) : IAuthService
{
    private readonly JwtOptions _jwtOptions = jwtOptions.Value;

    public async Task<AuthSessionResult> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken
    )
    {
        var email = NormalizeEmail(request.Email);

        if (await database.Users.AnyAsync(
            user => user.Email == email,
            cancellationToken
        ))
        {
            throw new ConflictApiException(
                "Ya existe una cuenta registrada con ese correo.",
                "email_already_registered"
            );
        }

        var customerRole = await database.Roles.SingleOrDefaultAsync(
            role => role.Name == "Customer",
            cancellationToken
        ) ?? throw new InvalidOperationException(
            "No se encontró el rol Customer en la base de datos."
        );

        var utcNow = timeProvider.GetUtcNow().UtcDateTime;
        var user = new User
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = email,
            PhoneNumber = NormalizeOptional(request.PhoneNumber),
            CreatedAt = utcNow,
            UpdatedAt = utcNow
        };

        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
        user.UserRoles.Add(new UserRole
        {
            User = user,
            Role = customerRole,
            RoleId = customerRole.Id,
            AssignedAt = utcNow
        });

        database.Users.Add(user);
        var session = CreateSession(user);

        try
        {
            await database.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            throw new ConflictApiException(
                "No fue posible registrar la cuenta. Verifica que el correo no esté en uso.",
                "email_already_registered"
            );
        }

        return session;
    }

    public async Task<AuthSessionResult> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken
    )
    {
        var email = NormalizeEmail(request.Email);
        var user = await FindUserWithRolesAsync(email, cancellationToken);

        if (user is null || !user.IsActive)
        {
            throw new UnauthorizedApiException();
        }

        var verification = passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password
        );

        if (verification == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedApiException();
        }

        if (verification == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
            user.UpdatedAt = timeProvider.GetUtcNow().UtcDateTime;
        }

        var session = CreateSession(user);
        await database.SaveChangesAsync(cancellationToken);
        return session;
    }

    public async Task<AuthSessionResult> RefreshAsync(
        string refreshToken,
        CancellationToken cancellationToken
    )
    {
        var tokenHash = tokenGenerator.Hash(refreshToken);
        var storedToken = await database.RefreshTokens
            .Include(token => token.User)
                .ThenInclude(user => user.UserRoles)
                    .ThenInclude(userRole => userRole.Role)
            .SingleOrDefaultAsync(
                token => token.TokenHash == tokenHash,
                cancellationToken
            );

        var utcNow = timeProvider.GetUtcNow().UtcDateTime;

        if (storedToken is null
            || !storedToken.IsActive(utcNow)
            || !storedToken.User.IsActive)
        {
            throw new UnauthorizedApiException(
                "El refresh token es inválido o ya expiró."
            );
        }

        storedToken.RevokedAt = utcNow;
        var session = CreateSession(storedToken.User);
        storedToken.ReplacedByTokenHash = tokenGenerator.Hash(
            session.RefreshToken
        );

        await database.SaveChangesAsync(cancellationToken);
        return session;
    }

    public async Task LogoutAsync(
        string? refreshToken,
        CancellationToken cancellationToken
    )
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return;
        }

        var tokenHash = tokenGenerator.Hash(refreshToken);
        var storedToken = await database.RefreshTokens.SingleOrDefaultAsync(
            token => token.TokenHash == tokenHash,
            cancellationToken
        );

        if (storedToken is null || storedToken.RevokedAt is not null)
        {
            return;
        }

        storedToken.RevokedAt = timeProvider.GetUtcNow().UtcDateTime;
        await database.SaveChangesAsync(cancellationToken);
    }

    public async Task<UserResponse> GetMeAsync(
        Guid userId,
        CancellationToken cancellationToken
    )
    {
        var user = await database.Users
            .AsNoTracking()
            .Include(entity => entity.UserRoles)
                .ThenInclude(userRole => userRole.Role)
            .SingleOrDefaultAsync(
                entity => entity.Id == userId && entity.IsActive,
                cancellationToken
            ) ?? throw new NotFoundApiException(
                "No se encontró el perfil del usuario."
            );

        return UserMapper.ToResponse(user);
    }

    public async Task<PasswordResetResult> ForgotPasswordAsync(
        ForgotPasswordRequest request,
        CancellationToken cancellationToken
    )
    {
        var email = NormalizeEmail(request.Email);
        var user = await database.Users.SingleOrDefaultAsync(
            entity => entity.Email == email && entity.IsActive,
            cancellationToken
        );

        if (user is null)
        {
            return new PasswordResetResult(null);
        }

        var utcNow = timeProvider.GetUtcNow().UtcDateTime;
        var previousTokens = await database.PasswordResetTokens
            .Where(token =>
                token.UserId == user.Id
                && token.UsedAt == null
                && token.ExpiresAt > utcNow
            )
            .ToListAsync(cancellationToken);

        foreach (var previousToken in previousTokens)
        {
            previousToken.UsedAt = utcNow;
        }

        var generatedToken = tokenGenerator.Create();
        database.PasswordResetTokens.Add(new PasswordResetToken
        {
            UserId = user.Id,
            TokenHash = generatedToken.Hash,
            CreatedAt = utcNow,
            ExpiresAt = utcNow.AddMinutes(
                _jwtOptions.PasswordResetTokenMinutes
            )
        });

        await database.SaveChangesAsync(cancellationToken);
        return new PasswordResetResult(generatedToken.PlainText);
    }

    public async Task ResetPasswordAsync(
        ResetPasswordRequest request,
        CancellationToken cancellationToken
    )
    {
        var tokenHash = tokenGenerator.Hash(request.Token);
        var resetToken = await database.PasswordResetTokens
            .Include(token => token.User)
            .SingleOrDefaultAsync(
                token => token.TokenHash == tokenHash,
                cancellationToken
            );

        var utcNow = timeProvider.GetUtcNow().UtcDateTime;

        if (resetToken is null
            || !resetToken.IsActive(utcNow)
            || !resetToken.User.IsActive)
        {
            throw new BadRequestApiException(
                "El token de recuperación es inválido o ya expiró.",
                "invalid_password_reset_token"
            );
        }

        resetToken.User.PasswordHash = passwordHasher.HashPassword(
            resetToken.User,
            request.NewPassword
        );
        resetToken.User.UpdatedAt = utcNow;
        resetToken.UsedAt = utcNow;

        var activeRefreshTokens = await database.RefreshTokens
            .Where(token =>
                token.UserId == resetToken.UserId
                && token.RevokedAt == null
                && token.ExpiresAt > utcNow
            )
            .ToListAsync(cancellationToken);

        foreach (var activeToken in activeRefreshTokens)
        {
            activeToken.RevokedAt = utcNow;
        }

        await database.SaveChangesAsync(cancellationToken);
    }

    private AuthSessionResult CreateSession(User user)
    {
        var roles = user.UserRoles
            .Select(userRole => userRole.Role.Name)
            .Distinct(StringComparer.Ordinal)
            .OrderBy(role => role)
            .ToArray();

        var accessToken = jwtTokenService.CreateAccessToken(user, roles);
        var generatedRefreshToken = tokenGenerator.Create();
        var utcNow = timeProvider.GetUtcNow().UtcDateTime;
        var refreshExpiresAt = utcNow.AddDays(_jwtOptions.RefreshTokenDays);

        database.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            User = user,
            TokenHash = generatedRefreshToken.Hash,
            CreatedAt = utcNow,
            ExpiresAt = refreshExpiresAt
        });

        return new AuthSessionResult(
            new AuthResponse(
                accessToken.Token,
                accessToken.ExpiresAt,
                UserMapper.ToResponse(user)
            ),
            generatedRefreshToken.PlainText,
            refreshExpiresAt
        );
    }

    private Task<User?> FindUserWithRolesAsync(
        string email,
        CancellationToken cancellationToken
    ) =>
        database.Users
            .Include(user => user.UserRoles)
                .ThenInclude(userRole => userRole.Role)
            .SingleOrDefaultAsync(
                user => user.Email == email,
                cancellationToken
            );

    private static string NormalizeEmail(string email) =>
        email.Trim().ToLowerInvariant();

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
