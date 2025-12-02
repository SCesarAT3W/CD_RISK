import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { InfoTooltip } from '@/components/InfoTooltip'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

import type { DimensionsStepProps } from '@/types/stepProps'
import {
  STRUCTURE_TYPES,
  FIRE_RISK_LEVELS,
  SITUATION_OPTIONS,
  ENVIRONMENTAL_FACTOR_OPTIONS,
  GROUND_TYPE_OPTIONS,
} from '@/config/formConfig'

const isDev = import.meta.env.DEV

const generateMockDimensions = () => {
  const randomNum = (min: number, max: number) =>
    (Math.random() * (max - min) + min).toFixed(2)
  const random = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

  return {
    length: randomNum(30, 150),
    width: randomNum(20, 100),
    height: randomNum(8, 40),
    protrusionHeight: randomNum(0, 10),
    typeOfStructure: random(['Hormigon', 'Metal', 'Madera']),
    riskOfFire: random(['Comun', 'Alto', 'Nulo']),
    specialFireDanger: random(['Si', 'No']),
    fireProtectionLevel: random(['Bajo', 'Medio', 'Alto']),
    roofFireResistance: random(['REI60', 'REI90', 'REI120']),
    magneticShielding: random(['Si', 'No']),
    powerLines: random(['Aereas', 'Enterradas', 'Mixtas']),
    telecomLines: random(['Aereas', 'Enterradas', 'Mixtas']),
  }
}

/**
 * Paso 2: Dimensiones
 * Basado en el diseño original de CD-Risk
 */
export function DimensionsStep({ data, onChange, onBulkChange }: DimensionsStepProps) {
  const handleAutofill = () => {
    if (onBulkChange) {
      onBulkChange(generateMockDimensions())
    }
  }
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary">DIMENSIONES</CardTitle>
            {isDev && (
              <Button onClick={handleAutofill} variant="outline" size="sm" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Autorellenar
              </Button>
            )}
          </div>
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
                    type="number"
                    step="0.01"
                    value={data.length || '80.00'}
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
                    type="number"
                    step="0.01"
                    value={data.width || '50.00'}
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
                    type="number"
                    step="0.01"
                    value={data.height || '20.00'}
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
                    type="number"
                    step="0.01"
                    value={data.protrusionHeight || '20.00'}
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
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="typeOfStructure" className="col-span-2 flex items-center">
              Tipo de estructura
              <InfoTooltip content="Material principal de construcción del edificio. Influye en el riesgo de incendio y en el tipo de protección necesaria." />
            </Label>
            <div className="col-span-3">
              <Select
                value={data.typeOfStructure || 'Hormigon'}
                onValueChange={(value) => onChange('typeOfStructure', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STRUCTURE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Riesgo de incendio */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="riskOfFire" className="col-span-2 flex items-center">
              Riesgo de incendio
              <InfoTooltip content="Nivel de riesgo de incendio según el contenido y actividad del edificio. Afecta al cálculo de pérdidas potenciales." />
            </Label>
            <div className="col-span-3">
              <Select
                value={data.riskOfFire || 'Comun'}
                onValueChange={(value) => onChange('riskOfFire', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIRE_RISK_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-6" />

          {/* INFLUENCIAS AMBIENTALES */}
          <h3 className="text-lg font-semibold text-primary mb-4">INFLUENCIAS AMBIENTALES</h3>

          {/* Situación */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="situation" className="col-span-2 flex items-center">
              Situación
              <InfoTooltip content="Ubicación del edificio respecto a otras estructuras. Afecta el nivel de exposición a descargas atmosféricas." />
            </Label>
            <div className="col-span-3">
              <Select
                value={data.situation || 'EstructuraAislada'}
                onValueChange={(value) => onChange('situation', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SITUATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Factor ambiental */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="environmentalFactor" className="col-span-2 flex items-center">
              Factor ambiental
              <InfoTooltip content="Característica del entorno que influye en la frecuencia de impactos de rayos. Afecta al nivel de riesgo." />
            </Label>
            <div className="col-span-3">
              <Select
                value={data.environmentalFactor || 'Urbano'}
                onValueChange={(value) => onChange('environmentalFactor', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENVIRONMENTAL_FACTOR_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Días de tormenta */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="stormDays" className="col-span-2">
              Días de tormenta
            </Label>
            <div className="col-span-3">
              <Input
                id="stormDays"
                type="number"
                value={data.stormDays || '10'}
                onChange={(e) => onChange('stormDays', e.target.value)}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          {/* Densidad anual de impactos */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="annualImpactDensity" className="col-span-2">
              Densidad anual impactos
            </Label>
            <div className="col-span-3">
              <Input
                id="annualImpactDensity"
                type="number"
                value={data.annualImpactDensity || '1.00'}
                onChange={(e) => onChange('annualImpactDensity', e.target.value)}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          {/* Tipo de terreno */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="groundType" className="col-span-2 flex items-center">
              Tipo de terreno
              <InfoTooltip content="Composición del suelo donde se encuentra el edificio. Influye en la resistencia de tierra y el sistema de puesta a tierra." />
            </Label>
            <div className="col-span-3">
              <Select
                value={data.groundType || 'Arenoso'}
                onValueChange={(value) => onChange('groundType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GROUND_TYPE_OPTIONS.map((option) => (
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
  )
}
