import type { ReactNode } from 'react'
import { CorporateHeader } from './CorporateHeader'
import { CorporateFooter } from './CorporateFooter'

interface CorporateLayoutProps {
  children: ReactNode
  className?: string
}

/**
 * Layout corporativo principal
 * Sin sidebar, con header y footer fijos
 * Replicando el diseño original de CD-Risk
 *
 * NOTA: No usamos memo() aquí porque children siempre cambia en cada render.
 * En su lugar, CorporateHeader y CorporateFooter tienen memo() para evitar re-renders innecesarios.
 */
export function CorporateLayout({ children, className }: CorporateLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <CorporateHeader />

      <main className={`container mx-auto flex-1 px-4 ${className || ''}`}>
        {children}
      </main>

      <CorporateFooter />
    </div>
  )
}
