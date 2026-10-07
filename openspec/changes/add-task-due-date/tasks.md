# Tasks

## 1. Datos y dominio

- [ ] 1.1 Crear la migración que añade `due_date` (`date`, anulable) a `tasks`, con un `down` que la elimina, y verificar que `node ace migration:run` termina limpio sobre la base con tareas existentes, que esas tareas quedan con `due_date` nulo y que `database/schema.ts` regenerado declara `dueDate` en `TaskSchema` (anotar el tipo generado)
- [ ] 1.2 Añadir `isOverdueOn(today)` al modelo `Task` (falso si `!dueDate`, incluido `undefined`; si no, fecha anterior a `today` en ISO y estado distinto de `done`) y crear `app/services/reference_day.ts` (forma y longitud de `x-timezone`, validación y nombre canónico con `Intl.DateTimeFormat`, UTC si falla), y verificar con `npm run typecheck`

## 2. API

- [ ] 2.1 Añadir `dueDate` (`YYYY-MM-DD`, anulable, opcional, sin límite inferior) a los validadores de crear y actualizar, y verificar con `npm run typecheck`
- [ ] 2.2 Ampliar `TaskTransformer` para recibir el día de referencia y exponer `dueDate` (`YYYY-MM-DD` o `null`) e `isOverdue` usando `isOverdueOn`, sin `createdAt`/`updatedAt`, y verificar con `npm run typecheck`
- [ ] 2.3 Añadir `show` al controlador, aceptar `dueDate` en `store` y `update` (clave ausente no toca la fecha, `null` la quita), pasar `referenceDay(request)` al transformer en las cuatro acciones y registrar a mano `GET /api/v1/tasks/:id`; verificar con `node ace list:routes` que hay exactamente `GET /tasks`, `GET /tasks/:id`, `POST /tasks` y `PATCH /tasks/:id`
- [ ] 2.4 Regenerar `.adonisjs/` (dev server o runner de tests), commitear su diff, y verificar con `curl` los escenarios del delta `tasks`:
  - **Lectura individual.** 401 sin token y con un token revocado, 404 con un id inexistente, y 200 sobre una tarea ajena.
  - **Forma.** `dueDate` e `isOverdue` presentes en lista, lectura, creación y actualización, y sin `createdAt`, `updatedAt` ni `email`.
  - **Creación.** Sin fecha da `dueDate: null` e `isOverdue: false`. Con una fecha futura se guarda. Con una fecha pasada da 201 con `isOverdue: true`. Con `isOverdue: true` en el cuerpo se ignora. Con `2027-02-30`, `15/03/2027`, `2027-03` y `2027-03-15T10:00:00Z` da 422 sobre `dueDate` y no se crea nada.
  - **Actualización.**
    - Poner y cambiar la fecha.
    - Quitar la fecha con `null` y con `""`.
    - Un cuerpo sin `dueDate` no la toca.
    - Una fecha pasada da `isOverdue: true`.
    - Una fecha no válida da 422 y la fecha anterior se conserva.
    - Reasignar no toca la fecha ni `isOverdue`.
    - `isOverdue` enviado en el cuerpo se ignora.
    - Una fecha guardada vuelve idéntica, sin desplazarse de día.
  - **Regla**, calculando los días con `X-Timezone`:
    - Ayer da vencida; hoy y mañana no; sin fecha no.
    - `done` con la fecha pasada no está vencida y conserva la fecha.
    - Volver de `done` a `pending` con la fecha pasada la deja vencida.
    - Aplazar a una fecha futura deja de vencerla.
  - **Husos.** Se usa `Etc/GMT+12` en vez del par de la spec (`America/Los_Angeles`) porque su día es el mínimo del planeta: con Kiritimati siempre hay al menos un día de diferencia, sin depender de la hora a la que se verifique. Con `dueDate` = hoy en `Etc/GMT+12`, la misma tarea leída con `X-Timezone: Pacific/Kiritimati` da `isOverdue: true` y con `Etc/GMT+12` da `false`. Esto cubre las dos lecturas simultáneas y el paso de día sin modificar la tarea.
  - **Cabecera.** Sin `X-Timezone`, y con `Marte/Olympus`, `+05:00`, `UTC+3`, `local` o 100 caracteres, la respuesta es 200 normal y el día es el de UTC (comprobado con una tarea de fecha = hoy en UTC, que no sale vencida).
  - **Persistencia.** No existe ninguna columna `is_overdue` en `tasks`.
- [ ] 2.5 Verificar `npm run lint` y `npm run typecheck` limpios en `backend/`

## 3. Cliente de API (frontend)

- [ ] 3.1 Añadir `dueDate` e `isOverdue` al tipo `Task`, la cabecera `X-Timezone` del navegador en `request()`, `getTask` y `updateTaskDueDate`, y la traducción por campo de los errores de `dueDate` («Introduce una fecha completa y válida, o pulsa «Quitar fecha».»), y verificar con `npm run build` y `npm run lint`

## 4. Vista de la tarea (frontend)

- [ ] 4.1 Crear `pages/task-page.tsx` en `/tasks/:id` dentro de `ProtectedRoute`, con enlace a la lista, título, campo de fecha nativo, botón «Quitar fecha» y la señal «Vencida» (icono + texto + color) según `isOverdue` del servidor. Verificar en el navegador que:
  - Una tarea vencida muestra «Vencida».
  - Las de hoy, futuras, sin fecha y hechas con la fecha pasada no la muestran, y la que no tiene fecha no muestra ningún aviso.
  - Un id inexistente muestra «Esa tarea ya no existe.».
  - Con el backend parado aparece el aviso.
  - Sin sesión redirige al login.
- [ ] 4.2 Implementar el guardado automático de la fecha (al elegir una fecha completa o con «Quitar fecha»; vaciar el campo no guarda nada; controles deshabilitados en vuelo; vuelta a la fecha anterior con mensaje bajo el campo o aviso si falla; validación en `onBlur` de fecha incompleta o campo vacío sin enviar nada). Verificar en el navegador que:
  - Poner una fecha futura, una de hoy y una pasada refleja al instante la fecha y el veredicto del servidor sin recargar, y persiste tras recargar.
  - Quitar la fecha con el botón no pide confirmación y quita «Vencida».
  - Una fecha incompleta o el campo vaciado muestran el mensaje al salir del campo, no generan ninguna petición en la pestaña de red y el campo vuelve a la fecha guardada.
  - Un 401 (token revocado desde otra pestaña) muestra «Tu sesión ha caducado…» y no cambia la fecha.
  - Con el backend parado se restaura la fecha anterior con aviso.
  - Todo es operable solo con teclado.
  - En las peticiones viaja la cabecera `X-Timezone`.
- [ ] 4.3 Convertir el título de cada fila de la lista en un enlace a `/tasks/:id` sin añadir ningún otro dato. Verificar en el navegador que:
  - El título abre la vista.
  - La lista sigue sin mostrar fechas ni marcas de vencida aunque haya tareas vencidas.
  - El formulario de creación sigue teniendo solo el campo título.
- [ ] 4.4 Verificar `npm run build`, `npm run lint` y `npm run format` limpios en `frontend/`

## 5. Integración

- [ ] 5.1 Recorrer el flujo completo en el navegador con dos cuentas:
  - Crear una tarea.
  - Abrirla y ponerle una fecha pasada: aparece «Vencida».
  - Marcarla como Hecho en la lista y reabrirla: no está vencida y conserva la fecha.
  - Volver a Pendiente: vencida de nuevo.
  - Aplazarla: deja de estar vencida.
  - Quitarle la fecha.

  Verificar además que la otra cuenta ve lo mismo y puede cambiar la fecha.
- [ ] 5.2 Ejecutar `npx openspec validate add-task-due-date --strict` y verificar que el change sigue siendo válido

## Workflow follow-up

- Archivar el change (`/opsx:archive`) una vez revisado y mergeado, y verificar que `openspec/specs/tasks/spec.md` y `openspec/specs/auth/spec.md` reflejan los deltas.
