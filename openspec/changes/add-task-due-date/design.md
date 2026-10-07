# Design

## Context

Ver proposal.md (Why) y los deltas de `specs/tasks` y `specs/auth`. Punto de partida, tal y como lo dejó `add-task-list`:

**Backend**
- La tabla `tasks` tiene `id`, `title`, `status`, `assignee_id` y timestamps.
- `TaskTransformer` hace `pick` de `id`, `title` y `status` más `assignee { id, fullName }`.
- `TasksController` tiene `index`, `store` y `update`.
- Las rutas están declaradas a mano en `start/routes.ts`.
- Los validadores viven en `app/validators/task.ts`.

**Frontend**
- `lib/api.ts` es el único punto de contacto con la API.
- `pages/tasks-page.tsx` es la lista.
- `routes/app-routes.tsx` monta `/tasks` y `/profile` bajo `ProtectedRoute`.

**Entorno**
- `config/cors.ts` refleja las cabeceras pedidas (`headers: true`), así que una cabecera nueva no necesita configuración.
- El backend corre con la zona horaria del proceso. Luxon está disponible a través de Lucid.

## Goals / Non-Goals

**Goals:**
- Una sola implementación de la regla de vencimiento, en el modelo, evaluada en cada respuesta con el día de referencia de la petición.
- Fecha de calendario sin hora de punta a punta: `YYYY-MM-DD` en la API y una columna `date` en la base.
- Vista mínima de la tarea construida solo con componentes existentes y el selector de fecha nativo.

**Non-Goals:**
- Tests y base de pruebas.
- Persistir `isOverdue`, jobs o crons.
- Mostrar la fecha o el vencimiento en la lista, ordenar o filtrar por fecha.
- Editar título, estado o responsable en la vista de la tarea.
- Un componente de calendario o una dependencia de fechas en el frontend.

## Decisions

### Datos
- Nueva migración `alter_tasks_add_due_date`:
  - `up`: `table.date('due_date').nullable()`.
  - `down`: `dropColumn('due_date')`.
  - Las tareas existentes quedan con `NULL`, es decir, sin fecha y nunca vencidas.
- No se toca `database/schema.ts` a mano: se regenera con `migration:run`. Se espera `@column.date() declare dueDate: DateTime | null`; se comprueba en el fichero generado antes de seguir.
- No hay columna `is_overdue` (restricción 3).

### Regla en el dominio
- `Task#isOverdueOn(today: string): boolean` en `app/models/task.ts` devuelve `dueDate !== null && status !== 'done' && dueDate.toISODate()! < today`.
  - Compara cadenas ISO `YYYY-MM-DD`, que ordenan igual que las fechas y evitan cualquier aritmética de horas.
  - Es el único sitio donde vive la regla.
- *Alternativa descartada:* calcularlo en SQL o en el transformer. Duplicaría la regla o la escondería en la capa de presentación.

### Día de referencia
- `referenceDay(request)` en `app/services/reference_day.ts`, importado como `#services/reference_day` (el subpath ya está declarado en `package.json`):
  - Lee la cabecera `x-timezone`.
  - Hace `DateTime.now().setZone(tz)` y, si el resultado no `isValid` (huso desconocido o cabecera ausente), usa `DateTime.utc()`.
  - Devuelve `toISODate()`.
- Se calcula una vez por petición en cada acción del controlador y se pasa al transformer.
- *Alternativa descartada:* que el cliente envíe su fecha (`X-Client-Date`). Es más fácil de falsear sin querer con un reloj mal puesto y no aporta nada a CA-19/CA-20.
- *Alternativa descartada:* un middleware que lo guarde en el contexto. Es más maquinaria para tres llamadas.

### API
- `TaskTransformer`:
  - Recibe el día por constructor: `constructor(resource: Task, protected today: string)`. `transform()` admite argumentos extra (`...rest` en `base_transformer.d.ts`) y se llama como `TaskTransformer.transform(tasks, today)`.
  - Añade `dueDate: this.resource.dueDate?.toISODate() ?? null` e `isOverdue: this.resource.isOverdueOn(this.today)`.
  - Sigue sin exponer `createdAt` ni `updatedAt`.
- Validación de `dueDate`:
  - `vine.date({ formats: ['YYYY-MM-DD'] }).nullable().optional()` en ambos validadores. VineJS parsea en modo estricto y rechaza `2027-02-30`, `15/03/2027`, `2027-03` y valores con hora.
  - Antes de dar por buena la regla, en la implementación se comprueban esos cuatro ejemplos. Si alguno pasara, se sustituye por `vine.string().regex(/^\d{4}-\d{2}-\d{2}$/)` más una regla propia que valide con `DateTime.fromISO(v, { zone: 'utc' }).isValid`.
  - El `Date` resultante se convierte con `DateTime.fromJSDate(value)` (misma zona del proceso en ambos pasos, así que el día no se desplaza).
  - `""` llega como `null` (bodyparser `convertEmptyStringsToNull`), así que quitar la fecha acepta `null` y `""`.
  - `optional()` distingue la clave ausente (`undefined`, no se toca la fecha) de la explícitamente vacía (`null`, se quita).
- Fechas pasadas: no hay regla `afterOrEqual`. Una fecha pasada es válida (restricción 4).
- `isOverdue` no se declara en ningún validador, así que se descarta si llega en el cuerpo.
- Controlador:
  - `store` acepta `dueDate`.
  - `update` asigna `dueDate` solo si `!== undefined`.
  - Nuevo `show` con `Task.findOrFail(params.id)` + `load('assignee')`.
  - Todas las acciones responden con `TaskTransformer.transform(..., referenceDay(request))`.
- Ruta nueva: `router.get(':id', [controllers.Tasks, 'show'])` en el grupo `tasks`, declarada a mano como las otras. Sigue sin haber `destroy`.
- Lectura individual (restricción 5): se añade solo porque «abrir la tarea» la necesita. Queda abierto (PA-6) qué devolverá la pantalla de detalle completa, y si esta vista se amplía o se sustituye.

### Frontend
- `lib/types.ts`: `Task` gana `dueDate: string | null` e `isOverdue: boolean`.
- `lib/api.ts`:
  - `request()` añade a todas las peticiones `X-Timezone: Intl.DateTimeFormat().resolvedOptions().timeZone`. Es inocuo en las de auth y evita olvidarlo en llamadas futuras.
  - Funciones nuevas `getTask(token, id)` y `updateTaskDueDate(token, id, dueDate: string | null)`.
  - `FIELD_LABELS.dueDate = 'la fecha'`. Cualquier error sobre `dueDate` se traduce a «Introduce una fecha completa y válida.».
- `pages/task-page.tsx` en `/tasks/:id`, dentro de `ProtectedRoute`, con el mismo marco que la lista:
  - Enlace «Volver a la lista» y título (`wrap-anywhere`).
  - `Label` «Fecha de vencimiento» + `Input type="date"` + `Button variant="outline"` «Quitar fecha» (deshabilitado si no hay fecha).
  - Si `task.isOverdue`, se muestra un `<p role="status">` con `AlertCircleIcon` + texto «Vencida» en `text-destructive`. Es texto, icono y color.
  - Nunca se calcula el vencimiento en el cliente: tras cada guardado se pinta la tarea que devuelve el servidor.
- Interacción con el campo de fecha. El campo es controlado (`draft`). El valor guardado es `task.dueDate`.
  - Si `onChange` da una fecha completa, se guarda.
  - Si `onChange` da `''` sin `validity.badInput` (la persona vació el campo), se guarda `null`, igual que «Quitar fecha».
  - En `onBlur`, si `validity.badInput` (fecha incompleta o inexistente), se muestra «Introduce una fecha completa y válida.» bajo el campo, no se envía nada y se vuelve a montar el input (`key`) con la fecha guardada.
  - Mientras hay guardado en vuelo, el input y el botón quedan `disabled`.
  - Si el guardado falla:
    - Se restaura `draft` a `task.dueDate`.
    - Un 422 se muestra bajo el campo (`fieldErrors.dueDate`).
    - Cualquier otro fallo se muestra en un `Alert`.
  - No hay botón de guardar ni confirmación (CA-15, CA-16).
- Carga: texto «Cargando tarea…» mientras llega. Si falla, `Alert` con el mensaje (un 404 da «Esa tarea ya no existe.», que ya existe en `toApiError`) y el enlace a la lista.
- Lista: el `<p>` del título pasa a ser un `Link` a `/tasks/:id` con el mismo aspecto (subrayado al pasar el ratón). No se añade ningún dato.
- Rutas: `/tasks/:id` junto a `/tasks` dentro de `ProtectedRoute`. La ruta comodín no cambia.

## Risks / Trade-offs

- [Lucid lee la columna `date` en la zona del proceso] → La lectura (`DateTime` local) y la escritura (`toISODate()` en la misma zona) son coherentes mientras el proceso no cambie de zona entre ambas. Se verifica con `curl` que una fecha guardada vuelve idéntica.
- [`input type="date"` difiere entre navegadores y no informa bien de las fechas a medias] → Se usa `validity.badInput` en `onBlur`. Navegadores sin selector nativo muestran un campo de texto: el servidor rechaza el formato con 422 y la vista restaura la fecha.
- [Un año de 5 o 6 cifras que el selector admite] → El servidor lo rechaza (formato `YYYY-MM-DD` estricto) y la vista restaura la fecha.
- [Huso del navegador mal configurado] → La persona ve el vencimiento según su reloj. Es exactamente lo que pide CA-19.
- [Cabecera ausente en clientes como curl] → UTC sin error. Las lecturas pueden diferir en un día de las de la web cerca de medianoche, y es lo esperado.
- [Base compartida dev/test] → Migrar añade la columna en la base del servidor de desarrollo. Las tareas existentes quedan sin fecha.
- [Sin tests para la regla, el ticket de más riesgo según FS-118.2] → La verificación de los bordes (ayer, hoy, mañana, sin fecha, hecha, vuelta desde hecha y dos husos) se hace con `curl` en tasks.md. Queda sin red de regresión.

## Migration Plan

`node ace migration:run` añade la columna y regenera el esquema. Rollback: `node ace migration:rollback` (elimina `due_date`) y revertir el commit. Los clientes antiguos siguen funcionando, porque los campos nuevos de la respuesta son aditivos.

## Open Questions

- PA-6: alcance de la pantalla de detalle completa y relación con esta vista mínima.
- PA-7 y PA-8: ver proposal.md (Puntos abiertos). No cambian este diseño.
