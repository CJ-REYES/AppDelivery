# Stack tecnológico

## 1. Tecnologías y versiones reales

Las versiones se obtienen de `Backend.csproj`, `Backend.Tests.csproj` y `Frontend/package-lock.json`.

| Área | Tecnología | Versión utilizada | Justificación |
|---|---|---:|---|
| Backend | .NET / ASP.NET Core | 8 | API madura, tipado fuerte, DI, seguridad, Swagger y alto rendimiento |
| ORM | Entity Framework Core | 8.0.28 | Migraciones, consultas LINQ y transacciones con modelo relacional |
| Proveedor MariaDB | Pomelo EF Core MySQL | 8.0.3 | Compatibilidad de EF Core con MariaDB/MySQL |
| API docs | Swashbuckle | 6.6.2 | Swagger UI y contrato OpenAPI en desarrollo |
| Frontend | React | 19.2.8 | Componentes reutilizables y estado declarativo |
| Lenguaje frontend | TypeScript | 6.0.3 | Contratos tipados y reducción de errores entre módulos |
| Build frontend | Vite | 8.1.5 | Desarrollo rápido y empaquetado optimizado |
| Estilos | Tailwind CSS | 4.3.3 | Sistema visual responsive basado en utilidades |
| Navegación | React Router | 7.18.1 | Rutas, parámetros y guardas de acceso |
| Mapas | Leaflet | 1.9.4 | Mapas interactivos ligeros con OpenStreetMap |
| Integración React mapas | React Leaflet | 5.0.0 | Componentes React para Leaflet |
| Tiempo real cliente | Microsoft SignalR | 8.0.17 | Reconexión y eventos del seguimiento de pedidos |
| Lint | oxlint | 1.75.0 | Validación rápida del código TypeScript/React |
| Base de datos | MariaDB | 12.x | Persistencia relacional, transacciones y compatibilidad MySQL |
| Rutas | OSRM | API pública configurada | Cálculo de rutas basado en OpenStreetMap |
| Pruebas | xUnit | 2.9.3 | Pruebas de integración del backend |
| Host de pruebas | ASP.NET MVC Testing | 8.0.28 | Arranque del API dentro de la suite |
| BD de pruebas | EF Core InMemory | 8.0.28 | Aislamiento de pruebas sin depender de MariaDB local |
| Cobertura | Coverlet Collector | 6.0.4 | Recolección de cobertura XPlat |
| Control de versiones | Git + GitHub | Repositorio actual | Ramas, commits, PR, revisión e historial |
| CI | GitHub Actions | Workflow del repositorio | Repite pruebas y builds en PR y push |

## 2. Justificación por capa

### React, TypeScript, Vite y Tailwind

El MVP requiere interfaces diferenciadas para cliente, comercio y repartidor. React permite reutilizar tarjetas, formularios, layouts y mapas. TypeScript mantiene contratos explícitos. Vite reduce el tiempo de desarrollo y Tailwind facilita una interfaz adaptable a escritorio y móvil desde una misma SPA.

### ASP.NET Core y C#

La API concentra autenticación, autorización, catálogo, inventario, pedidos, pagos simulados, asignaciones y tracking. ASP.NET Core aporta middleware, políticas, inyección de dependencias, SignalR y documentación OpenAPI en un único ecosistema.

### MariaDB y EF Core

El dominio requiere relaciones y operaciones atómicas: crear pedidos, descontar stock, registrar historial y asignar repartidores. MariaDB proporciona persistencia transaccional y EF Core mantiene el esquema mediante migraciones versionadas.

### SignalR

Los cambios del pedido deben llegar sin recargar la página. SignalR gestiona WebSocket y reconexión. La API REST sigue siendo la fuente de verdad, por lo que una desconexión temporal no corrompe el estado.

### Leaflet, OpenStreetMap y OSRM

Leaflet presenta ubicaciones y rutas sin depender de un SDK propietario. OSRM calcula rutas y el backend incorpora una estimación de respaldo si el proveedor no está disponible.

### xUnit y GitHub Actions

Las pruebas cubren autenticación, autorización, catálogo, comercio, pedidos, pagos, repartidores y tracking. GitHub Actions automatiza los mismos comandos usados localmente para reducir integraciones defectuosas.

## 3. Tecnologías de la propuesta que no se implementaron

| Tecnología propuesta | Estado real |
|---|---|
| React Native / Expo | No existe aplicación móvil; se implementó SPA web responsive |
| PostgreSQL / Supabase | Se sustituyó por MariaDB local con EF Core |
| Railway | No existe despliegue productivo configurado |
| Stripe o Mercado Pago | El pago actual es simulado y conserva solo metadatos enmascarados |
| WebSockets de Supabase | Se implementó SignalR en ASP.NET Core |
| EAS / tiendas móviles | Fuera del alcance porque no existe cliente móvil |

Esta tabla evita atribuir al proyecto tecnologías que no aparecen en el código.
