# Tasks

## 1. Datos

- [ ] 1.1 Crear la migración `create_tasks_table` (id, `title` string(120) not null, `status` string not null default `pending`, `assignee_id` FK a `users` con cascade, timestamps; sin columnas de fecha de vencimiento) y verificar que `node ace migration:run` termina sin errores y que `database/schema.ts` incluye `TaskSchema` con esas columnas
- [ ] 1.2 Crear el modelo `Task` extendiendo `TaskSchema` con la relación `assignee` (belongsTo `User` por `assigneeId`) y la constante compartida de los tres estados, y verificar con `npm run typecheck` en `backend/`

## 2. API

- [ ] 2.1 Crear los validadores de crear (`title` con trim, mínimo 1, máximo 120) y actualizar (`status` enum opcional, `assigneeId` número que exista en `users` opcional) en `app/validators/`, y verificar con `npm run typecheck`
- [ ] 2.2 Crear `TaskTransformer` que exponga solo `id`, `title`, `status` y `assignee: { id, fullName }`, y verificar con `npm run typecheck` que no incluye email ni fechas
- [ ] 2.3 Crear el controlador de tareas con `index` (preload de `assignee`, sin `orderBy`), `store` (pending + usuario autenticado, 201) y `update` (`findOrFail`, solo campos presentes, 200), registrar las tres rutas a mano en un grupo `/api/v1/tasks` con `middleware.auth()` y verificar con `node ace list:routes` que existen exactamente `GET /api/v1/tasks`, `POST /api/v1/tasks` y `PATCH /api/v1/tasks/:id`
- [ ] 2.4 Arrancar `npm run dev`, commitear el diff regenerado de `.adonisjs/`, y verificar con `curl` los escenarios del delta `tasks`:
  - 401 sin token.
  - Creación 201 en `pending` y a nombre del creador, ignorando `status` y `assigneeId` en el cuerpo.
  - 422 con título vacío, en blanco y de 121 caracteres; 201 con 120.
  - Título recortado.
  - Lista idéntica con dos usuarios distintos y `{ data: [] }` con la tabla vacía.
  - PATCH de estado sobre una tarea ajena, vuelta de `done` a `pending`, 422 con `status` `"archived"` y `"Pendiente"`, reasignación a otro usuario, 422 con `assigneeId` inexistente, 404 con id inexistente, título ignorado y cuerpo vacío → 200 sin cambios.
  - Ninguna respuesta contiene `email` del responsable.
- [ ] 2.5 Verificar `npm run lint` y `npm run typecheck` limpios en `backend/`

## 3. Cliente de API (frontend)

- [ ] 3.1 Añadir a `lib/types.ts` `TaskStatus`, `Task` y las etiquetas Pendiente / En curso / Hecho, y verificar con `npm run build`
- [ ] 3.2 Añadir a `lib/api.ts` `listTasks`, `createTask` y `updateTaskStatus` (con `PATCH` en `RequestOptions`) y las traducciones nuevas (`title`, `enum`, `database.exists`, 404), y verificar con `npm run build` y `npm run lint`

## 4. Pantalla de lista (frontend)

- [ ] 4.1 Crear `pages/tasks-page.tsx` con carga, aviso de error y estado vacío explicativo, y filas con título, responsable (`Sin nombre` si falta o está en blanco) y estado; sin fechas, sin orden en cliente. Verificar en el navegador que con la tabla vacía aparece el texto de estado vacío y que con tareas de dos usuarios (uno sin nombre) cada fila muestra título, nombre o "Sin nombre" y estado en castellano
- [ ] 4.2 Añadir el formulario de creación con solo el campo título (sin `maxLength` en el input), con validación local de vacío/en blanco y de más de 120 caracteres, errores de servidor bajo el campo y la tarea creada añadida al final de la lista. Verificar en el navegador que:
  - La creación aparece sin recargar, a nombre propio y en "Pendiente".
  - Con el título vacío o en blanco sale "Escribe un título para la tarea." y no hay petición en la pestaña de red.
  - Con 121 caracteres sale "El título no puede superar los 120 caracteres." y el texto se conserva entero.
- [ ] 4.3 Añadir en cada fila los tres botones de estado (actual marcado con `aria-pressed`), con cambio optimista y vuelta atrás con aviso si la API falla, y verificar en el navegador que:
  - Cambiar el estado de una tarea propia y de una ajena se refleja al instante.
  - Tras recargar el estado persiste.
  - Con el backend parado el estado vuelve al anterior y aparece el aviso.

## 5. Navegación (frontend)

- [ ] 5.1 Registrar `/tasks` dentro de `ProtectedRoute`, redirigir `PublicOnlyRoute` y la ruta comodín a `/tasks`, añadir el enlace "Perfil" en la lista y "Ver tareas" en el perfil. Verificar en el navegador que:
  - Login y registro llevan a la lista.
  - `/login` con sesión lleva a la lista.
  - Una ruta inventada lleva a la lista, o al login si no hay sesión.
  - `/tasks` sin sesión lleva al login.
  - Los enlaces lista ↔ perfil funcionan.
- [ ] 5.2 Verificar `npm run build`, `npm run lint` y `npm run format` limpios en `frontend/`

## 6. Integración

- [ ] 6.1 Recorrer con dos cuentas en dos navegadores el flujo completo (crear, ver la tarea del otro tras recargar, cambiar el estado de la tarea ajena) y verificar que ninguna pantalla muestra emails de otros, fechas, marcas de vencida ni vista "mis tareas"
- [ ] 6.2 Ejecutar `npx openspec validate add-task-list --strict` y verificar que el change sigue siendo válido

## Workflow follow-up

- Archivar el change (`/opsx:archive`) una vez revisado y mergeado el PR, y verificar que `openspec/specs/tasks/spec.md` y `openspec/specs/auth/spec.md` reflejan los deltas.
