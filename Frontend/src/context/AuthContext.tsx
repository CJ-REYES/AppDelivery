/* oxlint-disable react/only-export-components */
import {
  useCallback,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { ApiError, apiRequest } from '../lib/api'
import type {
  AuthResponse,
  AuthUser,
  LoginInput,
  RegisterInput,
} from '../types/auth'

type AuthState = {
  accessToken: string
  expiresAt: string
  user: AuthUser
}

type AuthContextValue = {
  accessToken: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  isReady: boolean
  login: (input: LoginInput) => Promise<AuthUser>
  register: (input: RegisterInput) => Promise<AuthUser>
  refreshSession: () => Promise<AuthUser>
  logout: () => Promise<void>
  syncUser: (user: AuthUser) => void
}

const sessionKey = 'appdelivery-session-v1'
const AuthContext = createContext<AuthContextValue | null>(null)

function readSession(): AuthState | null {
  try {
    const value = window.sessionStorage.getItem(sessionKey)
    if (!value) return null
    const session = JSON.parse(value) as AuthState

    if (
      !session.accessToken ||
      !session.user?.id ||
      !session.expiresAt
    ) {
      window.sessionStorage.removeItem(sessionKey)
      return null
    }

    return session
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthState | null>(readSession)
  const [isRestoring, setIsRestoring] = useState(
    () =>
      session !== null &&
      new Date(session.expiresAt).getTime() <= Date.now() + 30_000,
  )

  const saveSession = useCallback((response: AuthResponse) => {
    const nextSession: AuthState = response
    setSession(nextSession)
    window.sessionStorage.setItem(sessionKey, JSON.stringify(nextSession))
    return response.user
  }, [])

  const clearSession = useCallback(() => {
    setSession(null)
    window.sessionStorage.removeItem(sessionKey)
  }, [])

  const syncUser = useCallback((user: AuthUser) => {
    setSession((current) => {
      if (!current) return null
      const nextSession = { ...current, user }
      window.sessionStorage.setItem(
        sessionKey,
        JSON.stringify(nextSession),
      )
      return nextSession
    })
  }, [])

  const currentAccessToken = session?.accessToken
  const currentExpiresAt = session?.expiresAt

  useEffect(() => {
    if (!currentAccessToken || !currentExpiresAt) return
    let active = true
    let refreshTimer: number | undefined

    async function refresh() {
      setIsRestoring(true)
      try {
        const response = await apiRequest<AuthResponse>('/auth/refresh', {
          method: 'POST',
        })
        if (active) saveSession(response)
      } catch {
        if (active) clearSession()
      } finally {
        if (active) setIsRestoring(false)
      }
    }

    const expiresAt = new Date(currentExpiresAt).getTime()
    if (expiresAt <= Date.now() + 30_000) {
      void refresh()
    } else {
      apiRequest<AuthUser>('/auth/me', {}, currentAccessToken)
        .then((user) => {
          if (active) syncUser(user)
        })
        .catch((reason: unknown) => {
          if (
            active &&
            reason instanceof ApiError &&
            reason.status === 401
          ) {
            void refresh()
          }
        })

      refreshTimer = window.setTimeout(
        () => void refresh(),
        Math.max(expiresAt - Date.now() - 60_000, 1_000),
      )
    }

    return () => {
      active = false
      if (refreshTimer) window.clearTimeout(refreshTimer)
    }
  }, [
    clearSession,
    currentAccessToken,
    currentExpiresAt,
    saveSession,
    syncUser,
  ])

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken: session?.accessToken ?? null,
      user: session?.user ?? null,
      isAuthenticated: session !== null,
      isReady: !isRestoring,
      login: async (input) => {
        const response = await apiRequest<AuthResponse>('/auth/login', {
          method: 'POST',
          body: JSON.stringify(input),
        })
        return saveSession(response)
      },
      register: async (input) => {
        const response = await apiRequest<AuthResponse>('/auth/register', {
          method: 'POST',
          body: JSON.stringify(input),
        })
        return saveSession(response)
      },
      refreshSession: async () => {
        const response = await apiRequest<AuthResponse>('/auth/refresh', {
          method: 'POST',
        })
        return saveSession(response)
      },
      logout: async () => {
        try {
          await apiRequest<void>('/auth/logout', { method: 'POST' })
        } finally {
          clearSession()
        }
      },
      syncUser,
    }),
    [clearSession, isRestoring, saveSession, session, syncUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider')
  }
  return context
}
