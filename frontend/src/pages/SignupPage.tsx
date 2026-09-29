import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { PasswordField, TextField } from '../components/fields'
import { ApiError, api, errorsByField } from '../lib/api'
import {
  PASSWORD_MISMATCH_MESSAGE,
  validateEmail,
  validatePassword,
} from '../lib/validation'

type Errors = Partial<
  Record<'email' | 'password' | 'passwordConfirmation', string>
>

export function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(undefined)

    const clientErrors: Errors = {
      email: validateEmail(email),
      password: validatePassword(password),
      passwordConfirmation:
        password !== passwordConfirmation
          ? PASSWORD_MISMATCH_MESSAGE
          : undefined,
    }
    setErrors(clientErrors)
    if (Object.values(clientErrors).some(Boolean)) return

    setSubmitting(true)
    try {
      const { user } = await api.signup(
        email.trim(),
        password,
        passwordConfirmation,
      )
      navigate('/login', { state: { email: user.email, created: true } })
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        setErrors(errorsByField(error.errors))
      } else {
        setFormError('No se pudo crear la cuenta. Inténtalo de nuevo.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-card">
      <h1>Crea tu cuenta</h1>
      {formError && (
        <p className="banner banner-error" role="alert">
          {formError}
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
          autoComplete="new-password"
          value={password}
          error={errors.password}
          onChange={setPassword}
        />
        <PasswordField
          id="passwordConfirmation"
          label="Confirmar contraseña"
          autoComplete="new-password"
          value={passwordConfirmation}
          error={errors.passwordConfirmation}
          onChange={setPasswordConfirmation}
        />
        <button type="submit" className="primary" disabled={submitting}>
          Crear cuenta
        </button>
      </form>
      <p className="auth-switch">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </main>
  )
}
