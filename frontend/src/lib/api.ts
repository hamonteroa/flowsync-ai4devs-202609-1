const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

export type User = {
  id: number
  fullName: string | null
  email: string
  initials: string
  createdAt: string
  updatedAt: string | null
}

export type FieldError = { field: string; message: string }

/**
 * Error thrown for any non-2xx response. `errors` holds the VineJS
 * field errors when the backend answers with a 422.
 */
export class ApiError extends Error {
  status: number
  errors: FieldError[]

  constructor(status: number, message: string, errors: FieldError[] = []) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

async function request<T>(
  path: string,
  {
    token,
    body,
    method = 'GET',
  }: { token?: string | null; body?: unknown; method?: string } = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_URL}/api/v1${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.message ?? payload?.errors?.[0]?.message ?? response.statusText,
      Array.isArray(payload?.errors) ? payload.errors : [],
    )
  }
  return payload?.data as T
}

export const api = {
  signup: (email: string, password: string, passwordConfirmation: string) =>
    request<{ user: User }>('/auth/signup', {
      method: 'POST',
      body: { email, password, passwordConfirmation },
    }),

  login: (email: string, password: string) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  profile: (token: string) => request<User>('/account/profile', { token }),

  logout: (token: string) =>
    request<void>('/account/logout', { method: 'POST', token }),
}

/**
 * Groups field errors by field, keeping the first message of each.
 */
export function errorsByField(errors: FieldError[]): Record<string, string> {
  const result: Record<string, string> = {}
  for (const { field, message } of errors) {
    result[field] ??= message
  }
  return result
}
