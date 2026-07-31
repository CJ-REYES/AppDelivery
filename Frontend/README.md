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
| `/checkout` | Creación persistente del pedido |
| `/pedidos` | Pedidos activos e historial del cliente |
| `/seguimiento` | Abre automáticamente el pedido reciente |
| `/seguimiento/:orderId` | Ruta y posición del repartidor |
| `/perfil` | Perfil y CRUD de direcciones del usuario autenticado |
| `/unete` | Selección de perfil adicional |
| `/registro-comercio` | Registro del comercio autenticado |
| `/mi-comercio` | Panel del comercio |
| `/mi-comercio/pedidos` | Pedidos activos y vendidos del comercio |
| `/mi-comercio/productos` | CRUD de categorías y productos |
| `/mi-comercio/perfil` | Edición del comercio |
| `/registro-repartidor` | Cuenta y alta del repartidor |
| `/repartidor` | Entregas recomendadas y mapa previo |
| `/repartidor/entrega-activa` | Navegación, GPS y estados |
| `/repartidor/historial` | Pedidos repartidos y ganancias reales |
| `/repartidor/perfil` | Vehículo y documentación |

El cliente inicia el seguimiento desde su historial con **Seguir pedido**.
La ruta `/seguimiento` ya no solicita escribir un identificador: selecciona el
pedido activo más reciente y abre su mapa. El carrito es el único estado
comercial que se conserva localmente; pedidos, estados, direcciones y métodos
de pago vienen de la API.

Los mapas usan Leaflet con mosaicos de OpenStreetMap. El navegador solicitará
permiso de ubicación al repartidor; el panel no ofrece pedidos hasta que
exista una posición válida y el estado sea `Available`. El seguimiento del
cliente recibe cambios mediante SignalR y conserva una consulta REST cada 30
segundos como respaldo si la conexión en tiempo real se interrumpe.
