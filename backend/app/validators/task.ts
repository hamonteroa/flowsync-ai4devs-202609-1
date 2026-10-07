import vine from '@vinejs/vine'
import { TASK_STATUSES } from '#models/task'

/**
 * Validator to use when creating a task. The title is the only input:
 * status and assignee are set by the server, and any other field in the
 * body is dropped.
 *
 * `trim()` runs before the length rules, so a blank title fails `minLength`
 * and the 120 limit applies to the text that is actually stored.
 */
export const createTaskValidator = vine.create({
  title: vine.string().trim().minLength(1).maxLength(120),
})

/**
 * Validator to use when updating a task. Only status and assignee can
 * change; the title is not declared, so it is ignored.
 */
export const updateTaskValidator = vine.create({
  status: vine.enum(TASK_STATUSES).optional(),
  assigneeId: vine.number().exists({ table: 'users', column: 'id' }).optional(),
})
