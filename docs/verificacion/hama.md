# Verificación: «Lo que cada tarea muestra de su responsable»

Capability `tasks` · requisito de `openspec/specs/tasks/spec.md` · tests en `backend/tests/functional/tasks/assignee.spec.ts` (grupo `Tasks | responsable`).

- **Scenarios del requisito:** 3
- **Scenarios cubiertos:** 2

Antes de este trabajo la suite no tenía ningún test de `tasks`: 0 de 3 cubiertos. Los tres tests son nuevos y comprueban cada scenario en la tarea suelta (`GET /api/v1/tasks/:id`) y en la lista (`GET /api/v1/tasks`).

| Scenario | Test que lo cubre | Estado | Observaciones |
|---|---|---|---|
| Al obtener una tarea cuyo responsable es "Ada Lovelace", `assignee` trae ese nombre y sus iniciales. | `Tasks \| responsable / el assignee trae el nombre y las iniciales del responsable` | Cubierto | Pasa. El nombre llega en `fullName` y las iniciales en `initials` (`AL`). |
| Al obtener cualquier tarea, suelta o en la lista, `assignee` no incluye el email ni otro dato de la cuenta. | `Tasks \| responsable / el assignee no incluye el email ni ningún otro dato de la cuenta` | No cubierto | **Falla, y se queda en rojo.** La tarea suelta cumple (`TaskDetailTransformer` → `TaskAssigneeTransformer`). La lista no: `TaskTransformer` serializa el assignee con `UserTransformer` y expone `email`, `createdAt` y `updatedAt`. `POST /api/v1/tasks` usa el mismo transformer y sufre el mismo defecto, pero no se prueba aquí. |
| Si el responsable se registró sin nombre, `fullName` llega nulo y las iniciales siguen llegando. | `Tasks \| responsable / un responsable sin nombre llega con nombre nulo y sus iniciales` | Cubierto | Pasa. Sin nombre, las iniciales se derivan del email (`ada@example.com` → `AE`). El scenario lo permite porque el email no se expone, aunque se puede inferir en parte. |

## Ejecución

`node ace test functional --files=assignee`: **2 passed, 1 failed (3)**. Fallo: `lista: assignee no debe traer el email: expected { id: 8, …(5) } to not have nested property 'email'`.

Suite completa (`node ace test`): 22 passed, 1 failed (23); el único fallo es el de arriba.

## Tres líneas

1. El requisito se cumple en la tarea suelta, pero **la lista filtra el email** del responsable: `TaskTransformer` reutiliza `UserTransformer` en vez de `TaskAssigneeTransformer`.
2. No he tocado el código de la app, y el test no se ha relajado: se entrega en rojo.
3. Queda abierto si `id` del responsable cuenta como «otro dato de la cuenta». El test lo permite, porque `TaskAssigneeTransformer` lo expone a propósito.
