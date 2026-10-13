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

**Modelo:** Opus 5.5 xMedium
**Herramienta:** Claude Code

```
lista los agentes disponibles
```

**Qué salió:** 
Estos son los tipos de agente que tienes disponibles:

Del proyecto
- adversarial-reviewer: revisa un PR buscando bugs, huecos de seguridad y desviaciones de AGENTS.md. Su objetivo es refutar, no aprobar. Solo lectura (Read, Grep, Glob, Bash).
- tc-generator: genera casos de prueba que cubran el mayor número de escenarios posible, incluidos casos límite y errores esperados (Read, Grep, Glob, Bash). Ojo: .claude/agents/tc-generator.md todavía no está en git (aparece como ?? en git status).

Integrados
- claude: agente comodín para tareas que no encajan en otro más específico. Tiene acceso a todas las herramientas.
- general-purpose: investigación, búsquedas de código y tareas de varios pasos. Tiene acceso a todas las herramientas.
- Explore: búsquedas amplias por muchos ficheros cuando solo interesa la conclusión. Solo lectura.
- Plan: arquitecto de software que diseña planes de implementación. Solo lectura.
- claude-code-guide: responde dudas sobre Claude Code, el Agent SDK, la API de Claude y Claude Tag.
- statusline-setup: configura la status line de Claude Code.
- fork: una copia de mí mismo que hereda todo el contexto de esta conversación y trabaja en segundo plano.

## Prompt 2

**Modelo:** Opus 5.5 xMedium
**Herramienta:** Claude Code

```
utiliza el agente tc-generator para la capability task, sobre el requerimient "Lo que cada tarea muestra de su responsable" y solo sobre ese requerimient
```

**Qué salió:** 
- Tests: uno de los tres falla. La lista de tareas expone el email del responsable; lo dejé en rojo y no toqué el código.
- Te falta a ti: las tres líneas de la Parte B en docs/verificacion/hama.md (las dejé como plantilla) y prompts.md con tus prompts.
- Base del PR: abrí el PR en tu fork contra s4/start. El README pide entregarlo contra el repositorio del curso; lo puedes reabrir allí cuando lo completes.