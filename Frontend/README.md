# Frontend de AppDelivery

Aplicación web del MVP construida con React, TypeScript, Vite y Tailwind CSS.

## Configuración

Desde la raíz del repositorio:

```fish
cp Frontend/.env.example Frontend/.env.local
npm --prefix Frontend ci
```

`VITE_API_URL` debe apuntar a la ruta base de la API:

```text
http://localhost:5258/api
```

## Ejecución

Inicia el backend y después el frontend:

```fish
dotnet run --project Backend/Backend.csproj --launch-profile http
npm --prefix Frontend run dev
```

La API permite credenciales para que el refresh token viaje como cookie
`HttpOnly`. El access token se conserva únicamente en `sessionStorage`.

## Validaciones

```fish
npm --prefix Frontend run lint
npm --prefix Frontend run build
```

## Rutas del catálogo y comercio

| Ruta | Función |
|---|---|
| `/login` | Registro e inicio de sesión reales |
| `/recuperar-contrasena` | Recuperación y restablecimiento de contraseña |
| `/inicio` | Inicio conectado al catálogo |
| `/buscar` | Búsqueda y filtros |
| `/comercio/:storeId` | Comercio y productos públicos |
| `/perfil` | Perfil y CRUD de direcciones del usuario autenticado |
| `/unete` | Selección de perfil adicional |
| `/registro-comercio` | Registro del comercio autenticado |
| `/mi-comercio` | Panel del comercio |
| `/mi-comercio/productos` | CRUD de categorías y productos |
| `/mi-comercio/perfil` | Edición del comercio |

La correspondencia completa entre páginas, endpoints y pruebas está en
`docs/05-trazabilidad.md`.
