import { useMemo, useEffect, useState, useCallback } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Sparkles, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { ProtectionSchemeCanvas } from '@/components/ProtectionSchemeCanvas'
import type { ProtectionSchemeStepProps } from '@/types/stepProps'
import {
  HEAD_CONFIGS,
  PROTECTION_LEVELS,
  MAST_TYPES,
  MAST_HEIGHTS,
  ANCHOR_TYPES,
  ANCHOR_SEPARATION_OPTIONS,
  getModelsByType,
} from '@/config/formConfig'

const isDev = import.meta.env.DEV

const HEAD_TYPES = HEAD_CONFIGS.map((c) => c.type)

/**
 * Generic function to select a random element preserving type
 */
function randomFromArray<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Gets the default model for a head type
 */
function getDefaultModel(type: string | undefined): string {
  const models = getModelsByType(type)
  return models.length > 0 ? models[0] : 'DAT CONTROLER REMOTE 15'
}

const generateMockProtectionScheme = () => {
  const randomNum = (min: number, max: number) => (Math.random() * (max - min) + min).toFixed(2)

  // Select head type using configuration
  const headType = randomFromArray(HEAD_TYPES)

  // Generate model matching the selected type using helper
  const availableModels = getModelsByType(headType)
  const headModel = randomFromArray(availableModels)

  return {
    headType,
    headModel,
    mastType: randomFromArray(['Telescopico', 'Fijo', 'Abatible'] as const),
    mastHeight: randomFromArray(['3', '6', '9', '12'] as const),
    anchorType: randomFromArray(['Pared', 'Suelo', 'Tejado'] as const),
    anchorSeparation: randomNum(1, 5),
  }
}

/**
 * Paso 5: Esquema de Protección
 * Implementación con navegación de pararrayos inspirada en el diseño original
 */
export function ProtectionSchemeStep({ data, onChange, onBulkChange }: ProtectionSchemeStepProps) {
  // Estado para el índice del pararrayos actualmente seleccionado
  const [selectedZoneIndex, setSelectedZoneIndex] = useState<number>(0)

  const handleAutofill = () => {
    if (onBulkChange) {
      onBulkChange(generateMockProtectionScheme())
    }
  }

  // Get head models based on the selected type using configuration
  const headOptions = useMemo(
    () => getModelsByType(data.headType),
    [data.headType]
  )

  // Get the current head type (with fallback to the first one)
  const currentHeadType = data.headType || HEAD_TYPES[0]

  // Get the current head model (with fallback to the first one of the selected type)
  const currentHeadModel = data.headModel || getDefaultModel(currentHeadType)

  // Lista de pararrayos configurados
  const protectionZones = data.protectionZones || []
  const hasZones = protectionZones.length > 0
  const currentZone = hasZones ? protectionZones[selectedZoneIndex] : null

  const handleZonesChange = useCallback((zones: typeof protectionZones) => {
    onChange('protectionZones', zones)
  }, [onChange])

  const handleCaptureImage = useCallback((imageData: string, timestamp: number) => {
    onBulkChange?.({
      schemeImage: imageData,
      schemeImageTimestamp: timestamp,
    })
  }, [onBulkChange])

  // Initialize head type if not defined on mount
  // Intentionally only runs once on mount to avoid re-initialization
  useEffect(() => {
    if (!data.headType) {
      onChange('headType', HEAD_TYPES[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Ajustar el índice seleccionado si se elimina un pararrayos
  useEffect(() => {
    if (hasZones && selectedZoneIndex >= protectionZones.length) {
      setSelectedZoneIndex(Math.max(0, protectionZones.length - 1))
    }
  }, [protectionZones.length, selectedZoneIndex, hasZones])

  // Function to add a new lightning rod from details panel
  // These are added to the list but NOT placed on the map until user draws an area
  const handleAddLightningRod = () => {
    const newZone = {
      id: `zone-${Date.now()}`,
      x: 40, // Default position (will be ignored if not placed on map)
      y: 25,
      radius: 20,
      model: currentHeadModel,
      level: data.protectionLevel || 'III',
      mastType: data.mastType,
      mastHeight: data.mastHeight,
      anchorType: data.anchorType,
      anchorSeparation: data.anchorSeparation,
      placedOnMap: false, // NOT placed on map yet
    }

    const updatedZones = [...protectionZones, newZone]
    onChange('protectionZones', updatedZones)
    setSelectedZoneIndex(updatedZones.length - 1)
  }

  // Navigation between lightning rods
  const handlePreviousZone = () => {
    if (selectedZoneIndex > 0) {
      setSelectedZoneIndex(selectedZoneIndex - 1)
    }
  }

  const handleNextZone = () => {
    if (selectedZoneIndex < protectionZones.length - 1) {
      setSelectedZoneIndex(selectedZoneIndex + 1)
    }
  }

  // Update the currently selected lightning rod
  const updateCurrentZone = (field: string, value: unknown) => {
    if (!currentZone || !hasZones) return

    const updatedZones = protectionZones.map((zone, index) =>
      index === selectedZoneIndex ? { ...zone, [field]: value } : zone
    )
    onChange('protectionZones', updatedZones)
  }

  // Delete a lightning rod by index
  const handleDeleteZone = (indexToDelete: number) => {
    const updatedZones = protectionZones.filter((_, index) => index !== indexToDelete)
    onChange('protectionZones', updatedZones)

    // Adjust selected index after deletion
    if (selectedZoneIndex >= updatedZones.length && updatedZones.length > 0) {
      setSelectedZoneIndex(updatedZones.length - 1)
    } else if (updatedZones.length === 0) {
      setSelectedZoneIndex(0)
    } else if (indexToDelete <= selectedZoneIndex && selectedZoneIndex > 0) {
      // Si se eliminó uno anterior o el seleccionado, ajustar el índice
      setSelectedZoneIndex(selectedZoneIndex - 1)
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
        {/* Columna izquierda: Detalles de la protección */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">DETALLES DE LA PROTECCIÓN</CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          {/* Nombre del edificio */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="buildingNameExt" className="col-span-2">
              Nombre del edificio
            </Label>
            <Input
              id="buildingNameExt"
              value={data.projectName || 'EDIFICIO PRODUCCIÓN'}
              readOnly
              className="col-span-3 bg-muted"
            />
          </div>

          {/* Altura del edificio */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="buildingHeight" className="col-span-2">
              Altura del edificio
            </Label>
            <Input
              id="buildingHeight"
              value={`${data.height || '20.00'} m`}
              readOnly
              className="col-span-3 bg-muted"
            />
          </div>

          <Separator className="my-4" />

          {/* Button to add lightning rod */}
          <div className="space-y-3">
            <Button
              onClick={handleAddLightningRod}
              className="w-full gap-2 bg-primary hover:bg-primary/90"
              size="lg"
            >
              <Plus className="h-5 w-5" />
              Añadir Pararrayos
            </Button>

            {/* Navigation between lightning rods */}
            {hasZones && (
              <div className="flex items-center justify-center gap-2 rounded-md border bg-muted/50 p-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePreviousZone}
                  disabled={selectedZoneIndex === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={selectedZoneIndex + 1}
                    readOnly
                    className="h-8 w-16 text-center"
                  />
                  <span className="text-sm text-muted-foreground">
                    de {protectionZones.length}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleNextZone}
                  disabled={selectedZoneIndex === protectionZones.length - 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Head type */}
          <div className="space-y-2">
            <Label>Tipo de cabezal {hasZones && <span className="text-xs text-muted-foreground">(editando pararrayos {selectedZoneIndex + 1})</span>}</Label>
            <RadioGroup
              value={hasZones ? (currentZone?.model?.includes('REMOTE') ? 'DAT CONTROLER® REMOTE' : 'DAT CONTROLER® PLUS') : (data.headType || HEAD_TYPES[0])}
              onValueChange={(value) => {
                if (hasZones) {
                  // Update current lightning rod
                  const newModel = getDefaultModel(value)
                  updateCurrentZone('model', newModel)
                } else {
                  // Update global configuration with default model
                  const newModel = getDefaultModel(value)
                  if (onBulkChange) {
                    onBulkChange({
                      headType: value,
                      headModel: newModel,
                    })
                  } else {
                    onChange('headType', value)
                    onChange('headModel', newModel)
                  }
                }
              }}
            >
              {HEAD_CONFIGS.map((config) => {
                const id = config.type.replace(/[®\s]/g, '').toLowerCase()
                return (
                  <div key={config.type} className="flex items-center space-x-2">
                    <RadioGroupItem value={config.type} id={id} />
                    <Label htmlFor={id} className="cursor-pointer">
                      {config.type}
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          </div>

          {/* Head model */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="headModel" className="col-span-2">
              Modelo de cabezal
            </Label>
            <div className="col-span-3">
              <Select
                key={`${currentHeadType}-${selectedZoneIndex}`}
                value={hasZones ? (currentZone?.model || '') : (data.headModel || '')}
                onValueChange={(value) => {
                  if (hasZones) {
                    updateCurrentZone('model', value)
                  } else {
                    onChange('headModel', value)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="--Seleccione modelo de cabezal--" />
                </SelectTrigger>
                <SelectContent>
                  {headOptions.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Radio de Protección */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="radioProteccion" className="col-span-2">
              Radio de Protección {hasZones && <span className="text-xs text-muted-foreground">(editando pararrayos {selectedZoneIndex + 1})</span>}
            </Label>
            <div className="col-span-3">
              <Select
                key={`protectionLevel-${selectedZoneIndex}`}
                value={hasZones ? (currentZone?.level || data.protectionLevel || 'III') : (data.protectionLevel || 'III')}
                onValueChange={(value) => {
                  if (hasZones) {
                    updateCurrentZone('level', value)
                  } else {
                    onChange('protectionLevel', value)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="--Seleccione nivel de protección--" />
                </SelectTrigger>
                <SelectContent>
                  {PROTECTION_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Tipo de mástil */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="mastType" className="col-span-2">
              Tipo de mástil
            </Label>
            <div className="col-span-3">
              <Select
                key={`mastType-${selectedZoneIndex}`}
                value={hasZones ? (currentZone?.mastType || data.mastType || '') : (data.mastType || '')}
                onValueChange={(value) => {
                  if (hasZones) {
                    updateCurrentZone('mastType', value)
                  } else {
                    onChange('mastType', value)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="--Seleccione tipo de mástil--" />
                </SelectTrigger>
                <SelectContent>
                  {MAST_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Altura del mástil */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="mastHeight" className="col-span-2">
              Altura del mástil
            </Label>
            <div className="col-span-3">
              <Select
                key={`mastHeight-${selectedZoneIndex}`}
                value={hasZones ? (currentZone?.mastHeight || data.mastHeight || '') : (data.mastHeight || '')}
                onValueChange={(value) => {
                  if (hasZones) {
                    updateCurrentZone('mastHeight', value)
                  } else {
                    onChange('mastHeight', value)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="--Seleccione altura--" />
                </SelectTrigger>
                <SelectContent>
                  {MAST_HEIGHTS.map((height) => (
                    <SelectItem key={height.value} value={height.value}>
                      {height.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Tipo de anclaje */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="anchorType" className="col-span-2">
              Tipo de anclaje
            </Label>
            <div className="col-span-3">
              <Select
                key={`anchorType-${selectedZoneIndex}`}
                value={hasZones ? (currentZone?.anchorType || data.anchorType || '') : (data.anchorType || '')}
                onValueChange={(value) => {
                  if (hasZones) {
                    updateCurrentZone('anchorType', value)
                  } else {
                    onChange('anchorType', value)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="--Seleccione tipo de anclaje--" />
                </SelectTrigger>
                <SelectContent>
                  {ANCHOR_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Separación del anclaje */}
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="anchorSeparation" className="col-span-2">
              Separación del anclaje
            </Label>
            <div className="col-span-3">
              <Select
                key={`anchorSeparation-${selectedZoneIndex}`}
                value={hasZones ? (currentZone?.anchorSeparation || data.anchorSeparation || '') : (data.anchorSeparation || '')}
                onValueChange={(value) => {
                  if (hasZones) {
                    updateCurrentZone('anchorSeparation', value)
                  } else {
                    onChange('anchorSeparation', value)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="--Seleccione separación--" />
                </SelectTrigger>
                <SelectContent>
                  {ANCHOR_SEPARATION_OPTIONS.map((option) => (
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

      {/* Right column: Interactive protection scheme */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">ESQUEMA DE PROTECCIÓN</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProtectionSchemeCanvas
            cabezalModel={currentHeadModel}
            protectionLevel={data.protectionLevel || 'III'}
            buildingLength={data.length ? parseFloat(data.length) : 80}
            buildingWidth={data.width ? parseFloat(data.width) : 50}
            mastType={data.mastType}
            mastHeight={data.mastHeight}
            anchorType={data.anchorType}
            anchorSeparation={data.anchorSeparation}
            initialProtectionZones={data.protectionZones}
            selectedZoneId={currentZone?.id}
            onZonesChange={handleZonesChange}
            onCaptureImage={handleCaptureImage}
          />

          {/* List of individual lightning rods */}
          {data.protectionZones && data.protectionZones.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="text-sm font-semibold text-primary mb-3">PARARRAYOS CONFIGURADOS</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left">#</th>
                        <th className="p-2 text-left">Estado</th>
                        <th className="p-2 text-left">Modelo</th>
                        <th className="p-2 text-left">Nivel</th>
                        <th className="p-2 text-left">Tipo Mástil</th>
                        <th className="p-2 text-left">Altura</th>
                        <th className="p-2 text-left">Anclaje</th>
                        <th className="p-2 text-left">Separación</th>
                        <th className="p-2 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.protectionZones.map((zone, index) => {
                        const isOnMap = zone.placedOnMap === true
                        return (
                          <tr
                            key={zone.id}
                            className={`border-b transition-colors ${
                              index === selectedZoneIndex
                                ? 'bg-primary/10 hover:bg-primary/20'
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <td
                              className="p-2 font-semibold cursor-pointer"
                              onClick={() => setSelectedZoneIndex(index)}
                            >
                              {index === selectedZoneIndex && <span className="mr-1">▶</span>}
                              {index + 1}
                            </td>
                            <td
                              className="p-2 cursor-pointer"
                              onClick={() => setSelectedZoneIndex(index)}
                            >
                              {isOnMap ? (
                                <span className="text-green-600 text-xs font-medium">✓ En mapa</span>
                              ) : (
                                <span className="text-orange-600 text-xs font-medium">⚠ Pendiente</span>
                              )}
                            </td>
                            <td
                              className="p-2 cursor-pointer"
                              onClick={() => setSelectedZoneIndex(index)}
                            >{zone.model || currentHeadModel}</td>
                            <td
                              className="p-2 cursor-pointer"
                              onClick={() => setSelectedZoneIndex(index)}
                            >{zone.level || data.protectionLevel || 'III'}</td>
                            <td
                              className="p-2 cursor-pointer"
                              onClick={() => setSelectedZoneIndex(index)}
                            >{zone.mastType || data.mastType || '-'}</td>
                            <td
                              className="p-2 cursor-pointer"
                              onClick={() => setSelectedZoneIndex(index)}
                            >{zone.mastHeight || data.mastHeight || '-'}</td>
                            <td
                              className="p-2 cursor-pointer"
                              onClick={() => setSelectedZoneIndex(index)}
                            >{zone.anchorType || data.anchorType || '-'}</td>
                            <td
                              className="p-2 cursor-pointer"
                              onClick={() => setSelectedZoneIndex(index)}
                            >{zone.anchorSeparation || data.anchorSeparation || '-'}</td>
                            <td className="p-2 text-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteZone(index)
                                }}
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  <p>
                    Total de pararrayos configurados: <strong>{data.protectionZones.length}</strong>
                    {' '}
                    (<span className="text-green-600 font-medium">✓ En mapa: {data.protectionZones.filter(z => z.placedOnMap === true).length}</span>
                    {' | '}
                    <span className="text-orange-600 font-medium">⚠ Pendientes: {data.protectionZones.filter(z => z.placedOnMap !== true).length}</span>)
                  </p>
                  <p className="mt-2">
                    <span className="text-green-600 font-medium">✓ En mapa:</span> Colocado y visible en el esquema de protección
                  </p>
                  <p className="mt-1">
                    <span className="text-orange-600 font-medium">⚠ Pendiente:</span> Configurado pero no colocado en el mapa (dibuja un área primero)
                  </p>
                  <p className="mt-1">Haz clic en una fila para seleccionarla y editarla con los controles de arriba.</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      </div>
    </div>
  )
}
