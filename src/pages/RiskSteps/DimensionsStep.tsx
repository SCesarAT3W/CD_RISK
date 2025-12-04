import { memo } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CardSelect } from '@/components/ui/card-select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { InfoTooltip } from '@/components/InfoTooltip'

import type { DimensionsStepProps } from '@/types/stepProps'
import {
  STRUCTURE_TYPES,
  FIRE_RISK_LEVELS,
  SITUATION_OPTIONS,
  ENVIRONMENTAL_FACTOR_OPTIONS,
  GROUND_TYPE_OPTIONS,
} from '@/config/formConfig'

/**
 * Paso 2: Dimensiones
 * Basado en el diseño original de CD-Risk
 */
function DimensionsStepInner({ data, onChange, onBulkChange }: DimensionsStepProps) {
  // Calcular área de colección (simplificado)
  const calculateCollectionArea = () => {
    const length = parseFloat(data.length) || 0
    const width = parseFloat(data.width) || 0
    const height = parseFloat(data.height) || 0

    // Fórmula simplificada del área de colección
    const area = length * width + 2 * height * (length + width)
    return area.toFixed(2)
  }

  const collectionArea = data.manualArea ? data.calculatedCollectionArea : calculateCollectionArea()

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Columna izquierda: Dimensiones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">DIMENSIONES</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              {/* Longitud */}
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="length" className="whitespace-nowrap">
                  Longitud (L)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="length"
                    step="0.01"
                    value={data.length || ''}
                    onChange={(e) => onChange('length', e.target.value)}
                    className="w-28"
                  />
                  <span className="text-sm text-muted-foreground">m.</span>
                </div>
              </div>

              {/* Anchura */}
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="width" className="whitespace-nowrap">
                  Anchura (W)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="width"
                    step="0.01"
                    value={data.width || ''}
                    onChange={(e) => onChange('width', e.target.value)}
                    className="w-28"
                  />
                  <span className="text-sm text-muted-foreground">m.</span>
                </div>
              </div>

              {/* Altura tejado */}
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="height" className="whitespace-nowrap">
                  Altura tejado (H)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="height"
                    step="0.01"
                    value={data.height || ''}
                    onChange={(e) => onChange('height', e.target.value)}
                    className="w-28"
                  />
                  <span className="text-sm text-muted-foreground">m.</span>
                </div>
              </div>

              {/* Altura prominencia */}
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="protrusionHeight" className="whitespace-nowrap">
                  Altura prominencia (Hp)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="protrusionHeight"
                    step="0.01"
                    value={data.protrusionHeight || ''}
                    onChange={(e) => onChange('protrusionHeight', e.target.value)}
                    className="w-28"
                  />
                  <span className="text-sm text-muted-foreground">m.</span>
                </div>
              </div>

              {/* Área de colección */}
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="calculatedCollectionArea" className="whitespace-nowrap flex items-center">
                  Área de colección (Ad)
                  <InfoTooltip content="Superficie equivalente de colección del edificio. Se calcula automáticamente según las dimensiones introducidas, pero puede fijarse manualmente." />
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="calculatedCollectionArea"
                    value={collectionArea}
                    onChange={(e) => onChange('calculatedCollectionArea', e.target.value)}
                    readOnly={!data.manualArea}
                    className={`w-28 ${!data.manualArea ? 'bg-muted' : ''}`}
                  />
                  <span className="text-sm text-muted-foreground">m².</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="manualArea"
                  checked={data.manualArea || false}
                  onCheckedChange={(checked) => onChange('manualArea', checked)}
                />
                <Label htmlFor="manualArea" className="cursor-pointer text-sm">
                  Fijada manualmente
                </Label>
              </div>
            </div>

            {/* Imagen del edificio */}
            <div className="flex items-center justify-center">
              <img
                src="/products/edificio.jpg"
                alt="Dimensiones del edificio (L, W, H, Hp)"
                className="h-64 w-auto rounded-md object-contain"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Columna derecha: Características de la Estructura */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">CARACTERÍSTICAS DE LA ESTRUCTURA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tipo de estructura */}
          <div className="space-y-2">
            <Label className="flex items-center">
              Tipo de estructura
              <InfoTooltip content="Material principal de construcción del edificio. Influye en el riesgo de incendio y en el tipo de protección necesaria." />
            </Label>
            <CardSelect
              value={data.typeOfStructure || ''}
              onValueChange={(value) => onChange('typeOfStructure', value)}
              options={STRUCTURE_TYPES}
              columns={3}
            />
          </div>

          {/* Riesgo de incendio */}
          <div className="space-y-2">
            <Label className="flex items-center">
              Riesgo de incendio
              <InfoTooltip content="Nivel de riesgo de incendio según el contenido y actividad del edificio. Afecta al cálculo de pérdidas potenciales." />
            </Label>
            <CardSelect
              value={data.riskOfFire || ''}
              onValueChange={(value) => onChange('riskOfFire', value)}
              options={FIRE_RISK_LEVELS}
              columns={3}
            />
          </div>

          <Separator className="my-6" />

          {/* INFLUENCIAS AMBIENTALES */}
          <h3 className="text-lg font-semibold text-primary mb-4">INFLUENCIAS AMBIENTALES</h3>

          {/* Situación */}
          <div className="space-y-2">
            <Label className="flex items-center">
              Situación
              <InfoTooltip content="Ubicación del edificio respecto a otras estructuras. Afecta el nivel de exposición a descargas atmosféricas." />
            </Label>
            <CardSelect
              value={data.situation || ''}
              onValueChange={(value) => onChange('situation', value)}
              options={SITUATION_OPTIONS}
              columns={3}
            />
          </div>

          {/* Factor ambiental */}
          <div className="space-y-2">
            <Label className="flex items-center">
              Factor ambiental
              <InfoTooltip content="Característica del entorno que influye en la frecuencia de impactos de rayos. Afecta al nivel de riesgo." />
            </Label>
            <CardSelect
              value={data.environmentalFactor || ''}
              onValueChange={(value) => onChange('environmentalFactor', value)}
              options={ENVIRONMENTAL_FACTOR_OPTIONS}
              columns={3}
            />
          </div>

          {/* Días de tormenta + Densidad anual en la misma fila */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stormDays">
                Días de tormenta
              </Label>
              <Input
                id="stormDays"
                value={data.stormDays || ''}
                onChange={(e) => onChange('stormDays', e.target.value)}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="annualImpactDensity">
                Densidad anual impactos
              </Label>
              <Input
                id="annualImpactDensity"
                value={data.annualImpactDensity || ''}
                onChange={(e) => onChange('annualImpactDensity', e.target.value)}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          {/* Tipo de terreno */}
          <div className="space-y-2">
            <Label className="flex items-center">
              Tipo de terreno
              <InfoTooltip content="Composición del suelo donde se encuentra el edificio. Influye en la resistencia de tierra y el sistema de puesta a tierra." />
            </Label>
            <CardSelect
              value={data.groundType || ''}
              onValueChange={(value) => onChange('groundType', value)}
              options={GROUND_TYPE_OPTIONS}
              columns={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const DimensionsStep = memo(DimensionsStepInner)
