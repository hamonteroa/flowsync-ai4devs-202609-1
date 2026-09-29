import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../lib/auth-context'

/**
 * Only lets authenticated users through; everyone else goes to the login.
 * `replace` keeps the protected URL out of the history, so "back" after a
 * logout lands here again and bounces to the login.
 */
export function RequireAuth() {
  const { token } = useAuth()
  return token ? <Outlet /> : <Navigate to="/login" replace />
}

/**
 * Keeps authenticated users away from the signup and login screens.
 */
export function RedirectIfAuthenticated() {
  const { token } = useAuth()
  return token ? <Navigate to="/perfil" replace /> : <Outlet />
}
