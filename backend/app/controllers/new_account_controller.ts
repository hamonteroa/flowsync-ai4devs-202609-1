import User from '#models/user'
import { errors } from '@vinejs/vine'
import { DUPLICATE_EMAIL_MESSAGE, signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'

export default class NewAccountController {
  /**
   * Creates the account without opening a session: the client is sent
   * to the login screen afterwards.
   */
  async store({ request, serialize }: HttpContext) {
    const { fullName, email, password } = await request.validateUsing(signupValidator)

    try {
      const user = await User.create({ fullName, email, password })
      return serialize({ user: UserTransformer.transform(user) })
    } catch (error) {
      /**
       * Two concurrent signups can both pass the "unique" rule; the DB
       * index rejects the second one, which must still be a 422.
       */
      if ((error as { code?: string })?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new errors.E_VALIDATION_ERROR([
          { field: 'email', message: DUPLICATE_EMAIL_MESSAGE, rule: 'database.unique' },
        ])
      }
      throw error
    }
  }
}
