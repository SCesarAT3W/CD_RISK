import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    <div className="flex items-center justify-center gap-2 rounded-md p-3">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={currentIndex + 1}
          readOnly
          className="h-8 w-16 text-center"
        />
        <span className="text-sm text-muted-foreground">
          de {totalCount}
        </span>
      </div>
      <Button
        variant="outline"
        onClick={onNext}
        disabled={currentIndex === totalCount - 1}
        className="h-8 w-8 p-0"
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
