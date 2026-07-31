# Instalación y configuración

## 1. Requisitos

- Linux, macOS o Windows.
- Git.
- .NET SDK 8.
- Node.js 20 o superior y npm.
- MariaDB 12.x.
- Navegador moderno con geolocalización habilitada para probar el rol de repartidor.

## 2. Clonar y restaurar

```bash
git clone https://github.com/CJ-REYES/AppDelivery.git
cd AppDelivery

dotnet tool restore
dotnet restore Backend/Backend.csproj
npm --prefix Frontend ci
```

## 3. Crear base de datos y usuario

Ejemplo SQL:

```sql
CREATE DATABASE appdelivery
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'appdelivery'@'localhost' IDENTIFIED BY 'CAMBIA_ESTA_CONTRASENA';
GRANT ALL PRIVILEGES ON appdelivery.* TO 'appdelivery'@'localhost';
FLUSH PRIVILEGES;
```

## 4. Secretos del backend

No se deben escribir contraseñas o llaves reales en `appsettings.json`.

```bash
dotnet user-secrets set \
  "ConnectionStrings:DefaultConnection" \
  "Server=127.0.0.1;Port=3306;Database=appdelivery;User ID=appdelivery;Password=CAMBIA_ESTA_CONTRASENA;" \
  --project Backend/Backend.csproj

JWT_KEY="$(openssl rand -base64 48)"
dotnet user-secrets set \
  "Jwt:Key" \
  "$JWT_KEY" \
  --project Backend/Backend.csproj
unset JWT_KEY
```

## 5. Variables del frontend

```bash
cp Frontend/.env.example Frontend/.env.local
```

Contenido esperado:

```env
VITE_API_URL=http://localhost:5258/api
```

`Frontend/.env.local` está ignorado por Git.

## 6. Migraciones

```bash
dotnet ef database update \
  --project Backend/Backend.csproj \
  --startup-project Backend/Backend.csproj \
  --context AppDbContext
```

## 7. Ejecución local

Backend:

```bash
dotnet run --project Backend/Backend.csproj --launch-profile http
```

Frontend:

```bash
npm --prefix Frontend run dev
```

Accesos habituales:

- Frontend: `http://localhost:5173`
- API: `http://localhost:5258`
- Swagger: `http://localhost:5258/swagger`
- Health de base de datos: `http://localhost:5258/api/health/database`
- Hub SignalR: `http://localhost:5258/hubs/tracking`

## 8. Validación

```bash
dotnet build Backend/Backend.csproj --configuration Release
dotnet test Backend.Tests/Backend.Tests.csproj --configuration Release
npm --prefix Frontend run lint
npm --prefix Frontend run build
```

## 9. Configuración relevante

| Clave | Función | Ubicación segura |
|---|---|---|
| `ConnectionStrings:DefaultConnection` | MariaDB | User Secrets o secreto del hosting |
| `Jwt:Key` | Firma de tokens | User Secrets o secreto del hosting |
| `Jwt:Issuer` | Emisor | `appsettings.json` |
| `Jwt:Audience` | Audiencia | `appsettings.json` |
| `Cors:AllowedOrigins` | Orígenes permitidos | Configuración por entorno |
| `Routing:BaseUrl` | Proveedor OSRM | `appsettings.json` |
| `VITE_API_URL` | URL base de la API | `.env.local` o variable de build |

## 10. Solución de problemas

### La API no inicia

- Confirmar que existen `DefaultConnection` y `Jwt:Key`.
- Verificar que MariaDB esté activo.
- Ejecutar migraciones.

### CORS o refresh token no funciona

- Confirmar que la URL exacta del frontend esté en `Cors:AllowedOrigins`.
- Usar el mismo esquema esperado en ambos servicios durante desarrollo.
- Confirmar que `apiRequest` use `credentials: include`.

### No aparecen rutas

- Verificar acceso a `router.project-osrm.org`.
- El backend puede devolver estimación Haversine cuando OSRM falla.

### No hay entregas disponibles

- El repartidor debe estar autenticado, registrado, disponible y con ubicación válida.
- El pedido debe estar en estado listo para recolección.
