# Índice de documentación y cobertura de la rúbrica

Esta carpeta documenta el estado real de AppDelivery. Su organización responde directamente a los cinco criterios de la **Rúbrica de Evaluación Desarrollo Web Integral, mayo-agosto 2026**.

| Criterio de la rúbrica | Evidencia principal | Evidencia complementaria |
|---|---|---|
| 1. Metodología de desarrollo | `01-metodologia.md` | Historial de PR, commits y sprints en `05-trazabilidad.md` |
| 2. Arquitectura del sistema | `02-arquitectura.md` | Código de `Backend/`, `Frontend/src/` y migraciones |
| 3. Stack tecnológico | `03-stack-tecnologico.md` | `Backend.csproj`, `package.json`, `package-lock.json` |
| 4. Flujo de trabajo con Git | `04-flujo-git.md` | PR #1 a #11 y rama final de SPRINT6 |
| 5. Consistencia documentación-proyecto | `09-consistencia-alcance.md` | `10-lista-verificacion-rubrica.md` |

## Documentos

1. [`01-metodologia.md`](01-metodologia.md): metodología Scrum adaptada, fases, sprints, entregables y evidencia.
2. [`02-arquitectura.md`](02-arquitectura.md): contexto, contenedores, componentes, despliegue local y comunicación.
3. [`03-stack-tecnologico.md`](03-stack-tecnologico.md): tecnologías, versiones bloqueadas y justificación.
4. [`04-flujo-git.md`](04-flujo-git.md): ramas, commits convencionales, revisión y merges.
5. [`05-trazabilidad.md`](05-trazabilidad.md): relación entre objetivos, módulos, archivos, pruebas y PR.
6. [`06-instalacion-configuracion.md`](06-instalacion-configuracion.md): ambiente, secretos, base de datos y ejecución.
7. [`07-manual-usuario.md`](07-manual-usuario.md): guía funcional por rol.
8. [`08-pruebas-calidad.md`](08-pruebas-calidad.md): pruebas automatizadas, validaciones y CI.
9. [`09-consistencia-alcance.md`](09-consistencia-alcance.md): cambios respecto a la propuesta inicial y limitaciones.
10. [`10-lista-verificacion-rubrica.md`](10-lista-verificacion-rubrica.md): checklist final de entrega.

## Fuentes de verdad

Para evitar inconsistencias, se adopta el siguiente orden:

1. Código y migraciones en la rama estable.
2. Pruebas automatizadas y pipeline de CI.
3. Documentación técnica de esta carpeta.
4. Propuesta inicial, utilizada como antecedente y no como descripción automática del producto final.
