---
name: priority-ticket
description: Trae el ticket de mayor prioridad asignado al usuario logeado en Jira (vía MCP) y arranca el trabajo sobre él. Usar al empesar una tarea nueva.
---
#Priority ticket
1. Consult Jira vía MCP: busca los tickets asignados al usuario actual **en estado "Tareas por hacer"**, ordénalos por prioridad y toma el de mayor prioridad. No consideres tickets ya en "En curso" o "En revisión" - evita re-motar uno que ya está en marcha o cerrado.
2. Resume sus crioterios de acpetación.
3. Entra en plan mode y propone cómo implementarlo (sigue la convenciones de AGENT.md/CLAUDE.md si existen).
4. En cuanto el usuario apruebe el plan: mueve el ticket a "En curso".
5. Al terminar (con el PR ya creado siguiendo las reglas de CLAUDE.md): mueve el ticket a "En revisión" y deja un comentario en el ticket con el enlace al PR.