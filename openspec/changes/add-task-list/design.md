# Design

## Context

Ver proposal.md (Why) y los deltas de `specs/tasks` y `specs/auth`. Hoy el backend solo tiene usuarios y tokens de acceso. Sus convenciones son:

- Esquema generado desde migraciones en `database/schema.ts`; los modelos extienden la clase generada.
- Controladores registrados en `#generated/controllers`.
- Respuestas vía `serialize()` + transformers.
- VineJS 4 con `vine.create`.

El frontend concentra las llamadas en `lib/api.ts`, que traduce los errores a `ApiError` en castellano. Protege las pantallas con `ProtectedRoute` / `PublicOnlyRoute` y solo dispone de los componentes `alert`, `button`, `card`, `input` y `label` en `components/ui/`.

## Goals / Non-Goals

**Goals:**
- Tres endpoints sobre una tabla nueva, siguiendo al pie de la letra las convenciones existentes (schema generado, transformer, `serialize`, subpath imports).
- Una pantalla nueva construida solo con los componentes ya presentes y el patrón de páginas de login.

**Non-Goals:**
- Tests ni infraestructura de tests (decisión explícita del change).
- Dependencias nuevas, componentes shadcn nuevos (p. ej. `select`) o design system.
- Fecha de vencimiento, ni siquiera como columna anulable "para más adelante".
- Ordenación: ni `orderBy` en la consulta ni `sort` en el cliente.
- Refresco en tiempo real, lectura individual, borrado, endpoints de usuarios/equipo.

## Decisions

### Datos
- Migración `create_tasks_table` con estas columnas:
  - `id` incremental.
  - `title` `string(120)` not null.
  - `status` `string` not null, default `'pending'`.
  - `assignee_id` integer not null, FK a `users.id` con `onDelete('CASCADE')`, igual que los tokens. Hoy no se borran usuarios.
  - `created_at` / `updated_at`.
- No hay `creator_id`: ninguna historia lo usa y el responsable inicial ya es el creador.
- No hay enum ni CHECK en la base de datos. El conjunto cerrado se garantiza en el validador, que es la única vía de escritura. *Alternativa descartada:* un `CHECK` en SQLite obliga a recrear la tabla para cualquier cambio futuro de estados y no aporta nada observable.
- Modelo `Task extends TaskSchema` con `@belongsTo(() => User, { foreignKey: 'assigneeId' }) declare assignee`. Se exporta un `TASK_STATUSES = ['pending', 'in_progress', 'done'] as const` (en el modelo o en el validador) para no repetir la lista.

### API
- Rutas en un nuevo grupo `tasks` dentro de `/api/v1`, con `.use(middleware.auth())`:
  - `GET /tasks` → `index`
  - `POST /tasks` → `store`
  - `PATCH /tasks/:id` → `update`

  Se declaran a mano, sin `router.resource`, para que no aparezcan `show` ni `destroy` (restricción 2).
- `index`: `Task.query().preload('assignee')` **sin** `orderBy` (punto abierto PA-3).
- `store`:
  - Valida solo `title` con `vine.string().trim().minLength(1).maxLength(120)`.
  - Crea con `status: 'pending'` y `assigneeId: auth.user.id`.
  - Hace `load('assignee')` y responde `response.status(201)`.
  - El validador solo declara `title`, así que cualquier otro campo del cuerpo se descarta.
  - El `trim()` va antes de las reglas de longitud: «   » queda en cadena vacía y falla `minLength`, y el límite de 120 se mide sobre el texto que realmente se guarda.
  - El bodyparser ya convierte `""` en `null`, que falla `required`.
- `update`:
  - Valida `status: vine.enum(TASK_STATUSES).optional()` y `assigneeId: vine.number().exists({ table: 'users', column: 'id' }).optional()`. `title` no se declara, así que se ignora.
  - Aplica `Task.findOrFail(params.id)`, lo que da 404 si el id no existe o no es numérico.
  - Asigna solo los campos presentes, `save()`, `load('assignee')` y devuelve 200.
  - Un cuerpo vacío no cambia nada y devuelve la tarea tal cual. *Alternativa descartada:* 422 «nada que actualizar», que añade una regla sin valor para la web.
- `TaskTransformer` hace `pick(['id', 'title', 'status'])` y añade `assignee: { id, fullName }` construido a mano desde la relación. No reutiliza `UserTransformer`, que expone email y fechas (nota de E3-1: no filtrar datos de cuenta). Se comprueba en `@adonisjs/http-transformers/build/src/base_transformer.d.ts` cómo componer el objeto con `whenLoaded`.
- Sin fechas en la respuesta: la lista no las muestra y así no se deja nada preparado para vencimientos.

### Frontend
- `lib/types.ts`:
  - `TaskStatus = 'pending' | 'in_progress' | 'done'`.
  - `Task = { id, title, status, assignee: { id, fullName } }`.
  - Un mapa `STATUS_LABELS` con Pendiente / En curso / Hecho, que es lo único que se pinta.
- `lib/api.ts`:
  - Funciones nuevas `listTasks(token)`, `createTask(token, title)` y `updateTaskStatus(token, id, status)`. Se añade `'PATCH'` a `RequestOptions.method`.
  - Se amplía la traducción de errores:
    - `FIELD_LABELS.title = 'el título'`.
    - Regla `enum` → «Ese estado no existe.».
    - `database.exists` → «Esa persona no existe.».
    - 404 → «Esa tarea ya no existe.».
  - El mapeo genérico de 400 a «credenciales incorrectas» no afecta: ninguna ruta de tareas devuelve 400.
- `pages/tasks-page.tsx`:
  - Va dentro de un `Card` con el mismo marco que el perfil (fondo `bg-muted/40`, centrado, más ancho).
  - Cabecera con «Tareas del equipo» y un enlace «Perfil».
  - Formulario: un `Input` + `Button` «Crear tarea» / «Creando…».
  - Validación local antes de enviar:
    - Título vacío o en blanco → «Escribe un título para la tarea.».
    - Más de 120 caracteres → «El título no puede superar los 120 caracteres.».
    - Sin atributo `maxLength` en el input: el navegador cortaría en silencio lo pegado, justo lo que E2-2 CA-3 prohíbe.
  - Los errores de servidor se reparten con `useAuthForm(['title'])`, que sirve tal cual aunque el nombre diga «auth».
  - La tarea creada se **añade al final** del array local, sin reordenar.
- Filas:
  - Una `ul` con título, responsable (`fullName?.trim() || 'Sin nombre'`) y tres `Button size="sm"` (Pendiente / En curso / Hecho).
  - El actual va con `variant="default"` y `aria-pressed`, los otros con `variant="outline"`.
  - Un clic es el gesto completo.
  - *Alternativa descartada:* `<select>` nativo, que cuesta dos interacciones y no existe como componente en `ui/`.
  - El cambio es optimista: se actualiza el estado local, se llama a la API y, si falla, se restaura el estado previo de esa fila y se muestra un `Alert` sobre la lista.
- Carga: `FullScreenLoader`-like local (texto «Cargando tareas…») mientras llega la primera respuesta. Si falla, `Alert` con el mensaje de `ApiError`.
- Estado vacío: un párrafo en lugar de la `ul`, con el texto «Aquí aparecerán las tareas de todo el equipo, con quién lleva cada una y en qué estado está. Escribe arriba el título de la primera.».
- Rutas:
  - `/tasks` dentro de `ProtectedRoute`.
  - `PublicOnlyRoute` y la ruta comodín redirigen a `/tasks` en vez de `/profile`.
  - `ProfilePage` gana un enlace «Ver tareas» en el `CardFooter`.
- El token para las llamadas se obtiene de `useAuth().token`. Un 401 en estas llamadas solo muestra el aviso; no se fuerza el logout. Es el mismo comportamiento que hoy fuera de la rehidratación.

## Risks / Trade-offs

- [Orden no determinista en SQLite sin `ORDER BY`] → En la práctica sale por `id`, pero no está garantizado. Queda documentado como punto abierto PA-3 y no se oculta con un orden implícito en el cliente.
- [Actualización optimista con dos personas cambiando la misma tarea] → Gana la última escritura y la otra persona no lo ve hasta recargar (E3-2 fuera de alcance).
- [`assigneeId` aceptado por la API sin UI] → Superficie que solo se puede probar con HTTP directo. Está cubierta por la spec y se verifica con `curl` en tasks.md.
- [Sin tests] → La verificación de cada tarea es manual (curl, navegador, `typecheck`, `lint`, `build`). Las regresiones futuras no tienen red.
- [Reutilizar `useAuthForm` fuera de auth] → Acoplamiento de nombre, no de lógica. Renombrarlo queda fuera de este change.

## Migration Plan

`node ace migration:run` crea la tabla y regenera `database/schema.ts`. Es un cambio aditivo y no hay datos que migrar. Rollback: `node ace migration:rollback` y revertir el commit.
