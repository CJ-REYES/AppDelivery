using Backend.Data;
using Microsoft.EntityFrameworkCore;

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

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
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