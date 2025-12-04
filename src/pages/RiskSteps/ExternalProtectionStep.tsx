import { useState, memo, useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CardSelect } from '@/components/ui/card-select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Calculator } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PararrayosNavigation } from '@/components/PararrayosNavigation'

import type { ExternalProtectionStepProps } from '@/types/stepProps'
import {
  getNaturesByMaterialType,
  getFixingsByMaterial,
  getMaterialTypeFromNature,
  getHeadType,
} from '@/config/formConfig'

/**
 * Paso 6: Materiales para protección externa
 * Basado en el diseño original de CD-Risk
 */
function ExternalProtectionStepInner({ data, onChange, onBulkChange }: ExternalProtectionStepProps) {
  const [showMaterialsTable, setShowMaterialsTable] = useState(false)
  const [extraMargin, setExtraMargin] = useState(15)
  const [selectedZoneIndex, setSelectedZoneIndex] = useState<number>(0)

  // Lista de pararrayos configurados (desde el paso anterior)
  const protectionZones = data.protectionZones || []
  const hasZones = protectionZones.length > 0
  const totalPararrayos = hasZones ? protectionZones.length : 1

  // Inicializar externalProtectionZones si no existe
  const externalProtectionZones = useMemo(() => {
    if (!data.externalProtectionZones && hasZones) {
      // Crear zonas iniciales basándose en protectionZones
      return protectionZones.map(zone => ({
        id: zone.id,
        externalCabezal: data.externalCabezal,
        conductorType: data.conductorType,
        conductorMaterial: data.conductorMaterial,
        fixingType: data.fixingType,
        useOtherBajantes: data.useOtherBajantes,
        useNaturalComponents: data.useNaturalComponents,
        metrosConductor: data.metrosConductor,
        tipoCubierta: data.tipoCubierta,
        bajantesNumber: data.bajantesNumber,
        totalLength: data.totalLength,
        distanceGroundLevel: data.distanceGroundLevel,
        groundType: data.groundType,
        groundMaterial: data.groundMaterial,
        generalGround: data.generalGround,
        generalGroundConductor: data.generalGroundConductor,
        antenasNumber: data.antenasNumber,
        antenasLength: data.antenasLength,
      }))
    }
    return data.externalProtectionZones || []
  }, [data.externalProtectionZones, hasZones, protectionZones, data])

  // Obtener la zona actual
  const currentZone = externalProtectionZones[selectedZoneIndex]

  // Obtener información del cabezal y nivel de protección del pararrayos actual
  const currentProtectionZone = protectionZones[selectedZoneIndex]
  const currentCabezalModel = hasZones ? (currentProtectionZone?.model || data.headModel) : data.headModel
  const currentCabezalType = useMemo(() => {
    if (currentCabezalModel) {
      return getHeadType(currentCabezalModel)
    }
    return data.headType
  }, [currentCabezalModel, data.headType])
  const currentProtectionLevel = hasZones ? (currentProtectionZone?.level || data.protectionLevel) : data.protectionLevel

  // Regla 7: Naturalezas disponibles según tipo de conductor
  const availableMaterialNatures = useMemo(() => {
    const conductorType = currentZone?.conductorType || data.conductorType
    return getNaturesByMaterialType(conductorType)
  }, [currentZone?.conductorType, data.conductorType])

  // Regla 9: Mostrar fijaciones solo si NO es mástil autónomo
  const showFixingField = useMemo(() => {
    const mastType = protectionZones[selectedZoneIndex]?.mastType || data.mastType
    return mastType !== 'MAutonomo'
  }, [protectionZones, selectedZoneIndex, data.mastType])

  // Regla 10: Fijaciones compatibles con el material seleccionado
  const availableFixings = useMemo(() => {
    const conductorMaterial = currentZone?.conductorMaterial || data.conductorMaterial
    return getFixingsByMaterial(conductorMaterial)
  }, [currentZone?.conductorMaterial, data.conductorMaterial])

  const handleCalculateMaterials = () => {
    setShowMaterialsTable(true)
  }

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
  const updateCurrentZone = (field: string, value: unknown) => {
    console.log('=== updateCurrentZone ===')
    console.log('field:', field)
    console.log('value:', value)
    console.log('hasZones:', hasZones)
    console.log('externalProtectionZones:', externalProtectionZones)
    console.log('selectedZoneIndex:', selectedZoneIndex)

    if (!hasZones) {
      // Si no hay zonas, usar el comportamiento legacy
      console.log('Usando modo legacy - actualizando campo global')
      onChange(field as any, value as any)
      return
    }

    const updatedZones = [...externalProtectionZones]
    console.log('Modo multi-zona - actualizando zona específica')

    // Si la zona no existe, crearla
    if (!updatedZones[selectedZoneIndex]) {
      console.log('Creando nueva zona en índice:', selectedZoneIndex)
      updatedZones[selectedZoneIndex] = {
        id: protectionZones[selectedZoneIndex]?.id || `zone-${selectedZoneIndex}`,
      }
    }

    updatedZones[selectedZoneIndex] = {
      ...updatedZones[selectedZoneIndex],
      [field]: value,
    }

    console.log('Zona actualizada:', updatedZones[selectedZoneIndex])
    console.log('======================')

    onChange('externalProtectionZones', updatedZones)
  }

  // Actualizar múltiples campos a la vez en la zona actual (evita race conditions)
  const updateCurrentZoneMultiple = (fields: Record<string, unknown>) => {
    if (!hasZones) {
      // Si no hay zonas, actualizar campos globales uno por uno
      Object.entries(fields).forEach(([field, value]) => {
        onChange(field as any, value as any)
      })
      return
    }

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Materiales para protección externa</h2>
        <div className="flex items-center gap-3">
          <Label htmlFor="skip-validation" className="text-sm font-normal cursor-pointer">
            Omitir validación de campos
          </Label>
          <Switch
            id="skip-validation"
            checked={data.skipValidation || false}
            onCheckedChange={(checked) => onChange('skipValidation', checked)}
          />
        </div>
      </div>

      {/* Información del edificio desde paso 5 */}
      {data.projectName && (
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-foreground">{data.projectName}</h3>

          {/* Información de captación y altura */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{data.height ? `${data.height} m` : 'No especificada'}</span>
            <span className="text-border">|</span>
            <span className="font-semibold text-foreground">{totalPararrayos} {totalPararrayos === 1 ? 'Pararrayos' : 'Pararrayos'}</span>
            <span className="text-border">|</span>
            <span className="font-semibold text-foreground">{currentCabezalModel || 'No especificado'}</span>
            <span className="text-border">|</span>
            <span className="font-semibold text-foreground">Nivel {currentProtectionLevel || 'No especificado'}</span>
          </div>

          {/* Navegación entre pararrayos si hay más de uno */}
          {hasZones && totalPararrayos > 1 && (
            <PararrayosNavigation
              currentIndex={selectedZoneIndex}
              totalCount={totalPararrayos}
              onPrevious={handlePreviousZone}
              onNext={handleNextZone}
            />
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Columna izquierda */}
        <div className="space-y-6">
          {/* BAJANTES */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">BAJANTES</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de conductor a presupuestar</Label>
                <CardSelect
                  value={currentZone?.conductorType || data.conductorType || ''}
                  onValueChange={(value) => {
                    // Al cambiar tipo de conductor, limpiar material solo si no es compatible
                    const currentMaterial = currentZone?.conductorMaterial || data.conductorMaterial
                    const currentMaterialType = getMaterialTypeFromNature(currentMaterial)

                    // Solo limpiar si el material actual no es compatible con el nuevo tipo
                    if (currentMaterialType && currentMaterialType !== value) {
                      updateCurrentZoneMultiple({
                        conductorType: value,
                        conductorMaterial: '',
                      })
                    } else {
                      updateCurrentZone('conductorType', value)
                    }
                  }}
                  options={[
                    { value: 'Cable', label: 'Cable' },
                    { value: 'Pletina', label: 'Pletina' },
                    { value: 'Redondo', label: 'Redondo' },
                  ]}
                  columns={3}
                  layout="grid"
                />
              </div>

              <div className="space-y-2">
                <Label>Naturaleza del conductor a presupuestar</Label>
                <CardSelect
                  value={currentZone?.conductorMaterial || data.conductorMaterial || ''}
                  onValueChange={(value) => {
                    // Al cambiar material, limpiar fijación si no es compatible
                    const newAvailableFixings = getFixingsByMaterial(value)
                    const currentFixingType = currentZone?.fixingType || data.fixingType
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

              {/* Regla 9: Solo mostrar fijaciones si NO es mástil autónomo */}
              {showFixingField && (
                <div className="space-y-2">
                  <Label>Tipo de fijaciones para el conductor</Label>
                  <CardSelect
                    value={currentZone?.fixingType || data.fixingType || ''}
                    onValueChange={(value) => updateCurrentZone('fixingType', value)}
                    options={availableFixings}
                    columns={4}
                    layout="grid"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>¿Se utilizarán bajantes de otros pararrayos como bajada?</Label>
                <RadioGroup
                  value={currentZone?.useOtherBajantes || data.useOtherBajantes || ''}
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

              {/* Campos condicionales si useOtherBajantes === "Si" */}
              {(currentZone?.useOtherBajantes || data.useOtherBajantes) === 'Si' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-right">Introduzca número de metros de conductor a utilizar</Label>
                    <Input
                      value={currentZone?.metrosConductor || data.metrosConductor || ''}
                      onChange={(e) => updateCurrentZone('metrosConductor', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-right">Tipo de cubierta</Label>
                    <CardSelect
                      value={currentZone?.tipoCubierta || data.tipoCubierta || ''}
                      onValueChange={(value) => updateCurrentZone('tipoCubierta', value)}
                      options={[
                        { value: 'Pared', label: 'Pared' },
                        { value: 'Terraza', label: 'Terraza' },
                      ]}
                      columns={2}
                      layout="grid"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>¿Se utilizan componentes naturales como bajadas?</Label>
                <RadioGroup
                  value={currentZone?.useNaturalComponents || data.useNaturalComponents || ''}
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

              {/* Número de bajantes + Recorrido horizontal en la misma fila */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Indique el número de bajantes a presupuestar</Label>
                  <Input
                    value={currentZone?.bajantesNumber || data.bajantesNumber || ''}
                    onChange={(e) => updateCurrentZone('bajantesNumber', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Recorrido horizontal total</Label>
                  <Input
                    value={currentZone?.totalLength || data.totalLength || ''}
                    onChange={(e) => updateCurrentZone('totalLength', e.target.value)}
                  />
                </div>
              </div>

              {/* Distancia entre bajantes + Margen extra en la misma fila */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Distancia entre las bajantes a nivel suelo</Label>
                  <Input
                    value={currentZone?.distanceGroundLevel || data.distanceGroundLevel || ''}
                    onChange={(e) => updateCurrentZone('distanceGroundLevel', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>¿Desea añadir un margen extra de materiales?</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[extraMargin]}
                      onValueChange={(value) => setExtraMargin(value[0] ?? 0)}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm">{extraMargin}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">
          {/* TOMA DE TIERRA */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">TOMA DE TIERRA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de toma de tierra</Label>
                <CardSelect
                  value={currentZone?.groundType || data.groundType || ''}
                  onValueChange={(value) => updateCurrentZone('groundType', value)}
                  options={[
                    { value: 'Tierratriangulos', label: 'Disposición en triángulo' },
                    { value: 'Tierraenlinea', label: 'Disposición en línea' },
                    { value: 'Patadeganso', label: 'Pata de ganso' },
                    { value: 'Enanillo', label: 'En anillo' },
                  ]}
                  columns={4}
                  layout="grid"
                />
              </div>

              <div className="space-y-2">
                <Label>Material de toma de tierra</Label>
                <CardSelect
                  value={currentZone?.groundMaterial || data.groundMaterial || ''}
                  onValueChange={(value) => updateCurrentZone('groundMaterial', value)}
                  options={[
                    { value: 'ElectrodosCobrizados', label: 'Electrodos Cobrizados' },
                    { value: 'PlacasdeTT', label: 'Placas de cobre' },
                    { value: 'ElectrodosDinamicos', label: 'Electrodos dinámicos' },
                  ]}
                  columns={3}
                  layout="grid"
                />
              </div>

              <div className="space-y-2">
                <Label>¿La toma de tierra se unirá a la tierra general?</Label>
                <RadioGroup
                  value={currentZone?.generalGround || data.generalGround || ''}
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

              <div className="space-y-2">
                <Label>Conductor enterrado para unión a tierra general</Label>
                <Input
                  value={currentZone?.generalGroundConductor || data.generalGroundConductor || ''}
                  onChange={(e) => updateCurrentZone('generalGroundConductor', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* ANTENAS */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">ANTENAS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Número de antenas + Conductor en la misma fila */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número de antenas en el tejado</Label>
                  <Input
                    value={currentZone?.antenasNumber || data.antenasNumber || ''}
                    onChange={(e) => updateCurrentZone('antenasNumber', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Conductor para unir las antenas a la bajante</Label>
                  <Input
                    value={currentZone?.antenasLength || data.antenasLength || ''}
                    onChange={(e) => updateCurrentZone('antenasLength', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Botón para calcular materiales */}
      <div>
        <Button onClick={handleCalculateMaterials} className="bg-primary hover:bg-primary/90">
          <Calculator className="mr-2 h-5 w-5" />
          Calcular los materiales
        </Button>
      </div>

      {/* Tabla de materiales calculados */}
      {showMaterialsTable && (
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">MATERIALES CALCULADOS</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref.</TableHead>
                  <TableHead>Materiales</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>AT-1560</TableCell>
                  <TableCell>DAT CONTROLER® REMOTE 60</TableCell>
                  <TableCell className="text-right">1,00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>AT-010A</TableCell>
                  <TableCell>Pieza adaptación, latón, para mástil PVC o cable o pletina</TableCell>
                  <TableCell className="text-right">1,00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>AT-056A</TableCell>
                  <TableCell>Mástil de Ø60 x 6m, galvanizado (2 tramos)</TableCell>
                  <TableCell className="text-right">1,00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>AT-023B</TableCell>
                  <TableCell>Anclaje en U 30cm atornillable (2 sop.), galvanizado</TableCell>
                  <TableCell className="text-right">1,00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>AT-184E</TableCell>
                  <TableCell>Soporte cónico esmaltado de 30 a 2mm</TableCell>
                  <TableCell className="text-right">1,00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>AT-052D</TableCell>
                  <TableCell>Pletina de cobre para cable o pletina (lleno)</TableCell>
                  <TableCell className="text-right">56,00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>AT-240E</TableCell>
                  <TableCell>Grapa helice de inox para pletina</TableCell>
                  <TableCell className="text-right">72,00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export const ExternalProtectionStep = memo(ExternalProtectionStepInner)
