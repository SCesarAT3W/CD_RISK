import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import type { KonvaEventObject } from 'konva/lib/Node'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { COLOR_TOKENS } from '@/lib/colorTokens'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'

// === TYPES ===

interface Point {
  x: number
  y: number
}

interface Area {
  id: string
  points: number[]
  closed: boolean
}

export interface ProtectionZone {
  id: string
  x: number
  y: number
  radius: number
  model: string
  level: string
  mastType?: string
  mastHeight?: string
  anchorType?: string
  anchorSeparation?: string
  placedOnMap?: boolean
}

interface UseProtectionSchemeCanvasParams {
  cabezalModel?: string
  protectionLevel?: string
  buildingLength?: number
  buildingWidth?: number
  mastType?: string
  mastHeight?: string
  anchorType?: string
  anchorSeparation?: string
  initialProtectionZones?: ProtectionZone[]
  selectedZoneId?: string
  onZonesChange?: (zones: ProtectionZone[]) => void
  onCaptureImage?: (imageData: string, timestamp: number) => void
}

// === CONSTANTS ===

const PROTECTION_RADII: Record<string, Record<string, number>> = {
  'DAT CONTROLER PLUS 15': { I: 32, II: 38, III: 46, IV: 52 },
  'DAT CONTROLER PLUS 30': { I: 48, II: 55, III: 64, IV: 72 },
  'DAT CONTROLER PLUS 45': { I: 63, II: 71, III: 81, IV: 90 },
  'DAT CONTROLER PLUS 60': { I: 79, II: 87, III: 97, IV: 107 },
  'DAT CONTROLER REMOTE 15': { I: 32, II: 38, III: 46, IV: 52 },
  'DAT CONTROLER REMOTE 30': { I: 48, II: 55, III: 64, IV: 72 },
  'DAT CONTROLER REMOTE 45': { I: 63, II: 71, III: 81, IV: 90 },
  'DAT CONTROLER REMOTE 60': { I: 79, II: 87, III: 97, IV: 107 },
}

const PIXELS_PER_METER = 3

export const STAGE_WIDTH = 800
export const STAGE_HEIGHT = 500

// === UTILITY FUNCTIONS ===

function isPointInPolygon(point: Point, polygonPoints: number[]): boolean {
  const x = point.x
  const y = point.y
  let inside = false

  const points: Point[] = []
  for (let i = 0; i < polygonPoints.length; i += 2) {
    points.push({ x: polygonPoints[i], y: polygonPoints[i + 1] })
  }

  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x
    const yi = points[i].y
    const xj = points[j].x
    const yj = points[j].y

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }

  return inside
}

// === MAIN HOOK ===

export function useProtectionSchemeCanvas({
  cabezalModel = 'DAT CONTROLER REMOTE 60',
  protectionLevel = 'III',
  buildingLength = 80,
  buildingWidth = 50,
  initialProtectionZones = [],
  onZonesChange,
  onCaptureImage,
}: UseProtectionSchemeCanvasParams) {
  // === STATE ===
  const [mode, setMode] = useState<'select' | 'map' | 'grid' | null>('select')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [scale, setScale] = useState(100)
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 })
  const [drawingMode, setDrawingMode] = useState<'area' | 'none'>('none')
  const [isDraggingZone, setIsDraggingZone] = useState(false)
  const [currentArea, setCurrentArea] = useState<Point[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [protectionZones, setProtectionZones] = useState<ProtectionZone[]>([])
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [customDistances, setCustomDistances] = useState<Record<string, number>>({})
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingMeasurement, setEditingMeasurement] = useState<{
    areaId: string
    sideIndex: number
    currentValue: number
  } | null>(null)
  const [newMeasurementValue, setNewMeasurementValue] = useState('')
  const [hoveredMeasurement, setHoveredMeasurement] = useState<string | null>(null)

  // === REFS ===
  const fileInputRef = useRef<HTMLInputElement>(null)
  const stageRef = useRef<any>(null)
  const onZonesChangeRef = useRef(onZonesChange)
  const onCaptureImageRef = useRef(onCaptureImage)

  // === CONFIRMATION DIALOG ===
  const { dialogState, showConfirm, handleConfirm, handleCancel } = useConfirmDialog()

  // === EFFECTS ===

  // Mantener las referencias actualizadas sin causar re-renders
  useEffect(() => {
    onZonesChangeRef.current = onZonesChange
    onCaptureImageRef.current = onCaptureImage
  })

  // Sincronizar zonas de protección cuando cambian desde fuera
  useEffect(() => {
    setProtectionZones(initialProtectionZones)
  }, [initialProtectionZones])

  // === COMPUTED VALUES ===

  // Calcular escala dinámica (píxeles por metro)
  const dynamicPixelsPerMeter = useMemo(() => {
    if (areas.length === 0) return PIXELS_PER_METER

    const area = areas[0]
    const points: Point[] = []
    for (let i = 0; i < area.points.length; i += 2) {
      points.push({ x: area.points[i], y: area.points[i + 1] })
    }

    let firstHorizontalPx = 0
    let firstHorizontalMeters = 0
    let firstVerticalPx = 0
    let firstVerticalMeters = 0
    let hasHorizontal = false
    let hasVertical = false

    points.forEach((point, idx) => {
      const nextIdx = (idx + 1) % points.length
      const nextPoint = points[nextIdx]

      const deltaX = Math.abs(nextPoint.x - point.x)
      const deltaY = Math.abs(nextPoint.y - point.y)
      const isHorizontal = deltaX > deltaY

      const distanceKey = `${area.id}-${idx}`
      const customDistance = customDistances[distanceKey]

      if (customDistance) {
        const distancePx = Math.sqrt(
          Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.y - point.y, 2)
        )

        if (isHorizontal && !hasHorizontal) {
          firstHorizontalPx = distancePx
          firstHorizontalMeters = customDistance
          hasHorizontal = true
        } else if (!isHorizontal && !hasVertical) {
          firstVerticalPx = distancePx
          firstVerticalMeters = customDistance
          hasVertical = true
        }
      }
    })

    if (hasHorizontal && hasVertical) {
      const scaleX = firstHorizontalPx / firstHorizontalMeters
      const scaleY = firstVerticalPx / firstVerticalMeters
      return (scaleX + scaleY) / 2
    } else if (hasHorizontal) {
      return firstHorizontalPx / firstHorizontalMeters
    } else if (hasVertical) {
      return firstVerticalPx / firstVerticalMeters
    }

    return PIXELS_PER_METER
  }, [areas, customDistances])

  // Calcular radio de protección en píxeles
  const getProtectionRadiusInPixels = useCallback(
    (model: string, level: string): number => {
      const radiusInMeters = PROTECTION_RADII[model]?.[level] || 60
      return radiusInMeters * dynamicPixelsPerMeter
    },
    [dynamicPixelsPerMeter]
  )

  // === CALLBACKS ===

  // Manejar clic en zona
  const handleZoneClick = useCallback((zoneId: string, e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true
    setSelectedZone(zoneId)
  }, [])

  // Manejar inicio de arrastre
  const handleZoneDragStart = useCallback((e: KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true
    setIsDraggingZone(true)
  }, [])

  // Manejar movimiento durante arrastre
  const handleZoneDragMove = useCallback(
    (_zoneId: string, _newX: number, _newY: number, e: KonvaEventObject<DragEvent>) => {
      e.cancelBubble = true
    },
    []
  )

  // Manejar fin de arrastre
  const handleZoneDragEnd = useCallback(
    (zone: ProtectionZone, e: KonvaEventObject<DragEvent>) => {
      e.cancelBubble = true
      setIsDraggingZone(false)
      let newX = e.target.x()
      let newY = e.target.y()

      // Validar que el pararrayos esté dentro del área del edificio
      if (areas.length > 0) {
        const area = areas[0]
        const points = area.points

        const minX = Math.min(...points.filter((_, i) => i % 2 === 0))
        const maxX = Math.max(...points.filter((_, i) => i % 2 === 0))
        const minY = Math.min(...points.filter((_, i) => i % 2 === 1))
        const maxY = Math.max(...points.filter((_, i) => i % 2 === 1))

        newX = Math.max(minX, Math.min(maxX, newX))
        newY = Math.max(minY, Math.min(maxY, newY))

        e.target.x(newX)
        e.target.y(newY)
      }

      const newZones = protectionZones.map((z) => (z.id === zone.id ? { ...z, x: newX, y: newY } : z))
      setProtectionZones(newZones)
      onZonesChange?.(newZones)
    },
    [protectionZones, areas, onZonesChange]
  )

  // Eliminar zona
  const handleDeleteZone = useCallback(
    (zoneId: string) => {
      showConfirm({
        title: '¿Eliminar pararrayos?',
        description: 'Esta acción no se puede deshacer.',
        onConfirm: () => {
          const newZones = protectionZones.filter((z) => z.id !== zoneId)
          setProtectionZones(newZones)
          onZonesChange?.(newZones)
          setSelectedZone(null)
          toast.success('Pararrayos eliminado')
        },
      })
    },
    [protectionZones, onZonesChange, showConfirm]
  )

  // Cerrar área actual
  const closeCurrentArea = useCallback(() => {
    if (currentArea.length < 3) {
      toast.error('Se necesitan al menos 3 puntos para cerrar el área')
      return
    }

    const flatPoints: number[] = []
    currentArea.forEach((point) => {
      flatPoints.push(point.x, point.y)
    })

    const newArea: Area = {
      id: `area-${Date.now()}`,
      points: flatPoints,
      closed: true,
    }

    setAreas([newArea])
    setCurrentArea([])
    setDrawingMode('none')
  }, [currentArea])

  // Verificar si un punto está cerca del primero
  const isNearFirstPoint = useCallback(
    (point: Point): boolean => {
      if (currentArea.length === 0) return false
      const first = currentArea[0]
      const distance = Math.sqrt(Math.pow(point.x - first.x, 2) + Math.pow(point.y - first.y, 2))
      return distance < 15
    },
    [currentArea]
  )

  // Manejar clic en el stage
  const handleStageClickWithZoom = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (drawingMode === 'area') {
        const stage = e.target.getStage()
        if (!stage) return

        const scaleValue = scale / 100
        const pointer = stage.getPointerPosition()
        if (!pointer) return

        const point = {
          x: (pointer.x - stagePosition.x) / scaleValue,
          y: (pointer.y - stagePosition.y) / scaleValue,
        }

        if (isNearFirstPoint(point)) {
          closeCurrentArea()
        } else {
          setCurrentArea([...currentArea, point])
        }
      }
    },
    [drawingMode, scale, stagePosition, isNearFirstPoint, closeCurrentArea, currentArea]
  )

  // Capturar imagen del canvas
  const captureCanvasImage = useCallback(() => {
    if (!stageRef.current) return

    try {
      const dataURL = stageRef.current.toDataURL({
        pixelRatio: 2,
        mimeType: 'image/png',
      })

      const timestamp = Date.now()
      onCaptureImageRef.current?.(dataURL, timestamp)
    } catch (error) {
      logger.error('Error al capturar imagen automáticamente', error as Error)
    }
  }, [])

  // Efecto para capturar automáticamente cuando hay cambios
  useEffect(() => {
    if (areas.length > 0 || protectionZones.length > 0 || uploadedImage) {
      const timeout = setTimeout(() => {
        captureCanvasImage()
      }, 500)

      return () => clearTimeout(timeout)
    }
  }, [areas, protectionZones, uploadedImage, captureCanvasImage])

  // Manejar subida de imagen
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
        setMode('map')
      }
      reader.readAsDataURL(file)
    }
  }, [])

  // Iniciar dibujo de área
  const startDrawingArea = useCallback(() => {
    setDrawingMode('area')
    setCurrentArea([])
  }, [])

  // Limpiar todo
  const clearAll = useCallback(() => {
    showConfirm({
      title: '¿Limpiar todo el canvas?',
      description: 'Se eliminarán todas las áreas y pararrayos dibujados.',
      onConfirm: () => {
        setAreas([])
        setProtectionZones([])
        setCurrentArea([])
        setDrawingMode('none')
        setSelectedZone(null)
        setCustomDistances({})
        onZonesChange?.([])
        toast.success('Canvas limpiado')
      },
    })
  }, [onZonesChange, showConfirm])

  // Crear cuadrícula automática
  const createGrid = useCallback(() => {
    const gridWidth = buildingWidth * PIXELS_PER_METER
    const gridHeight = buildingLength * PIXELS_PER_METER

    const centerX = STAGE_WIDTH / 2
    const centerY = STAGE_HEIGHT / 2

    const newArea: Area = {
      id: `area-${Date.now()}`,
      points: [
        centerX - gridWidth / 2,
        centerY - gridHeight / 2,
        centerX + gridWidth / 2,
        centerY - gridHeight / 2,
        centerX + gridWidth / 2,
        centerY + gridHeight / 2,
        centerX - gridWidth / 2,
        centerY + gridHeight / 2,
      ],
      closed: true,
    }

    setAreas([newArea])
    setMode('grid')
    toast.success('Cuadrícula creada')
  }, [buildingWidth, buildingLength])

  // Editar medida
  const handleEditDistance = useCallback(
    (areaId: string, sideIndex: number, currentValue: number) => {
      setEditingMeasurement({ areaId, sideIndex, currentValue })
      setNewMeasurementValue(currentValue.toFixed(2))
      setEditModalOpen(true)
    },
    []
  )

  // Guardar medida editada
  const handleSaveMeasurement = useCallback(() => {
    if (!editingMeasurement) return

    const newValue = parseFloat(newMeasurementValue)
    if (isNaN(newValue) || newValue <= 0) {
      toast.error('Por favor ingresa un valor válido mayor a 0')
      return
    }

    const distanceKey = `${editingMeasurement.areaId}-${editingMeasurement.sideIndex}`
    setCustomDistances({
      ...customDistances,
      [distanceKey]: newValue,
    })

    setEditModalOpen(false)
    setEditingMeasurement(null)
    setNewMeasurementValue('')
    toast.success('Medida actualizada')
  }, [editingMeasurement, newMeasurementValue, customDistances])

  // Zoom handlers
  const handleWheel = useCallback(
    (e: KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault()

      const scaleBy = 1.05
      const oldScale = scale

      const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy

      const clampedScale = Math.max(50, Math.min(200, newScale))
      setScale(clampedScale)
    },
    [scale]
  )

  const handleDragEnd = useCallback((e: KonvaEventObject<DragEvent>) => {
    const newPos = {
      x: e.target.x(),
      y: e.target.y(),
    }
    setStagePosition(newPos)
  }, [])

  // Renderizar cuadrícula
  const renderGrid = useMemo(() => {
    if (mode !== 'grid' && areas.length === 0) return null

    const gridLines: JSX.Element[] = []
    const metersPx = dynamicPixelsPerMeter

    for (let i = 0; i <= STAGE_WIDTH; i += metersPx * 10) {
      gridLines.push(
        <line
          key={`v-${i}`}
          x1={i}
          y1={0}
          x2={i}
          y2={STAGE_HEIGHT}
          stroke={COLOR_TOKENS.gridLighter}
          strokeWidth={1}
        />
      )
    }

    for (let i = 0; i <= STAGE_HEIGHT; i += metersPx * 10) {
      gridLines.push(
        <line
          key={`h-${i}`}
          x1={0}
          y1={i}
          x2={STAGE_WIDTH}
          y2={i}
          stroke={COLOR_TOKENS.gridLighter}
          strokeWidth={1}
        />
      )
    }

    return gridLines
  }, [mode, areas, dynamicPixelsPerMeter])

  return {
    // State
    mode,
    setMode,
    uploadedImage,
    scale,
    setScale,
    stagePosition,
    drawingMode,
    isDraggingZone,
    currentArea,
    areas,
    protectionZones,
    selectedZone,
    customDistances,
    editModalOpen,
    setEditModalOpen,
    editingMeasurement,
    newMeasurementValue,
    setNewMeasurementValue,
    hoveredMeasurement,
    setHoveredMeasurement,

    // Refs
    fileInputRef,
    stageRef,

    // Dialog
    dialogState,
    handleConfirm,
    handleCancel,

    // Computed
    dynamicPixelsPerMeter,
    getProtectionRadiusInPixels,
    renderGrid,

    // Callbacks
    handleZoneClick,
    handleZoneDragStart,
    handleZoneDragMove,
    handleZoneDragEnd,
    handleDeleteZone,
    closeCurrentArea,
    isNearFirstPoint,
    handleStageClickWithZoom,
    captureCanvasImage,
    handleImageUpload,
    startDrawingArea,
    clearAll,
    createGrid,
    handleEditDistance,
    handleSaveMeasurement,
    handleWheel,
    handleDragEnd,
  }
}
