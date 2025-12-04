import { memo } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { InfoTooltip } from '@/components/InfoTooltip'

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

/**
 * Paso 3: Pérdidas
 * Basado en el diseño original de CD-Risk
 */
function LossesStepInner({ data, onChange, onBulkChange }: LossesStepProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Columna izquierda: Tipos de pérdidas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">TIPO 1: PÉRDIDAS DE VIDAS HUMANAS</CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          {/* Por incendios */}
          <div className="space-y-2">
            <Label htmlFor="dueToFire" className="flex items-center">
              Por incendios
              <InfoTooltip content="Este apartado se refiere a las consecuencias de un incendio en la estructura, evaluando el riesgo de pérdida de vidas humanas." />
            </Label>
            <Select value={data.dueToFire || ''} onValueChange={(value) => onChange('dueToFire', value)}>
              <SelectTrigger id="dueToFire">
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

          {/* Por riesgo de pánico */}
          <div className="space-y-2">
            <Label htmlFor="riskOfPanic" className="flex items-center">
              Por riesgo de pánico
              <InfoTooltip content="Se evalúa si existe un riesgo de pánico significativo en la estructura, considerando el número de ocupantes y la dificultad de evacuación." />
            </Label>
            <Select value={data.riskOfPanic || ''} onValueChange={(value) => onChange('riskOfPanic', value)}>
              <SelectTrigger id="riskOfPanic">
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

          {/* Consecuencia de los daños */}
          <div className="space-y-2">
            <Label htmlFor="consequencesOfDamages">
              Consecuencia de los daños
            </Label>
            <Select value={data.consequencesOfDamages || ''} onValueChange={(value) => onChange('consequencesOfDamages', value)}>
              <SelectTrigger id="consequencesOfDamages">
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

          {/* Por sobretensiones */}
          <div className="space-y-2">
            <Label htmlFor="dueToOvervoltages1">
              Por sobretensiones
            </Label>
            <Select value={data.dueToOvervoltages1 || ''} onValueChange={(value) => onChange('dueToOvervoltages1', value)}>
              <SelectTrigger id="dueToOvervoltages1">
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

          <Separator className="my-4" />

          {/* TIPO 2: PÉRDIDAS DE SERVICIOS ESENCIALES */}
          <CardTitle className="text-primary">TIPO 2: PÉRDIDAS DE SERVICIOS ESENCIALES</CardTitle>

          <div className="space-y-2">
            <Label htmlFor="lossOfServices">
              Pérdida de servicios
            </Label>
            <Select value={data.lossOfServices || ''} onValueChange={(value) => onChange('lossOfServices', value)}>
              <SelectTrigger id="lossOfServices">
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

          <Separator className="my-4" />

          {/* TIPO 3: PÉRDIDAS DE PATRIMONIO CULTURAL */}
          <CardTitle className="text-primary">TIPO 3: PÉRDIDAS DE PATRIMONIO CULTURAL</CardTitle>

          <div className="space-y-2">
            <Label htmlFor="lossOfCulturalHeritage">
              Pérdida de patrimonio
            </Label>
            <Select value={data.lossOfCulturalHeritage || ''} onValueChange={(value) => onChange('lossOfCulturalHeritage', value)}>
              <SelectTrigger id="lossOfCulturalHeritage">
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

          <Separator className="my-4" />

          {/* TIPO 4: PÉRDIDAS ECONÓMICAS */}
          <CardTitle className="text-primary mb-4">TIPO 4: PÉRDIDAS ECONÓMICAS</CardTitle>

          <div className="grid grid-cols-2 gap-4">
            {/* Columna izquierda */}
            <div className="space-y-4">
              {/* Riesgos especiales */}
              <div className="space-y-2">
                <Label htmlFor="specialHazards">
                  Riesgos especiales
                </Label>
                <Select value={data.specialHazards || ''} onValueChange={(value) => onChange('specialHazards', value)}>
                  <SelectTrigger id="specialHazards">
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

              {/* Por incendios */}
              <div className="space-y-2">
                <Label htmlFor="dueToFire2">
                  Por incendios
                </Label>
                <Select value={data.dueToFire2 || ''} onValueChange={(value) => onChange('dueToFire2', value)}>
                  <SelectTrigger id="dueToFire2">
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

              {/* Por sobretensiones */}
              <div className="space-y-2">
                <Label htmlFor="dueToOvervoltages2" className="flex items-center">
                  Por sobretensiones
                  <InfoTooltip content="Evaluación de pérdidas económicas debido a daños en equipos electrónicos por sobretensiones." />
                </Label>
                <Select value={data.dueToOvervoltages2 || ''} onValueChange={(value) => onChange('dueToOvervoltages2', value)}>
                  <SelectTrigger id="dueToOvervoltages2">
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

            {/* Columna derecha */}
            <div className="space-y-4">
              {/* Por tensión paso/contacto */}
              <div className="space-y-2">
                <Label htmlFor="dueToStepTouchVoltages">
                  Por tensión paso/contacto
                </Label>
                <Select value={data.dueToStepTouchVoltages || ''} onValueChange={(value) => onChange('dueToStepTouchVoltages', value)}>
                  <SelectTrigger id="dueToStepTouchVoltages">
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

              {/* Riesgo tolerable de pérdidas */}
              <div className="space-y-2">
                <Label htmlFor="tolerableRisk" className="flex items-center">
                  Riesgo tolerable de pérdidas
                  <InfoTooltip content="Es la probabilidad máxima anual de pérdida que se considera aceptable (Rt). Se define por la normativa en función de la clase de riesgo (por ejemplo, 1 en 10.000 años para un riesgo crítico)." />
                </Label>
                <Select value={data.tolerableRisk || ''} onValueChange={(value) => onChange('tolerableRisk', value)}>
                  <SelectTrigger id="tolerableRisk">
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
          <div className="space-y-2">
            <Label htmlFor="cableSituation" className="flex items-center">
              Situación del cable
              <InfoTooltip content="- Aéreo: Distribución eléctrica al edificio mediante un cable aéreo. - Enterrado: Distribución eléctrica a la estructura mediante un cable subterráneo. - No conectado: No hay línea eléctrica conectada a la estructura." />
            </Label>
            <Select value={data.cableSituation || ''} onValueChange={(value) => onChange('cableSituation', value)}>
              <SelectTrigger id="cableSituation">
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

          {/* Cable apantallado */}
          <div className="space-y-2">
            <Label htmlFor="cableShielded" className="flex items-center">
              Cable apantallado
              <InfoTooltip content="Se refiere a si el cable de suministro cuenta con un apantallamiento metálico que ofrece cierta protección natural contra interferencias y sobretensiones." />
            </Label>
            <Select value={data.cableShielded || ''} onValueChange={(value) => onChange('cableShielded', value)}>
              <SelectTrigger id="cableShielded">
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

          {/* Transformador MT/BT */}
          <div className="space-y-2">
            <Label htmlFor="transformerMVLV">
              Transformador MT/BT
            </Label>
            <Select value={data.transformerMVLV || ''} onValueChange={(value) => onChange('transformerMVLV', value)}>
              <SelectTrigger id="transformerMVLV">
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

          <Separator className="my-4" />

          {/* OTROS SERVICIOS AÉREOS */}
          <CardTitle className="text-primary">OTROS SERVICIOS AÉREOS</CardTitle>

          {/* Número de servicios + Tipo de cable en la misma fila */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aerialServicesCount">
                Número de servicios
              </Label>
              <Input
                id="aerialServicesCount"
                value={data.aerialServicesCount || ''}
                onChange={(e) => onChange('aerialServicesCount', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aerialServiceType">
                Tipo de cable
              </Label>
              <Select value={data.aerialServiceType || ''} onValueChange={(value) => onChange('aerialServiceType', value)}>
                <SelectTrigger id="aerialServiceType">
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

          {/* Número de servicios + Tipo de cable en la misma fila */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buriedServicesCount">
                Número de servicios
              </Label>
              <Input
                id="buriedServicesCount"
                value={data.buriedServicesCount || ''}
                onChange={(e) => onChange('buriedServicesCount', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buriedServiceType">
                Tipo de cable
              </Label>
              <Select value={data.buriedServiceType || ''} onValueChange={(value) => onChange('buriedServiceType', value)}>
                <SelectTrigger id="buriedServiceType">
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

export const LossesStep = memo(LossesStepInner)
