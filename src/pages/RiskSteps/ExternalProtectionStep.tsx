import { useState, memo, useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { CardSelect } from '@/components/ui/card-select'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { NumberStepper } from '@/components/ui/number-stepper'

import { Calculator, ShieldCheck } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PararrayosNavigation } from '@/components/PararrayosNavigation'
import { useTranslatedOptions } from '@/contexts/TranslatedOptionsContext'
import { Button } from '@/components/ui/button'

import type { ExternalProtectionStepProps } from '@/types/stepProps'
import {
  getNaturesByMaterialType,
  getFixingsByMaterial,
  getMaterialTypeFromNature,
  getTranslatedOptions,
} from '@/config/formConfig'

/**
 * Paso 6: Materiales para protección externa
 * Basado en el diseño original de CD-Risk
 */
function ExternalProtectionStepInner({ data, onChange }: ExternalProtectionStepProps) {
  const {
    CONDUCTOR_TYPES,
    ROOF_COVER_TYPES,
    GROUND_SYSTEM_TYPES,
    GROUND_MATERIAL_TYPES,
  } = useTranslatedOptions()

  const [selectedZoneIndex, setSelectedZoneIndex] = useState<number>(0)
  const [materialsScope, setMaterialsScope] = useState<string>('all')
  const [showMaterialsTable, setShowMaterialsTable] = useState(true)

  // Lista de pararrayos configurados (desde el paso anterior)
  const protectionZones = data.protectionZones || []
  const externalZonesFromForm = data.externalProtectionZones || []
  const hasZones = protectionZones.length > 0
  const totalPararrayos = Math.max(protectionZones.length, externalZonesFromForm.length, 1)

  // Inicializar externalProtectionZones si no existe
  const externalProtectionZones = useMemo(() => {
    if (!data.externalProtectionZones && hasZones) {
      // Crear zonas vacías basándose en protectionZones con todas las propiedades opcionales
      return protectionZones.map(zone => ({
        id: zone.id,
        externalCabezal: undefined,
        conductorType: undefined,
        conductorMaterial: undefined,
        fixingType: undefined,
        useOtherBajantes: undefined,
        useNaturalComponents: undefined,
        metrosConductor: undefined,
        tipoCubierta: undefined,
        bajantesNumber: undefined,
        totalLength: undefined,
        distanceGroundLevel: undefined,
        groundType: undefined,
        groundMaterial: undefined,
        generalGround: undefined,
        generalGroundConductor: undefined,
        antenasNumber: undefined,
        antenasLength: undefined,
        extraMargin: 15,
      }))
    }
    return data.externalProtectionZones || []
  }, [data.externalProtectionZones, hasZones, protectionZones])

  // Obtener la zona actual
  const currentZone = externalProtectionZones[selectedZoneIndex]
  const extraMargin = currentZone?.extraMargin ?? 15

  // Obtener información del cabezal y nivel de protección del pararrayos actual
  const currentProtectionZone = protectionZones[selectedZoneIndex]
  const currentCabezalModel = hasZones ? (currentProtectionZone?.model || data.headModel) : data.headModel
  const currentProtectionLevel = hasZones ? (currentProtectionZone?.level || data.protectionLevel) : data.protectionLevel

  // Regla 7: Naturalezas disponibles según tipo de conductor (con traducción)
  const availableMaterialNatures = useMemo(() => {
    const conductorType = currentZone?.conductorType
    const natures = getNaturesByMaterialType(conductorType)
    return getTranslatedOptions(natures)
  }, [currentZone?.conductorType])

  // Regla 10: Fijaciones compatibles con el material seleccionado (con traducción)
  const availableFixings = useMemo(() => {
    const conductorMaterial = currentZone?.conductorMaterial
    const fixings = getFixingsByMaterial(conductorMaterial)
    return getTranslatedOptions(fixings)
  }, [currentZone?.conductorMaterial])

  // Helper para asegurar que un valor sea número (evita concatenación de strings)
  const toNumber = (value: unknown): number => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') return Number(value) || 0
    return 0
  }

  // Calcular lista de materiales de todas las zonas (enfoque declarativo)
  const calculateMaterialsForZones = (zones: typeof externalProtectionZones) => {
    // Totales acumulados (usando toNumber para evitar concatenación de strings)
    const totals = {
      bajantes: zones.reduce((sum, z) => sum + toNumber(z.bajantesNumber), 0),
      generalGroundConductor: zones.reduce((sum, z) => sum + toNumber(z.generalGroundConductor), 0),
      antenasNumber: zones.reduce((sum, z) => sum + toNumber(z.antenasNumber), 0),
      antenasLength: zones.reduce((sum, z) => sum + toNumber(z.antenasLength), 0),
    }

    // Catálogos de materiales
    const conductorTypes: Record<string, { ref: string; desc: string }> = {
      'CuTrenzado': { ref: 'AT-052D', desc: 'Cable Cu trenzado 70mm²' },
      'CuDesnudo': { ref: 'AT-053D', desc: 'Cable Cu desnudo 50mm²' },
      'AlTrenzado': { ref: 'AT-054D', desc: 'Cable Al trenzado 70mm²' },
      'AlDesnudo': { ref: 'AT-055D', desc: 'Cable Al desnudo 50mm²' },
      'AceroGalv': { ref: 'AT-056D', desc: 'Pletina acero galvanizado' },
      'AceroInox': { ref: 'AT-057D', desc: 'Pletina acero inoxidable' },
    }

    const fixingTypes: Record<string, { ref: string; desc: string }> = {
      'GrapaPletina': { ref: 'AT-240E', desc: 'Grapa hélice inox para pletina' },
      'GrapaCable': { ref: 'AT-241E', desc: 'Grapa para cable' },
      'SoporteMural': { ref: 'AT-242E', desc: 'Soporte mural para conductor' },
      'AbrazaderaTubo': { ref: 'AT-243E', desc: 'Abrazadera para tubo' },
    }

    const groundTypes: Record<string, { ref: string; desc: string }> = {
      'Piqueta': { ref: 'AT-055H', desc: 'Conjunto piquetas con manguito' },
      'Placa': { ref: 'AT-056H', desc: 'Placa de tierra Cu' },
      'Anillo': { ref: 'AT-057H', desc: 'Anillo de tierra conductor' },
    }

    // Materiales por zona (declarativo con flatMap)
    const zoneMaterials = zones.flatMap((zone) => {
      const conductor = zone.conductorMaterial ? conductorTypes[zone.conductorMaterial] : null
      const fixing = zone.fixingType ? fixingTypes[zone.fixingType] : null
      const ground = zone.groundType ? groundTypes[zone.groundType] : null
      const totalLength = toNumber(zone.totalLength)
      const metrosConductor = toNumber(zone.metrosConductor)
      const zoneLength = totalLength + metrosConductor

      return [
        conductor && zoneLength > 0 && {
          ref: conductor.ref,
          description: conductor.desc,
          quantity: zoneLength,
        },
        fixing && totalLength > 0 && {
          ref: fixing.ref,
          description: fixing.desc,
          quantity: Math.ceil(totalLength / 1.5),
        },
        ground && {
          ref: ground.ref,
          description: ground.desc,
          quantity: 1,
        },
      ].filter(Boolean) as { ref: string; description: string; quantity: number }[]
    })

    // Materiales fijos basados en totales (declarativo con filter)
    const fixedMaterials = [
      totals.bajantes > 0 && { ref: 'AT-034G', description: 'Contador de rayos', quantity: totals.bajantes },
      totals.bajantes > 0 && { ref: 'AT-060G', description: 'Tubo protección galvanizado 2m', quantity: totals.bajantes * 2 },
      totals.bajantes > 0 && { ref: 'AT-010H', description: 'Arqueta polipropileno 250x250mm', quantity: totals.bajantes },
      totals.bajantes > 0 && { ref: 'AT-020H', description: 'Puente comprobación latón', quantity: totals.bajantes },
      totals.generalGroundConductor > 0 && { ref: 'AT-058D', description: 'Conductor enterrado Cu 35mm²', quantity: totals.generalGroundConductor },
      totals.antenasNumber > 0 && { ref: 'AT-060F', description: 'Vía chispas mástil antena', quantity: totals.antenasNumber },
      totals.antenasLength > 0 && { ref: 'AT-059D', description: 'Conductor conexión antenas', quantity: totals.antenasLength },
    ].filter(Boolean) as { ref: string; description: string; quantity: number }[]

    // Combinar y agregar cantidades por referencia (declarativo con Map)
    const allMaterials = [...zoneMaterials, ...fixedMaterials]

    const materialsMap = allMaterials.reduce(
      (acc, material) => acc.set(
        material.ref,
        acc.has(material.ref)
          ? { ...material, quantity: (acc.get(material.ref)?.quantity || 0) + material.quantity }
          : material
      ),
      new Map<string, { ref: string; description: string; quantity: number }>()
    )

    return Array.from(materialsMap.values())
  }

  const calculatedMaterials = useMemo(() => {
    const zones = data.externalProtectionZones || []
    return calculateMaterialsForZones(zones)
  }, [data.externalProtectionZones])

  const materialsForScope = useMemo(() => {
    if (materialsScope === 'all') {
      return calculatedMaterials
    }
    const index = Number.parseInt(materialsScope.replace('zone-', ''), 10)
    const zone = externalProtectionZones[index]
    return zone ? calculateMaterialsForZones([zone]) : []
  }, [materialsScope, calculatedMaterials, externalProtectionZones])

  const previewMaterial = materialsForScope[0]

  const handlePreviousZone = () => {
    if (selectedZoneIndex > 0) {
      setSelectedZoneIndex(selectedZoneIndex - 1)
    }
  }

  const handleNextZone = () => {
    if (selectedZoneIndex < totalPararrayos - 1) {
      setSelectedZoneIndex(selectedZoneIndex + 1)
    }
  }

  // Actualizar la zona actual de protección externa
  // Siempre usa externalProtectionZones, incluso si no hay pararrayos configurados
  const updateCurrentZone = (field: string, value: unknown) => {
    const updatedZones = [...externalProtectionZones]

    // Si la zona no existe, crearla
    if (!updatedZones[selectedZoneIndex]) {
      updatedZones[selectedZoneIndex] = {
        id: protectionZones[selectedZoneIndex]?.id || `zone-${selectedZoneIndex}`,
      }
    }

    updatedZones[selectedZoneIndex] = {
      ...updatedZones[selectedZoneIndex],
      [field]: value,
    }
    onChange('externalProtectionZones', updatedZones)
  }

  // Actualizar múltiples campos a la vez en la zona actual (evita race conditions)
  // Siempre usa externalProtectionZones, incluso si no hay pararrayos configurados
  const updateCurrentZoneMultiple = (fields: Record<string, unknown>) => {
    const updatedZones = [...externalProtectionZones]

    // Si la zona no existe, crearla
    if (!updatedZones[selectedZoneIndex]) {
      updatedZones[selectedZoneIndex] = {
        id: protectionZones[selectedZoneIndex]?.id || `zone-${selectedZoneIndex}`,
      }
    }

    updatedZones[selectedZoneIndex] = {
      ...updatedZones[selectedZoneIndex],
      ...fields,
    }

    onChange('externalProtectionZones', updatedZones)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Columna izquierda */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Materiales para protección externa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{data.projectName || 'Proyecto'}</span>
              <span className="text-border">•</span>
              <span>{totalPararrayos} {totalPararrayos === 1 ? 'Pararrayos' : 'Pararrayos'}</span>
              <span className="text-border">•</span>
              <span>Nivel {currentProtectionLevel || 'No especificado'}</span>
              {totalPararrayos > 0 && (
                <div className="ml-auto">
                  <PararrayosNavigation
                    currentIndex={selectedZoneIndex}
                    totalCount={totalPararrayos}
                    onPrevious={handlePreviousZone}
                    onNext={handleNextZone}
                  />
                </div>
              )}
            </div>

            <div className="border-t flex" />

            <div className="space-y-8">
              <h4 className="text-sm font-semibold text-primary">Bajantes</h4>

              <div className="flex flex-wrap gap-x-8 gap-y-12">
                <div className="space-y-2 flex-1 min-w-[280px]">
                  <Label>Tipo de conductor a presupuestar</Label>
                  <CardSelect
                    value={currentZone?.conductorType || ''}
                    onValueChange={(value) => {
                      const currentMaterial = currentZone?.conductorMaterial
                      const currentMaterialType = getMaterialTypeFromNature(currentMaterial)

                      if (currentMaterialType && currentMaterialType !== value) {
                        updateCurrentZoneMultiple({
                          conductorType: value,
                          conductorMaterial: '',
                        })
                      } else {
                        updateCurrentZone('conductorType', value)
                      }
                    }}
                    options={CONDUCTOR_TYPES}
                    columns={3}
                    layout="grid"
                  />
                </div>

                <div className="space-y-2 flex-1 min-w-[280px]">
                  <Label>Naturaleza del conductor a presupuestar</Label>
                  <CardSelect
                    value={currentZone?.conductorMaterial || ''}
                    onValueChange={(value) => {
                      const newAvailableFixings = getFixingsByMaterial(value)
                      const currentFixingType = currentZone?.fixingType
                      const shouldClearFixing = currentFixingType && !newAvailableFixings.some(f => f.value === currentFixingType)

                      if (shouldClearFixing) {
                        updateCurrentZoneMultiple({
                          conductorMaterial: value,
                          fixingType: '',
                        })
                      } else {
                        updateCurrentZone('conductorMaterial', value)
                      }
                    }}
                    options={availableMaterialNatures}
                    columns={2}
                    layout="grid"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-10 items-end">
                <div className="space-y-2 flex-1 min-w-[280px]">
                  <Label>Tipo de fijaciones para el conductor</Label>
                  <Select
                    value={currentZone?.fixingType || ''}
                    onValueChange={(value) => updateCurrentZone('fixingType', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione tipo de fijación" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFixings.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-[280px] flex gap-6">
                  <div className="space-y-2 flex-1">
                    <Label>¿Se utilizarán bajantes de otros pararrayos como bajada?</Label>
                    <RadioGroup
                      value={currentZone?.useOtherBajantes || ''}
                      onValueChange={(value) => updateCurrentZone('useOtherBajantes', value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Si" id="otherBajantesYes" />
                        <Label htmlFor="otherBajantesYes">Sí</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="otherBajantesNo" />
                        <Label htmlFor="otherBajantesNo">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2 flex-1">
                    <Label>¿Se utilizan componentes naturales como bajadas?</Label>
                    <RadioGroup
                      value={currentZone?.useNaturalComponents || ''}
                      onValueChange={(value) => updateCurrentZone('useNaturalComponents', value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Si" id="naturalYes" />
                        <Label htmlFor="naturalYes">Sí</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="naturalNo" />
                        <Label htmlFor="naturalNo">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              {currentZone?.useOtherBajantes === 'Si' && (
                <div className="flex flex-wrap gap-x-4 gap-y-10">
                  <div className="space-y-2 flex-1 min-w-[220px]">
                    <Label>Metros de conductor a utilizar</Label>
                  <div className="flex">
                    <NumberStepper
                      value={currentZone?.metrosConductor || 0}
                      onChange={(nextValue) => updateCurrentZone('metrosConductor', nextValue)}
                      suffix="m"
                      ariaLabelMinus="Disminuir metros"
                      ariaLabelPlus="Aumentar metros"
                    />
                  </div>
                </div>

                  <div className="space-y-2 flex-1 min-w-[220px]">
                    <Label>Tipo de cubierta</Label>
                    <CardSelect
                      value={currentZone?.tipoCubierta || ''}
                      onValueChange={(value) => updateCurrentZone('tipoCubierta', value)}
                      options={ROOF_COVER_TYPES}
                      columns={2}
                      layout="grid"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-10">
                <div className="space-y-2 flex-1 min-w-[220px]">
                  <Label>Bajantes a presupuestar</Label>
                  <div className="flex">
                    <NumberStepper
                      value={currentZone?.bajantesNumber || 0}
                      onChange={(nextValue) => updateCurrentZone('bajantesNumber', nextValue)}
                      ariaLabelMinus="Disminuir bajantes"
                      ariaLabelPlus="Aumentar bajantes"
                    />
                  </div>
                </div>
                <div className="space-y-2 flex-1 min-w-[220px]">
                  <Label>Recorrido horizontal total</Label>
                  <div className="flex">
                    <NumberStepper
                      value={currentZone?.totalLength || 0}
                      onChange={(nextValue) => updateCurrentZone('totalLength', nextValue)}
                      suffix="m"
                      ariaLabelMinus="Disminuir recorrido"
                      ariaLabelPlus="Aumentar recorrido"
                    />
                  </div>
                </div>
                <div className="space-y-2 flex-1 min-w-[220px]">
                  <Label>Distancia entre bajantes nivel suelo</Label>
                  <div className="flex">
                    <NumberStepper
                      value={currentZone?.distanceGroundLevel || 0}
                      onChange={(nextValue) => updateCurrentZone('distanceGroundLevel', nextValue)}
                      suffix="m"
                      ariaLabelMinus="Disminuir distancia"
                      ariaLabelPlus="Aumentar distancia"
                    />
                  </div>
                </div>

                <div className="space-y-2 flex-1 min-w-[220px]">
                  <Label>Margen extra de materiales</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[extraMargin]}
                      onValueChange={(value) => updateCurrentZone('extraMargin', value[0] ?? 0)}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm">{extraMargin}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t" />

            <div className="space-y-8">
              <h4 className="text-sm font-semibold text-primary">Toma de tierra</h4>

              <div className="flex flex-wrap gap-x-8 gap-y-12">
                <div className="space-y-2 flex-1 min-w-[280px]">
                  <Label>Tipo de toma de tierra</Label>
                  <Select
                    value={currentZone?.groundType || ''}
                    onValueChange={(value) => updateCurrentZone('groundType', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione tipo de toma de tierra" />
                    </SelectTrigger>
                    <SelectContent>
                      {GROUND_SYSTEM_TYPES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 flex-1 min-w-[280px]">
                  <Label>Material de toma de tierra</Label>
                  <CardSelect
                    value={currentZone?.groundMaterial || ''}
                    onValueChange={(value) => updateCurrentZone('groundMaterial', value)}
                    options={GROUND_MATERIAL_TYPES}
                    columns={3}
                    layout="grid"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-10">
                <div className="space-y-2">
                  <Label>¿La toma de tierra se unirá a la tierra general?</Label>
                  <RadioGroup
                    value={currentZone?.generalGround || ''}
                    onValueChange={(value) => updateCurrentZone('generalGround', value)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Si" id="generalGroundYes" />
                      <Label htmlFor="generalGroundYes">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="generalGroundNo" />
                      <Label htmlFor="generalGroundNo">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2 flex-1 min-w-[220px]">
                  <Label>Conductor enterrado para unión a tierra general</Label>
                  <div className="flex">
                    <NumberStepper
                      value={currentZone?.generalGroundConductor || 0}
                      onChange={(nextValue) => updateCurrentZone('generalGroundConductor', nextValue)}
                      ariaLabelMinus="Disminuir conductor"
                      ariaLabelPlus="Aumentar conductor"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t" />

            <div className="space-y-8">
              <h4 className="text-sm font-semibold text-primary">Antenas</h4>
              <div className="flex flex-wrap gap-x-4 gap-y-10">
                <div className="space-y-2 flex-1 min-w-[220px]">
                  <Label>Número de antenas en el tejado</Label>
                  <div className="flex">
                    <NumberStepper
                      value={currentZone?.antenasNumber || 0}
                      onChange={(nextValue) => updateCurrentZone('antenasNumber', nextValue)}
                      ariaLabelMinus="Disminuir antenas"
                      ariaLabelPlus="Aumentar antenas"
                    />
                  </div>
                </div>

                <div className="space-y-2 flex-1 min-w-[220px]">
                  <Label>Conductor para unir las antenas a la bajante</Label>
                  <div className="flex">
                    <NumberStepper
                      value={currentZone?.antenasLength || 0}
                      onChange={(nextValue) => updateCurrentZone('antenasLength', nextValue)}
                      ariaLabelMinus="Disminuir conductor"
                      ariaLabelPlus="Aumentar conductor"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setShowMaterialsTable(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Calculator className="mr-2 h-4 w-4" />
                Calcular los materiales
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Columna derecha */}
        <div className="w-full lg:w-[30%] flex flex-col gap-6">
          <Card className='bg-gray-200'>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle hideIcon className="text-primary text-sm">Vista previa del material</CardTitle>
              <Select value={materialsScope} onValueChange={setMaterialsScope}>
                <SelectTrigger className="h-8 w-32 bg-card text-xs">
                  <SelectValue placeholder="Ver todo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Ver todo</SelectItem>
                  {Array.from({ length: totalPararrayos }).map((_, index) => (
                    <SelectItem key={`scope-${index}`} value={`zone-${index}`}>
                      Pararrayos {index + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="overflow-hidden rounded-lg bg-card border">
                <img
                  src="/CONDUCTOR/CABLE_COBRE.JPG"
                  alt="Cable de cobre trenzado"
                  className="h-56 w-full object-cover"
                />
                <div className="p-4 text-sm font-semibold text-primary">
                  {previewMaterial?.description || 'Cable de cobre trenzado 70mm2'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='-mt-8'>
            <CardHeader>
              <CardTitle hideIcon className="text-primary text-xs">Resumen materiales (Total)</CardTitle>
            </CardHeader>
            <CardContent>
              {showMaterialsTable && materialsForScope.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref.</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead className="text-right">Cant.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materialsForScope.map((material) => (
                      <TableRow key={material.ref}>
                        <TableCell className="text-xs text-muted-foreground">{material.ref}</TableCell>
                        <TableCell className="text-xs">{material.description}</TableCell>
                        <TableCell className="text-right font-semibold text-xs">{material.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-xs text-muted-foreground">Complete los datos para ver los materiales.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export const ExternalProtectionStep = memo(ExternalProtectionStepInner)
