import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import { AuthContext } from '../lib/auth-context'

const STORAGE_KEY = 'flowsync.token'

function readToken() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage unavailable: the session only lives in memory.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(readToken)

  const signIn = useCallback((newToken: string) => {
    writeToken(newToken)
    setToken(newToken)
  }, [])

  const signOut = useCallback(async () => {
    const current = token
    writeToken(null)
    setToken(null)
    if (current) {
      // The local session is already gone; a failed revoke must not block logout.
      await api.logout(current).catch(() => undefined)
    }
  }, [token])

  const value = useMemo(
    () => ({ token, signIn, signOut }),
    [token, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
