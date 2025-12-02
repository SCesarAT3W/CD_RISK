import { type ReactNode } from 'react'
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
 */
export function CorporateLayout({ children, className }: CorporateLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <CorporateHeader />

      <main className={`container mx-auto flex-1 px-4 py-6 ${className || ''}`}>
        {children}
      </main>

      <CorporateFooter />
    </div>
  )
}
