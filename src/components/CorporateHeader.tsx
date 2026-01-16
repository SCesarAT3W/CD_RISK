import { Link } from 'react-router'
import { memo } from 'react'
import { useAuth } from '@/lib/auth/mockAuth'
import { LogOut } from 'lucide-react'
import { logger } from '@/lib/logger'

/**
 * Header corporativo de Aplicaciones Tecnológicas
 * Replicando el diseño original con React y Tailwind
 */
function CorporateHeaderComponent() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      logger.error('Logout error', err as Error)
    }
  }

  return (
    <header className="group bg-primary py-3 text-primary-foreground transition-all hover:py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <div className="logo">
          <Link to="/">
            <img
              src="/ATSA logo.png"
              alt="Aplicaciones Tecnológicas"
              className="h-auto max-h-[38px] w-auto"
            />
          </Link>
        </div>

        {/* Navegación superior - se muestra al hacer hover */}
        <nav className="top-nav">
          <ul className="mb-0 flex list-none items-center gap-6 text-sm font-normal">
            <li className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Link
                to="/"
                className="text-muted-foreground transition-colors hover:text-primary-foreground"
              >
                WEB
              </Link>
            </li>
            <li className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Link
                to="/portal"
                className="text-muted-foreground transition-colors hover:text-primary-foreground"
              >
                PORTAL
              </Link>
            </li>
            <li className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Link
                to="/languages"
                className="text-muted-foreground transition-colors hover:text-primary-foreground"
              >
                IDIOMAS
              </Link>
            </li>
            <li className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Link
                to="/contact"
                className="text-muted-foreground transition-colors hover:text-primary-foreground"
              >
                CONTACTO
              </Link>
            </li>
            <li className="border-l border-primary-foreground/30 pl-6">
              <div className="flex items-center gap-2">
                <span className="text-primary-foreground">
                  {user?.fullName || user?.username || 'USUARIO-01'}
                </span>
                <span className="text-primary-foreground/70">|</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-primary-foreground transition-colors hover:text-accent"
                >
                  <LogOut className="h-3 w-3" />
                  SALIR
                </button>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

// Evita re-render si el padre cambia sin que cambie el contexto de auth
export const CorporateHeader = memo(CorporateHeaderComponent)
CorporateHeader.displayName = 'CorporateHeader'
