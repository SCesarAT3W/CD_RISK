import { memo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calculator } from 'lucide-react'
import type { ResultsStepProps } from '@/types/stepProps'
import { determineProtectionLevel } from '@/lib/calculations/riskCalculations'

interface RiskResult {
  type: string
  tolerableRisk: string
  initialRisk: string
  proposedRisk: string
  isInitialDanger: boolean
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
      alert('Por favor selecciona una normativa en el Paso 1')
      return
    }

    if (!data.height && !data.typeOfStructure) {
      alert('Por favor completa la altura o tipo de estructura en el Paso 2')
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Resultados del Cálculo</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">RIESGOS CALCULADOS</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
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
                  <TableCell className="font-bold">{risk.type}</TableCell>
                  <TableCell className="text-center">{risk.tolerableRisk}</TableCell>
                  <TableCell
                    className={`text-center font-bold ${
                      risk.isInitialDanger
                        ? 'bg-destructive text-destructive-foreground'
                        : 'bg-green-600 text-white'
                    }`}
                  >
                    R{index + 1} = {risk.initialRisk}
                  </TableCell>
                  <TableCell
                    className={`text-center font-bold ${
                      solutionCalculated && risk.proposedRisk !== 'N/A'
                        ? 'bg-green-600 text-white'
                        : 'bg-muted'
                    }`}
                  >
                    {risk.proposedRisk}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 flex justify-center">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">SOLUCIÓN</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Nivel de protección adecuado */}
            <div className="space-y-2">
              <p className="text-center font-bold">Nivel de protección adecuado</p>
              <Card
                className={`p-4 text-center ${
                  solutionCalculated
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <h4 className="text-2xl font-bold">{protectionLevel}</h4>
              </Card>
            </div>

            {/* Tipo de protección interna */}
            <div className="space-y-2">
              <p className="text-center font-bold">Tipo de protección interna</p>
              <Card
                className={`p-4 text-center ${
                  solutionCalculated
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <h4 className="text-2xl font-bold">{internalProtection}</h4>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
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
