import * as React from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface CardSelectOption {
  value: string
  label: string
}

export interface CardSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  options: CardSelectOption[]
  className?: string
  /**
   * Layout mode: 'grid' for multi-column layout, 'stack' for vertical stacking
   */
  layout?: 'grid' | 'stack'
  /**
   * Number of columns when layout is 'grid'
   */
  columns?: 2 | 3 | 4
}

// Generar ID único para evitar conflictos
let uniqueIdCounter = 0

/**
 * CardSelect - Selector de opciones con estilo de tarjetas/botones
 *
 * Componente que renderiza opciones como tarjetas clickeables,
 * perfecto para selectores visuales con pocas opciones.
 */
const CardSelectInner = React.forwardRef<HTMLDivElement, CardSelectProps>(
  ({ value, onValueChange, options, className, layout = 'grid', columns = 2 }, ref) => {
    // Generar un ID único para este componente
    const instanceId = React.useRef(`card-select-${++uniqueIdCounter}`)

    // Memoizar el className del grid
    const gridClassName = React.useMemo(
      () =>
        cn(
          layout === 'grid'
            ? `grid gap-3 items-stretch auto-rows-fr ${
              columns === 2 ? 'grid-cols-2' : columns === 3 ? 'grid-cols-3' : 'grid-cols-4'
            }`
            : 'flex flex-col items-stretch gap-3',
          className
        ),
      [layout, columns, className]
    )

    return (
      <RadioGroup
        ref={ref}
        value={value}
        onValueChange={onValueChange}
        className={gridClassName}
      >
        {options.map((option) => {
          const isSelected = value === option.value
          const optionId = `${instanceId.current}-${option.value}`

          return (
            <div key={option.value} className="relative h-full">
              <RadioGroupItem
                value={option.value}
                id={optionId}
                className="peer sr-only"
              />
              <Label
                htmlFor={optionId}
                className={cn(
                  'flex h-full min-h-[44px] cursor-pointer items-center justify-center rounded-md border-2 px-4 py-3 text-center text-sm font-medium transition-all',
                  'hover:bg-accent hover:text-accent-foreground',
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted bg-background text-foreground'
                )}
              >
                {option.label}
              </Label>
            </div>
          )
        })}
      </RadioGroup>
    )
  }
)

CardSelectInner.displayName = 'CardSelect'

// Habilitar tracking de why-did-you-render en desarrollo
if (import.meta.env.DEV) {
  // @ts-expect-error - whyDidYouRender property
  CardSelectInner.whyDidYouRender = true
}

// Memoizar el componente para evitar re-renders innecesarios
// La función de comparación retorna true si las props son IGUALES (NO re-renderizar)
export const CardSelect = React.memo(CardSelectInner)
