# Trazabilidad del proyecto

## 1. Matriz funcional

| Requisito del MVP | Implementación backend | Implementación frontend | Prueba o evidencia |
|---|---|---|---|
| Registro e inicio de sesión | `AuthController`, `AuthService`, JWT y refresh tokens | `LoginPage`, `AuthContext`, `authApi` | `AuthAndAuthorizationTests` y PR #8 |
| Recuperación de contraseña | Tokens de recuperación con expiración | `PasswordRecoveryPage` | Pruebas de autenticación y `Backend.http` |
| Perfil y direcciones | `UsersController`, `AddressesController` | `ProfilePage`, `AccountAddressForm` | Pruebas de autorización por usuario |
| Catálogo público | `CatalogController`, `CatalogService` | `HomePage`, `SearchPage`, `StorePage` | `CatalogAndMerchantTests`, PR #4 y #9 |
| Comercio e inventario | `MerchantCatalogController`, `MerchantCatalogService` | Páginas de comercio y `StoreForm` | `CatalogAndMerchantTests`, PR #9 |
| Carrito | Estado persistente del frontend | `AppStateContext`, `StorePage` y `CheckoutPage` | Build frontend y PR #5 |
| Pedidos | `OrdersController`, `OrderService` | `CheckoutPage`, `OrdersPage` | `OrderWorkflowTests`, PR #10 |
| Pago elemental | Métodos enmascarados y referencia simulada | Formularios de método de pago | `OrderWorkflowTests`; sin cargo bancario real |
| Estados del comercio | `MerchantOrdersController` | `MerchantOrdersPage` | `OrderWorkflowTests` |
| Perfil del repartidor | `DriversController`, `DriverService` | Registro, perfil y dashboard | `DriverAndTrackingTests`, PR #11 |
| Asignación de pedidos | `DeliveryAssignmentService` | `DriverDashboardPage` | `DriverAndTrackingTests` |
| Rutas | `RoutesController`, `OsrmRoutingService` | `RouteMap`, `LocationPicker` | Pruebas y fallback Haversine |
| Tracking | `TrackingController`, `TrackingHub`, notifier SignalR | `TrackingPage`, `trackingHub.ts` | `DriverAndTrackingTests`, PR #11 |
| Autorización por rol | Políticas `MerchantOnly`, `DriverOnly`, `AdminOnly` | `RequireAuth` y rutas por rol | `AuthAndAuthorizationTests` |

## 2. Trazabilidad de persistencia

| Entidad | Tabla o conjunto | Módulo que la utiliza |
|---|---|---|
| User, Role, UserRole | usuarios y roles | Auth y perfiles |
| RefreshToken | sesiones renovables | Auth |
| PasswordResetToken | recuperación | Auth |
| Address | direcciones | Cliente y checkout |
| StoreCategory, Store | comercios | Catálogo y comercio |
| ProductCategory, Product | inventario | Catálogo y pedidos |
| PaymentMethod | métodos enmascarados | Checkout |
| Order, OrderItem | transacción principal | Cliente y comercio |
| OrderStatusHistory | auditoría de estados | Pedidos y tracking |
| DriverProfile | repartidores | Logística |
| DeliveryAssignment | asignaciones | Logística y tracking |

## 3. Migraciones

| Migración | Propósito |
|---|---|
| `InitialCreate` | Esquema base del dominio |
| `AddAuthCore` | Refresh tokens y recuperación de contraseña |
| `AddOrderWorkflow` | Inventario e historial de estados del pedido |

## 4. Trazabilidad de Pull Requests

| PR | Módulos incorporados |
|---:|---|
| #1 | Monorepo y configuración inicial |
| #2 | Landing y login público |
| #3 | Primera publicación a `main` |
| #4 | Búsqueda, comercios y productos |
| #5 | Checkout, pedidos y tracking de interfaz |
| #6 | Modelo MariaDB y migraciones |
| #7 | Segunda publicación a `main` |
| #8 | Autenticación, roles, perfil y direcciones |
| #9 | Catálogo real y administración del comercio |
| #10 | Pedidos, stock y pagos simulados |
| #11 | Repartidores, asignaciones, rutas y SignalR |
| SPRINT6 | Documentación, CI y release final |

## 5. Requisitos no funcionales

| Requisito | Evidencia |
|---|---|
| Seguridad de sesión | JWT corto, cookie HttpOnly de refresh, rotación y revocación |
| Integridad | Transacciones y validación del lado servidor |
| Privacidad de pago | No se almacena PAN completo ni CVV |
| Autorización | Políticas por rol y comprobación de propiedad de recursos |
| Usabilidad | SPA responsive con estados de carga, error y vacío |
| Mantenibilidad | Separación modular, tipos, interfaces y documentación |
| Calidad | 19 pruebas de backend, lint, build y GitHub Actions |
| Recuperación ante fallo externo | Fallback de rutas y polling de tracking |

## 6. Fuente de verdad

La implementación de `develop` y `main` después del release final es la referencia oficial. La rama local `backup/pre-gitflow-split-20260731` se conserva únicamente como respaldo histórico y no debe sobrescribir el código más reciente de `develop`.
