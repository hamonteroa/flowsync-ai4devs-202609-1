# auth Specification

## Purpose
Permitir que una persona cree una cuenta en FlowSync, inicie y cierre sesión con un token de acceso, y consulte su propio perfil, tanto a través de la API HTTP como de las pantallas de la aplicación web.

## Requirements

### Requirement: Registro de cuenta
La API SHALL crear una cuenta nueva cuando recibe un nombre completo (que puede ser nulo), un email válido y no registrado, y una contraseña de 8 a 32 caracteres con su confirmación idéntica, y SHALL responder con los datos públicos del usuario y un token de acceso ya utilizable, envueltos en `data`.

#### Scenario: Registro correcto
- **WHEN** se envía `POST /api/v1/auth/signup` con `fullName`, `email` no registrado, `password` de entre 8 y 32 caracteres y `passwordConfirmation` igual a `password`
- **THEN** la respuesta es 200 con `{ data: { user, token } }`, donde `user` contiene los datos públicos del usuario y `token` es un token de acceso que autentica peticiones posteriores

#### Scenario: Registro sin nombre
- **WHEN** se envía el registro con `fullName: null` y el resto de campos válidos
- **THEN** la cuenta se crea igualmente y `user.fullName` vale `null`

#### Scenario: Email ya registrado
- **WHEN** se envía el registro con un `email` que ya pertenece a otra cuenta
- **THEN** la respuesta es 422 con un error de validación sobre el campo `email` y no se crea ninguna cuenta

#### Scenario: Datos de registro inválidos
- **WHEN** se envía el registro con un email mal formado o de más de 254 caracteres, una contraseña de menos de 8 o más de 32 caracteres, una confirmación distinta de la contraseña, o sin alguno de los cuatro campos
- **THEN** la respuesta es 422 con `{ errors: [...] }`, donde cada error indica el `field` afectado, la `rule` incumplida y un `message`

### Requirement: Inicio de sesión
La API SHALL emitir un token de acceso nuevo cuando recibe un email y una contraseña que corresponden a una cuenta existente, y SHALL rechazar las credenciales incorrectas sin revelar si el fallo está en el email o en la contraseña.

#### Scenario: Credenciales correctas
- **WHEN** se envía `POST /api/v1/auth/login` con el `email` y la `password` de una cuenta existente
- **THEN** la respuesta es 200 con `{ data: { user, token } }`, y cada inicio de sesión emite un token distinto sin invalidar los anteriores

#### Scenario: Credenciales incorrectas
- **WHEN** se envía el inicio de sesión con un email que no existe o con una contraseña que no corresponde a ese email
- **THEN** la respuesta es 400 con un único error genérico, sin `field`, idéntico en ambos casos

#### Scenario: Petición de inicio de sesión mal formada
- **WHEN** se envía el inicio de sesión sin email, con un email mal formado o sin contraseña
- **THEN** la respuesta es 422 con los errores de validación por campo

### Requirement: Autenticación por token de acceso
Las rutas de cuenta de la API SHALL exigir un token de acceso válido en la cabecera `Authorization: Bearer <token>` y SHALL rechazar con 401 cualquier petición sin token, con un token desconocido o con un token revocado.

#### Scenario: Petición sin token
- **WHEN** se llama a `GET /api/v1/account/profile` o a `POST /api/v1/account/logout` sin cabecera `Authorization`
- **THEN** la respuesta es 401 con `{ errors: [{ message }] }`

#### Scenario: Token revocado
- **WHEN** se llama a una ruta de cuenta con un token que ya se usó para cerrar sesión
- **THEN** la respuesta es 401

#### Scenario: Token sin caducidad
- **WHEN** se usa un token válido cualquier tiempo después de haberse emitido, sin haber cerrado sesión con él
- **THEN** la petición se autentica, porque los tokens no caducan por tiempo

### Requirement: Consulta del perfil propio
La API SHALL devolver los datos públicos del usuario dueño del token, y nunca su contraseña.

#### Scenario: Perfil con sesión válida
- **WHEN** se envía `GET /api/v1/account/profile` con un token válido
- **THEN** la respuesta es 200 con `{ data: { id, fullName, email, createdAt, updatedAt, initials } }` del usuario dueño del token

### Requirement: Iniciales del usuario
La API SHALL calcular las iniciales del usuario en mayúsculas a partir de su nombre completo o, si no lo tiene, a partir de su email.

#### Scenario: Nombre con dos o más palabras
- **WHEN** el usuario tiene `fullName` "Ada Lovelace"
- **THEN** `initials` vale "AL" (primera letra de las dos primeras palabras)

#### Scenario: Nombre de una sola palabra
- **WHEN** el usuario tiene `fullName` "Ada"
- **THEN** `initials` vale "AD" (dos primeras letras)

#### Scenario: Sin nombre
- **WHEN** el usuario tiene `fullName` nulo y email "ada@example.com"
- **THEN** `initials` vale "AE" (primera letra de la parte local y primera letra del dominio)

### Requirement: Cierre de sesión en la API
La API SHALL revocar el token con el que se hace la petición de cierre de sesión, dejando intactos los demás tokens del mismo usuario.

#### Scenario: Cierre de sesión correcto
- **WHEN** se envía `POST /api/v1/account/logout` con un token válido
- **THEN** la respuesta es 200 con `{ message: "Logged out successfully" }` (sin envoltorio `data`) y ese token deja de autenticar

#### Scenario: Otros tokens siguen vivos
- **WHEN** un usuario tiene dos tokens y cierra sesión con uno de ellos
- **THEN** el otro token sigue autenticando peticiones

### Requirement: Respuestas siempre en JSON
La API SHALL responder en JSON a cualquier petición, incluidos los errores, aunque el cliente no lo pida en la cabecera `Accept`.

#### Scenario: Error sin cabecera Accept
- **WHEN** se envía una petición inválida a una ruta de autenticación sin cabecera `Accept: application/json`
- **THEN** el error llega como cuerpo JSON y no como página HTML

### Requirement: Pantalla de registro
La aplicación web SHALL ofrecer una pantalla de registro con los campos nombre completo (opcional), email, contraseña y repetición de la contraseña, y SHALL dejar a la persona dentro de su perfil con la sesión iniciada en cuanto el registro tiene éxito.

#### Scenario: Registro correcto desde la web
- **WHEN** una persona sin sesión rellena el formulario de registro con datos válidos y pulsa "Crear cuenta"
- **THEN** el botón muestra "Creando cuenta…" y queda deshabilitado mientras se envía, y al terminar la persona ve su perfil con la sesión iniciada

#### Scenario: Contraseñas que no coinciden
- **WHEN** la persona escribe dos contraseñas distintas y pulsa "Crear cuenta"
- **THEN** ve "Las contraseñas no coinciden." bajo el campo de repetición, sin que se envíe nada al servidor

#### Scenario: Email ya registrado desde la web
- **WHEN** la persona intenta registrarse con un email que ya existe
- **THEN** ve bajo el campo email "Ese email ya está registrado. Inicia sesión en su lugar."

#### Scenario: Errores de validación por campo
- **WHEN** el servidor rechaza alguno de los campos del formulario
- **THEN** cada mensaje aparece en castellano bajo su campo, y si alguno no corresponde a un campo visible el mensaje aparece en un aviso en la parte superior del formulario

#### Scenario: Nombre vacío
- **WHEN** la persona deja el nombre completo vacío o solo con espacios
- **THEN** la cuenta se crea sin nombre y el perfil muestra "Sin nombre"

### Requirement: Pantalla de inicio de sesión
La aplicación web SHALL ofrecer una pantalla de inicio de sesión con email y contraseña, y SHALL llevar a la persona a su perfil cuando las credenciales son correctas.

#### Scenario: Inicio de sesión correcto desde la web
- **WHEN** una persona sin sesión introduce credenciales correctas y pulsa "Entrar"
- **THEN** el botón muestra "Entrando…" y queda deshabilitado mientras se envía, y al terminar la persona ve su perfil

#### Scenario: Credenciales incorrectas desde la web
- **WHEN** la persona introduce un email o una contraseña incorrectos
- **THEN** ve en la parte superior del formulario "El email o la contraseña no son correctos."

#### Scenario: Servidor inaccesible
- **WHEN** la persona intenta entrar o registrarse y el servidor no responde
- **THEN** ve "No se pudo conectar con el servidor. Comprueba que el backend está arrancado."

#### Scenario: Navegación entre acceso y registro
- **WHEN** la persona está en la pantalla de inicio de sesión o en la de registro
- **THEN** dispone de un enlace para pasar a la otra ("Crea una" / "Inicia sesión")

### Requirement: Persistencia y restauración de la sesión en la web
La aplicación web SHALL conservar la sesión entre recargas y reaperturas del navegador, y SHALL comprobar con el servidor que sigue siendo válida antes de dar acceso al contenido protegido.

#### Scenario: Recarga con sesión válida
- **WHEN** una persona con sesión iniciada recarga la página o vuelve a abrir la aplicación
- **THEN** ve un indicador de carga mientras se comprueba la sesión y después sigue en su perfil sin volver a introducir credenciales

#### Scenario: Sesión rechazada por el servidor
- **WHEN** al abrir la aplicación el servidor ya no reconoce la sesión guardada
- **THEN** la sesión se descarta y la persona ve la pantalla de inicio de sesión con el aviso "Tu sesión ha caducado. Vuelve a iniciar sesión."

#### Scenario: Servidor caído al restaurar
- **WHEN** al abrir la aplicación el servidor no responde o falla
- **THEN** la persona ve la pantalla de inicio de sesión con un aviso que explica el problema, y la sesión guardada se conserva para restaurarse al recargar cuando el servidor vuelva

### Requirement: Protección de pantallas según la sesión
La aplicación web SHALL mostrar el perfil solo a personas con sesión iniciada y SHALL mostrar las pantallas de inicio de sesión y registro solo a personas sin sesión.

#### Scenario: Perfil sin sesión
- **WHEN** una persona sin sesión intenta abrir la pantalla de perfil
- **THEN** es redirigida a la pantalla de inicio de sesión

#### Scenario: Acceso o registro con sesión
- **WHEN** una persona con sesión iniciada intenta abrir la pantalla de inicio de sesión o la de registro
- **THEN** es redirigida a su perfil

#### Scenario: Dirección desconocida
- **WHEN** una persona abre cualquier dirección que no es inicio de sesión, registro ni perfil
- **THEN** es redirigida al perfil, y de ahí al inicio de sesión si no tiene sesión

### Requirement: Pantalla de perfil
La aplicación web SHALL mostrar a la persona con sesión iniciada sus iniciales, su nombre completo (o "Sin nombre" si no tiene), su email y la fecha en que se registró.

#### Scenario: Ver el perfil
- **WHEN** una persona con sesión iniciada abre su perfil
- **THEN** ve un avatar con sus iniciales, su nombre o "Sin nombre", su email y "Miembro desde" seguido de la fecha de alta en formato largo en castellano

### Requirement: Cierre de sesión en la web
La aplicación web SHALL cerrar la sesión local en cuanto la persona lo pide, aunque el servidor no llegue a confirmar la revocación del token.

#### Scenario: Cerrar sesión
- **WHEN** la persona pulsa "Cerrar sesión" en su perfil
- **THEN** pasa a la pantalla de inicio de sesión sin ningún aviso, y al recargar la página sigue sin sesión

#### Scenario: Cerrar sesión con el servidor caído
- **WHEN** la persona pulsa "Cerrar sesión" y el servidor no responde
- **THEN** la sesión se cierra igualmente en el navegador y la persona ve la pantalla de inicio de sesión
