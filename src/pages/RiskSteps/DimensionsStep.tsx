import { memo } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CardSelect } from '@/components/ui/card-select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { InfoTooltip } from '@/components/InfoTooltip'
import { DimensionsMapViewer } from '@/components/DimensionsMapViewer'
import { useTranslatedOptions } from '@/contexts/TranslatedOptionsContext'
import { Scan } from 'lucide-react'

import type { DimensionsStepProps } from '@/types/stepProps'

/**
 * Paso 2: Dimensiones
 * Basado en el diseño original de CD-Risk
 */
function DimensionsStepInner({ data, onChange }: DimensionsStepProps) {
  const {
    STRUCTURE_TYPES,
    FIRE_RISK_LEVELS,
    SITUATION_OPTIONS,
    ENVIRONMENTAL_FACTOR_OPTIONS,
    GROUND_TYPE_OPTIONS,
  } = useTranslatedOptions()

  // Calcular área de colección (simplificado)
  const calculateCollectionArea = () => {
    const length = parseFloat(data.length || '0') || 0
    const width = parseFloat(data.width || '0') || 0
    const height = parseFloat(data.height || '0') || 0

    // Fórmula simplificada del área de colección
    const area = length * width + 2 * height * (length + width)
    return area.toFixed(2)
  }

  const collectionArea = data.manualArea ? data.calculatedCollectionArea : calculateCollectionArea()

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
      {/* Columna izquierda: Dimensiones */}
      <Card className="flex flex-col md:flex-1 min-h-0">
        <CardContent className="flex flex-1 min-h-0 flex-col">
          <div className="flex flex-1 min-h-0 flex-col gap-4 md:flex-row">
            <div className="space-y-8 md:w-[40%]">
              <CardHeader className="px-0">
                <CardTitle className="text-primary" icon={<Scan className="h-[15px] w-[15px]" />}>
                  Dimensiones
                </CardTitle>
              </CardHeader>
              {/* Longitud */}
              <div className="space-y-8">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="length">
                    Longitud (L)
                  </Label>
                  <div className="relative">
                    <Input
                      id="length"
                      step="0.01"
                      value={data.length || ''}
                      onChange={(e) => onChange('length', e.target.value)}
                      className="w-24 pr-7"
                    />
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      m
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="200"
                  step="1"
                  value={data.length || '50'}
                  onChange={(e) => onChange('length', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Anchura */}
              <div className="space-y-8">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="width">
                    Anchura (W)
                  </Label>
                  <div className="relative">
                    <Input
                      id="width"
                      step="0.01"
                      value={data.width || ''}
                      onChange={(e) => onChange('width', e.target.value)}
                      className="w-24 pr-7"
                    />
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      m
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="200"
                  step="1"
                  value={data.width || '50'}
                  onChange={(e) => onChange('width', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Altura tejado */}
              <div className="space-y-8">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="height">
                    Altura tejado (H)
                  </Label>
                  <div className="relative">
                    <Input
                      id="height"
                      step="0.01"
                      value={data.height || ''}
                      onChange={(e) => onChange('height', e.target.value)}
                      className="w-24 pr-7"
                    />
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      m
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={data.height || '12'}
                  onChange={(e) => onChange('height', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Altura prominencia */}
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="protrusionHeight">
                  Altura prominencia (Hp)
                </Label>
                <div className="relative">
                  <Input
                    id="protrusionHeight"
                    step="0.01"
                    value={data.protrusionHeight || ''}
                    onChange={(e) => onChange('protrusionHeight', e.target.value)}
                    className="w-24 pr-7"
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    m
                  </span>
                </div>
              </div>

              {/* Área de colección */}
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="calculatedCollectionArea" className="flex items-center">
                  Área de colección (Ad)
                  <InfoTooltip content="Superficie equivalente de colección del edificio. Se calcula automáticamente según las dimensiones introducidas, pero puede fijarse manualmente." />
                </Label>
                <div className="relative">
                  <Input
                    id="calculatedCollectionArea"
                    value={collectionArea}
                    onChange={(e) => onChange('calculatedCollectionArea', e.target.value)}
                    readOnly={!data.manualArea}
                    className={`w-24 pr-8 ${!data.manualArea ? 'bg-muted' : ''}`}
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    m²
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="manualArea"
                  checked={data.manualArea || false}
                  onCheckedChange={(checked) => onChange('manualArea', checked === true)}
                />
                <Label htmlFor="manualArea" className="cursor-pointer text-sm">
                  Fijada manualmente
                </Label>
              </div>
            </div>

            {/* Mapa 2D/3D */}
            <div className="flex min-h-0 md:w-[60%] flex-col">
              <DimensionsMapViewer
                length={data.length}
                width={data.width}
                height={data.height}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Columna derecha: Características de la Estructura */}
      <Card className="md:flex-1">
        <CardHeader>
          <CardTitle
            className="text-primary"
            icon={<img src="/icons/Frame(1).svg" alt="" className="h-[15px] w-[15px]" />}
          >
            Características de la Estructura
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
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
