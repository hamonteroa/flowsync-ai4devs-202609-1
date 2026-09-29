import vine, { SimpleMessagesProvider } from '@vinejs/vine'

/**
 * Password policy: 8-32 chars with at least one uppercase letter,
 * one lowercase letter and one digit.
 */
const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
const PASSWORD_POLICY_MESSAGE =
  'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.'

/**
 * Shared rules for email and password. Emails are normalized to
 * lowercase before any other rule runs, so uniqueness and login
 * lookups are case-insensitive.
 */
const email = () => vine.string().trim().toLowerCase().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32).regex(PASSWORD_POLICY)

/**
 * Validator to use when performing self-signup
 */
export const signupValidator = vine.create({
  fullName: vine.string().trim().nullable().optional(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  passwordConfirmation: vine.string().sameAs('password'),
})

signupValidator.messagesProvider = new SimpleMessagesProvider({
  'required': 'Este campo es obligatorio.',
  'email.email': 'Introduce un email válido.',
  'email.maxLength': 'El email no puede superar los 254 caracteres.',
  'email.database.unique': 'Ya existe una cuenta con este email.',
  'password.minLength': PASSWORD_POLICY_MESSAGE,
  'password.maxLength': 'La contraseña no puede superar los 32 caracteres.',
  'password.regex': PASSWORD_POLICY_MESSAGE,
  'passwordConfirmation.sameAs': 'Las contraseñas no coinciden',
})

/**
 * Validator to use before validating user credentials
 * during login
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})
