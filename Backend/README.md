# Backend de AppDelivery

API REST del MVP de AppDelivery construida con ASP.NET Core 8, Entity
Framework Core 8 y MariaDB.

## Requisitos

- .NET SDK 8
- MariaDB 12 (compatible con el esquema actual)
- La herramienta local `dotnet-ef`

Desde la raíz del repositorio:

```fish
dotnet tool restore
```

## Configuración local

La cadena de conexión y la llave JWT son secretos locales. No deben agregarse
a `appsettings.json` ni subirse a Git.

```fish
read --silent --prompt-str "Contraseña de MariaDB: " APPDELIVERY_DB_PASSWORD
echo

dotnet user-secrets set \
  "ConnectionStrings:DefaultConnection" \
  "Server=127.0.0.1;Port=3306;Database=appdelivery;User ID=appdelivery;Password=$APPDELIVERY_DB_PASSWORD;" \
  --project Backend/Backend.csproj

set APPDELIVERY_JWT_KEY (openssl rand -base64 48)

dotnet user-secrets set \
  "Jwt:Key" \
  "$APPDELIVERY_JWT_KEY" \
  --project Backend/Backend.csproj

set -e APPDELIVERY_DB_PASSWORD
set -e APPDELIVERY_JWT_KEY
```

La llave JWT debe tener al menos 32 bytes.

## Base de datos

Aplicar todas las migraciones:

```fish
dotnet ef database update \
  --project Backend/Backend.csproj \
  --startup-project Backend/Backend.csproj \
  --context AppDbContext
```

Después de `AddAuthCore`, la base contiene 16 tablas: las 13 tablas originales,
`refresh_tokens`, `password_reset_tokens` y `__EFMigrationsHistory`.

## Ejecución y pruebas

```fish
dotnet build Backend/Backend.csproj

dotnet test Backend.Tests/Backend.Tests.csproj \
  --collect:"XPlat Code Coverage"

dotnet run --project Backend/Backend.csproj
```

Swagger está disponible en desarrollo en la URL que muestre `dotnet run`,
seguida de `/swagger`.

## Endpoints de autenticación

| Método | Ruta | Autenticación | Función |
|---|---|---|---|
| `POST` | `/api/auth/register` | Pública | Registrar cliente |
| `POST` | `/api/auth/login` | Pública | Iniciar sesión |
| `POST` | `/api/auth/refresh` | Cookie | Rotar refresh token |
| `POST` | `/api/auth/logout` | Cookie | Revocar sesión |
| `GET` | `/api/auth/me` | Bearer | Consultar sesión |
| `POST` | `/api/auth/forgot-password` | Pública | Solicitar recuperación |
| `POST` | `/api/auth/reset-password` | Pública | Restablecer contraseña |
| `GET` | `/api/users/me` | Bearer | Consultar perfil |
| `PUT` | `/api/users/me` | Bearer | Actualizar perfil |

El access token se devuelve en JSON. El refresh token se entrega únicamente
como cookie `HttpOnly`, se almacena en la base por hash y se rota en cada uso.

Durante desarrollo, `forgot-password` devuelve `resetToken` para poder probar el
flujo sin un proveedor de correo. En otros entornos nunca lo expone.

## Direcciones

Todas las rutas requieren access token y solo permiten trabajar con las
direcciones del usuario autenticado.

| Método | Ruta | Función |
|---|---|---|
| `GET` | `/api/addresses` | Listar mis direcciones |
| `GET` | `/api/addresses/{id}` | Consultar una dirección propia |
| `POST` | `/api/addresses` | Crear dirección |
| `PUT` | `/api/addresses/{id}` | Actualizar dirección |
| `DELETE` | `/api/addresses/{id}` | Eliminar dirección |
| `PATCH` | `/api/addresses/{id}/default` | Marcar como predeterminada |

Los ejemplos completos están en `Backend/Backend.http`.
