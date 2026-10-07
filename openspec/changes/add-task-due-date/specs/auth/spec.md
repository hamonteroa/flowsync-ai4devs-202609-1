# Spec Delta

## MODIFIED Requirements

### Requirement: Protección de pantallas según la sesión
La aplicación web SHALL mostrar la lista de tareas, la vista de una tarea y el perfil solo a personas con sesión iniciada y SHALL mostrar las pantallas de inicio de sesión y registro solo a personas sin sesión.

#### Scenario: Perfil sin sesión
- **WHEN** una persona sin sesión intenta abrir la pantalla de perfil, la lista de tareas o la vista de una tarea
- **THEN** es redirigida a la pantalla de inicio de sesión

#### Scenario: Acceso o registro con sesión
- **WHEN** una persona con sesión iniciada intenta abrir la pantalla de inicio de sesión o la de registro
- **THEN** es redirigida a la lista de tareas

#### Scenario: Dirección desconocida
- **WHEN** una persona abre cualquier dirección que no es inicio de sesión, registro, lista de tareas, vista de una tarea ni perfil
- **THEN** es redirigida a la lista de tareas, y de ahí al inicio de sesión si no tiene sesión
