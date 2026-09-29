# Alcance del MVP: lista compartida de tareas con el estado siempre al día

## 1. Problema

En un equipo remoto pequeño nadie ve el estado del equipo sin interrumpir a alguien. Nadie sabe con certeza quién está en cada tarea ni qué queda libre, así que:

- Dos personas empiezan lo mismo sin saberlo (caso real: dos personas tocaron el mismo módulo la misma semana; dos días perdidos).
- La daily se gasta en la ronda de "¿en qué estás?", que hoy se come la mitad de los 15 minutos, y el resto del día se pregunta lo mismo por chat.

## 2. Usuarios

- **Quién:** miembros de un equipo remoto pequeño (3–10 personas) que comparten un único espacio de trabajo. Todos tienen los mismos permisos; no hay jerarquía.
- **Quién cobra el valor:** los pares, no un lead. El que descubre tarde que iba a lo mismo que otro y el que interrumpe para preguntar. No hay reporte hacia arriba.
- **Primer usuario (caso de estudio):** equipo de 6 personas de producto SaaS en 3 husos horarios, con un gestor de tareas pesado y una daily de 15 minutos por videollamada.
- **Supuestos:** existe un único espacio compartido, sin entidad "equipo"; todos los usuarios tienen sesión iniciada (registro y login ya existen).

## 3. Propuesta de valor

Una única lista compartida en la que se ve, sin recargar, quién está en cada tarea y qué está libre, y en la que crear o tomar una tarea cuesta un par de clics.

- **Decisión que cambia:** no empezar algo que otra persona ya está tocando, y elegir lo siguiente sabiendo qué está libre.
- **Por qué se sostiene:** quien actualiza el estado cobra en el momento. La lista es su cola de trabajo y, de paso, deja de recibir interrupciones preguntándole cómo va.
- **Hipótesis que valida el MVP:**
  - **H1:** si el estado se ve de un vistazo, la ronda de "¿en qué estás?" sobra.
  - **H2:** el estado se mantiene al día porque actualizarlo cuesta dos clics y a quien lo hace le sirve.
  - **H3:** ver qué está tomado evita el trabajo duplicado.
- **Riesgo #1:** que el estado se quede desactualizado. Si pasa, el producto pierde el sentido. La mitigación es que actualizar cueste dos clics; no se obliga a nadie.
- **Criterio de éxito:** tras una semana de uso real, el equipo cancela la ronda de "¿en qué estás?" de la daily y nadie pide recuperarla.

## 4. Alcance

Una vertical fina y usable de punta a punta: una pantalla, una lista, una tarea con **título, responsable y estado**.

- **Lista compartida:** muestra cada tarea con su título, su responsable y su estado ("Por hacer", "En curso" o "Hecha"). *(H1)*
- **Crear tarea:** basta con el título, que es obligatorio; la tarea nace libre (sin responsable) y en "Por hacer". *(H2)*
- **Tomar tarea:** una tarea libre se toma en dos clics como máximo; quien la toma pasa a ser responsable y el estado cambia a "En curso". *(H2, H3)*
- **Cambiar estado:** el responsable mueve la tarea entre estados, incluido volver de "Hecha" a "En curso", sin rellenar ningún otro campo. *(H2)*
- **Actualización en vivo:** las tareas nuevas y los cambios de otras personas aparecen en la lista abierta en menos de 5 segundos, sin recargar. *(H1, H3)*
- **Evitar tomas duplicadas:** si alguien intenta tomar una tarea que otra persona acaba de tomar, no se le asigna y se le indica quién la tiene. Una tarea nunca tiene dos responsables. *(H3)*

Reglas que atraviesan todo el alcance: dos clics como máximo para tomar o cambiar de estado; ningún campo obligatorio salvo el título; sin integraciones, permisos ni configuración.

## 5. NO-alcance

Cada exclusión lleva la hipótesis que **no** ayuda a validar, o el motivo de producto por el que se rechaza.

### Recortado de la propuesta inicial

- **Fecha de vencimiento y marca de "vencida".** El producto contesta "quién está en qué", no "qué va tarde". Los plazos no ayudan a validar ninguna de las tres hipótesis y añaden un campo más al crear, justo lo que H2 necesita que no exista. Es el primer paso hacia el gestor pesado que se quiere sustituir.
- **Filtro por estado.** Con 3–10 personas la lista cabe en una pantalla y se lee de un vistazo. Filtrar no aporta nada a H1 y esconde justo lo que interesa ver: qué está libre y qué está tomado a la vez. Si la lista crece hasta necesitar filtro, eso ya es información (ver NO-alcance de backlog).
- **Asignar la tarea a otra persona.** El estado lo declara quien hace la tarea (H2). Que otro te asigne trabajo introduce un rol de reparto que el producto rechaza (roles planos, sin lead) y rompe la lectura de la lista: "responsable" dejaría de significar "está en ello". Para ceder una tarea basta con soltarla y que la otra persona la tome.
- **Destacar cambios desde la última visita.** Encaja con "resumen que espera, no aviso que interrumpe", pero antes hay que probar que la lista en vivo por sí sola basta (H1). Es una mejora sobre una hipótesis aún sin validar, y exige guardar qué ha visto cada persona.

### Decidido fuera por producto

- **Notificaciones push.** La señal es un resumen que espera, no un aviso que interrumpe. Un push sustituye una interrupción por otra y va contra lo que se promete.
- **Integración con Slack.** Mueve la conversación de vuelta al chat, que es donde hoy nace el "¿en qué estás?". No valida nada de la lista y añade integraciones y OAuth de terceros.
- **Roles y permisos avanzados.** Todos ven y editan lo mismo. El valor lo cobran los pares; una jerarquía de permisos no aporta a ninguna hipótesis y añade configuración.
- **Analítica y reporting.** No hay reporte hacia arriba y a un manager le daría igual. Mide a las personas, no ayuda a que decidan qué coger.
- **Comentarios en las tareas.** Convierten la lista en un hilo de conversación. Para saber quién está en qué basta con título, responsable y estado.
- **Presencia ("quién está conectado") o indicadores de actividad.** El estado es de la tarea, no de la persona. Se rechaza a propósito porque sería vigilancia.
- **Chat, videollamada y edición simultánea del mismo documento.** "Tiempo real" aquí significa ver cambios de estado sin refrescar, nada más. Son otros productos.
- **Sprints, estimaciones, épicas y backlog priorizado.** Es exactamente el "rollo" que se quiere quitar. Un equipo que necesite eso no es nuestro usuario.
- **Integraciones con Git, PRs, CI o calendario, e importar tareas de otro gestor.** El estado lo teclea la persona (H2); derivarlo de señales externas es otro producto. Importar implicaría convivir con otro gestor, y la doble actualización es como muere esta categoría.
- **Varios equipos, o una misma persona en más de un equipo.** El MVP es un espacio único. Separar equipos no aporta nada a las hipótesis y se anota como supuesto, no se construye.
- **Resolver los bloqueos que hoy se tratan en la daily.** La daily no desaparece entera: solo la ronda de "¿en qué estás?". Los bloqueos siguen en la reunión y este MVP no promete resolverlos.

## Los dos números

Dejó correctamente los 6 requerimientos que conforman el MVP del producto.

## Tres cosas que dejaste 

Es lo mínimo para el MVP; no se excluyó ningún punto en el alcance.

## La exclusión de la que menos seguro estás

Es lo mínimo para el MVP; no se excluyó ningún punto en el alcance.