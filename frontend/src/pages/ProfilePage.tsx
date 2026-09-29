import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { ApiError, api, type User } from '../lib/api'
import { useAuth } from '../lib/auth-context'

const memberSince = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

export function ProfilePage() {
  const navigate = useNavigate()
  const { token, signOut } = useAuth()
  const [user, setUser] = useState<User>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (!token) return
    let cancelled = false

    api
      .profile(token)
      .then((profile) => {
        if (!cancelled) setUser(profile)
      })
      .catch(async (err) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 401) {
          // Token revoked or unknown: drop it; the route guard sends us to the login.
          await signOut()
        } else {
          setError('No se pudo cargar tu perfil.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [token, signOut])

  async function handleLogout() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <main className="auth-card profile">
      <h1>Tu perfil</h1>
      {error && (
        <p className="banner banner-error" role="alert">
          {error}
        </p>
      )}
      {!user && !error && <p>Cargando…</p>}
      {user && (
        <>
          <div className="avatar" aria-label={`Iniciales ${user.initials}`}>
            {user.initials}
          </div>
          <p className="profile-email">{user.email}</p>
          <p className="profile-since">
            Miembro desde {memberSince.format(new Date(user.createdAt))}
          </p>
        </>
      )}
      <button type="button" className="secondary" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </main>
  )
}
