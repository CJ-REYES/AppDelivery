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

Después de `AddOrderWorkflow`, la base contiene 17 tablas: las 13 tablas
originales, `refresh_tokens`, `password_reset_tokens`,
`order_status_history` y `__EFMigrationsHistory`. La misma migración agrega
`StockQuantity` a `products`.

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

## Pedidos y métodos de pago

El checkout crea el pedido, sus líneas y el primer evento de estado en una
transacción. La API vuelve a calcular precios y cargos, valida la propiedad de
la dirección y del método de pago, y descuenta existencias; no confía en
totales enviados por React.

| Método | Ruta | Función |
|---|---|---|
| `POST` | `/api/orders` | Crear un pedido real |
| `GET` | `/api/orders` | Historial del cliente |
| `GET` | `/api/orders/latest` | Obtener el pedido más reciente |
| `GET` | `/api/orders/{id}` | Consultar un pedido propio |
| `PATCH` | `/api/orders/{id}/cancel` | Cancelar y devolver existencias |
| `GET` | `/api/merchant/orders` | Historial de pedidos del comercio |
| `GET` | `/api/merchant/orders/summary` | Resumen de pedidos vendidos |
| `GET` | `/api/merchant/orders/{id}` | Consultar un pedido del comercio |
| `PATCH` | `/api/merchant/orders/{id}/status` | Confirmar, preparar o dejar listo |
| `GET/POST` | `/api/payment-methods` | Listar o registrar métodos enmascarados |
| `PATCH` | `/api/payment-methods/{id}/default` | Marcar como predeterminado |
| `DELETE` | `/api/payment-methods/{id}` | Eliminar un método propio |

Solo se conservan metadatos enmascarados de tarjeta. La API no guarda el
número completo ni el CVV. Esta entrega registra el pedido y su referencia de
pago, pero no realiza un cobro bancario real.

Los estados administrados en esta etapa son `Pending`, `Confirmed`,
`Preparing`, `ReadyForPickup` y `Cancelled`. Cada transición queda registrada
en `order_status_history`; reparto y entrega se integran en la etapa siguiente.

La cobertura de cada acción de los controladores y su consumidor React se
documenta en `docs/05-trazabilidad.md`.
