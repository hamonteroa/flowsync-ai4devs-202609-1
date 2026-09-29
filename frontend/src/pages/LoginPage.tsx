import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { PasswordField, TextField } from '../components/fields'
import { ApiError, api } from '../lib/api'
import { useAuth } from '../lib/auth-context'
import { REQUIRED_MESSAGE } from '../lib/validation'

type LocationState = { email?: string; created?: boolean } | null

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const state = useLocation().state as LocationState

  const [email, setEmail] = useState(state?.email ?? '')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  )
  const [banner, setBanner] = useState<
    { kind: 'success' | 'error'; text: string } | undefined
  >(
    state?.created
      ? { kind: 'success', text: 'Cuenta creada, inicia sesión' }
      : undefined,
  )
  const [submitting, setSubmitting] = useState(false)

  // The signup hand-off is read once; drop it so a reload does not show it again.
  useEffect(() => {
    if (state) navigate('.', { replace: true, state: null })
  }, [state, navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const clientErrors = {
      email: email.trim() ? undefined : REQUIRED_MESSAGE,
      password: password ? undefined : REQUIRED_MESSAGE,
    }
    setErrors(clientErrors)
    if (clientErrors.email || clientErrors.password) return

    setSubmitting(true)
    setBanner(undefined)
    try {
      const { token } = await api.login(email.trim(), password)
      signIn(token)
      navigate('/perfil', { replace: true })
    } catch (error) {
      const invalidCredentials =
        error instanceof ApiError &&
        (error.status === 400 || error.status === 422)
      setBanner({
        kind: 'error',
        text: invalidCredentials
          ? 'Email o contraseña incorrectos.'
          : 'No se pudo iniciar sesión. Inténtalo de nuevo.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-card">
      <h1>Inicia sesión</h1>
      {banner && (
        <p
          className={`banner banner-${banner.kind}`}
          role={banner.kind === 'error' ? 'alert' : 'status'}
        >
          {banner.text}
        </p>
      )}
      <form noValidate onSubmit={handleSubmit}>
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          error={errors.email}
          onChange={setEmail}
        />
        <PasswordField
          id="password"
          label="Contraseña"
          autoComplete="current-password"
          value={password}
          error={errors.password}
          onChange={setPassword}
        />
        <button type="submit" className="primary" disabled={submitting}>
          Entrar
        </button>
      </form>
      <p className="auth-switch">
        ¿No tienes cuenta? <Link to="/registro">Crea tu cuenta</Link>
      </p>
    </main>
  )
}
