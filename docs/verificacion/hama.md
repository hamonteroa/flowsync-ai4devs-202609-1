# Verificación: «Lo que cada tarea muestra de su responsable»

Capability `tasks` · requisito de `openspec/specs/tasks/spec.md` · tests en `backend/tests/functional/tasks/assignee.spec.ts` (grupo `Tasks | responsable`).

- **Scenarios del requisito:** 3
- **Scenarios cubiertos:** 2

Antes de este trabajo la suite no tenía ningún test de `tasks`, así que había 0 de 3 cubiertos. Los tres tests son nuevos. Cada uno comprueba el scenario en la tarea suelta (`GET /api/v1/tasks/:id`) y en la lista (`GET /api/v1/tasks`).

| Scenario | Test que lo cubre | Estado | Observaciones |
|---|---|---|---|
| Al obtener una tarea cuyo responsable es "Ada Lovelace", `assignee` trae ese nombre y sus iniciales. | `Tasks \| responsable / el assignee trae el nombre y las iniciales del responsable` | Cubierto | Pasa. El nombre llega en `fullName` y las iniciales en `initials` (`AL`). |
| Al obtener cualquier tarea, suelta o en la lista, `assignee` no incluye el email ni otro dato de la cuenta. | `Tasks \| responsable / el assignee no incluye el email ni ningún otro dato de la cuenta` | Cubierto (en rojo) | **El test falla y se queda en rojo.** La tarea suelta cumple. La lista no: `TaskTransformer` usa `UserTransformer` y expone `email`, `createdAt` y `updatedAt`. `POST /api/v1/tasks` tiene el mismo defecto, pero no se prueba aquí. |
| Si el responsable se registró sin nombre, `fullName` llega nulo y las iniciales siguen llegando. | `Tasks \| responsable / un responsable sin nombre llega con nombre nulo y sus iniciales` | No lo sé | El test pasa con lo que dice el scenario: nombre nulo e iniciales no vacías. Lo que no sé decidir es si cumple el «sin recurrir a su email». Las iniciales se derivan del email (`ada@example.com` → `AE`), y la spec no dice si eso cuenta como recurrir a él. |

## Ejecución

- `node ace test functional --files=assignee`: **2 passed, 1 failed (3)**.
- Fallo: `lista: assignee no debe traer el email: expected { id: 8, …(5) } to not have nested property 'email'`.
- Suite completa (`node ace test`): 22 passed, 1 failed (23). El único fallo es el de arriba.

## Tres líneas

<!-- Parte B: las escribe la persona que entrega, no el agente. -->

1. Cuántos creía cubiertos antes de mirar: _pendiente_ · cuántos lo estaban: 0 de 3
2. Scenario dudoso entre hueco de test y hueco de spec: _pendiente_
3. Lo que tuve que decidir al escribir el test: _pendiente_

Material para la línea 3, de lo que se decidió al escribir los tests:
- Se fija `?today=2026-08-13`, porque la tarea suelta lo exige.
- `id` del responsable se acepta como dato permitido.
- Las iniciales sin nombre solo se exigen no vacías, sin fijar su valor.
- La tarea se mira desde otra cuenta, no desde la de su responsable.
