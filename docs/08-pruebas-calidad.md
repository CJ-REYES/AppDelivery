# Pruebas y aseguramiento de calidad

## 1. Estrategia

La calidad del MVP se valida en cuatro niveles:

1. Compilación del backend.
2. Pruebas de integración del backend.
3. Lint y compilación del frontend.
4. Validación automática en GitHub Actions.

## 2. Suite automatizada

El proyecto contiene **19 pruebas** distribuidas así:

| Archivo | Cantidad | Cobertura principal |
|---|---:|---|
| `AuthAndAuthorizationTests.cs` | 7 | Registro, login, credenciales, autorización, propiedad y refresh |
| `CatalogAndMerchantTests.cs` | 4 | Catálogo, comercio, categorías y productos |
| `ControllerConnectivityTests.cs` | 3 | Conectividad y respuestas de controladores |
| `OrderWorkflowTests.cs` | 2 | Checkout, stock, pedidos, pagos y estados |
| `DriverAndTrackingTests.cs` | 3 | Registro de repartidor, asignación, estados y tracking |

Las pruebas levantan el API mediante `WebApplicationFactory`, reemplazan la persistencia por EF Core InMemory y ejercitan solicitudes HTTP reales dentro del proceso.

## 3. Comandos locales

```bash
dotnet restore Backend/Backend.csproj
dotnet build Backend/Backend.csproj --configuration Release --no-restore
dotnet test Backend.Tests/Backend.Tests.csproj \
  --configuration Release \
  --collect:"XPlat Code Coverage"

npm --prefix Frontend ci
npm --prefix Frontend run lint
npm --prefix Frontend run build

git diff --check
```

## 4. Integración continua

`.github/workflows/ci.yml` se ejecuta en:

- Pull Requests hacia `develop` y `main`.
- Push hacia `develop` y `main`.

Jobs:

- `backend`: setup .NET 8, restore, build y test.
- `frontend`: setup Node 20, `npm ci`, lint y build.

La integración solo debe realizarse cuando ambos jobs terminan correctamente.

## 5. Criterios de aceptación por módulo

### Autenticación

- Contraseñas fuertes.
- JWT válido y con expiración corta.
- Refresh token HttpOnly, rotado y revocable.
- Acceso 401/403 coherente.

### Catálogo y comercio

- Solo se publican comercios y productos activos.
- El comercio solo modifica sus propios recursos.
- El inventario no acepta valores inválidos.

### Pedidos

- El backend recalcula precios.
- Se valida propiedad de dirección y pago.
- El stock se descuenta en transacción.
- Cancelación devuelve existencias cuando corresponde.
- Cada transición queda en historial.

### Repartidores

- Solo repartidores disponibles y ubicados ven recomendaciones.
- No se permite aceptar entregas ya tomadas.
- Los estados siguen una secuencia válida.

### Tracking

- Solo actores autorizados pueden consultar o suscribirse.
- REST es la fuente de verdad.
- SignalR y polling mantienen la interfaz actualizada.

## 6. Revisión de seguridad aplicada

- Secretos fuera del repositorio.
- Hash de contraseñas con 120 000 iteraciones configuradas.
- Refresh tokens almacenados por hash.
- Métodos de pago enmascarados; no se conserva CVV.
- Políticas por rol y verificación de propiedad.
- CORS limitado a orígenes configurados.
- Errores mediante Problem Details sin exponer trazas internas al cliente.

## 7. Limitación de pruebas

El repositorio no incorpora actualmente una suite E2E de navegador con Playwright o Cypress. La validación de interfaz se realiza mediante lint, compilación y pruebas manuales de los flujos. Esta limitación se declara para no atribuir cobertura inexistente al proyecto y queda como mejora futura.
