import React, { createContext, useContext, useState, useEffect } from 'react'
import api, { setAccessToken } from '@/services/api'

type User = {
  id: number
  email: string
  full_name: string
  role: string
  points: number
  trust_score: number
  total_reports: number
  total_verifications: number
  resolved_reports: number
}

type AuthContextType = {
  user: User | null
  token: string | null
  login: (token: string) => void
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const refreshed = await api.post('/auth/refresh')
        const restoredToken = refreshed.data.access_token
        setAccessToken(restoredToken)
        setToken(restoredToken)
        const profile = await api.get('/auth/me')
        setUser(profile.data)
      } catch {
        setAccessToken(null)
        setToken(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    restoreSession()

    const handleUnauthorized = () => {
      setAccessToken(null)
      setToken(null)
      setUser(null)
    }

    window.addEventListener('auth-unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized)
  }, [])

  const login = (newToken: string) => {
    setAccessToken(newToken)
    setToken(newToken)
    // Fetch user info immediately after login
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(console.error)
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (e) {
      // ignore
    }
    setAccessToken(null)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
