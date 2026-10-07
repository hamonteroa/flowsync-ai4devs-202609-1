# Spec Delta

## Purpose

Dar al equipo una única lista de tareas compartida en la que cualquiera puede anotar trabajo con solo un título y ver, y cambiar, quién lleva cada tarea y en qué estado está.

## ADDED Requirements

### Requirement: Acceso autenticado a las tareas
La API SHALL exigir un token de acceso válido en todas las operaciones de tareas y SHALL rechazar con 401 cualquier petición sin token o con un token no válido, sin revelar ninguna tarea.

#### Scenario: Listar sin sesión
- **WHEN** se envía `GET /api/v1/tasks` sin cabecera `Authorization`
- **THEN** la respuesta es 401 y no contiene ninguna tarea

#### Scenario: Crear o actualizar sin sesión
- **WHEN** se envía `POST /api/v1/tasks` o `PATCH /api/v1/tasks/:id` sin token o con un token revocado
- **THEN** la respuesta es 401 y no se crea ni se modifica ninguna tarea

### Requirement: Forma pública de una tarea
La API SHALL representar cada tarea con su `id`, su `title`, su `status` y su responsable como `assignee: { id, fullName }`, y SHALL NOT exponer el email ni ningún otro dato de cuenta del responsable, ni fechas de la tarea.

#### Scenario: Tarea de un responsable con nombre
- **WHEN** una tarea pertenece a una persona con nombre completo "Ada Lovelace"
- **THEN** la tarea viaja como `{ id, title, status, assignee: { id, fullName: "Ada Lovelace" } }`, sin `email` del responsable

#### Scenario: Tarea de un responsable sin nombre
- **WHEN** el responsable de una tarea no tiene nombre completo
- **THEN** `assignee.fullName` vale `null` y su email sigue sin aparecer

### Requirement: Lista única compartida
La API SHALL devolver, a cualquier persona autenticada, todas las tareas existentes, sin filtrar por responsable ni por creador, y SHALL NOT ofrecer ninguna forma de crear tareas privadas ni una lista por persona.

#### Scenario: Dos personas ven lo mismo
- **WHEN** dos personas distintas piden `GET /api/v1/tasks` sin que nada cambie entre medias
- **THEN** las dos reciben 200 con `{ data: [...] }` conteniendo exactamente el mismo conjunto de tareas

#### Scenario: La tarea de otro aparece en mi lista
- **WHEN** otra persona crea una tarea, que queda a su nombre, y después yo pido la lista
- **THEN** esa tarea está en mi lista

#### Scenario: Espacio sin tareas
- **WHEN** se pide la lista y no se ha creado ninguna tarea
- **THEN** la respuesta es 200 con `{ data: [] }`

#### Scenario: Consultar no modifica
- **WHEN** se pide la lista cualquier número de veces
- **THEN** ninguna tarea cambia de título, estado ni responsable

#### Scenario: Orden no garantizado
- **WHEN** se pide la lista
- **THEN** las tareas llegan sin ningún criterio de orden garantizado, porque no hay regla de orden decidida

### Requirement: Crear una tarea con solo el título
La API SHALL crear una tarea a partir únicamente de un título, asignándole siempre el estado `pending` y como responsable a la persona autenticada que la crea, e ignorando cualquier otro dato que venga en la petición.

#### Scenario: Creación correcta
- **WHEN** se envía `POST /api/v1/tasks` con `{ "title": "Preparar la demo" }` y un token válido
- **THEN** la respuesta es 201 con `{ data: task }`, donde `task.title` es "Preparar la demo", `task.status` es `pending` y `task.assignee` es quien la ha creado

#### Scenario: Datos extra ignorados
- **WHEN** la petición de creación incluye además `status: "done"` o un `assigneeId` de otra persona
- **THEN** la tarea se crea igualmente en `pending` y a nombre de quien la crea

#### Scenario: Espacios en los extremos del título
- **WHEN** se crea una tarea con título "  Preparar la demo  "
- **THEN** la tarea se guarda con el título "Preparar la demo"

### Requirement: Título obligatorio y acotado
La API SHALL rechazar con 422, sin crear ninguna tarea, un título ausente, vacío, formado solo por espacios o de más de 120 caracteres una vez recortados los espacios de los extremos, y SHALL NOT guardar nunca una versión recortada del título.

#### Scenario: Sin título
- **WHEN** se envía la creación sin `title` o con `title` vacío
- **THEN** la respuesta es 422 con un error sobre el campo `title` y no se crea ninguna tarea

#### Scenario: Título en blanco
- **WHEN** se envía la creación con `title` formado solo por espacios
- **THEN** la respuesta es 422 con un error sobre el campo `title` y no se crea ninguna tarea

#### Scenario: Título demasiado largo
- **WHEN** se envía la creación con un `title` de 121 caracteres
- **THEN** la respuesta es 422 con un error sobre el campo `title` y no se guarda ninguna tarea, ni completa ni recortada

#### Scenario: Título en el límite
- **WHEN** se envía la creación con un `title` de exactamente 120 caracteres
- **THEN** la tarea se crea con el título completo

### Requirement: Actualizar estado y responsable de cualquier tarea
La API SHALL permitir a cualquier persona autenticada cambiar el estado y/o el responsable de cualquier tarea, sea suya o no, y SHALL responder con la tarea ya actualizada. Los campos que no sean estado ni responsable SHALL ignorarse.

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
- **WHEN** se envía la actualización con un cuerpo sin `status` ni `assigneeId`
- **THEN** la respuesta es 200 con la tarea tal como estaba

#### Scenario: Tarea inexistente
- **WHEN** se envía la actualización sobre un id que no corresponde a ninguna tarea
- **THEN** la respuesta es 404

#### Scenario: Responsable inexistente
- **WHEN** se envía la actualización con un `assigneeId` que no corresponde a ninguna persona registrada
- **THEN** la respuesta es 422 con un error sobre el campo `assigneeId` y la tarea no cambia

### Requirement: Conjunto cerrado de estados
La API SHALL aceptar como estado únicamente `pending`, `in_progress` y `done`, SHALL rechazar con 422 cualquier otro valor y SHALL permitir pasar de cualquiera de los tres a cualquier otro, incluido volver atrás desde `done`.

#### Scenario: Estado desconocido
- **WHEN** se envía la actualización con `status` "archived", "Pendiente" o cualquier valor fuera de los tres
- **THEN** la respuesta es 422 con un error sobre el campo `status` y la tarea no cambia

#### Scenario: Volver atrás desde hecho
- **WHEN** una tarea en `done` se actualiza a `pending`
- **THEN** la respuesta es 200 y la tarea queda en `pending`

#### Scenario: Saltar estados
- **WHEN** una tarea en `pending` se actualiza directamente a `done`
- **THEN** la respuesta es 200 y la tarea queda en `done`

### Requirement: Pantalla de la lista de tareas
La aplicación web SHALL ofrecer, solo a personas con sesión iniciada, una pantalla con la lista compartida en la que cada fila muestra el título, el nombre del responsable y el estado, sin necesidad de abrir ninguna tarea.

#### Scenario: Ver la lista
- **WHEN** una persona con sesión abre la lista y hay tareas
- **THEN** ve todas las tareas del equipo, y en cada fila el título, el nombre del responsable y el estado como "Pendiente", "En curso" o "Hecho"

#### Scenario: Responsable sin nombre
- **WHEN** el responsable de una tarea no tiene nombre completo, o solo tiene espacios
- **THEN** la fila muestra "Sin nombre", nunca su email ni su identificador

#### Scenario: Sin fechas ni presencia
- **WHEN** una persona recorre la lista
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

### Requirement: Estado vacío de la lista
La aplicación web SHALL explicar qué es la lista e invitar a crear la primera tarea cuando todavía no existe ninguna, en lugar de mostrar una lista vacía sin más.

#### Scenario: Primera visita a un espacio vacío
- **WHEN** una persona abre la lista y no hay ninguna tarea
- **THEN** ve un texto que explica que aquí aparecerán las tareas de todo el equipo con su responsable y su estado, y que la invita a crear la primera con el formulario de creación

### Requirement: Crear una tarea desde la lista
La aplicación web SHALL permitir crear una tarea desde la propia lista escribiendo únicamente su título, sin ofrecer ni sugerir responsable, estado, fecha ni ningún otro dato, y SHALL mostrar la tarea creada en la lista sin recargar ni navegar.

#### Scenario: Crear con un título
- **WHEN** la persona escribe un título y pulsa "Crear tarea"
- **THEN** el botón queda deshabilitado mientras se envía, la tarea aparece en la lista a su nombre y en "Pendiente", y el campo de título queda vacío

#### Scenario: El formulario solo pide el título
- **WHEN** la persona recorre el formulario de creación
- **THEN** el único campo que encuentra es el título

#### Scenario: Crear sin título
- **WHEN** la persona pulsa "Crear tarea" con el título vacío o solo con espacios
- **THEN** ve "Escribe un título para la tarea." bajo el campo, no se envía nada al servidor y la lista no cambia

#### Scenario: Título demasiado largo en pantalla
- **WHEN** la persona pulsa "Crear tarea" con un título de más de 120 caracteres
- **THEN** ve "El título no puede superar los 120 caracteres." bajo el campo, el texto escrito se conserva sin recortar y no se crea ninguna tarea

#### Scenario: Error al crear
- **WHEN** el servidor no responde o falla al crear la tarea
- **THEN** la persona ve un aviso con el motivo, el título escrito se conserva y la lista no cambia

### Requirement: Cambiar el estado desde la fila
La aplicación web SHALL permitir cambiar el estado de cualquier tarea desde su propia fila con un único gesto, ofreciendo como destinos solo Pendiente, En curso y Hecho, sin abrir la tarea, sin diálogos de confirmación y sin advertencias aunque la tarea sea de otra persona.

#### Scenario: Cambio inmediato
- **WHEN** la persona pulsa "En curso" en la fila de una tarea que está en "Pendiente"
- **THEN** la fila muestra "En curso" como estado actual de inmediato, sin diálogos ni campos que rellenar

#### Scenario: Tarea de otra persona
- **WHEN** la persona cambia el estado de una tarea cuyo responsable es otra
- **THEN** el cambio se aplica igual, sin pedir permiso ni mostrar advertencias

#### Scenario: Solo tres destinos
- **WHEN** la persona mira cómo cambiar el estado de una fila
- **THEN** las únicas opciones son "Pendiente", "En curso" y "Hecho", con la actual marcada como seleccionada

#### Scenario: El servidor rechaza el cambio
- **WHEN** el servidor no responde o rechaza el cambio de estado
- **THEN** la fila vuelve a mostrar el estado anterior y la persona ve un aviso con el motivo

#### Scenario: Sin cambio de responsable en pantalla
- **WHEN** la persona mira una fila
- **THEN** no hay forma de cambiar el responsable desde la web
