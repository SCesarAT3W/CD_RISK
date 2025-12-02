import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { InfoTooltip } from '@/components/InfoTooltip'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

import type { LossesStepProps } from '@/types/stepProps'
import {
  DUE_TO_FIRE_OPTIONS,
  RISK_OF_PANIC_OPTIONS,
  CONSEQUENCES_OF_DAMAGES_OPTIONS,
  DUE_TO_OVERVOLTAGES_1_OPTIONS,
  LOSS_OF_SERVICES_OPTIONS,
  LOSS_OF_CULTURAL_HERITAGE_OPTIONS,
  SPECIAL_HAZARDS_OPTIONS,
  DUE_TO_FIRE_2_OPTIONS,
  DUE_TO_OVERVOLTAGES_2_OPTIONS,
  DUE_TO_STEP_TOUCH_VOLTAGES_OPTIONS,
  TOLERABLE_RISK_OPTIONS,
  CABLE_SITUATION_OPTIONS,
  CABLE_SHIELDED_OPTIONS,
  TRANSFORMER_MVLV_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  BURIED_SERVICE_TYPE_OPTIONS,
} from '@/config/formConfig'

const isDev = import.meta.env.DEV

const generateMockLosses = () => {
  const random = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
  const randomNum = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

  return {
    dueToFire: random(['A', 'B']),
    riskOfPanic: random(['C', 'D']),
    consequencesOfDamages: random(['No aplica', 'Graves']),
    dueToOvervoltages1: random(['Comun', 'Critico']),
    lossOfServices: random(['No aplica', 'Interrupcion']),
    lossOfCulturalHeritage: random(['No aplica', 'Irreversible']),
    specialHazards: random(['Sin consecuencias', 'Riesgo']),
    dueToFire2: random(['Comun', 'Critico']),
    dueToOvervoltages2: random(['Comun', 'Critico']),
    dueToStepTouchVoltages: random(['Sin riesgo', 'Riesgo']),
    tolerableRisk: random(['1E-03', '1E-04']),
    cableSituation: random(['Aereo', 'Enterrado', 'NoConectado']),
    cableShielded: random(['Apantallado', 'NoApantallado']),
    transformerMVLV: random(['SinTransformador', 'ConTransformador']),
    aerialServicesCount: randomNum(0, 5).toString(),
    aerialServiceType: random(['Coaxial', 'FibraOptica']),
    buriedServicesCount: randomNum(0, 5).toString(),
    buriedServiceType: random(['No aplica', 'Coaxial', 'FibraOptica']),
  }
}

/**
 * Paso 3: Pérdidas
 * Basado en el diseño original de CD-Risk
 */
export function LossesStep({ data, onChange, onBulkChange }: LossesStepProps) {
  const handleAutofill = () => {
    if (onBulkChange) {
      onBulkChange(generateMockLosses())
    }
  }
  return (
    <div className="space-y-4">
      {isDev && (
        <div className="flex justify-end">
          <Button onClick={handleAutofill} variant="outline" size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Autorellenar
          </Button>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Columna izquierda: Tipos de pérdidas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">TIPO 1: PÉRDIDAS DE VIDAS HUMANAS</CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          {/* Por incendios */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="dueToFire" className="col-span-2 flex items-center">
              Por incendios
              <InfoTooltip content="Este apartado se refiere a las consecuencias de un incendio en la estructura, evaluando el riesgo de pérdida de vidas humanas." />
            </Label>
            <div className="col-span-3">
              <Select
                value={data.dueToFire || 'A'}
                onValueChange={(value) => onChange('dueToFire', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DUE_TO_FIRE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Por riesgo de pánico */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="riskOfPanic" className="col-span-2 flex items-center">
              Por riesgo de pánico
              <InfoTooltip content="Se evalúa si existe un riesgo de pánico significativo en la estructura, considerando el número de ocupantes y la dificultad de evacuación." />
            </Label>
            <div className="col-span-3">
              <Select
                value={data.riskOfPanic || 'C'}
                onValueChange={(value) => onChange('riskOfPanic', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RISK_OF_PANIC_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Consecuencia de los daños */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="consequencesOfDamages" className="col-span-2">
              Consecuencia de los daños
            </Label>
            <div className="col-span-3">
              <Select
                value={data.consequencesOfDamages || 'No aplica'}
                onValueChange={(value) => onChange('consequencesOfDamages', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONSEQUENCES_OF_DAMAGES_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Por sobretensiones */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="dueToOvervoltages1" className="col-span-2">
              Por sobretensiones
            </Label>
            <div className="col-span-3">
              <Select
                value={data.dueToOvervoltages1 || 'Comun'}
                onValueChange={(value) => onChange('dueToOvervoltages1', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DUE_TO_OVERVOLTAGES_1_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-4" />

          {/* TIPO 2: PÉRDIDAS DE SERVICIOS ESENCIALES */}
          <CardTitle className="text-primary">TIPO 2: PÉRDIDAS DE SERVICIOS ESENCIALES</CardTitle>

          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="lossOfServices" className="col-span-2">
              Pérdida de servicios
            </Label>
            <div className="col-span-3">
              <Select
                value={data.lossOfServices || 'No aplica'}
                onValueChange={(value) => onChange('lossOfServices', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOSS_OF_SERVICES_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-4" />

          {/* TIPO 3: PÉRDIDAS DE PATRIMONIO CULTURAL */}
          <CardTitle className="text-primary">TIPO 3: PÉRDIDAS DE PATRIMONIO CULTURAL</CardTitle>

          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="lossOfCulturalHeritage" className="col-span-2">
              Pérdida de patrimonio
            </Label>
            <div className="col-span-3">
              <Select
                value={data.lossOfCulturalHeritage || 'No aplica'}
                onValueChange={(value) => onChange('lossOfCulturalHeritage', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOSS_OF_CULTURAL_HERITAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-4" />

          {/* TIPO 4: PÉRDIDAS ECONÓMICAS */}
          <CardTitle className="text-primary">TIPO 4: PÉRDIDAS ECONÓMICAS</CardTitle>

          {/* Riesgos especiales */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="specialHazards" className="col-span-2">
              Riesgos especiales
            </Label>
            <div className="col-span-3">
              <Select
                value={data.specialHazards || 'Sin consecuencias'}
                onValueChange={(value) => onChange('specialHazards', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPECIAL_HAZARDS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Por incendios */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="dueToFire2" className="col-span-2">
              Por incendios
            </Label>
            <div className="col-span-3">
              <Select
                value={data.dueToFire2 || 'Comun'}
                onValueChange={(value) => onChange('dueToFire2', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DUE_TO_FIRE_2_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Por sobretensiones */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="dueToOvervoltages2" className="col-span-2 flex items-center">
              Por sobretensiones
              <InfoTooltip content="Evaluación de pérdidas económicas debido a daños en equipos electrónicos por sobretensiones." />
            </Label>
            <div className="col-span-3">
              <Select
                value={data.dueToOvervoltages2 || 'Comun'}
                onValueChange={(value) => onChange('dueToOvervoltages2', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DUE_TO_OVERVOLTAGES_2_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Por tensión paso/contacto */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="dueToStepTouchVoltages" className="col-span-2">
              Por tensión paso/contacto
            </Label>
            <div className="col-span-3">
              <Select
                value={data.dueToStepTouchVoltages || 'Sin riesgo'}
                onValueChange={(value) => onChange('dueToStepTouchVoltages', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DUE_TO_STEP_TOUCH_VOLTAGES_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Riesgo tolerable de pérdidas */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="tolerableRisk" className="col-span-2 flex items-center">
              Riesgo tolerable de pérdidas
              <InfoTooltip content="Es la probabilidad máxima anual de pérdida que se considera aceptable (Rt). Se define por la normativa en función de la clase de riesgo (por ejemplo, 1 en 10.000 años para un riesgo crítico)." />
            </Label>
            <div className="col-span-3">
              <Select
                value={data.tolerableRisk || '1E-03'}
                onValueChange={(value) => onChange('tolerableRisk', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TOLERABLE_RISK_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Columna derecha: Suministro eléctrico y servicios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">SUMINISTRO ELÉCTRICO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Situación del cable */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="cableSituation" className="col-span-2 flex items-center">
              Situación del cable
              <InfoTooltip content="- Aéreo: Distribución eléctrica al edificio mediante un cable aéreo. - Enterrado: Distribución eléctrica a la estructura mediante un cable subterráneo. - No conectado: No hay línea eléctrica conectada a la estructura." />
            </Label>
            <div className="col-span-3">
              <Select
                value={data.cableSituation || 'Aereo'}
                onValueChange={(value) => onChange('cableSituation', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CABLE_SITUATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cable apantallado */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="cableShielded" className="col-span-2 flex items-center">
              Cable apantallado
              <InfoTooltip content="Se refiere a si el cable de suministro cuenta con un apantallamiento metálico que ofrece cierta protección natural contra interferencias y sobretensiones." />
            </Label>
            <div className="col-span-3">
              <Select
                value={data.cableShielded || 'Apantallado'}
                onValueChange={(value) => onChange('cableShielded', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CABLE_SHIELDED_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Transformador MT/BT */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="transformerMVLV" className="col-span-2">
              Transformador MT/BT
            </Label>
            <div className="col-span-3">
              <Select
                value={data.transformerMVLV || 'SinTransformador'}
                onValueChange={(value) => onChange('transformerMVLV', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSFORMER_MVLV_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-4" />

          {/* OTROS SERVICIOS AÉREOS */}
          <CardTitle className="text-primary">OTROS SERVICIOS AÉREOS</CardTitle>

          {/* Número de servicios */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="aerialServicesCount" className="col-span-2">
              Número de servicios
            </Label>
            <div className="col-span-3">
              <Input
                id="aerialServicesCount"
                type="number"
                value={data.aerialServicesCount || '1'}
                onChange={(e) => onChange('aerialServicesCount', e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Tipo de cable */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="aerialServiceType" className="col-span-2">
              Tipo de cable
            </Label>
            <div className="col-span-3">
              <Select
                value={data.aerialServiceType || 'Coaxial'}
                onValueChange={(value) => onChange('aerialServiceType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-4" />

          {/* OTROS SERVICIOS ENTERRADOS */}
          <CardTitle className="text-primary">OTROS SERVICIOS ENTERRADOS</CardTitle>

          {/* Número de servicios */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="buriedServicesCount" className="col-span-2">
              Número de servicios
            </Label>
            <div className="col-span-3">
              <Input
                id="buriedServicesCount"
                type="number"
                value={data.buriedServicesCount || '0'}
                onChange={(e) => onChange('buriedServicesCount', e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Tipo de cable */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="buriedServiceType" className="col-span-2">
              Tipo de cable
            </Label>
            <div className="col-span-3">
              <Select
                value={data.buriedServiceType || 'No aplica'}
                onValueChange={(value) => onChange('buriedServiceType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BURIED_SERVICE_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
