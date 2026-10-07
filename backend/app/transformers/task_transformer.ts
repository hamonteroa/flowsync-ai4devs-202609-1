import type Task from '#models/task'
import { BaseTransformer } from '@adonisjs/core/transformers'

/**
 * Expects the `assignee` relation to be loaded. Only the assignee's id and
 * name are exposed: the list never needs their email or account dates.
 */
export default class TaskTransformer extends BaseTransformer<Task> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'title', 'status']),
      assignee: this.pick(this.resource.assignee, ['id', 'fullName']),
    }
  }
}
