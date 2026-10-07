# Spec Delta

## MODIFIED Requirements

### Requirement: Acceso autenticado a las tareas
La API SHALL exigir un token de acceso válido en todas las operaciones de tareas y SHALL rechazar con 401 cualquier petición sin token o con un token no válido, sin revelar ninguna tarea.

#### Scenario: Listar sin sesión
- **WHEN** se envía `GET /api/v1/tasks` sin cabecera `Authorization`
- **THEN** la respuesta es 401 y no contiene ninguna tarea

#### Scenario: Crear o actualizar sin sesión
- **WHEN** se envía `POST /api/v1/tasks` o `PATCH /api/v1/tasks/:id` sin token o con un token revocado
- **THEN** la respuesta es 401 y no se crea ni se modifica ninguna tarea

#### Scenario: Leer una tarea sin sesión
- **WHEN** se envía `GET /api/v1/tasks/:id` sin token o con un token revocado
- **THEN** la respuesta es 401 y no contiene la tarea

### Requirement: Forma pública de una tarea
La API SHALL representar cada tarea con su `id`, su `title`, su `status`, su `dueDate` (fecha de calendario `YYYY-MM-DD` o `null`), su `isOverdue` (booleano) y su responsable como `assignee: { id, fullName }`, y SHALL NOT exponer el email ni ningún otro dato de cuenta del responsable, ni ninguna otra fecha de la tarea.

#### Scenario: Tarea de un responsable con nombre
- **WHEN** una tarea sin fecha pertenece a una persona con nombre completo "Ada Lovelace"
- **THEN** la tarea viaja como `{ id, title, status, dueDate: null, isOverdue: false, assignee: { id, fullName: "Ada Lovelace" } }`, sin `email` del responsable

#### Scenario: Tarea de un responsable sin nombre
- **WHEN** el responsable de una tarea no tiene nombre completo
- **THEN** `assignee.fullName` vale `null` y su email sigue sin aparecer

#### Scenario: Tarea con fecha
- **WHEN** una tarea tiene fecha de vencimiento el 15 de marzo de 2027
- **THEN** `dueDate` vale `"2027-03-15"`, sin hora ni zona

#### Scenario: Sin fechas internas
- **WHEN** se lee cualquier tarea
- **THEN** la representación no incluye fechas de creación ni de modificación

### Requirement: Crear una tarea con solo el título
La API SHALL crear una tarea a partir de un título y, opcionalmente, una fecha de vencimiento, asignándole siempre el estado `pending` y como responsable a la persona autenticada que la crea, e ignorando cualquier otro dato que venga en la petición.

#### Scenario: Creación correcta
- **WHEN** se envía `POST /api/v1/tasks` con `{ "title": "Preparar la demo" }` y un token válido
- **THEN** la respuesta es 201 con `{ data: task }`, donde `task.title` es "Preparar la demo", `task.status` es `pending`, `task.dueDate` es `null`, `task.isOverdue` es `false` y `task.assignee` es quien la ha creado

#### Scenario: Datos extra ignorados
- **WHEN** la petición de creación incluye además `status: "done"`, un `assigneeId` de otra persona o `isOverdue: true`
- **THEN** la tarea se crea igualmente en `pending`, a nombre de quien la crea y con `isOverdue` calculado por el servidor

#### Scenario: Espacios en los extremos del título
- **WHEN** se crea una tarea con título "  Preparar la demo  "
- **THEN** la tarea se guarda con el título "Preparar la demo"

#### Scenario: Crear con fecha
- **WHEN** se crea una tarea con `{ "title": "Entregar informe", "dueDate": "2027-03-15" }`
- **THEN** la respuesta es 201 y `task.dueDate` es `"2027-03-15"`

#### Scenario: Crear con una fecha ya pasada
- **WHEN** se crea una tarea con una `dueDate` anterior al día de referencia
- **THEN** la respuesta es 201, la tarea se guarda con esa fecha e `isOverdue` es `true`

#### Scenario: Crear con una fecha no válida
- **WHEN** se crea una tarea con `dueDate` "2027-02-30", "15/03/2027", "2027-03" o "2027-03-15T10:00:00Z"
- **THEN** la respuesta es 422 con un error sobre el campo `dueDate` y no se crea ninguna tarea

### Requirement: Actualizar estado y responsable de cualquier tarea
La API SHALL permitir a cualquier persona autenticada cambiar el estado, el responsable y/o la fecha de vencimiento de cualquier tarea, sea suya o no, y SHALL responder con la tarea ya actualizada. Los campos que no sean estado, responsable ni fecha de vencimiento SHALL ignorarse.

#### Scenario: Cambiar el estado de una tarea propia
- **WHEN** se envía `PATCH /api/v1/tasks/:id` con `{ "status": "in_progress" }` sobre una tarea propia
- **THEN** la respuesta es 200 con `{ data: task }` y `task.status` es `in_progress`

#### Scenario: Cambiar el estado de una tarea ajena
- **WHEN** una persona cambia el estado de una tarea cuyo responsable es otra
- **THEN** el cambio se aplica igual que en una tarea propia, sin error ni advertencia

#### Scenario: Reasignar
- **WHEN** se envía la actualización con `{ "assigneeId": <id de otra persona registrada> }`
- **THEN** la respuesta es 200 y `task.assignee` es esa persona

#### Scenario: Título en la actualización
- **WHEN** la actualización incluye un `title`
- **THEN** el título de la tarea no cambia

#### Scenario: Actualización sin cambios
- **WHEN** se envía la actualización con un cuerpo sin `status`, `assigneeId` ni `dueDate`
- **THEN** la respuesta es 200 con la tarea tal como estaba

#### Scenario: Tarea inexistente
- **WHEN** se envía la actualización sobre un id que no corresponde a ninguna tarea
- **THEN** la respuesta es 404

#### Scenario: Responsable inexistente
- **WHEN** se envía la actualización con un `assigneeId` que no corresponde a ninguna persona registrada
- **THEN** la respuesta es 422 con un error sobre el campo `assigneeId` y la tarea no cambia

#### Scenario: Poner o cambiar la fecha
- **WHEN** se envía la actualización con `{ "dueDate": "2027-03-15" }` sobre una tarea, tenga fecha o no
- **THEN** la respuesta es 200 y `task.dueDate` es `"2027-03-15"`

#### Scenario: Quitar la fecha
- **WHEN** se envía la actualización con `{ "dueDate": null }` o `{ "dueDate": "" }` sobre una tarea con fecha
- **THEN** la respuesta es 200, `task.dueDate` es `null` e `isOverdue` es `false`

#### Scenario: Fecha ausente no la toca
- **WHEN** se envía la actualización sin la clave `dueDate`
- **THEN** la fecha de la tarea no cambia

#### Scenario: Poner una fecha ya pasada
- **WHEN** se envía la actualización con una `dueDate` anterior al día de referencia sobre una tarea no hecha
- **THEN** la respuesta es 200, la fecha se guarda e `isOverdue` es `true`

#### Scenario: Fecha no válida en la actualización
- **WHEN** se envía la actualización con una `dueDate` inexistente o mal formada
- **THEN** la respuesta es 422 con un error sobre el campo `dueDate` y la tarea conserva la fecha que tenía

#### Scenario: Fecha de una tarea ajena
- **WHEN** una persona pone o quita la fecha de una tarea cuyo responsable es otra
- **THEN** el cambio se aplica igual que en una tarea propia, sin error ni advertencia

#### Scenario: Reasignar no toca la fecha
- **WHEN** se reasigna una tarea con fecha
- **THEN** su `dueDate` y su `isOverdue` no cambian

#### Scenario: isOverdue enviado por el cliente
- **WHEN** la actualización incluye `isOverdue`
- **THEN** se ignora y la respuesta trae el valor calculado por el servidor

### Requirement: Pantalla de la lista de tareas
La aplicación web SHALL ofrecer, solo a personas con sesión iniciada, una pantalla con la lista compartida en la que cada fila muestra el título, el nombre del responsable y el estado, sin necesidad de abrir ninguna tarea, y en la que el título de cada fila permite abrir esa tarea.

#### Scenario: Ver la lista
- **WHEN** una persona con sesión abre la lista y hay tareas
- **THEN** ve todas las tareas del equipo, y en cada fila el título, el nombre del responsable y el estado como "Pendiente", "En curso" o "Hecho"

#### Scenario: Responsable sin nombre
- **WHEN** el responsable de una tarea no tiene nombre completo, o solo tiene espacios
- **THEN** la fila muestra "Sin nombre", nunca su email ni su identificador

#### Scenario: Sin fechas ni presencia
- **WHEN** una persona recorre la lista, aunque haya tareas con fecha y algunas vencidas
- **THEN** no ve fechas, marcas de vencida ni ninguna señal de quién está conectado

#### Scenario: Una sola lista
- **WHEN** una persona busca otras vistas de tareas en la aplicación
- **THEN** no existe ninguna vista «mis tareas» ni otra lista aparte de la del equipo

#### Scenario: Orden de las filas
- **WHEN** se carga la lista
- **THEN** las filas aparecen en el orden en que llegan del servidor, sin que la pantalla las reordene

#### Scenario: Lista sin sesión
- **WHEN** una persona sin sesión intenta abrir la lista
- **THEN** es redirigida a la pantalla de inicio de sesión sin ver ninguna tarea

#### Scenario: Fallo al cargar la lista
- **WHEN** el servidor no responde o falla al pedir la lista
- **THEN** la persona ve un aviso con el motivo en lugar de una lista vacía

#### Scenario: Abrir una tarea desde la lista
- **WHEN** la persona pulsa el título de una fila
- **THEN** ve la vista de esa tarea

## ADDED Requirements

### Requirement: Leer una tarea
La API SHALL devolver una única tarea por su id a cualquier persona autenticada, con la misma representación que en la lista.

#### Scenario: Lectura correcta
- **WHEN** se envía `GET /api/v1/tasks/:id` con un token válido sobre una tarea existente, sea de quien sea
- **THEN** la respuesta es 200 con `{ data: task }`

#### Scenario: Tarea inexistente al leer
- **WHEN** se envía `GET /api/v1/tasks/:id` con un id que no corresponde a ninguna tarea
- **THEN** la respuesta es 404

#### Scenario: Leer no modifica
- **WHEN** se lee una tarea cualquier número de veces
- **THEN** ni su título, ni su estado, ni su responsable, ni su fecha cambian

### Requirement: Regla de vencimiento
La API SHALL marcar una tarea con `isOverdue: true` si y solo si tiene fecha de vencimiento, esa fecha es anterior al día de referencia de la petición y su estado no es `done`, y SHALL calcularlo en cada respuesta, sin guardarlo ni aceptarlo del cliente.

#### Scenario: Fecha de ayer
- **WHEN** una tarea `pending` o `in_progress` tiene como fecha el día anterior al de referencia
- **THEN** `isOverdue` es `true`

#### Scenario: Fecha de hoy
- **WHEN** una tarea no hecha tiene como fecha el propio día de referencia
- **THEN** `isOverdue` es `false`

#### Scenario: Fecha futura
- **WHEN** una tarea no hecha tiene una fecha posterior al día de referencia
- **THEN** `isOverdue` es `false`

#### Scenario: Sin fecha
- **WHEN** una tarea sin fecha lleva semanas en `pending`
- **THEN** `isOverdue` es `false`

#### Scenario: Hecha con la fecha pasada
- **WHEN** una tarea en `done` tiene una fecha anterior al día de referencia
- **THEN** `isOverdue` es `false`

#### Scenario: Darla por hecha
- **WHEN** una tarea vencida se actualiza a `done`
- **THEN** la respuesta trae `isOverdue: false` y la misma `dueDate` que tenía

#### Scenario: Volver atrás desde hecho con la fecha pasada
- **WHEN** una tarea en `done` con fecha anterior al día de referencia se actualiza a `pending`
- **THEN** la respuesta trae `isOverdue: true`

#### Scenario: Aplazar la fecha
- **WHEN** una tarea vencida se actualiza con una fecha posterior al día de referencia
- **THEN** la respuesta trae `isOverdue: false`

#### Scenario: Vence sola al cambiar el día
- **WHEN** una tarea no hecha con fecha D se lee con día de referencia D y, sin que nadie la modifique, se vuelve a leer con día de referencia D+1
- **THEN** la primera lectura trae `isOverdue: false` y la segunda `isOverdue: true`

### Requirement: Día de referencia según el huso de quien mira
La API SHALL tomar como día de referencia la fecha actual en el huso horario IANA indicado en la cabecera `X-Timezone` de cada petición de tareas y, si la cabecera falta o no es un huso válido, la fecha actual en UTC, sin rechazar la petición.

#### Scenario: Dos husos, dos lecturas
- **WHEN** una tarea no hecha tiene fecha D y, en un instante en que en `Pacific/Kiritimati` ya es D+1 y en `America/Los_Angeles` todavía es D, se lee con cada una de esas cabeceras
- **THEN** la lectura con `Pacific/Kiritimati` trae `isOverdue: true` y la de `America/Los_Angeles` trae `isOverdue: false`

#### Scenario: Sin cabecera
- **WHEN** se pide una tarea sin cabecera `X-Timezone`
- **THEN** la respuesta es la normal y el día de referencia es el día actual en UTC

#### Scenario: Huso no válido
- **WHEN** se pide una tarea con `X-Timezone` `Marte/Olympus`, `+05:00`, `UTC+3`, `local` o un valor de más de 64 caracteres
- **THEN** la respuesta es la normal, sin error, y el día de referencia es el día actual en UTC

### Requirement: Vista de una tarea
La aplicación web SHALL ofrecer, solo a personas con sesión iniciada, una vista de una tarea con su título, su fecha de vencimiento editable y, si el servidor la da por vencida, una señal «Vencida» con texto e icono, y SHALL NOT ofrecer en ella la edición de ningún otro dato.

#### Scenario: Abrir una tarea vencida
- **WHEN** la persona abre una tarea que el servidor da por vencida
- **THEN** ve la señal "Vencida", con texto e icono además de color, sin tener que comparar la fecha con el día de hoy

#### Scenario: Abrir una tarea no vencida
- **WHEN** la persona abre una tarea con fecha de hoy o futura, sin fecha, o hecha con la fecha pasada
- **THEN** no ve la señal "Vencida"

#### Scenario: Tarea sin fecha
- **WHEN** la persona abre una tarea sin fecha
- **THEN** ve el campo de fecha vacío y ningún aviso, recordatorio ni señal de que le falte algo

#### Scenario: Volver a la lista
- **WHEN** la persona está en la vista de una tarea y pulsa el enlace a la lista
- **THEN** ve la lista de tareas

#### Scenario: Tarea inexistente en la web
- **WHEN** la persona abre la vista de un id que no corresponde a ninguna tarea
- **THEN** ve "Esa tarea ya no existe." y el enlace para volver a la lista

#### Scenario: Fallo al cargar la tarea
- **WHEN** el servidor no responde o falla al pedir la tarea
- **THEN** la persona ve un aviso con el motivo

#### Scenario: Vista sin sesión
- **WHEN** una persona sin sesión intenta abrir la vista de una tarea
- **THEN** es redirigida a la pantalla de inicio de sesión sin ver la tarea

#### Scenario: El día lo pone quien mira
- **WHEN** la web pide cualquier dato de tareas
- **THEN** envía el huso horario del navegador en la cabecera `X-Timezone`

### Requirement: Poner y quitar la fecha en la web
La aplicación web SHALL guardar la fecha de vencimiento en cuanto la persona elige una fecha completa o la quita, sin botón de guardar ni diálogo de confirmación, y SHALL mostrar la fecha y la señal de vencida que devuelve el servidor sin recargar.

#### Scenario: Poner una fecha
- **WHEN** la persona elige una fecha en el campo de una tarea sin fecha
- **THEN** la fecha queda guardada sin ningún paso extra y la vista refleja la fecha y el veredicto de vencida devueltos por el servidor, sin recargar

#### Scenario: Poner una fecha ya pasada en la web
- **WHEN** la persona elige una fecha anterior a hoy en una tarea no hecha
- **THEN** se guarda sin impedimento y la vista pasa a mostrar "Vencida"

#### Scenario: Quitar la fecha en la web
- **WHEN** la persona pulsa "Quitar fecha"
- **THEN** la tarea queda sin fecha al instante, sin diálogo de confirmación, y deja de mostrar "Vencida" si la mostraba

#### Scenario: Fecha incompleta en pantalla
- **WHEN** la persona sale del campo dejándolo con una fecha incompleta, inexistente o vacío
- **THEN** ve "Introduce una fecha completa y válida, o pulsa «Quitar fecha»." bajo el campo, no se envía nada al servidor y el campo vuelve a mostrar la fecha que la tarea tenía

#### Scenario: El servidor rechaza la fecha
- **WHEN** el servidor responde 422 sobre `dueDate`
- **THEN** la persona ve el mensaje bajo el campo y la vista vuelve a mostrar la fecha que la tarea tenía

#### Scenario: Error al guardar la fecha
- **WHEN** el servidor no responde o falla al guardar la fecha
- **THEN** la persona ve un aviso con el motivo y la vista vuelve a mostrar la fecha que la tarea tenía

#### Scenario: Guardado en curso
- **WHEN** se ha elegido o quitado una fecha y el servidor aún no ha respondido
- **THEN** el campo y el botón "Quitar fecha" quedan deshabilitados hasta la respuesta

#### Scenario: Sesión caducada en la vista de la tarea
- **WHEN** el servidor responde 401 al cargar la tarea o al guardar su fecha
- **THEN** la persona ve "Tu sesión ha caducado. Vuelve a iniciar sesión.", la fecha guardada no cambia, y al recargar la página llega a la pantalla de inicio de sesión

#### Scenario: Fecha de una tarea ajena en la web
- **WHEN** la persona cambia la fecha de una tarea cuyo responsable es otra
- **THEN** el cambio se aplica igual, sin pedir permiso ni mostrar advertencias

#### Scenario: Operable con teclado
- **WHEN** la persona usa solo el teclado
- **THEN** puede llegar al campo de fecha, elegir una fecha y pulsar "Quitar fecha"
