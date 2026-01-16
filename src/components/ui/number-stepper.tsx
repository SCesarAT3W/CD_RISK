import * as React from 'react'
import { cn } from '@/lib/utils'

interface NumberStepperProps {
  value: number
  onChange: (nextValue: number) => void
  min?: number
  step?: number
  suffix?: string
  className?: string
  ariaLabelMinus?: string
  ariaLabelPlus?: string
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  step = 1,
  suffix,
  className,
  ariaLabelMinus = 'Disminuir',
  ariaLabelPlus = 'Aumentar',
}: NumberStepperProps) {
  const safeValue = Number.isFinite(value) ? value : 0
  const displayValue = suffix ? `${safeValue} ${suffix}` : String(safeValue)

  return (
    <div className={cn('inline-flex items-center overflow-hidden rounded-lg border bg-card', className)}>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center text-lg text-muted-foreground transition hover:bg-accent hover:text-accent-foreground active:bg-accent/80"
        onClick={() => onChange(Math.max(min, safeValue - step))}
        aria-label={ariaLabelMinus}
      >
        −
      </button>
      <div className="flex h-10 w-16 items-center justify-center border-x text-base font-semibold text-primary">
        {displayValue}
      </div>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center text-lg text-muted-foreground transition hover:bg-accent hover:text-accent-foreground active:bg-accent/80"
        onClick={() => onChange(safeValue + step)}
        aria-label={ariaLabelPlus}
      >
        +
      </button>
    </div>
  )
}
