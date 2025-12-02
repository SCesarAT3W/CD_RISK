import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { useAuth } from '@/lib/auth/mockAuth'
import { Layout } from './Layout'

/**
 * Layout para rutas protegidas
 * Verifica autenticación y redirige al login si es necesario
 */
export function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, isLoading, navigate])

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
    return null
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}
