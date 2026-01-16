import { memo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calculator, Square } from 'lucide-react'
import { toast } from 'sonner'
import type { ResultsStepProps } from '@/types/stepProps'
import { determineProtectionLevel } from '@/lib/calculations/riskCalculations'

interface RiskResult {
  type: string
  tolerableRisk: string
  initialRisk: string
  proposedRisk: string
  isInitialDanger: boolean
}

interface SolutionCardProps {
  title: string
  value: string
}

function SolutionCard({ title, value }: SolutionCardProps) {
  return (
    <Card className="p-4 w-80 bg-[var(--brand-navy)] text-[var(--brand-navy-foreground)]">
      <div className="flex justify-between items-center">
        <p className="font-bold text-sm">{title}</p>
        <div className="flex items-center justify-center w-5 h-5 rounded-[5px] p-0.5 bg-[var(--brand-navy-foreground)]/10">
          <Square className="h-[15px] w-[15px]" />
        </div>
      </div>
      <div className="mt-2">
        <h4 className="text-2xl font-bold">{value}</h4>
      </div>
    </Card>
  )
}

/**
 * Paso 4: Resultados del Cálculo
 * Basado en el diseño original de CD-Risk
 */
function ResultsStepInner({ data, onChange }: ResultsStepProps) {
  // Datos iniciales de riesgos (simulados - en producción vendrían de cálculos reales)
  const initialRisks: RiskResult[] = [
    {
      type: 'Pérdidas de vidas humanas',
      tolerableRisk: '1.00E-05',
      initialRisk: '9.70E-4',
      proposedRisk: 'N/A',
      isInitialDanger: true,
    },
    {
      type: 'Pérdidas de servicios públicos',
      tolerableRisk: '1.00E-03',
      initialRisk: '0.00E+0',
      proposedRisk: 'N/A',
      isInitialDanger: false,
    },
    {
      type: 'Pérdidas de patrimonio',
      tolerableRisk: '1.00E-04',
      initialRisk: '0.00E+0',
      proposedRisk: 'N/A',
      isInitialDanger: false,
    },
    {
      type: 'Pérdidas económicas',
      tolerableRisk: '1.00E-03',
      initialRisk: '9.70E-3',
      proposedRisk: 'N/A',
      isInitialDanger: true,
    },
  ]

  // Estados locales - se sincronizan con los datos del formulario
  const [risks, setRisks] = useState<RiskResult[]>(data.calculatedRisks || initialRisks)
  const [protectionLevel, setProtectionLevel] = useState(data.protectionLevel ? `NIVEL ${data.protectionLevel}` : 'Sin protección')
  const [internalProtection, setInternalProtection] = useState(data.internalProtection || 'Sin protección')
  const [solutionCalculated, setSolutionCalculated] = useState(!!data.calculatedRisks)

  const handleCalculateSolution = () => {
    // Verificar que hay datos suficientes antes de calcular
    if (!data.calculationNormative) {
      toast.error('Por favor selecciona una normativa en el Paso 1')
      return
    }

    if (!data.height && !data.typeOfStructure) {
      toast.error('Por favor completa la altura o tipo de estructura en el Paso 2')
      return
    }

    // Simular el cálculo de la solución
    const updatedRisks = risks.map((risk, index) => {
      if (index === 0) {
        // R1: Pérdidas de vidas humanas
        return { ...risk, proposedRisk: '8.91E-6' }
      } else if (index === 1) {
        // R2: Pérdidas de servicios públicos
        return { ...risk, proposedRisk: '0.00E+0' }
      } else if (index === 2) {
        // R3: Pérdidas de patrimonio
        return { ...risk, proposedRisk: '0.00E+0' }
      } else {
        // R4: Pérdidas económicas
        return { ...risk, proposedRisk: '1.10E-5' }
      }
    })

    // Determinar nivel de protección según normativa seleccionada
    const normative = data.calculationNormative || 'lightning' // Por defecto IEC 62305
    const R1_value = parseFloat(risks[0].initialRisk) || 9.70e-4
    const structureHeight = data.height ? parseFloat(data.height) : 20 // Convertir string a number

    const calculatedLevel = determineProtectionLevel(
      normative,
      R1_value,
      data.typeOfStructure,
      structureHeight
    )

    const levelText = calculatedLevel === 'none' ? 'Sin protección' : `NIVEL ${calculatedLevel}`

    setRisks(updatedRisks)
    setProtectionLevel(levelText)
    setInternalProtection('Protección Coordinada')
    setSolutionCalculated(true)

    // Guardar en el estado del formulario
    onChange('calculatedRisks', updatedRisks)
    onChange('protectionLevel', calculatedLevel === 'none' ? undefined : calculatedLevel)
    onChange('internalProtection', 'Protección Coordinada')
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Riesgos Calculados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="border-separate border-spacing-y-[10px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3"></TableHead>
                <TableHead className="text-center">Riesgo Tolerable (Rt)</TableHead>
                <TableHead className="text-center">Riesgo Calculado (R) Inicial</TableHead>
                <TableHead className="text-center">Riesgo Calculado (R) Propuesto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {risks.map((risk, index) => (
                <TableRow key={index}>
                  <TableCell className="font-bold px-[13px] py-[6px] border-y border-l border-[var(--border-subtle)] rounded-l-[5px]">{risk.type}</TableCell>
                  <TableCell className="text-center px-[13px] py-[6px] border-y border-[var(--border-subtle)]">{risk.tolerableRisk}</TableCell>
                  <TableCell className="px-[13px] py-[6px] border-y border-[var(--border-subtle)] text-center">
                    <span
                      className={`inline-block w-[180px] text-center font-bold px-[13px] py-[6px] rounded-[5px] border-[0.5px] ${
                        risk.isInitialDanger
                          ? 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger)]'
                          : 'bg-[var(--status-ok-bg)] text-[var(--status-ok)] border-[var(--status-ok)]'
                      }`}
                    >
                      R{index + 1} = {risk.initialRisk}
                    </span>
                  </TableCell>
                  <TableCell className="px-[13px] py-[6px] border-y border-r border-[var(--border-subtle)] rounded-r-[5px] text-center">
                    <span className="inline-block w-[180px] text-center font-bold px-[13px] py-[6px] rounded-[5px] border-[0.5px] bg-muted text-[var(--brand-navy)] border-[var(--brand-navy)]">
                      {risk.proposedRisk} 
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 flex justify-end">
            <Button
              size="lg"
              onClick={handleCalculateSolution}
              className="bg-primary hover:bg-primary/90"
            >
              <Calculator className="mr-2 h-5 w-5" />
              {solutionCalculated ? 'Recalcular Solución' : 'Calcular Solución'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {solutionCalculated && (
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Solución</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6">
              <SolutionCard title="Nivel de protección adecuado" value={protectionLevel} />
              <SolutionCard title="Tipo de protección interna" value={internalProtection} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Comparador personalizado: solo re-renderizar si cambian los campos de este Step
export const ResultsStep = memo(ResultsStepInner, (prevProps, nextProps) => {
  const prevData = prevProps.data
  const nextData = nextProps.data

  // Comparar arrays de forma profunda
  const risksEqual =
    JSON.stringify(prevData.calculatedRisks) === JSON.stringify(nextData.calculatedRisks)

  return (
    risksEqual &&
    prevData.protectionLevel === nextData.protectionLevel &&
    prevData.internalProtection === nextData.internalProtection &&
    prevData.calculationNormative === nextData.calculationNormative &&
    prevData.height === nextData.height &&
    prevData.typeOfStructure === nextData.typeOfStructure &&
    prevProps.onChange === nextProps.onChange
  )
})
