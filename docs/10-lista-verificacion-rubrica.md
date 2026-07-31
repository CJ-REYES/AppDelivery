# Lista de verificación de la rúbrica

## 1. Metodología - objetivo: Excelente

- [x] Se indica Scrum adaptado.
- [x] Se describen planificación, diseño, implementación, pruebas e integración.
- [x] Se identifican entregables.
- [x] Existe evidencia de seguimiento mediante sprints, commits y PR.
- [x] Se documenta un criterio de terminado.

Evidencia: `01-metodologia.md`, `05-trazabilidad.md` y PR #1 a #11.

## 2. Arquitectura - objetivo: Excelente

- [x] Existe diagrama de contexto.
- [x] Existe diagrama de contenedores.
- [x] Existe diagrama de componentes del backend.
- [x] Existe diagrama de componentes del frontend.
- [x] Existe modelo de datos conceptual.
- [x] Se describen responsabilidades.
- [x] Se explica REST, SignalR, EF Core y OSRM.
- [x] Existe separación de capas.
- [x] Se distingue despliegue local de despliegue futuro.

Evidencia: `02-arquitectura.md`.

## 3. Stack - objetivo: Excelente

- [x] Se documentan lenguajes.
- [x] Se documentan frameworks.
- [x] Se documenta base de datos.
- [x] Se documenta control de versiones.
- [x] Se documentan librerías principales.
- [x] Se indican versiones reales.
- [x] Se justifica cada elección.
- [x] Se separan tecnologías propuestas no implementadas.

Evidencia: `03-stack-tecnologico.md`, `Backend.csproj` y `package-lock.json`.

## 4. Git - objetivo: Excelente

- [x] Modelo de ramas definido.
- [x] Rama principal `main`.
- [x] Rama de integración `develop`.
- [x] Ramas `feature/*` por sprint.
- [x] Convención de commits.
- [x] Uso de Pull Requests.
- [x] Estrategia de merge documentada.
- [x] Evidencia del historial y PR.
- [x] Release final de `develop` a `main` previsto.

Evidencia: `04-flujo-git.md`, `CONTRIBUTING.md` e historial de GitHub.

## 5. Consistencia - objetivo: Excelente

- [x] La arquitectura coincide con las carpetas y servicios reales.
- [x] Las tecnologías coinciden con archivos de dependencias.
- [x] El flujo Git coincide con el historial.
- [x] Se declara que el producto es web responsive, no móvil.
- [x] Se declara que MariaDB sustituyó PostgreSQL/Supabase.
- [x] Se declara que el pago es simulado.
- [x] Se declara que no existe despliegue productivo ni suite E2E de navegador.
- [x] La rama backup se identifica como respaldo, no como rama de integración.

Evidencia: `09-consistencia-alcance.md` y código fuente.

## Resultado esperado

La documentación cubre los cinco bloques de la rúbrica: 20 puntos de metodología, 20 de arquitectura, 15 de stack, 25 de flujo Git y 20 de consistencia, para un total objetivo de 100 puntos, sujeto a la evaluación docente y a que el release final mantenga el repositorio coherente con estos documentos.
