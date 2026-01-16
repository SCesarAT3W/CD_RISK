import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PararrayosNavigationProps {
  currentIndex: number
  totalCount: number
  onPrevious: () => void
  onNext: () => void
}

/**
 * Componente de navegación entre pararrayos
 * Compartido entre Esquema de Protección (Step 5) y Protección Externa (Step 6)
 */
function PararrayosNavigationInner({
  currentIndex,
  totalCount,
  onPrevious,
  onNext,
}: PararrayosNavigationProps) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-md p-3">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="h-7 w-7 p-0 rounded-md border border-input bg-card shadow-none"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-semibold text-primary">
        Pararrayos {currentIndex + 1}
      </span>
      <Button
        variant="outline"
        onClick={onNext}
        disabled={currentIndex === totalCount - 1}
        className="h-7 w-7 p-0 rounded-md border border-input bg-card shadow-none"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export const PararrayosNavigation = memo(
  PararrayosNavigationInner,
  (prevProps, nextProps) => {
    return (
      prevProps.currentIndex === nextProps.currentIndex &&
      prevProps.totalCount === nextProps.totalCount &&
      prevProps.onPrevious === nextProps.onPrevious &&
      prevProps.onNext === nextProps.onNext
    )
  }
)
