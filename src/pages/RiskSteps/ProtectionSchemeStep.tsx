import { useMemo, useEffect, useState, useCallback, memo, useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { ProtectionSchemeCanvas } from '@/components/ProtectionSchemeCanvas'
import type { ProtectionSchemeStepProps } from '@/types/stepProps'
import {
  HEAD_CONFIGS,
  MAST_TYPES,
  ANCHOR_SEPARATION_OPTIONS,
  getModelsByType,
  getHeadType,
  getHeightsByMastType,
  getAnchorsByHeight,
  getTranslatedOptions,
} from '@/config/formConfig'

const HEAD_TYPES = HEAD_CONFIGS.map((c) => c.type)

function getDefaultModel(type: string | undefined): string {
  const models = getModelsByType(type)
  return models.length > 0 ? models[0] : 'DAT CONTROLER REMOTE 15'
}

/**
 * Paso 5: Esquema de Protección
 */
function ProtectionSchemeStepInner({ data, onChange, onBulkChange }: ProtectionSchemeStepProps) {
  const [selectedZoneIndex, setSelectedZoneIndex] = useState(0)
  const [isDrawingMode, setIsDrawingMode] = useState(false)
  const [drawingPointsCount, setDrawingPointsCount] = useState(0)
  const [hasStructure, setHasStructure] = useState(false)
  const cancelDrawingRef = useRef<(() => void) | null>(null)
  const editStructureRef = useRef<(() => void) | null>(null)
  const deleteStructureRef = useRef<(() => void) | null>(null)
  const prevZonesLengthRef = useRef(0)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Callback para el modo de dibujo
  const handleDrawingModeChange = useCallback((isDrawing: boolean, pointsCount: number, cancelFn: () => void, hasStruct: boolean, editFn: () => void, deleteFn: () => void) => {
    setIsDrawingMode(isDrawing)
    setDrawingPointsCount(pointsCount)
    setHasStructure(hasStruct)
    cancelDrawingRef.current = cancelFn
    editStructureRef.current = editFn
    deleteStructureRef.current = deleteFn
  }, [])

  // Datos derivados
  const protectionZones = data.protectionZones || []
  const hasZones = protectionZones.length > 0
  const currentZone = hasZones ? protectionZones[selectedZoneIndex] : null
  const buildingLength = data.length ? parseFloat(data.length) : 80
  const buildingWidth = data.width ? parseFloat(data.width) : 50
  const protectionLevel = data.protectionLevel || 'III'

  // MastType actual (zona o global)
  const currentMastType = hasZones
    ? (currentZone?.mastType || data.mastType)
    : data.mastType

  const showAnchorField = currentMastType === 'Mastil'

  const currentHeadType = useMemo(() => {
    if (hasZones && currentZone?.model) {
      return getHeadType(currentZone.model) || HEAD_TYPES[0]
    }
    return data.headType || HEAD_TYPES[0]
  }, [hasZones, currentZone?.model, data.headType])

  const headOptions = useMemo(
    () => getModelsByType(currentHeadType).map(model => ({ value: model, label: model })),
    [currentHeadType]
  )

  const currentHeadModel = useMemo(() => {
    if (hasZones && currentZone?.model) return currentZone.model
    return data.headModel || getDefaultModel(currentHeadType)
  }, [hasZones, currentZone?.model, data.headModel, currentHeadType])

  const availableHeights = useMemo(
    () => getTranslatedOptions(getHeightsByMastType(currentMastType)),
    [currentMastType]
  )

  const availableAnchors = useMemo(() => {
    if (currentMastType !== 'Mastil') return []
    const mastHeight = hasZones ? (currentZone?.mastHeight || data.mastHeight) : data.mastHeight
    return getTranslatedOptions(getAnchorsByHeight(mastHeight))
  }, [currentMastType, hasZones, currentZone?.mastHeight, data.mastHeight])

  const canvasProps = useMemo(() => ({
    cabezalModel: currentHeadModel,
    protectionLevel,
    buildingLength,
    buildingWidth,
    buildingName: data.buildingName,
    mastType: data.mastType,
    mastHeight: data.mastHeight,
    anchorType: data.anchorType,
    anchorSeparation: data.anchorSeparation,
    initialProtectionZones: data.protectionZones,
    selectedZoneId: currentZone?.id,
  }), [currentHeadModel, protectionLevel, buildingLength, buildingWidth, data.buildingName, data.mastType, data.mastHeight, data.anchorType, data.anchorSeparation, data.protectionZones, currentZone?.id])

  // === HELPERS ===

  // Obtener valor de campo de zona o global
  const getZoneOrGlobalValue = useCallback((
    zoneValue: string | undefined,
    globalValue: string | undefined
  ): string => {
    if (hasZones) {
      return zoneValue || globalValue || ''
    }
    return globalValue || ''
  }, [hasZones])

  // Actualizar zona actual
  const updateZone = useCallback((fields: Record<string, string>) => {
    if (!hasZones || selectedZoneIndex < 0) return
    const updatedZones = protectionZones.map((zone, i) =>
      i === selectedZoneIndex ? { ...zone, ...fields } : zone
    )
    onChange('protectionZones', updatedZones)
  }, [hasZones, protectionZones, selectedZoneIndex, onChange])

  // === HANDLERS ===

  const handleZonesChange = useCallback((zones: typeof protectionZones) => {
    onChange('protectionZones', zones)
  }, [onChange])

  const handleCaptureImage = useCallback((imageData: string, timestamp: number) => {
    onBulkChange?.({ schemeImage: imageData, schemeImageTimestamp: timestamp })
  }, [onBulkChange])

  const handleAddLightningRod = useCallback(() => {
    const newZone = {
      id: `zone-${Date.now()}`,
      x: 400,
      y: 250,
      radius: 20,
      model: currentHeadModel,
      level: data.protectionLevel || '',
      mastType: '',
      mastHeight: '',
      anchorType: '',
      anchorSeparation: '',
      placedOnMap: true,
    }
    onChange('protectionZones', [...protectionZones, newZone])
  }, [currentHeadModel, data.protectionLevel, protectionZones, onChange])

  const handleDeleteZone = useCallback((indexToDelete: number) => {
    const updatedZones = protectionZones.filter((_, i) => i !== indexToDelete)
    onChange('protectionZones', updatedZones)

    const newIndex = updatedZones.length === 0
      ? 0
      : Math.min(selectedZoneIndex, updatedZones.length - 1)

    if (indexToDelete <= selectedZoneIndex) {
      setSelectedZoneIndex(Math.max(0, newIndex - (indexToDelete < selectedZoneIndex ? 1 : 0)))
    }
  }, [protectionZones, selectedZoneIndex, onChange])

  const handleHeadTypeChange = useCallback((value: string) => {
    const newModel = getDefaultModel(value)
    if (hasZones) {
      updateZone({ model: newModel })
    } else {
      onBulkChange?.({ headType: value, headModel: newModel })
    }
  }, [hasZones, updateZone, onBulkChange])

  const handleHeadModelChange = useCallback((value: string) => {
    if (hasZones) {
      updateZone({ model: value })
    } else {
      onChange('headModel', value)
    }
  }, [hasZones, updateZone, onChange])

  const handleMastTypeChange = useCallback((value: string) => {
    if (hasZones) {
      updateZone({ mastType: value, mastHeight: '', anchorType: '' })
    } else {
      onBulkChange?.({ mastType: value, mastHeight: '', anchorType: '' })
    }
  }, [hasZones, updateZone, onBulkChange])

  const handleMastHeightChange = useCallback((value: string) => {
    const currentAnchor = hasZones
      ? (currentZone?.anchorType || data.anchorType)
      : data.anchorType

    const needsAnchorReset = currentMastType === 'Mastil' &&
      currentAnchor &&
      !getAnchorsByHeight(value).some(a => a.value === currentAnchor)

    if (hasZones) {
      if (needsAnchorReset) {
        updateZone({ mastHeight: value, anchorType: '' })
      } else {
        updateZone({ mastHeight: value })
      }
    } else {
      if (needsAnchorReset) {
        onBulkChange?.({ mastHeight: value, anchorType: '' })
      } else {
        onChange('mastHeight', value)
      }
    }
  }, [hasZones, currentZone?.anchorType, data.anchorType, currentMastType, updateZone, onBulkChange, onChange])

  const handleAnchorTypeChange = useCallback((value: string) => {
    if (hasZones) {
      updateZone({ anchorType: value })
    } else {
      onChange('anchorType', value)
    }
  }, [hasZones, updateZone, onChange])

  const handleAnchorSeparationChange = useCallback((value: string) => {
    if (hasZones) {
      updateZone({ anchorSeparation: value })
    } else {
      onChange('anchorSeparation', value)
    }
  }, [hasZones, updateZone, onChange])

  // === EFFECTS ===

  useEffect(() => {
    if (!data.headType) {
      onChangeRef.current('headType', HEAD_TYPES[0])
    }
  }, [data.headType])

  useEffect(() => {
    if (hasZones && selectedZoneIndex >= protectionZones.length) {
      setSelectedZoneIndex(Math.max(0, protectionZones.length - 1))
    }
  }, [protectionZones.length, selectedZoneIndex, hasZones])

  useEffect(() => {
    const currentLength = protectionZones.length
    if (currentLength > prevZonesLengthRef.current && currentLength > 0) {
      setSelectedZoneIndex(currentLength - 1)
    }
    prevZonesLengthRef.current = currentLength
  }, [protectionZones.length])

  return (
    <div className="flex flex-col  h-full min-h-0 flex-1">
      {/* Header */}
      <Card className="flex-1 min-h-0 h-[65vh]">
        <CardContent className="flex-1 min-h-0 h-full">
          <div className="flex gap-6 h-full min-h-0 items-stretch">
            {/* Formulario */}
            <div className="w-1/4 h-[calc(65vh)]">
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-6 pr-4">
              {/* Información del edificio */}
              <div className="space-y-4">
                <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  1. Datos del edificio
                </p>
                <div className="space-y-2">
                  <Label htmlFor="buildingName">Nombre del edificio</Label>
                  <div className="flex gap-2">
                    <Input
                      id="buildingName"
                      value={data.buildingName || ''}
                      onChange={(e) => onChange('buildingName', e.target.value)}
                      placeholder="Nombre del edificio"
                      className="bg-card flex-1"
                    />
                    {hasStructure ? (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 shrink-0"
                          title="Editar estructura"
                          onClick={() => editStructureRef.current?.()}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Eliminar estructura"
                          onClick={() => deleteStructureRef.current?.()}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        className="h-9 shrink-0 gap-2 px-3"
                        title={isDrawingMode ? `Dibujando: ${drawingPointsCount} puntos` : "Editar estructura"}
                        disabled={isDrawingMode}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="text-xs">Estructura</span>
                      </Button>
                    )}
                  </div>
                  {/* Tooltip de instrucciones de dibujo */}
                  {isDrawingMode && (
                    <div className="bg-primary text-primary-foreground px-4 py-3 rounded-md mt-2">
                      <p className="text-xs font-semibold mb-1">DIBUJANDO...</p>
                      <p className="text-[11px] opacity-90">
                        Haz clic en el plano para añadir puntos. Une el último punto con el primero para cerrar la forma.
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full text-primary-foreground hover:bg-primary-foreground/10 border border-primary-foreground/30 h-7 text-xs"
                        onClick={() => cancelDrawingRef.current?.()}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buildingHeight" className="text-xs">Altura total (m)</Label>
                  <Input
                    id="buildingHeight"
                    value={data.height ? `${data.height}` : ''}
                    disabled
                    placeholder="No especificada"
                    className="bg-muted"
                  />
                </div>
              </div>

              <Separator />

              {/* Configurar nuevo pararrayos */}
              <div className="rounded-xl border p-4 space-y-4 bg-[var(--surface-muted)]">
                <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  2. Configurar nuevo pararrayos
                </p>

                {/* Tipo de cabezal */}
                <div className="space-y-2">
                  <Label htmlFor="headType" className="text-xs">Tipo de cabezal</Label>
                  <Select
                    value={hasZones ? (getHeadType(currentZone?.model || '') || HEAD_TYPES[0]) : (data.headType || HEAD_TYPES[0])}
                    onValueChange={handleHeadTypeChange}
                  >
                    <SelectTrigger id="headType" className="w-full bg-card">
                      <SelectValue placeholder="Selecciona tipo de cabezal" />
                    </SelectTrigger>
                    <SelectContent>
                      {HEAD_CONFIGS.map((config) => (
                        <SelectItem key={config.type} value={config.type}>
                          {config.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Modelo de cabezal */}
                <div className="space-y-2">
                  <Label htmlFor="headModel" className="text-xs">Modelo de cabezal</Label>
                  <Select
                    key={`${currentHeadType}-${selectedZoneIndex}`}
                    value={hasZones ? (currentZone?.model || '') : (data.headModel || '')}
                    onValueChange={handleHeadModelChange}
                  >
                    <SelectTrigger id="headModel" className="w-full bg-card">
                      <SelectValue placeholder="Selecciona modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {headOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3">
                  {/* Tipo de mástil */}
                  <div className="space-y-2 w-1/2 min-w-0">
                    <Label htmlFor="mastType" className="text-xs">Tipo de mástil</Label>
                    <Select
                      key={`mastType-${selectedZoneIndex}`}
                      value={getZoneOrGlobalValue(currentZone?.mastType, data.mastType)}
                      onValueChange={handleMastTypeChange}
                    >
                      <SelectTrigger id="mastType" className="w-full bg-card truncate">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {getTranslatedOptions(MAST_TYPES).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Altura del mástil */}
                  <div className="space-y-2 w-1/2 min-w-0">
                    <Label htmlFor="mastHeight" className="text-xs">Altura (m)</Label>
                    <Select
                      key={`mastHeight-${selectedZoneIndex}`}
                      value={getZoneOrGlobalValue(currentZone?.mastHeight, data.mastHeight)}
                      onValueChange={handleMastHeightChange}
                      disabled={!currentMastType}
                    >
                      <SelectTrigger id="mastHeight" className="w-full bg-card truncate">
                        <SelectValue placeholder="Altura" />
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
                </div>

                {/* Anclaje - Solo si mastType === 'Mastil' */}
                {showAnchorField && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="anchorType" className="text-xs">Tipo de anclaje</Label>
                      <Select
                        key={`anchorType-${selectedZoneIndex}`}
                        value={getZoneOrGlobalValue(currentZone?.anchorType, data.anchorType)}
                        onValueChange={handleAnchorTypeChange}
                      >
                        <SelectTrigger id="anchorType" className="w-full bg-card">
                          <SelectValue placeholder="Selecciona anclaje" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableAnchors.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="anchorSeparation" className="text-xs">Separación del anclaje</Label>
                      <Select
                        key={`anchorSeparation-${selectedZoneIndex}`}
                        value={getZoneOrGlobalValue(currentZone?.anchorSeparation, data.anchorSeparation)}
                        onValueChange={handleAnchorSeparationChange}
                      >
                        <SelectTrigger id="anchorSeparation" className="w-full bg-card">
                          <SelectValue placeholder="Selecciona separación" />
                        </SelectTrigger>
                        <SelectContent>
                          {getTranslatedOptions(ANCHOR_SEPARATION_OPTIONS).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <Button
                  size="sm"
                  onClick={handleAddLightningRod}
                  disabled={isDrawingMode}
                  className="h-9 text-xs bg-primary hover:bg-primary/90 w-full"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Añadir pararrayos
                </Button>
              </div>

              <Separator />

              {/* Lista de pararrayos */}
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    3. Instalados
                  </p>
                  {protectionZones.length > 0 && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onChange('protectionZones', [])}
                      className="h-7 text-xs"
                    >
                      Borrar todo
                    </Button>
                  )}
                </div>
                {protectionZones.length > 0 ? (
                  <div className="space-y-2">
                    {protectionZones.map((zone, index) => (
                      <div
                        key={zone.id}
                        className={`flex items-center justify-between gap-3 p-3 rounded-lg text-xs cursor-pointer transition-colors border ${
                          index === selectedZoneIndex
                            ? 'bg-card border-[0.5px] border-[var(--border-strong)] shadow-[0px_2px_4px_0px_var(--shadow-10)]'
                            : 'bg-muted/30 hover:bg-primary/10 border-transparent'
                        }`}
                        onClick={() => setSelectedZoneIndex(index)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                            {index + 1}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-semibold text-primary">
                              {zone.model || currentHeadModel}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {data.buildingName || 'EDIFICIO'} - {zone.mastType || data.mastType || 'Mástil'} {zone.mastHeight || data.mastHeight || ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedZoneIndex(index)
                            }}
                            className="h-6 w-6 text-primary hover:bg-primary/10"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteZone(index)
                            }}
                            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">Sin pararrayos</p>
                )}
              </div>
                </div>
              </ScrollArea>
            </div>

            {/* Canvas */}
            <div className="flex-1 h-[calc(60vh)]">
              <ProtectionSchemeCanvas
                {...canvasProps}
                onZonesChange={handleZonesChange}
                onCaptureImage={handleCaptureImage}
                onDrawingModeChange={handleDrawingModeChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const ProtectionSchemeStep = memo(ProtectionSchemeStepInner)
