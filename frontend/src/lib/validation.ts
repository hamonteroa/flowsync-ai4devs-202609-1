export const REQUIRED_MESSAGE = 'Este campo es obligatorio.'
export const INVALID_EMAIL_MESSAGE = 'Introduce un email válido.'
export const PASSWORD_POLICY_MESSAGE =
  'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.'
export const PASSWORD_MISMATCH_MESSAGE = 'Las contraseñas no coinciden'

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Same policy the backend enforces in app/validators/user.ts.
const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,32}$/

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return REQUIRED_MESSAGE
  if (!EMAIL_FORMAT.test(email.trim())) return INVALID_EMAIL_MESSAGE
}

export function validatePassword(password: string): string | undefined {
  if (!password) return REQUIRED_MESSAGE
  if (!PASSWORD_POLICY.test(password)) return PASSWORD_POLICY_MESSAGE
}
