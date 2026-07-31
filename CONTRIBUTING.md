# Contribución y flujo de trabajo

## Ramas

- Crear trabajo nuevo desde `develop`.
- Usar `feature/SPRINTx-*`, `fix/*`, `test/*`, `docs/*` o `chore/*`.
- No desarrollar directamente en `main`.

## Commits

Formato:

```text
<tipo>(<alcance>): <descripción>
```

Ejemplos:

```text
feat(orders): add order cancellation
fix(auth): clear expired session
test(api): cover merchant authorization
docs(project): update architecture diagrams
ci(validation): run backend and frontend checks
```

Tipos permitidos: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`, `ci`.

## Validación antes del push

```bash
dotnet build Backend/Backend.csproj
dotnet test Backend.Tests/Backend.Tests.csproj
npm --prefix Frontend run lint
npm --prefix Frontend run build
git diff --check
```

## Pull Request

El PR debe incluir:

- Objetivo.
- Cambios principales.
- Evidencia o pruebas.
- Riesgos y limitaciones.
- Fuera de alcance.

Destino habitual: `develop`. Las publicaciones se realizan con un PR separado de `develop` hacia `main`.
