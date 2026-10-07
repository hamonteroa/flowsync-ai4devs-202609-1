# Proposal

## Why

Hoy una tarea no puede comprometerse con una fecha, y nadie descubre que algo se ha pasado de plazo hasta que es tarde. FS-118 (RF-13, RF-14, RF-15) pide poder poner, cambiar o quitar una fecha de vencimiento al abrir una tarea, y ver de forma explícita, sin cálculo mental, si está vencida. Ese «hoy» tiene que ser el de quien mira.

## What Changes

- **Fecha de vencimiento**:
  - Es opcional y de calendario, sin hora (`YYYY-MM-DD`).
  - Una tarea nace sin fecha.
  - La fecha se puede poner, cambiar y quitar. Para quitarla se envía explícitamente vacía (`null` o `""`).
  - Se acepta una fecha anterior a hoy, tanto al crear como al actualizar: esa tarea nace ya vencida.
  - Una fecha inexistente o mal formada se rechaza con 422 sobre el campo `dueDate` y la tarea conserva la que tenía.
- **Vencimiento (`isOverdue`)**:
  - Es un booleano que la API incluye en toda representación de una tarea.
  - Es `true` solo si se cumplen las tres condiciones: hay fecha, la fecha es anterior al día de referencia y el estado no es `done`.
  - Lo decide el backend en cada lectura. No se guarda en ninguna columna, no hay procesos programados y, si el cliente lo envía, se ignora.
- **Día de referencia por huso**:
  - El cliente indica su zona con la cabecera `X-Timezone` (nombre IANA, p. ej. `Europe/Madrid`) y el servidor calcula «hoy» en esa zona.
  - Si la cabecera falta o no es válida, se usa UTC sin error.
  - La web la envía en todas sus peticiones.
- **API**:
  - **BREAKING (aditivo)**: la representación de una tarea gana `dueDate` (`YYYY-MM-DD` o `null`) e `isOverdue`.
  - `POST /api/v1/tasks` acepta un `dueDate` opcional.
  - `PATCH /api/v1/tasks/:id` acepta `dueDate`.
  - Nueva lectura individual `GET /api/v1/tasks/:id`.
  - Sigue sin haber borrado ni endpoints de equipo.
- **Web**:
  - El título de cada fila de la lista enlaza a una vista mínima de la tarea en `/tasks/:id`. Esa vista muestra el título, un campo de fecha que se guarda solo, un botón «Quitar fecha» sin confirmación y, si procede, la señal «Vencida» con texto e icono, no solo con color.
  - La lista **no cambia lo que muestra**: título, responsable y estado, sin fecha ni marca de vencida.
  - El formulario de creación sigue pidiendo solo el título.
- Sin tests de ningún tipo, sin dependencias nuevas y sin componentes de UI nuevos (la fecha usa el `Input` existente con el selector nativo del navegador).

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `tasks`:
  - La forma pública de la tarea gana `dueDate` e `isOverdue`.
  - Crear y actualizar admiten la fecha.
  - Se añaden la lectura individual, la regla de vencimiento, el día de referencia por huso y la vista mínima de la tarea en la web.
  - Las filas de la lista enlazan a esa vista.
- `auth`: la protección de pantallas y las direcciones conocidas incluyen la vista de una tarea.

## Decisiones tomadas con el equipo

- **Dónde se abre una tarea:** en una vista mínima `/tasks/:id`, solo con el título, la fecha y la señal de vencida. La pantalla de detalle completa (PA-6 del PRD) sigue fuera de alcance.
- **Día de referencia:** lo marca la cabecera `X-Timezone` con un huso IANA. Si falta o no es válida, se usa UTC.

## Puntos abiertos

- **Lectura individual (PA-6).** Se añade solo porque «abrir la tarea» la necesita. Qué más mostrará el detalle completo, y si esta vista mínima evoluciona hacia él o se sustituye, queda por decidir.
- **Volver de «Hecho» con la fecha pasada (PA-7).** Las transiciones ya son libres, así que la regla hace que esa tarea vuelva a estar vencida. Es consecuencia directa de la regla, no una decisión nueva. Se deja anotado por si PA-7 restringe las transiciones.
- **Cambios simultáneos de la fecha (PA-8).** Gana la última escritura. Quien pierde no lo ve hasta volver a abrir la tarea.

## Fuera de alcance

Notificaciones, recordatorios, recurrencia, ordenar o filtrar por fecha, la pantalla de detalle completa, la edición de otros campos en la vista de la tarea y tests de cualquier tipo (FS-118.5 y las pruebas de FS-118.2/118.3 quedan fuera por decisión del change).

## Impact

- `backend/`:
  - Migración que añade `due_date` (fecha, anulable) a `tasks` y regeneración de `database/schema.ts`.
  - La regla de vencimiento en el modelo.
  - Resolución del día de referencia a partir de `X-Timezone`.
  - Validadores, transformer, controlador (nuevo `show`) y una ruta nueva.
  - Regeneración de `.adonisjs/`.
- `frontend/`:
  - Tipos.
  - `lib/api.ts`: cabecera `X-Timezone`, `getTask` y `updateTaskDueDate`, y traducción de los errores de fecha.
  - Página nueva de la tarea y su ruta protegida.
  - Enlace desde el título de cada fila.
- La base de desarrollo es el mismo fichero que usan las pruebas: migrar toca también el estado local (las tareas existentes quedan sin fecha).
