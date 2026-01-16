import { cn } from '@/lib/utils'

export interface Step {
  id: string
  title: string
  number: number
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (index: number) => void
  completedSteps?: number[]
  className?: string
}

/**
 * Stepper horizontal corporativo
 * Replicando el diseño original del stepper de AT con shadcn/ui
 */
export function Stepper({
  steps,
  currentStep,
  onStepClick,
  completedSteps = [],
  className,
}: StepperProps) {
  return (
    <div
      className={cn('relative rounded-lg bg-card px-4 py-6 shadow-[0px_0px_4px_0px_var(--shadow-10)]', className)}
    >
      {/* Línea conectora de fondo */}
      <div className="absolute left-8 right-8 top-11 h-px bg-border/50" aria-hidden="true" />

      {/* Contenedor de pasos */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = completedSteps.includes(index) || index < currentStep
          const isClickable = onStepClick && (isCompleted || index <= currentStep)

          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick?.(index)}
              disabled={!isClickable}
              className={cn(
                'group relative flex flex-1 flex-col items-center gap-2 transition-all',
                isClickable && 'cursor-pointer',
                !isClickable && 'cursor-default'
              )}
            >
              {/* Círculo numerado */}
              <div
                className={cn(
                  'relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold transition-all',
                  // Estado activo
                  isActive && 'bg-accent text-primary',
                  // Estado completado
                  isCompleted && !isActive && 'bg-primary text-primary-foreground',
                  // Estado pendiente
                  !isActive && !isCompleted && 'text-muted-foreground'
                )}
                style={{
                  boxShadow: !isActive && !isCompleted ? 'none' : '0px 4px 8px 0px var(--shadow-15)',
                  backgroundColor: !isActive && !isCompleted ? 'var(--brand-navy-12)' : undefined
                }}
              >
                {step.number}
              </div>

              {/* Título del paso */}
              <div
                className={cn(
                  'text-center text-sm transition-all',
                  // Texto activo
                  isActive && 'font-bold text-primary',
                  // Texto completado
                  isCompleted && !isActive && 'font-medium text-primary',
                  // Texto pendiente
                  !isActive && !isCompleted && 'font-normal text-muted-foreground',
                  // Truncar texto si es muy largo
                  'max-w-full overflow-hidden text-ellipsis whitespace-nowrap px-1'
                )}
              >
                {step.title}
              </div>

              {/* Efecto hover para pasos clickables */}
              {isClickable && (
                <div className="absolute inset-0 -z-10 rounded-lg transition-all group-hover:bg-accent/5" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
