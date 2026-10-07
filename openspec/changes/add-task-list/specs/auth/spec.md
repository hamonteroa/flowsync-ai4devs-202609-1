# Spec Delta

## MODIFIED Requirements

### Requirement: Pantalla de registro
La aplicación web SHALL ofrecer una pantalla de registro con los campos nombre completo (opcional), email, contraseña y repetición de la contraseña, y SHALL dejar a la persona dentro de la lista de tareas con la sesión iniciada en cuanto el registro tiene éxito.

#### Scenario: Registro correcto desde la web
- **WHEN** una persona sin sesión rellena el formulario de registro con datos válidos y pulsa "Crear cuenta"
- **THEN** el botón muestra "Creando cuenta…" y queda deshabilitado mientras se envía, y al terminar la persona ve la lista de tareas con la sesión iniciada

#### Scenario: Contraseñas que no coinciden
- **WHEN** la persona escribe dos contraseñas distintas y pulsa "Crear cuenta"
- **THEN** ve "Las contraseñas no coinciden." bajo el campo de repetición, sin que se envíe nada al servidor

#### Scenario: Email ya registrado desde la web
- **WHEN** la persona intenta registrarse con un email que ya existe
- **THEN** ve bajo el campo email "Ese email ya está registrado. Inicia sesión en su lugar."

#### Scenario: Errores de validación por campo
- **WHEN** el servidor rechaza uno o varios campos del formulario
- **THEN** bajo cada campo afectado aparece en castellano el primer error de ese campo, por ejemplo "Introduce una dirección de email válida."

#### Scenario: Error sobre un campo que no está en pantalla
- **WHEN** el servidor devuelve algún error de validación sobre un campo que el formulario no muestra
- **THEN** aparece en la parte superior un aviso con el mensaje del primer error devuelto por el servidor, además de los errores de los campos visibles bajo cada campo

#### Scenario: Nombre vacío
- **WHEN** la persona deja el nombre completo vacío o solo con espacios
- **THEN** la cuenta se crea sin nombre y el perfil muestra "Sin nombre"

### Requirement: Pantalla de inicio de sesión
La aplicación web SHALL ofrecer una pantalla de inicio de sesión con email y contraseña, y SHALL llevar a la persona a la lista de tareas cuando las credenciales son correctas.

#### Scenario: Inicio de sesión correcto desde la web
- **WHEN** una persona sin sesión introduce credenciales correctas y pulsa "Entrar"
- **THEN** el botón muestra "Entrando…" y queda deshabilitado mientras se envía, y al terminar la persona ve la lista de tareas

#### Scenario: Credenciales incorrectas desde la web
- **WHEN** la persona introduce un email o una contraseña incorrectos
- **THEN** ve en la parte superior del formulario "El email o la contraseña no son correctos."

#### Scenario: Datos mal formados al iniciar sesión
- **WHEN** la persona envía el formulario con un email mal formado o sin contraseña
- **THEN** ve bajo el campo afectado "Introduce una dirección de email válida." o "Falta rellenar la contraseña."

#### Scenario: Servidor inaccesible
- **WHEN** la persona intenta entrar o registrarse y el servidor no responde
- **THEN** ve "No se pudo conectar con el servidor. Comprueba que el backend está arrancado."

#### Scenario: Error del servidor
- **WHEN** la persona intenta entrar o registrarse y el servidor responde con un error interno
- **THEN** ve en la parte superior "Algo ha ido mal en el servidor. Inténtalo de nuevo en un momento."

#### Scenario: Navegación entre acceso y registro
- **WHEN** la persona está en la pantalla de inicio de sesión o en la de registro
- **THEN** dispone de un enlace para pasar a la otra ("Crea una" / "Inicia sesión")

### Requirement: Persistencia y restauración de la sesión en la web
La aplicación web SHALL conservar la sesión entre recargas y reaperturas del navegador, y SHALL comprobar con el servidor que sigue siendo válida antes de dar acceso al contenido protegido.

#### Scenario: Recarga con sesión válida
- **WHEN** una persona con sesión iniciada recarga la página o vuelve a abrir la aplicación
- **THEN** ve un indicador de carga mientras se comprueba la sesión y después sigue en la pantalla protegida en la que estaba (la lista de tareas o el perfil) sin volver a introducir credenciales

#### Scenario: Sesión rechazada por el servidor
- **WHEN** al abrir la aplicación el servidor ya no reconoce la sesión guardada
- **THEN** la sesión se descarta y la persona ve la pantalla de inicio de sesión con el aviso "Tu sesión ha caducado. Vuelve a iniciar sesión."

#### Scenario: Servidor caído al restaurar
- **WHEN** al abrir la aplicación el servidor no responde o falla
- **THEN** la persona ve la pantalla de inicio de sesión con el aviso "No se pudo conectar con el servidor. Comprueba que el backend está arrancado." (si no responde) o "Algo ha ido mal en el servidor. Inténtalo de nuevo en un momento." (si falla), y la sesión guardada se conserva para restaurarse al recargar cuando el servidor vuelva

### Requirement: Protección de pantallas según la sesión
La aplicación web SHALL mostrar la lista de tareas y el perfil solo a personas con sesión iniciada y SHALL mostrar las pantallas de inicio de sesión y registro solo a personas sin sesión.

#### Scenario: Perfil sin sesión
- **WHEN** una persona sin sesión intenta abrir la pantalla de perfil o la lista de tareas
- **THEN** es redirigida a la pantalla de inicio de sesión

#### Scenario: Acceso o registro con sesión
- **WHEN** una persona con sesión iniciada intenta abrir la pantalla de inicio de sesión o la de registro
- **THEN** es redirigida a la lista de tareas

#### Scenario: Dirección desconocida
- **WHEN** una persona abre cualquier dirección que no es inicio de sesión, registro, lista de tareas ni perfil
- **THEN** es redirigida a la lista de tareas, y de ahí al inicio de sesión si no tiene sesión

### Requirement: Pantalla de perfil
La aplicación web SHALL mostrar a la persona con sesión iniciada sus iniciales, su nombre completo (o "Sin nombre" si no tiene), su email y la fecha en que se registró, y SHALL ofrecerle volver a la lista de tareas.

#### Scenario: Ver el perfil
- **WHEN** una persona con sesión iniciada abre su perfil
- **THEN** ve un avatar con sus iniciales, su nombre o "Sin nombre", su email y "Miembro desde" seguido de la fecha de alta en formato largo en castellano

#### Scenario: Volver a la lista
- **WHEN** la persona está en su perfil y pulsa el enlace a la lista de tareas
- **THEN** ve la lista de tareas

## ADDED Requirements

### Requirement: Acceso al perfil desde la lista
La aplicación web SHALL ofrecer desde la lista de tareas un enlace al perfil de la persona con sesión iniciada.

#### Scenario: Ir al perfil
- **WHEN** la persona está en la lista de tareas y pulsa el enlace a su perfil
- **THEN** ve su perfil
