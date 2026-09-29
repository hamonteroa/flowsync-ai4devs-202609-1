# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es este repo

FlowSync: proyecto de curso (AI4Devs, LIDR). Monorepo con dos paquetes npm independientes, sin workspace raíz — cada comando se ejecuta dentro de `backend/` o `frontend/`:

- `backend/` — API REST en AdonisJS 7 (TypeScript, ESM) con Lucid ORM sobre SQLite (`better-sqlite3`, fichero en `backend/tmp/db.sqlite3`).
- `frontend/` — React 19 + Vite 8, todavía la plantilla por defecto de Vite (sin conexión con el backend).

La documentación y los mensajes del repo están en español.

## Comandos

### Backend (`cd backend`)

```bash
npm install
cp .env.example .env && node ace generate:key   # primera vez: APP_KEY es obligatoria
node ace migration:run                          # crea tablas y regenera database/schema.ts
npm run dev          # node ace serve --hmr (puerto 3333)
npm run build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run format       # prettier
npm test             # node ace test (todas las suites)
```

Tests con Japa. Suites definidas en `adonisrc.ts`: `unit` (`tests/unit/**/*.spec.ts`) y `functional` (`tests/functional/**/*.spec.ts`, arranca el servidor HTTP). Aún no hay tests escritos. Para acotar:

```bash
node ace test unit                                   # una suite
node ace test --files tests/functional/auth.spec.ts  # un fichero
node ace test --tests "nombre exacto del test"       # un test
```

`.env.test` solo sobreescribe `SESSION_DRIVER=memory`.

### Frontend (`cd frontend`)

```bash
npm run dev      # vite
npm run build    # tsc -b && vite build
npm run lint     # oxlint
```

## Arquitectura del backend

- **Rutas** (`start/routes.ts`): todo bajo `/api/v1`. `auth/signup` y `auth/login` son públicas; `account/profile` y `account/logout` usan `middleware.auth()`. Los controladores se referencian vía `controllers` de `#generated/controllers`, no importándolos directamente.
- **Código generado** (`.adonisjs/`): los hooks `indexEntities` y `generateRegistry` (Tuyau) de `adonisrc.ts` regeneran el índice de controladores/transformers y el registro tipado de rutas al arrancar/compilar. No editar a mano; está versionado porque `package.json` lo exporta (`./data`, `./registry`) y `tests/bootstrap.ts` tipa el api-client con él.
- **Modelos y esquema**: `database/schema.ts` se autogenera desde las migraciones al correr `migration:run` (no editar). Los modelos extienden esas clases (`User extends compose(UserSchema, withAuthFinder(hash))`), así que las columnas se añaden con una migración, no declarándolas en el modelo. Reglas de generación personalizadas en `database/schema_rules.ts`.
- **Auth**: guard por defecto `api` = access tokens opacos en BD (`User.accessTokens`). También está configurado un guard `web` de sesión, sin uso en rutas.
- **Respuestas**: `providers/api_provider.ts` añade `ctx.serialize()`, que envuelve la respuesta en `{ data: ... }` (y valida metadatos de paginación de Lucid). Los controladores devuelven `serialize(XTransformer.transform(model))`; los transformers (`app/transformers/`) deciden qué campos se exponen.
- **Validación**: VineJS en `app/validators/`, usada con `request.validateUsing(...)`.
- `force_json_response_middleware` fuerza `Accept: application/json` en todas las peticiones (errores siempre en JSON).
- Imports internos por subpath de `package.json` (`#models/*`, `#controllers/*`, `#validators/*`, etc.), con extensión `.js` resuelta.

## Ramas del curso y publicación a cohortes

Este es el repo **canónico**; cada cohorte tiene el suyo derivado. Las ramas del curso siguen `sN/start` y `sN/end`, y **`s(N+1)/start` es el mismo commit que `sN/end`** (la solución de la sesión anterior). Por eso las ramas se publican a los cohortes solo con `scripts/publicar-cohorte.sh` (`crear` / `publicar` / `estado`), nunca con `git push` a mano: el script avisa cuando una publicación destapa una solución. Detalles en `COHORTES.md`.

## Tooling de Claude en el repo

- `.mcp.json` configura el MCP de Atlassian (Jira/Confluence).
- Skills de proyecto en `.claude/skills/`: `priority-ticket` (toma el ticket "Tareas por hacer" de mayor prioridad en Jira, planifica y lo mueve a "En curso"/"En revisión") y `commit` (commit convencional `tipo(scope): descripción` a partir de lo staged).

La URL de la API sale de `VITE_API_URL` (ver `frontend/.env.example`); por defecto `http://localhost:3333`.

## Reglas de proceso
- Antes de tocar código: crear una rama nueva (`git checkout -b feat/<slug>`). Nunca commitear directo en `main`/`s1/start`.
- Al cerrar la tarea: usar la skill `/commit`, luego `gh pr create` con una descripción completa de los cambios en el cuerpo del PR.
- Después de abrir el PR: usar el subagente `adversarial-reviewer` sobre él, antes de darlo por terminado.
- No repitas ese resumen en el chat: la sesión se va a perder, el PR no. Responde solo con la URL del PR.
- Ejecuta pruebas e2e usando la extensión de Chrome, y inaliza agregando un gif del recorrido en un nuevo comentario del PR de GitHub.