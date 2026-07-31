# Consistencia entre propuesta, documentación e implementación

## 1. Propósito

La propuesta inicial funcionó como visión y punto de partida. Durante el desarrollo se tomaron decisiones distintas por restricciones académicas, tiempo disponible y evolución técnica. Este documento separa claramente lo **propuesto** de lo **implementado**.

## 2. Comparación

| Tema | Propuesta inicial | Implementación real | Estado documental |
|---|---|---|---|
| Canales de cliente y repartidor | Apps móviles React Native | SPA web responsive para los tres roles | Documentación actual usa “plataforma web” |
| Panel del comercio | React + Vite + Tailwind | React + Vite + Tailwind | Coincide |
| Backend | C# .NET Web API | ASP.NET Core 8 Web API | Coincide |
| Arquitectura | Monolito modular | Monolito modular en monorepo | Coincide |
| Base de datos | PostgreSQL mediante Supabase | MariaDB mediante EF Core y Pomelo | Se documenta MariaDB |
| Tiempo real | Suscripciones/WebSockets de Supabase | SignalR protegido por pedido | Se documenta SignalR |
| Tracking | Propuesta excluía GPS continuo del MVP | Se implementaron mapa, ubicación y ruta | Función adicional documentada |
| Pago | Stripe o Mercado Pago real | Registro y simulación con datos enmascarados | Se declara que no hay cargo real |
| Hosting | Railway y Supabase | Ejecución local; hosting no configurado | Se declara pendiente |
| CI/CD móvil | EAS y tiendas | No aplica por ausencia de app móvil | Se elimina como capacidad actual |
| CI web/API | GitHub Actions | Build, test y lint automatizados | Coincide después de SPRINT6 |
| Pruebas E2E | Previstas para Sprint 6 | No existe suite de navegador | Limitación declarada |

## 3. Alcance final del MVP

### Incluido

- SPA responsive para cliente, comercio y repartidor.
- API REST modular.
- Autenticación JWT y refresh token.
- Roles y autorización por recurso.
- MariaDB y migraciones.
- Catálogo, inventario, carrito y checkout.
- Métodos de pago enmascarados y flujo simulado.
- Pedidos, historial y transiciones.
- Registro y operación de repartidores.
- GPS, rutas, mapas y SignalR.
- Pruebas de integración del backend.
- Pipeline de CI y documentación.

### Fuera de alcance actual

- Aplicaciones iOS/Android.
- Publicación en App Store o Google Play.
- Cobro real con proveedor bancario.
- Cupones, billetera digital y chat interno.
- Multi-idioma, multi-divisa y multi-región.
- Infraestructura productiva y CD.
- Suite E2E automatizada de navegador.

## 4. Organización real del repositorio

```text
AppDelivery/
├── Backend/             API, servicios, dominio, EF Core y migraciones
├── Backend.Tests/       19 pruebas de integración
├── Frontend/            SPA React/TypeScript
├── docs/                documentación de la rúbrica
├── .github/workflows/   integración continua
├── .config/             herramientas locales de .NET
├── README.md            entrada principal
└── CONTRIBUTING.md      reglas de colaboración y Git Flow
```

## 5. Regla de consistencia

Ningún documento debe afirmar que existe una tecnología, despliegue o prueba que no pueda localizarse en el repositorio o verificarse en el historial. Cuando una función corresponde a trabajo futuro se marca explícitamente como tal.
