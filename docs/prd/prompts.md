# Prompts

Aquí van **todos los prompts que lanzaste** para hacer el ejercicio, en el orden en que los
lanzaste, con el modelo y la herramienta de cada uno.

Esto no es papeleo. Lo que se revisa es **cómo pediste las cosas**, no solo lo que salió: un
resultado flojo con un prompt bueno y un resultado flojo con un prompt vago necesitan feedback
distinto, y sin este archivo no se distinguen.

## Cómo rellenarlo

- Un apartado `## Prompt N` por cada prompt.
- **Pega el prompt tal cual lo lanzaste**, dentro del bloque de código, aunque ocupe diez líneas
  y aunque tenga faltas. No lo reescribas para que quede bien: el que arreglaste mentalmente
  después no es el que lanzaste.
- Incluye también los que **no funcionaron**. Suelen ser los más útiles de leer.
- `Modelo` y `Herramienta` en todos. Si cambiaste de una a otra a mitad, se nota aquí.

Borra el ejemplo de abajo cuando escribas el primero.

---

## Prompt 1

**Modelo:** Opus 5.5 medium
**Herramienta:** Claude Code

Devuelve qué capabilities hay ya construididas y cómo es el modelo de datos actual. Escribelo a manera de resumen

**Qué salió:**
Qué hay: solo cuentas y sesión. Se puede crear una cuenta, iniciar sesión, ver el perfil propio y cerrar sesión. Todo funciona de punta a punta entre la API (/api/v1/auth/* y /api/v1/account/*) y las pantallas /register, /login y /profile. La sesión usa un token que se guarda en el navegador, y las rutas privadas están protegidas en el backend y en el frontend.

Qué no hay: nada de gestión de tareas. No existen tareas, proyectos, equipos, asignaciones ni tiempo real. Tampoco se puede editar el perfil ni recuperar la contraseña, y no hay tests.

Modelo de datos: dos tablas.
- users: id, nombre (opcional), email único, contraseña guardada como hash y fechas de alta y modificación.
- auth_access_tokens: los tokens de sesión, cada uno ligado a un usuario (un usuario puede tener varios). Si se borra el usuario, se borran sus tokens.

Pequeñas incoherencias:
- El logout devuelve su respuesta sin el envoltorio { data } que usa el resto de la API.
- En el frontend, updatedAt está tipado como obligatorio, pero el backend puede devolverlo vacío (null).

Conclusión: la base técnica (autenticación, convenciones y stack) está lista, pero el producto en sí está sin empezar.



## Prompt 2

**Modelo:** Opus 5.5 medium
**Herramienta:** Claude Code

con la finalidad de generar una historia de usuario que sea INVEST, criterios de aceptación con Gherkin y con MoSCoW, te voy a proporcionar las respuestas del producto. Para ello, considera antes de proponer las cinco preguntas que más reducirían la incertidumbre sobre el problema, los usuarios y el alcance, debe de ser una sola ronda y no debe de bajar al modelo de datos o a los endpoints. No seas condecendiente y se preciso en la pregunta, no te extiendas

**Qué salió:**
Cinco preguntas, en una sola ronda:

1. ¿Qué decisión o acción concreta toma alguien del equipo después de ver en qué está cada uno? Por ejemplo, desbloquear a un compañero, evitar trabajo duplicado o saltarse la daily. Si no hay decisión, no hay problema que resolver.
2. ¿Quién es el usuario principal: quien hace el trabajo y lo reporta, o quien lo consulta (el lead o el resto del equipo)? ¿Y qué gana el que reporta, si el que más se beneficia es el que consulta?
3. Hoy, sin FlowSync, ¿cómo se enteran y qué falla exactamente? Por ejemplo: la información llega tarde, está desactualizada, está repartida entre Slack y Jira, o cuesta demasiado mantenerla.
4. ¿Qué significa "más en tiempo real" en tiempo? ¿Que el cambio aparezca en segundos sin recargar, o basta con que cada uno actualice su estado varias veces al día?
5. ¿Qué es exactamente "menos rollo que Jira"? Di lo mínimo que tiene que tener una tarea para ser útil (título, responsable, estado…) y qué de Jira queda explícitamente fuera (estimaciones, sprints, flujos configurables, subtareas…).



##Prompt 3

**Modelo:** Opus 5.5 medium
**Herramienta:** Claude Code

- Qué duele hoy: la daily de sincronización y el "¿en qué estás?" constante por Slack/chat. Nadie ve el estado del equipo sin interrumpir a alguien.
  - Quién cobra el valor: los pares, no un lead. No hay reporte hacia arriba y a un manager le daría igual. Duele a los dos devs que descubren tarde que iban a lo mismo, y al que interrumpe a otro para preguntar.
  - Episodio concreto: dos personas del equipo tocaron el mismo módulo la misma semana porque una empezó sin que la otra lo supiera. Dos días perdidos.
  - Qué reunión desaparece (respuesta honesta, no la vendas de más): la daily NO desaparece entera. Desaparece la ronda de "¿en qué estás?", que hoy se come la mitad de los 15 minutos. La parte de bloqueos sigue, y este MVP no la resuelve.
  - Usuarios / equipo: equipos remotos pequeños, 3–10 personas. Roles planos: en el MVP todos ven y editan lo mismo, sin jerarquía de permisos.
  - Primer usuario concreto: equipo de 6 personas de producto SaaS, en 3 husos horarios, que hoy usa un gestor de tareas pesado y una daily de 15 minutos por videollamada. Es un CASO DE ESTUDIO, no un cliente real.
  - Fronteras: un espacio único compartido, sin entidad "equipo". Varios equipos separados, o gente en más de uno, queda FUERA del MVP: se anota como supuesto en el PRD, no se construye.
  - "Tiempo real" = ver los cambios de estado de las tareas sin refrescar ni preguntar. NO es chat, NO es videollamada, NO es colaboración simultánea sobre el mismo documento.
  - Es frescura, no presencia: el estado es de la TAREA, no de la persona. Nada de "quién está conectado ahora" ni indicadores de actividad; eso es vigilancia y lo rechazamos a propósito.
  - Forma de la señal: resumen que espera, no aviso que interrumpe. El caso es "llego por la mañana o vuelvo de una reunión y veo qué se ha movido". Sin notificaciones push.
  - Qué decisión cambia: no empezar algo que otra persona ya está tocando, y elegir lo siguiente sabiendo qué está libre. Si la única respuesta fuera "sentirse informado", el tiempo real no valdría lo que cuesta.
  - De dónde sale el estado: lo teclea la persona que hace la tarea, en segundos. Derivarlo de señales externas (Git/PRs, CI, calendario) está FUERA del MVP: es otro producto, con integraciones y OAuth de terceros.
  - Por qué se sostiene: no porque sea más agradable, sino porque son dos clics sobre una lista ya abierta, sin campos obligatorios, sin decidir sprint ni estimación. Y quien lo escribe cobra en el momento: esa misma lista es su cola de trabajo, la mira para decidir qué coge, y de paso deja de recibir interrupciones preguntándole cómo va. Si el beneficio fuera solo para los demás, no lo escribiría.
  - Si la información se queda vieja: el producto pierde el sentido, y lo asumo. Es el riesgo #1 a validar, no un detalle. La mitigación es que actualizar cueste dos clics, no obligar a nadie.
  - Es donde se hace el trabajo, no donde se cuenta: sustituye al gestor de tareas, no convive con él. FlowSync crea las tareas, no lee las de otro sitio. Convivir exigiría doble actualización, que es como muere esta categoría.
  - Renuncia explícita a sprints, estimaciones, épicas, backlog priorizado e informes. Un equipo que necesite eso no es nuestro usuario.
  - "Menos rollo que Jira" = crear una tarea y cambiarle el estado en segundos, sin flujos de configuración ni campos obligatorios. Lo mínimo para saber quién está en qué.
  - Qué necesita una tarea en el MVP: título, responsable, estado y fecha de vencimiento. La fecha, para ver de un vistazo qué se ha pasado de plazo.
  - Cómo se consume la lista: filtrando por estado, para centrarse en lo pendiente.
  - Éxito para el usuario: dejar de hacer la ronda de "¿en qué estás?" de la daily porque el estado del equipo se ve de un vistazo.
  - Criterio a una semana de uso real: que el equipo cancele esa ronda y nadie pida que vuelva. Si la siguen haciendo igual, no funcionó.
  - Cuánto construir: una vertical fina y usable de punta a punta, no el andamiaje amplio de un producto. Prefiero una capability terminada a tres a medias.
  
**Qué salió:**

Historia de usuario

Como miembro de un equipo remoto pequeño,
quiero ver en una lista compartida quién está en cada tarea y en qué estado está, sin tener que recargar, y poder crear o tomar una tarea en un par de clics,
para no empezar algo que otra persona ya está tocando y elegir lo siguiente sabiendo qué queda libre, sin preguntar "¿en qué estás?".

Comprobación INVEST

┌───────────────┬───────────────────────────────────────────────────────────────────────────────────────────────┐
│               │                                       Por qué la cumple                                       │
├───────────────┼───────────────────────────────────────────────────────────────────────────────────────────────┤
│ Independiente │ Se sostiene sola: incluye crear, tomar y ver. No depende de otra historia para aportar valor. │
├───────────────┼───────────────────────────────────────────────────────────────────────────────────────────────┤
│ Negociable    │ El alcance se ajusta con la prioridad MoSCoW; solo el bloque Must es innegociable.            │
├───────────────┼───────────────────────────────────────────────────────────────────────────────────────────────┤
│ Valiosa       │ Ataca directamente el caso de las dos personas que tocaron el mismo módulo la misma semana.   │
├───────────────┼───────────────────────────────────────────────────────────────────────────────────────────────┤
│ Estimable     │ Es una única pantalla con una única lista, sin integraciones, permisos ni configuración.      │
├───────────────┼───────────────────────────────────────────────────────────────────────────────────────────────┤
│ Small         │ Solo el Must ya es la vertical mínima. Should y Could se pueden separar sin romper nada.      │
├───────────────┼───────────────────────────────────────────────────────────────────────────────────────────────┤
│ Testeable     │ Cada criterio de abajo se puede comprobar como verdadero o falso.                             │
└───────────────┴───────────────────────────────────────────────────────────────────────────────────────────────┘

Criterios de aceptación

# language: es
Característica: Lista compartida de tareas con estado siempre al día

  Antecedentes:
    Dado que Ana y Luis han iniciado sesión en el mismo espacio compartido
    Y los dos tienen la lista de tareas abierta

  # ─── MUST ───────────────────────────────────────────────

  Escenario: Ver quién está en qué
    Dado que existe la tarea "Migrar facturación" con responsable Luis y estado "En curso"
    Cuando Ana mira la lista
    Entonces ve la tarea con su título, su responsable Luis y su estado "En curso"

  Escenario: Crear una tarea solo con el título
    Cuando Ana crea una tarea con el título "Revisar onboarding" sin rellenar nada más
    Entonces la tarea aparece en la lista sin responsable y con estado "Por hacer"

  Escenario: No se puede crear una tarea sin título
    Cuando Ana intenta crear una tarea con el título vacío
    Entonces la tarea no se crea
    Y se le indica que el título es obligatorio

  Escenario: Tomar una tarea libre
    Dado que la tarea "Revisar onboarding" no tiene responsable
    Cuando Ana la toma
    Entonces Ana pasa a ser la responsable y el estado cambia a "En curso"
    Y para hacerlo no ha necesitado más de dos clics

  Escenario: Cambiar el estado de mi tarea
    Dado que Ana es la responsable de "Revisar onboarding" en estado "En curso"
    Cuando la marca como "Hecha"
    Entonces el estado pasa a "Hecha" sin que tenga que rellenar ningún otro campo

  Escenario: Ver los cambios de otra persona sin recargar
    Cuando Luis toma la tarea "Revisar onboarding"
    Entonces Ana ve a Luis como responsable en su lista sin recargar la página

  Escenario: No pisar una tarea que otra persona acaba de tomar
    Dado que Luis acaba de tomar "Revisar onboarding"
    Y la lista de Ana todavía la muestra libre
    Cuando Ana intenta tomarla
    Entonces no se le asigna
    Y se le indica que la tiene Luis

  # ─── SHOULD ─────────────────────────────────────────────

  Escenario: Filtrar la lista por estado
    Dado que hay tareas en "Por hacer", "En curso" y "Hecha"
    Cuando Ana filtra por "Por hacer"
    Entonces solo ve las tareas en "Por hacer"

  Escenario: Ver de un vistazo lo que se ha pasado de plazo
    Dado que la tarea "Migrar facturación" vence ayer y no está "Hecha"
    Cuando Ana mira la lista
    Entonces la tarea aparece marcada como vencida

  Escenario: La fecha de vencimiento es opcional
    Cuando Ana crea una tarea sin fecha de vencimiento
    Entonces la tarea se crea y no aparece como vencida

  Escenario: Asignar una tarea a otra persona
    Cuando Ana asigna "Revisar onboarding" a Luis
    Entonces Luis pasa a ser el responsable

  # ─── COULD ──────────────────────────────────────────────

  Escenario: Ver qué se ha movido desde mi última visita
    Dado que Ana ha estado una hora sin mirar la lista
    Y en ese tiempo Luis ha cambiado el estado de dos tareas
    Cuando Ana vuelve a la lista
    Entonces esas dos tareas aparecen destacadas como cambiadas desde su última visita

MoSCoW

- Must: la lista compartida con título, responsable y estado; crear una tarea poniendo solo el título; tomar una tarea y cambiarle el estado en dos clics como máximo; ver los cambios de los demás sin recargar; evitar que dos personas tomen la misma tarea.
- Should: filtrar por estado; fecha de vencimiento opcional con la marca de vencida; asignar una tarea a otra persona.
- Could: destacar lo que ha cambiado desde tu última visita (es el "resumen que espera").
- Won't (en este MVP):
  - Nada que interrumpa ni vigile: notificaciones push, saber quién está conectado, indicadores de actividad.
  - Nada de comunicación: chat, videollamada, edición simultánea del mismo documento.
  - Nada de metodología: sprints, estimaciones, épicas, backlog priorizado, informes.
  - Ni integraciones con Git, CI o calendario, ni leer tareas de otro gestor.
  - Ni varios equipos, ni permisos o jerarquías.
  - Tampoco la parte de bloqueos de la daily.

Tres puntos que no salen de tus respuestas y he tenido que suponer

1. Los estados. He supuesto tres: "Por hacer", "En curso" y "Hecha". Si hay otros (por ejemplo "Bloqueada"), cambian los escenarios.
2. Qué significa "sin recargar" en segundos. Sin un número, ese criterio no se puede comprobar del todo. Propongo que el cambio se vea en menos de 5 segundos.
3. Qué es una tarea "libre". He supuesto que es una tarea sin responsable, aunque su estado sea "Por hacer".



## Prompt 4

**Modelo:** Opus 5.5 medium
**Herramienta:** Claude Code

es correcto los 3 supuestos, genera la HU final. Incluye el Fuera del MVP: notificaciones push, integración con Slack, roles/permisos avanzados, analítica/reporting, comentarios en tareas.

**Qué salió:**

He escribo docs/prd/alcance-mvp-hm.md con la HU final


## Prompt 5

**Modelo:** Opus 5.5 medium
**Herramienta:** Claude Code

vuelve a modificar el alcance-mvp-hd.md a que sea un formato de alcance, no de HU

**Qué salió:**
He reescrito docs/prd/alcance-mvp-hm.md para que sea un documento de alcance y no una historia de usuario. No existe ningún alcance-mvp-hd.md; di por hecho que te referías a este, que es el único archivo de alcance del repo.

Qué he quitado:
- El formato "Como / quiero / para".
- La tabla que comprobaba si la historia cumplía los criterios INVEST.
- Los escenarios Gherkin.

Cómo queda ahora:
- Contexto: problema, objetivo, usuarios y definiciones.
- Dentro del alcance: tres tablas de funcionalidades ordenadas por prioridad: imprescindible (Must), deseable (Should) y si sobra tiempo (Could). El detalle de los escenarios que había antes se ha pasado a la descripción de cada funcionalidad.
- Requisitos no funcionales: menos de 5 s para ver los cambios de otros, dos clics como máximo para tomar o cambiar una tarea, que una tarea no pueda quedar con dos responsables, y simplicidad.
- Resto de secciones: fuera del alcance, supuestos, riesgos y criterio de éxito.

He añadido un supuesto que no estaba en la versión anterior: el registro y el login ya existen. Revísalo por si no encaja con lo que tenías en mente.

No he hecho commit ni he abierto PR, porque docs/ todavía no está en git. Si quieres, lo subo en una rama con su PR.



## Prompt 6

**Modelo:** Opus 5.5 medium
**Herramienta:** Claude Code

dentro de @docs/prd/alcance-mvp-hm.md el alcance debe de estar en 5 bloques: Problema · usuarios · propuesta de valor · alcance · NO-alcance. Debes de recortar lo que es parte del MVP y lo que no que quede dentro del NO-alcance, justificando cada exclusión

**Qué salió:**
He reorganizado docs/prd/alcance-mvp-hm.md en los 5 bloques: Problema · Usuarios · Propuesta de valor · Alcance · NO-alcance.

Qué he recortado: había 10 funcionalidades dentro (6 Must, 3 Should y 1 Could) y ahora quedan 6: lista compartida, crear, tomar, cambiar estado, actualización en vivo y evitar tomas duplicadas. Las 4 que salen pasan al NO-alcance, cada una con su justificación:
- Fecha de vencimiento: no ayuda a validar ninguna hipótesis y añade un campo al crear la tarea.
- Filtro por estado: con 3–10 personas la lista se lee de un vistazo, y el filtro ocultaría justo lo que interesa ver.
- Asignar a otra persona: mete un rol de reparto, y "responsable" dejaría de significar "está en ello".
- Cambios desde la última visita: antes hay que comprobar que la lista en vivo basta por sí sola.

Cómo encaja el resto:
- He añadido tres hipótesis (H1–H3) en la propuesta de valor. Cada funcionalidad del alcance indica cuál valida, y cada exclusión dice cuál no ayuda a validar, que es lo que pide el README.
- Las 11 exclusiones que ya estaban ahora llevan también su porqué.
- Objetivo, riesgo y criterio de éxito van dentro de la propuesta de valor. Los supuestos, en Usuarios. Las definiciones y los requisitos no funcionales, dentro del Alcance.

Tienes que revisar dos cosas:
1. La Parte B contradice ahora el documento. Sigue diciendo "No se dejó fuera". No la he tocado porque el README dice que ese recorte y esas reflexiones son tuyas. Los números salen 10 → 6.
2. La fecha de vencimiento y el filtro por estado venían en la ficha de hechos. Por eso los he quitado argumentando. Es una tensión clara entre lo que te piden y lo que valida el producto, y encaja en "la exclusión de la que menos seguro estás" si no la compartes.

No he creado rama, ni commit, ni PR, porque solo he editado un documento. Si quieres, abro la rama alcance-hm que indica el README y lo subo.