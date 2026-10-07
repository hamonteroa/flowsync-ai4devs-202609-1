/**
 * Espejo de `UserTransformer` del backend (app/transformers/user_transformer.ts).
 */
export type User = {
  id: number
  fullName: string | null
  email: string
  initials: string
  createdAt: string
  updatedAt: string
}

/**
 * Respuesta de `POST /auth/signup` y `POST /auth/login`, ya sin el envoltorio `{ data }`.
 */
export type AuthResult = {
  user: User
  token: string
}

export type SignupPayload = {
  /** El backend lo declara `.nullable()`: la clave debe viajar siempre, aunque valga `null`. */
  fullName: string | null
  email: string
  password: string
  passwordConfirmation: string
}

export type LoginPayload = {
  email: string
  password: string
}

/** Identificadores de estado tal y como viajan por la API. */
export type TaskStatus = 'pending' | 'in_progress' | 'done'

/** Orden en que se ofrecen los estados en pantalla. */
export const TASK_STATUSES: readonly TaskStatus[] = [
  'pending',
  'in_progress',
  'done',
]

/** Lo único que se pinta de un estado: nunca el identificador de la API. */
export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  done: 'Hecho',
}

/**
 * Espejo de `TaskTransformer` del backend: del responsable solo llegan su id
 * y su nombre, nunca el email.
 */
export type Task = {
  id: number
  title: string
  status: TaskStatus
  assignee: {
    id: number
    fullName: string | null
  }
}
