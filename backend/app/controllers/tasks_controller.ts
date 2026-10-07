import Task from '#models/task'
import { createTaskValidator, updateTaskValidator } from '#validators/task'
import type { HttpContext } from '@adonisjs/core/http'
import TaskTransformer from '#transformers/task_transformer'

export default class TasksController {
  /**
   * The whole team shares one list. There is no agreed order yet, so the
   * query deliberately has no `orderBy`.
   */
  async index({ serialize }: HttpContext) {
    const tasks = await Task.query().preload('assignee')

    return serialize(TaskTransformer.transform(tasks))
  }

  /**
   * A new task always starts pending and assigned to whoever creates it.
   */
  async store({ auth, request, response, serialize }: HttpContext) {
    const { title } = await request.validateUsing(createTaskValidator)

    const task = await Task.create({
      title,
      status: 'pending',
      assigneeId: auth.getUserOrFail().id,
    })
    await task.load('assignee')

    response.status(201)
    return serialize(TaskTransformer.transform(task))
  }

  /**
   * Anyone can change the status or the assignee of any task.
   */
  async update({ params, request, serialize }: HttpContext) {
    const { status, assigneeId } = await request.validateUsing(updateTaskValidator)

    const task = await Task.findOrFail(params.id)
    if (status !== undefined) task.status = status
    if (assigneeId !== undefined) task.assigneeId = assigneeId

    await task.save()
    await task.load('assignee')

    return serialize(TaskTransformer.transform(task))
  }
}
