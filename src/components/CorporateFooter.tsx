import { Link } from 'react-router'
import { Facebook, Linkedin, Youtube } from 'lucide-react'

/**
 * Footer corporativo de Aplicaciones Tecnológicas
 * Replicando el diseño original con React y Tailwind
 */
export function CorporateFooter() {
  return (
    <footer className="mt-auto bg-primary py-4 text-primary-foreground/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-3 text-xs md:flex-row">
          {/* Links legales */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <span>© 2025 APLICACIONES TECNOLOGICAS S.A.</span>
            <span className="hidden md:inline">|</span>
            <Link
              to="/legal"
              className="text-primary-foreground/50 transition-colors hover:text-primary-foreground"
            >
              Aviso legal
            </Link>
            <span className="hidden md:inline">|</span>
            <Link
              to="/privacy"
              className="text-primary-foreground/50 transition-colors hover:text-primary-foreground"
            >
              Política de privacidad
            </Link>
            <span className="hidden md:inline">|</span>
            <Link
              to="/cookies"
              className="text-primary-foreground/50 transition-colors hover:text-primary-foreground"
            >
              Cookies
            </Link>
            <span className="hidden md:inline">|</span>
            <Link
              to="/system-info"
              className="text-primary-foreground/50 transition-colors hover:text-primary-foreground"
            >
              Sistema de información interno
            </Link>
          </div>

          {/* Contacto y Redes Sociales */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span>(+34) 96 131 82 50</span>
            <span className="hidden md:inline">|</span>
            <a
              href="mailto:email@at3w.com"
              className="text-primary-foreground/50 transition-colors hover:text-primary-foreground"
            >
              email@at3w.com
            </a>
            <div className="ml-2 flex items-center gap-2">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/50 transition-colors hover:text-primary-foreground"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/50 transition-colors hover:text-primary-foreground"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/50 transition-colors hover:text-primary-foreground"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
