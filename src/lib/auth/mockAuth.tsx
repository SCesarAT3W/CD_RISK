/**
 * Mock temporal de Papiro Auth
 *
 * NOTA: Este es un mock temporal. Para usar Papiro Auth real, instala:
 * npm install github:CSanchezAT3W/interfaz-ts-papiro
 *
 * Y reemplaza estos imports con:
 * import { AuthProvider, useAuth, ProtectedRoute } from 'interfaz-ts-papiro/react'
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { logger } from '@/lib/logger'

// Tipos basados en la documentación de Papiro
export interface User {
  id: string
  username: string
  fullName: string
  level: string
  token: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  softwareName: string
  login: (username: string, password: string) => Promise<User>
  logout: () => Promise<void>
  verifyToken: () => Promise<boolean>
}

interface AuthProviderProps {
  softwareName: string
  DEV_MODE?: boolean
  onLogout?: () => void
  onEvent?: (event: unknown) => void
  children: ReactNode
}

const AuthContext = createContext<AuthContextType | null>(null)

/**
 * Mock AuthProvider
 * Simula el comportamiento de Papiro Auth para desarrollo
 */
export function AuthProvider({
  softwareName,
  DEV_MODE = false,
  onLogout,
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verificar token almacenado al iniciar
  useEffect(() => {
    const checkStoredAuth = () => {
      try {
        const storedUser = localStorage.getItem('mock-auth-user')
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        }
      } catch (err) {
        logger.error('Error loading stored user', err as Error)
        localStorage.removeItem('mock-auth-user')
      } finally {
        setIsLoading(false)
      }
    }

    checkStoredAuth()
  }, [])

  const login = useCallback(
    async (username: string, password: string): Promise<User> => {
      setIsLoading(true)
      setError(null)

      try {
        // Simular llamada a API
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock: cualquier usuario/contraseña válida
        if (username && password) {
          const mockUser: User = {
            id: '1',
            username,
            fullName: `Usuario ${username}`,
            level: 'admin',
            token: 'mock-token-' + Date.now(),
          }

          setUser(mockUser)
          localStorage.setItem('mock-auth-user', JSON.stringify(mockUser))

          if (DEV_MODE) {
            logger.info('[Mock Auth] Login successful', mockUser)
          }

          return mockUser
        } else {
          throw new Error('Usuario o contraseña inválidos')
        }
      } catch (err) {
        const error = err as Error
        const errorMessage = error.message || 'Error al iniciar sesión'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [DEV_MODE]
  )

  const logout = useCallback(async () => {
    setIsLoading(true)

    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 500))

      setUser(null)
      setError(null)
      localStorage.removeItem('mock-auth-user')

      if (DEV_MODE) {
        logger.info('[Mock Auth] Logout successful')
      }

      onLogout?.()
    } finally {
      setIsLoading(false)
    }
  }, [DEV_MODE, onLogout])

  const verifyToken = useCallback(async (): Promise<boolean> => {
    if (!user) return false

    try {
      // Simular verificación de token
      await new Promise((resolve) => setTimeout(resolve, 300))
      return true
    } catch {
      return false
    }
  }, [user])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    softwareName,
    login,
    logout,
    verifyToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook para usar el contexto de autenticación
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}

/**
 * Componente para proteger rutas
 */
interface ProtectedRouteProps {
  children: ReactNode
  onNotAuthenticated: () => ReactNode
}

export function ProtectedRoute({ children, onNotAuthenticated }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <>{onNotAuthenticated()}</>
  }

  return <>{children}</>
}
