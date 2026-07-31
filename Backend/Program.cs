using System.Security.Claims;
using System.Text;
using Backend.Authorization;
using Backend.Data;
using Backend.Infrastructure.Auth;
using Backend.Middleware;
using Backend.Models;
using Backend.Services.Addresses;
using Backend.Services.Auth;
using Backend.Services.Catalog;
using Backend.Services.Users;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "No se encontró ConnectionStrings:DefaultConnection."
    );

var serverVersion = new MariaDbServerVersion(new Version(12, 3, 2));

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        connectionString,
        serverVersion,
        mysqlOptions => mysqlOptions.EnableRetryOnFailure()
    )
);

var jwtSection = builder.Configuration.GetSection(JwtOptions.SectionName);

builder.Services
    .AddOptions<JwtOptions>()
    .Bind(jwtSection)
    .Validate(options =>
        !string.IsNullOrWhiteSpace(options.Issuer)
        && !string.IsNullOrWhiteSpace(options.Audience),
        "Jwt:Issuer y Jwt:Audience son obligatorios."
    )
    .Validate(options =>
        Encoding.UTF8.GetByteCount(options.Key) >= 32,
        "Jwt:Key debe tener al menos 32 bytes."
    )
    .Validate(options =>
        options.AccessTokenMinutes is >= 5 and <= 60
        && options.RefreshTokenDays is >= 1 and <= 30
        && options.PasswordResetTokenMinutes is >= 5 and <= 60,
        "Los tiempos configurados para JWT no son válidos."
    )
    .ValidateOnStart();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer();

builder.Services
    .AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
    .Configure<IOptions<JwtOptions>>((options, jwtOptionsAccessor) =>
    {
        var jwtOptions = jwtOptionsAccessor.Value;

        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtOptions.Key)
            ),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            NameClaimType = ClaimTypes.NameIdentifier,
            RoleClaimType = ClaimTypes.Role
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("MerchantOnly", policy =>
        policy.RequireRole("Merchant", "Admin")
    );
    options.AddPolicy("DriverOnly", policy =>
        policy.RequireRole("Driver", "Admin")
    );
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireRole("Admin")
    );
});

var allowedOrigins =
    builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var problem = new ValidationProblemDetails(context.ModelState)
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Uno o más datos no son válidos.",
            Instance = context.HttpContext.Request.Path
        };

        problem.Extensions["errorCode"] = "validation_error";
        problem.Extensions["traceId"] =
            context.HttpContext.TraceIdentifier;

        return new BadRequestObjectResult(problem);
    };
});

builder.Services.Configure<PasswordHasherOptions>(options =>
{
    options.IterationCount = 120_000;
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddSingleton<ITokenGenerator, SecureTokenGenerator>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserProfileService, UserProfileService>();
builder.Services.AddScoped<IAddressService, AddressService>();
builder.Services.AddScoped<ICatalogService, CatalogService>();
builder.Services.AddScoped<IMerchantCatalogService, MerchantCatalogService>();

builder.Services.AddProblemDetails();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "AppDelivery API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Introduce el access token JWT."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseStatusCodePages(async statusCodeContext =>
{
    var response = statusCodeContext.HttpContext.Response;
    var request = statusCodeContext.HttpContext.Request;
    var title = response.StatusCode switch
    {
        StatusCodes.Status401Unauthorized => "No autorizado",
        StatusCodes.Status403Forbidden => "Acceso denegado",
        StatusCodes.Status404NotFound => "Recurso no encontrado",
        _ => "La solicitud no pudo completarse"
    };

    var problem = new ProblemDetails
    {
        Status = response.StatusCode,
        Title = title,
        Instance = request.Path
    };
    problem.Extensions["traceId"] =
        statusCodeContext.HttpContext.TraceIdentifier;

    response.ContentType = "application/problem+json";
    await response.WriteAsJsonAsync(
        problem,
        options: null,
        contentType: "application/problem+json",
        cancellationToken: statusCodeContext.HttpContext.RequestAborted
    );
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/api/health/database", async (AppDbContext database) =>
{
    var connected = await database.Database.CanConnectAsync();

    if (!connected)
    {
        return Results.Problem(
            title: "No fue posible conectar con MariaDB.",
            statusCode: StatusCodes.Status503ServiceUnavailable
        );
    }

    return Results.Ok(new
    {
        status = "ok",
        message = "Conexión con MariaDB establecida correctamente.",
        database = database.Database.GetDbConnection().Database,
        provider = database.Database.ProviderName
    });
})
.WithName("DatabaseHealth")
.WithOpenApi();

app.Run();

public partial class Program
{
}
