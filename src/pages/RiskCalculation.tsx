import { useState } from 'react'
import { CorporateLayout } from '@/components/CorporateLayout'
import { CorporateStepper, type Step } from '@/components/CorporateStepper'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ProjectDataStep } from './RiskSteps/ProjectDataStep'
import { DimensionsStep } from './RiskSteps/DimensionsStep'
import { LossesStep } from './RiskSteps/LossesStep'
import { ResultsStep } from './RiskSteps/ResultsStep'
import { ProtectionSchemeStep } from './RiskSteps/ProtectionSchemeStep'
import { ExternalProtectionStep } from './RiskSteps/ExternalProtectionStep'
import { InternalProtectionStep } from './RiskSteps/InternalProtectionStep'
import { QuoteRequestStep } from './RiskSteps/QuoteRequestStep'
import { useRiskForm } from '@/hooks/useRiskForm'
import { Loader2, Copy, Download, CheckCircle2 } from 'lucide-react'
import { logger } from '@/lib/logger'

/**
 * Aplicación de Cálculo de Riesgo CD-Risk
 * Basada en el diseño original con formularios reales
 * Gestión de estado con TanStack Query
 */
export function RiskCalculation() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showResultModal, setShowResultModal] = useState(false)
  const [copied, setCopied] = useState(false)

  // Usar TanStack Query para gestionar el estado del formulario
  const { formData, isLoading, updateField, updateFields, isSaving, validateFormStep } = useRiskForm()

  // Definir los pasos del wizard (basado en el diseño original)
  const steps: Step[] = [
    { id: 'project_data', title: 'Datos del Proyecto', number: 1 },
    { id: 'dimensions', title: 'Dimensiones', number: 2 },
    { id: 'losses', title: 'Pérdidas', number: 3 },
    { id: 'calculation_results', title: 'Resultados', number: 4 },
    { id: 'protection_scheme_map', title: 'Esquema Protección', number: 5 },
    { id: 'external_protection', title: 'Prot. Externa', number: 6 },
    { id: 'internal_protection', title: 'Prot. Interna', number: 7 },
    { id: 'request_quote', title: 'Solicitar Presupuesto', number: 8 },
  ]

  const currentStepData = steps[currentStep]

  const handleStepClick = (index: number) => {
    // Solo permitir navegar a pasos completados o el actual
    if (index <= currentStep) {
      setCurrentStep(index)
    }
  }

  const handleNext = () => {
    // Solo validar pasos críticos (project_data y dimensions)
    const currentStepId = steps[currentStep].id
    const criticalSteps = ['project_data', 'dimensions']

    if (criticalSteps.includes(currentStepId)) {
      if (!validateFormStep(currentStepId)) {
        return // Detener si hay errores de validación
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleDataChange = (field: string, value: unknown) => {
    // Usar TanStack Query mutation para actualizar el formulario
    updateField(field, value)
  }

  const handleFinish = () => {
    // Abrir modal con resultado JSON
    setShowResultModal(true)
  }

  const handleCopyJSON = async () => {
    const jsonString = JSON.stringify(formData, null, 2)
    try {
      await navigator.clipboard.writeText(jsonString)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      logger.error('Error copying to clipboard', err as Error)
    }
  }

  const handleDownloadJSON = () => {
    const jsonString = JSON.stringify(formData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cd-risk-${formData.projectName || 'calculacion'}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Mostrar loading mientras se cargan los datos
  if (isLoading) {
    return (
      <CorporateLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando formulario...</p>
          </div>
        </div>
      </CorporateLayout>
    )
  }

  // Renderizar el contenido del paso actual
  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'project_data':
        return <ProjectDataStep data={formData} onChange={handleDataChange} onBulkChange={updateFields} />

      case 'dimensions':
        return <DimensionsStep data={formData} onChange={handleDataChange} onBulkChange={updateFields} />

      case 'losses':
        return <LossesStep data={formData} onChange={handleDataChange} onBulkChange={updateFields} />

      case 'calculation_results':
        return <ResultsStep data={formData} onChange={handleDataChange} />

      case 'protection_scheme_map':
        return <ProtectionSchemeStep data={formData} onChange={handleDataChange} onBulkChange={updateFields} />

      case 'external_protection':
        return <ExternalProtectionStep data={formData} onChange={handleDataChange} onBulkChange={updateFields} />

      case 'internal_protection':
        return <InternalProtectionStep data={formData} onChange={handleDataChange} onBulkChange={updateFields} />

      case 'request_quote':
        return <QuoteRequestStep data={formData} onChange={handleDataChange} />

      default:
        return (
          <div className="min-h-[400px] space-y-4">
            <h2 className="text-2xl font-bold text-primary">{currentStepData.title}</h2>
            <div className="rounded-md border border-accent/20 bg-accent/5 p-4">
              <p className="text-muted-foreground">
                Paso <strong>{currentStepData.number}</strong>: {currentStepData.title}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Contenido del formulario en desarrollo...
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <CorporateLayout>
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-2">
        <BreadcrumbList className="rounded-md bg-muted p-3">
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-primary">
              Cálculo de Riesgo
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentStepData.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Stepper */}
      <CorporateStepper
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
        className="mb-8"
      />

      {/* Contenido del paso actual */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          {renderStepContent()}

          {/* Botones de navegación */}
          <div className="mt-8 flex items-center justify-between border-t pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0 || isSaving}
              size="lg"
            >
              Anterior
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Paso {currentStep + 1} de {steps.length}</span>
              {isSaving && <span className="text-primary">(Guardando...)</span>}
            </div>

            <Button
              onClick={currentStep === steps.length - 1 ? handleFinish : handleNext}
              disabled={isSaving}
              size="lg"
            >
              {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal con resultado JSON */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">Resultado del Cálculo de Riesgo</DialogTitle>
            <DialogDescription>
              Datos completos del formulario en formato JSON
            </DialogDescription>
          </DialogHeader>

          <div className="relative max-h-[50vh] overflow-auto rounded-md border bg-muted p-4">
            <pre className="text-xs">
              <code>{JSON.stringify(formData, null, 2)}</code>
            </pre>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setShowResultModal(false)}>
              Cerrar
            </Button>
            <Button variant="outline" onClick={handleCopyJSON}>
              {copied ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar JSON
                </>
              )}
            </Button>
            <Button onClick={handleDownloadJSON} className="bg-primary hover:bg-primary/90">
              <Download className="mr-2 h-4 w-4" />
              Descargar JSON
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CorporateLayout>
  )
}
