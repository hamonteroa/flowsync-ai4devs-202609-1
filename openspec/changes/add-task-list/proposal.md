# Proposal

## Why

FlowSync todavía no tiene tareas: solo cuentas y perfil. Sin una lista compartida no hay dónde anotar el trabajo ni manera de responder «quién está en qué» sin preguntar. Este change da de alta la capability de tareas con las cinco historias que la sostienen: E3-1 (lista compartida), E2-1 (crear con solo el título), E2-2 (título obligatorio), E2-3 (nace mía y pendiente) y E2-4 (cambiar el estado desde la lista).

## What Changes

- **API** (bajo `/api/v1`, solo para sesiones autenticadas), exactamente tres operaciones:
  - Listar todas las tareas del espacio: la misma lista para cualquier persona, cada tarea con título, estado y responsable identificado por id y nombre (nunca su email).
  - Crear una tarea indicando solo el título: nace en `pending` y con quien la crea como responsable.
  - Actualizar una tarea: estado (`pending`, `in_progress`, `done`) y/o responsable. Cualquier persona puede tocar cualquier tarea; las transiciones son libres entre los tres estados.
  - Validación: título obligatorio, no en blanco, de 120 caracteres como máximo tras recortar espacios. Estado fuera del conjunto cerrado → 422. Responsable inexistente → 422.
  - Sin lectura individual, sin borrado, sin endpoints de equipo.
- **Web**: nueva pantalla de lista de tareas, que pasa a ser la pantalla de inicio de la sesión:
  - Formulario de creación con un único campo, el título, que avisa (no recorta) si se pasa de largo.
  - Cada fila muestra título, nombre del responsable (o «Sin nombre») y estado como Pendiente / En curso / Hecho, y se cambia de estado desde la propia fila con un solo gesto, sin diálogos.
  - Estado vacío que explica qué es la lista e invita a crear la primera tarea.
  - Navegación entre lista y perfil.
  - Tras iniciar sesión o registrarse, y en direcciones desconocidas, se llega a la lista en lugar de al perfil.
- Sin fecha de vencimiento: la tarea no la tiene y la lista no muestra fechas ni marcas de vencida.
- Sin tests en este change, sin dependencias nuevas y sin componentes de UI nuevos: se reutilizan los que ya hay.

## Capabilities

### New Capabilities
- `tasks`: la lista de tareas compartida por todo el equipo: crear, listar y actualizar estado y responsable, por API y en la web.

### Modified Capabilities
- `auth`: la pantalla a la que llevan el inicio de sesión, el registro, las redirecciones con sesión y las direcciones desconocidas pasa de ser el perfil a ser la lista de tareas; el perfil ofrece volver a la lista.

## Puntos abiertos

- **Orden de la lista (PA-3).** No hay regla de orden decidida: la API no ordena explícitamente y la web pinta las tareas en el orden en que llegan, sin reordenarlas. El orden observable no está garantizado. Hasta que se decida, CA-5 de E3-1 («enumerar el trabajo de cada persona») solo se cumple recorriendo la lista entera.
- **Coste del gesto (PA-9).** El cambio de estado es un clic sobre el estado de destino en la propia fila; no hay umbral formal de «interacciones».
- **Fuera de alcance:** refresco automático cuando otro cambia algo (E3-2), filtros, reasignación desde la web (la API la admite, pero la web no tiene de dónde sacar la lista de personas), lectura individual y borrado.

## Decisiones tomadas con el equipo

- Título: máximo 120 caracteres (umbral de PA-9 para E2-2 CA-3).
- Actualizar: la API acepta estado y responsable; la web solo ofrece cambiar el estado.
- Transiciones (PA-7): libres entre los tres estados, incluido volver atrás desde Hecho.
- La lista pasa a ser la pantalla de inicio.

## Impact

- `backend/`: migración nueva (tabla de tareas con relación al usuario responsable), regeneración del esquema, modelo, validadores, transformer, controlador y tres rutas en el grupo autenticado. Se regeneran los tipos de `.adonisjs/`.
- `frontend/`: llamadas nuevas en el cliente de API (y traducción de los errores nuevos), tipos, página de lista, ruta protegida y cambio de destino en los guards y en la ruta comodín. Enlaces entre perfil y lista.
- Sin dependencias nuevas.
