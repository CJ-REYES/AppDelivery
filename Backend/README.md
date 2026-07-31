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

## Catálogo público

Las consultas públicas solo devuelven comercios activos y productos
disponibles cuyas categorías estén activas.

| Método | Ruta | Función |
|---|---|---|
| `GET` | `/api/catalog/store-categories` | Listar tipos de comercio |
| `GET` | `/api/catalog/stores` | Buscar y filtrar comercios |
| `GET` | `/api/catalog/stores/{storeId}` | Consultar un comercio |
| `GET` | `/api/catalog/stores/{storeId}/products` | Consultar sus productos |

`GET /api/catalog/stores` acepta `search`, `storeCategoryId` y `openOnly`.
La búsqueda también considera los nombres y descripciones de los productos.

## Administración del comercio

`POST /api/merchant/store` requiere una sesión de usuario y asigna el rol
`Merchant`. Después debe renovarse el access token mediante
`POST /api/auth/refresh`. Las demás rutas exigen el rol `Merchant` y verifican
que el recurso pertenezca al usuario autenticado.

| Método | Ruta | Función |
|---|---|---|
| `POST` | `/api/merchant/store` | Registrar mi comercio |
| `GET` | `/api/merchant/store` | Consultar mi comercio |
| `PUT` | `/api/merchant/store` | Actualizar mi comercio |
| `DELETE` | `/api/merchant/store` | Desactivar mi comercio |
| `GET/POST` | `/api/merchant/categories` | Listar o crear categorías |
| `PUT/DELETE` | `/api/merchant/categories/{id}` | Modificar una categoría propia |
| `GET/POST` | `/api/merchant/products` | Listar o crear productos |
| `PUT/DELETE` | `/api/merchant/products/{id}` | Modificar un producto propio |

Esta entrega utiliza el esquema creado por `InitialCreate`; no requiere una
migración adicional.

La cobertura de cada acción de los controladores y su consumidor React se
documenta en `docs/05-trazabilidad.md`.
