import { useMemo, useEffect, useState, useCallback, memo } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CardSelect } from '@/components/ui/card-select'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2 } from 'lucide-react'
import { ProtectionSchemeCanvas } from '@/components/ProtectionSchemeCanvas'
import { PararrayosNavigation } from '@/components/PararrayosNavigation'
import type { ProtectionSchemeStepProps } from '@/types/stepProps'
import {
  HEAD_CONFIGS,
  PROTECTION_LEVELS,
  PROTECTION_LEVELS_CTE,
  MAST_TYPES,
  MAST_HEIGHTS,
  ANCHOR_TYPES,
  ANCHOR_SEPARATION_OPTIONS,
  getModelsByType,
  getHeadType,
  getHeightsByMastType,
  getAnchorsByHeight,
} from '@/config/formConfig'

const HEAD_TYPES = HEAD_CONFIGS.map((c) => c.type)

/**
 * Gets the default model for a head type
 */
function getDefaultModel(type: string | undefined): string {
  const models = getModelsByType(type)
  return models.length > 0 ? models[0] : 'DAT CONTROLER REMOTE 15'
}

/**
 * Paso 5: Esquema de Protección
 * Implementación con navegación de pararrayos inspirada en el diseño original
 */
function ProtectionSchemeStepInner({ data, onChange, onBulkChange }: ProtectionSchemeStepProps) {
  // Estado para el índice del pararrayos actualmente seleccionado
  const [selectedZoneIndex, setSelectedZoneIndex] = useState<number>(0)

  // Lista de pararrayos configurados
  const protectionZones = data.protectionZones || []
  const hasZones = protectionZones.length > 0
  const currentZone = hasZones ? protectionZones[selectedZoneIndex] : null

  // Calculate the current head type based on whether we're editing a zone or global config
  const currentHeadType = useMemo(() => {
    if (hasZones && currentZone?.model) {
      return getHeadType(currentZone.model) || HEAD_TYPES[0]
    }
    return data.headType || HEAD_TYPES[0]
  }, [hasZones, currentZone?.model, data.headType])

  // Get head models based on the current type
  const headOptions = useMemo(
    () => getModelsByType(currentHeadType).map(model => ({ value: model, label: model })),
    [currentHeadType]
  )

  // Get the current head model (with fallback to the first one of the selected type)
  const currentHeadModel = useMemo(() => {
    if (hasZones && currentZone?.model) {
      return currentZone.model
    }
    return data.headModel || getDefaultModel(currentHeadType)
  }, [hasZones, currentZone?.model, data.headModel, currentHeadType])

  // Get protection level options based on normative
  const protectionOptions = useMemo(() => {
    return data.calculationNormative === 'cte' ? PROTECTION_LEVELS_CTE : PROTECTION_LEVELS
  }, [data.calculationNormative])

  // Regla 4: Get available heights based on selected mast type
  const availableHeights = useMemo(() => {
    const mastType = hasZones ? (currentZone?.mastType || data.mastType) : data.mastType
    return getHeightsByMastType(mastType)
  }, [hasZones, currentZone?.mastType, data.mastType])

  // Regla 5: Show anchor field only if mastType is 'Mastil'
  const showAnchorField = useMemo(() => {
    const mastType = hasZones ? (currentZone?.mastType || data.mastType) : data.mastType
    return mastType === 'Mastil'
  }, [hasZones, currentZone?.mastType, data.mastType])

  // Regla 6: Get available anchors based on selected mast height (only for Mástil)
  const availableAnchors = useMemo(() => {
    const mastType = hasZones ? (currentZone?.mastType || data.mastType) : data.mastType
    if (mastType !== 'Mastil') return []

    const mastHeight = hasZones ? (currentZone?.mastHeight || data.mastHeight) : data.mastHeight
    return getAnchorsByHeight(mastHeight)
  }, [hasZones, currentZone?.mastType, currentZone?.mastHeight, data.mastType, data.mastHeight])

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
      x: 400, // Centro del canvas (800px / 2), dentro del edificio
      y: 250, // Centro del canvas (500px / 2), dentro del edificio
      radius: 20,
      model: currentHeadModel,
      level: data.protectionLevel || 'III',
      mastType: data.mastType,
      mastHeight: data.mastHeight,
      anchorType: data.anchorType,
      anchorSeparation: data.anchorSeparation,
      placedOnMap: true, // Colocado por defecto en el mapa
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

  // Update multiple fields at once in the currently selected lightning rod
  const updateCurrentZoneMultiple = (fields: Record<string, unknown>) => {
    if (!currentZone || !hasZones) return

    const updatedZones = protectionZones.map((zone, index) =>
      index === selectedZoneIndex ? { ...zone, ...fields } : zone
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
    <div className="space-y-6">
      {/* Header con título y switch de validación */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Esquema de Protección</h2>
        <div className="flex items-center gap-3">
          <Label htmlFor="skip-validation-step5" className="text-sm font-normal cursor-pointer">
            Omitir validación de campos
          </Label>
          <Switch
            id="skip-validation-step5"
            checked={data.skipValidation || false}
            onCheckedChange={(checked) => onChange('skipValidation', checked)}
          />
        </div>
      </div>

      {/* Header: Información del edificio */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Nombre del edificio</p>
            <p className="text-lg font-semibold text-foreground">{data.projectName || 'EDIFICIO PRODUCCIÓN'}</p>
          </div>
          <Separator orientation="vertical" className="h-12" />
          <div>
            <p className="text-sm text-muted-foreground">Altura</p>
            <p className="text-lg font-semibold text-foreground">{data.height || '20.00'} m</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Columna izquierda: Controles y Tabla apilados */}
        <div className="space-y-6">
          {/* Controles */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-primary">PARARRAYOS CONFIGURADOS</CardTitle>
              <div>

               <Button
                  onClick={handleAddLightningRod}
                  className="bg-primary hover:bg-primary/90"
                  
                  >
                  <Plus className="h-5 w-5" />
                  Añadir Pararrayos
                </Button>
                  </div>
            </CardHeader>
            <CardContent>
              {data.protectionZones && data.protectionZones.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="p-2 text-left">#</th>
                          <th className="p-2 text-left">Modelo</th>
                          <th className="p-2 text-left">Nivel</th>
                          <th className="p-2 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.protectionZones.map((zone, index) => {
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
                              >{zone.model || currentHeadModel}</td>
                              <td
                                className="p-2 cursor-pointer"
                                onClick={() => setSelectedZoneIndex(index)}
                              >{zone.level || data.protectionLevel || 'III'}</td>
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
                      Total: <strong>{data.protectionZones.length}</strong> pararrayos
                    </p>
                    <p className="mt-1">Haz clic en una fila para editarla.</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No hay pararrayos configurados</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">CONFIGURACIÓN  PARARRAYO {selectedZoneIndex + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            
              {/* Head type */}
              <div className="space-y-2">
                <Label>Tipo de cabezal</Label>
                <RadioGroup
                  value={hasZones ? (getHeadType(currentZone?.model || '') || HEAD_TYPES[0]) : (data.headType || HEAD_TYPES[0])}
                  onValueChange={(value) => {
                    if (hasZones) {
                      const newModel = getDefaultModel(value)
                      updateCurrentZone('model', newModel)
                    } else {
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
                  className="flex flex-wrap gap-4"
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
              <div className="space-y-2">
                <Label htmlFor="headModel">Modelo de cabezal</Label>
                <CardSelect
                  key={`${currentHeadType}-${selectedZoneIndex}`}
                  value={hasZones ? (currentZone?.model || '') : (data.headModel || '')}
                  onValueChange={(value) => {
                    if (hasZones) {
                      updateCurrentZone('model', value)
                    } else {
                      onChange('headModel', value)
                    }
                  }}
                  options={headOptions}
                  columns={2}
                />
              </div>

              {/* Radio de Protección */}
              <div className="space-y-2">
                <Label htmlFor="radioProteccion">
                  Radio de Protección {hasZones && <span className="text-xs text-muted-foreground">(editando pararrayos {selectedZoneIndex + 1})</span>}
                </Label>
                <CardSelect
                  key={`protectionLevel-${selectedZoneIndex}-${data.calculationNormative}`}
                  value={hasZones ? (currentZone?.level || data.protectionLevel || (data.calculationNormative === 'cte' ? '3' : 'III')) : (data.protectionLevel || (data.calculationNormative === 'cte' ? '3' : 'III'))}
                  onValueChange={(value) => {
                    if (hasZones) {
                      updateCurrentZone('level', value)
                    } else {
                      onChange('protectionLevel', value)
                    }
                  }}
                  options={protectionOptions}
                  columns={4}
                />
              </div>

              <Separator />

              {/* Tipo de mástil */}
              <div className="space-y-2">
                <Label htmlFor="mastType">Tipo de mástil</Label>
                <CardSelect
                  key={`mastType-${selectedZoneIndex}`}
                  value={hasZones ? (currentZone?.mastType || data.mastType || '') : (data.mastType || '')}
                  onValueChange={(value) => {
                    if (hasZones) {
                      updateCurrentZoneMultiple({
                        mastType: value,
                        mastHeight: '',
                        anchorType: '',
                      })
                    } else {
                      if (onBulkChange) {
                        onBulkChange({
                          mastType: value,
                          mastHeight: '',
                          anchorType: '',
                        })
                      }
                    }
                  }}
                  options={MAST_TYPES}
                  columns={4}
                  layout="grid"
                />
              </div>

              {/* Altura del mástil */}
              <div className="space-y-2">
                <Label htmlFor="mastHeight">Altura del mástil</Label>
                <Select
                  key={`mastHeight-${selectedZoneIndex}`}
                  value={hasZones ? (currentZone?.mastHeight || data.mastHeight || '') : (data.mastHeight || '')}
                  onValueChange={(value) => {
                    if (hasZones) {
                      const currentMastType = currentZone?.mastType || data.mastType
                      if (currentMastType === 'Mastil') {
                        const currentAnchor = currentZone?.anchorType || data.anchorType
                        const newAvailableAnchors = getAnchorsByHeight(value)
                        if (currentAnchor && !newAvailableAnchors.some(a => a.value === currentAnchor)) {
                          updateCurrentZoneMultiple({
                            mastHeight: value,
                            anchorType: '',
                          })
                        } else {
                          updateCurrentZone('mastHeight', value)
                        }
                      } else {
                        updateCurrentZone('mastHeight', value)
                      }
                    } else {
                      if (data.mastType === 'Mastil') {
                        const newAvailableAnchors = getAnchorsByHeight(value)
                        if (data.anchorType && !newAvailableAnchors.some(a => a.value === data.anchorType)) {
                          if (onBulkChange) {
                            onBulkChange({
                              mastHeight: value,
                              anchorType: '',
                            })
                          }
                        } else {
                          onChange('mastHeight', value)
                        }
                      } else {
                        onChange('mastHeight', value)
                      }
                    }
                  }}
                >
                  <SelectTrigger id="mastHeight">
                    <SelectValue placeholder="Selecciona altura" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableHeights.map((height) => (
                      <SelectItem key={height.value} value={height.value}>
                        {height.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de anclaje - Solo visible si mastType === 'Mastil' */}
              {showAnchorField && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="anchorType">Tipo de anclaje</Label>
                    <CardSelect
                      key={`anchorType-${selectedZoneIndex}`}
                      value={hasZones ? (currentZone?.anchorType || data.anchorType || '') : (data.anchorType || '')}
                      onValueChange={(value) => {
                        if (hasZones) {
                          updateCurrentZone('anchorType', value)
                        } else {
                          onChange('anchorType', value)
                        }
                      }}
                      options={availableAnchors}
                      columns={2}
                    />
                  </div>

                  {/* Separación del anclaje */}
                  <div className="space-y-2">
                    <Label htmlFor="anchorSeparation">Separación del anclaje</Label>
                    <CardSelect
                      key={`anchorSeparation-${selectedZoneIndex}`}
                      value={hasZones ? (currentZone?.anchorSeparation || data.anchorSeparation || '') : (data.anchorSeparation || '')}
                      onValueChange={(value) => {
                        if (hasZones) {
                          updateCurrentZone('anchorSeparation', value)
                        } else {
                          onChange('anchorSeparation', value)
                        }
                      }}
                      options={ANCHOR_SEPARATION_OPTIONS}
                      columns={3}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tabla de pararrayos */}
          
        </div>

        {/* Columna derecha: Canvas */}
        <Card className="md:row-span-2">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const ProtectionSchemeStep = memo(ProtectionSchemeStepInner)
