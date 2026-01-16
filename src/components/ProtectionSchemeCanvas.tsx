import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Stage, Layer, Line, Circle, Image as KonvaImage, Group, Text } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, LayoutGrid, PenTool, RotateCcw, Move, ZoomIn, ZoomOut, Check, Ruler, Pencil, Hexagon } from 'lucide-react'
import useImage from 'use-image'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { COLOR_TOKENS } from '@/lib/colorTokens'
import { COVERAGE_CONFIG } from '@/config/canvas'

interface Point {
  x: number
  y: number
}

interface Area {
  id: string
  points: number[]
  closed: boolean
}

interface ProtectionZone {
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
  placedOnMap?: boolean // Indica si el pararrayos está colocado en el mapa
}

interface ProtectionSchemeCanvasProps {
  cabezalModel?: string
  protectionLevel?: string
  buildingLength?: number // Longitud del edificio en metros (del Paso 2)
  buildingWidth?: number // Anchura del edificio en metros (del Paso 2)
  buildingName?: string // Nombre del edificio para mostrar en el mapa
  mastType?: string
  mastHeight?: string
  anchorType?: string
  anchorSeparation?: string
  initialProtectionZones?: ProtectionZone[]
  selectedZoneId?: string // ID del pararrayos seleccionado para resaltarlo
  onZonesChange?: (zones: ProtectionZone[]) => void
  onCaptureImage?: (imageData: string, timestamp: number) => void // Callback para capturar imagen del canvas
  onDrawingModeChange?: (isDrawing: boolean, pointsCount: number, cancelFn: () => void, hasStructure: boolean, editFn: () => void, deleteFn: () => void) => void // Callback para modo de dibujo
}

// Tabla de radios de protección (en metros)
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

const DEFAULT_PIXELS_PER_METER = 3 // Escala por defecto: 1 metro = 3 píxeles

function BackgroundImage({ image, width, height }: { image: string; width: number; height: number }) {
  const [img] = useImage(image)
  return <KonvaImage image={img} width={width} height={height} />
}

const ZAP_ICON_PATH = 'M13 2 L3 14 h9 l-1 8 10-12 h-9 Z'
const buildZapIconUri = (color: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="1"><path d="${ZAP_ICON_PATH}"/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

// Color único para todas las zonas de protección
const ZONE_COLOR = {
  stroke: COLOR_TOKENS.brandBlue, // Borde azul corporativo del pararrayos
  fill: 'rgba(212, 133, 13, 0.20)', // Relleno naranja/ámbar
  icon: '#D4850D', // Icono del rayo naranja
  badgeFill: COLOR_TOKENS.brandBlue, // Fondo azul corporativo del badge
  badgeText: COLOR_TOKENS.white, // Número blanco
}

// Límites del área para restringir arrastre
interface AreaBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

// Componente memoizado para las zonas de protección (evita re-renders innecesarios)
interface ProtectionZoneCircleProps {
  zone: ProtectionZone
  zoneNumber: number
  isSelected: boolean
  areaBounds: AreaBounds | null
  areaPoints: number[] | null // Puntos del polígono para restricción precisa
  onZoneClick: (zoneId: string, e: KonvaEventObject<MouseEvent>) => void
  onDragStart: (e: KonvaEventObject<DragEvent>) => void
  onDragEnd: (zone: ProtectionZone, e: KonvaEventObject<DragEvent>) => void
}

const ProtectionZoneCircle = React.memo(({
  zone,
  zoneNumber,
  isSelected,
  areaBounds,
  areaPoints,
  onZoneClick,
  onDragStart,
  onDragEnd
}: ProtectionZoneCircleProps) => {
  // Usar color único para todas las zonas
  const strokeColor = ZONE_COLOR.stroke
  const fillColor = ZONE_COLOR.fill
  const iconColor = ZONE_COLOR.icon
  const badgeFillColor = ZONE_COLOR.badgeFill
  const badgeTextColor = ZONE_COLOR.badgeText

  const outerStrokeWidth = isSelected ? 2 : 1.5
  const innerStrokeWidth = isSelected ? 1.5 : 1
  const iconSize = isSelected ? 32 : 28
  const [zapImage] = useImage(buildZapIconUri(iconColor))

  // Badge con número
  const badgeRadius = 10
  const badgeOffsetY = -iconSize / 2 - badgeRadius - 2

  // Opacidad según selección
  const groupOpacity = isSelected ? 1 : 0.5

  // Última posición válida dentro del polígono
  const lastValidPosition = useRef({ x: zone.x, y: zone.y })

  // Función para verificar si un punto está dentro del polígono (ray casting)
  const isPointInPolygon = useCallback((px: number, py: number): boolean => {
    if (!areaPoints || areaPoints.length < 6) return true // Si no hay polígono, permitir
    let inside = false
    const n = areaPoints.length / 2
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = areaPoints[i * 2], yi = areaPoints[i * 2 + 1]
      const xj = areaPoints[j * 2], yj = areaPoints[j * 2 + 1]
      if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
        inside = !inside
      }
    }
    return inside
  }, [areaPoints])

  // Handler de movimiento - solo usa bounding box para mejor rendimiento
  // La verificación del polígono se hace al soltar (onDragEnd)
  const handleDragMove = useCallback((e: KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true

    if (!areaBounds) return

    // Obtener posición actual
    let newX = e.target.x()
    let newY = e.target.y()

    // Solo restringir al bounding box durante el arrastre (rápido)
    newX = Math.max(areaBounds.minX, Math.min(areaBounds.maxX, newX))
    newY = Math.max(areaBounds.minY, Math.min(areaBounds.maxY, newY))

    e.target.x(newX)
    e.target.y(newY)
  }, [areaBounds])

  // Verificar polígono al soltar y ajustar si es necesario
  const handleLocalDragEnd = useCallback((e: KonvaEventObject<DragEvent>) => {
    const newX = e.target.x()
    const newY = e.target.y()

    // Verificar si está dentro del polígono
    if (!isPointInPolygon(newX, newY)) {
      // Fuera del polígono, volver a última posición válida
      e.target.x(lastValidPosition.current.x)
      e.target.y(lastValidPosition.current.y)
    } else {
      // Posición válida, guardarla
      lastValidPosition.current = { x: newX, y: newY }
    }

    onDragEnd(zone, e)
  }, [isPointInPolygon, onDragEnd, zone])

  return (
    <Group
      x={zone.x}
      y={zone.y}
      draggable={isSelected}
      opacity={groupOpacity}
      onClick={(e) => onZoneClick(zone.id, e)}
      onDragStart={onDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleLocalDragEnd}
    >
      <Circle
        x={0}
        y={0}
        radius={zone.radius}
        stroke={strokeColor}
        strokeWidth={outerStrokeWidth}
        fill={fillColor}
      />
      <Circle
        x={0}
        y={0}
        radius={Math.max(zone.radius - 10, 4)}
        stroke={strokeColor}
        strokeWidth={innerStrokeWidth}
        dash={[4, 4]}
        fill="transparent"
      />
      {zapImage && (
        <KonvaImage
          image={zapImage}
          x={-iconSize / 2}
          y={-iconSize / 2}
          width={iconSize}
          height={iconSize}
          listening={false}
        />
      )}
      {/* Badge con número encima del rayo */}
      <Circle
        x={0}
        y={badgeOffsetY}
        radius={badgeRadius}
        fill={badgeFillColor}
        listening={false}
      />
      <Text
        x={-badgeRadius}
        y={badgeOffsetY - badgeRadius / 2 - 1}
        width={badgeRadius * 2}
        height={badgeRadius}
        text={String(zoneNumber)}
        fontSize={12}
        fontStyle="bold"
        fill={badgeTextColor}
        align="center"
        verticalAlign="middle"
        listening={false}
      />
    </Group>
  )
})

function ProtectionSchemeCanvas({
  cabezalModel = 'DAT CONTROLER REMOTE 60',
  protectionLevel = 'III',
  buildingLength = 80,
  buildingWidth = 50,
  buildingName = '',
  initialProtectionZones = [],
  selectedZoneId,
  onZonesChange,
  onCaptureImage,
  onDrawingModeChange,
}: ProtectionSchemeCanvasProps) {
  const [mode, setMode] = useState<'select' | 'map' | 'grid' | null>('select')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [scale, setScale] = useState(100)
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 })
  const [drawingMode, setDrawingMode] = useState<'area' | 'edit' | 'none'>('none')
  const [isDraggingZone, setIsDraggingZone] = useState(false)
  const [currentArea, setCurrentArea] = useState<Point[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [draggingVertexIndex, setDraggingVertexIndex] = useState<number | null>(null)
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null)
  const [protectionZones, setProtectionZones] = useState<ProtectionZone[]>([])
  const [customDistances, setCustomDistances] = useState<Record<string, number>>({})
  const [dynamicPixelsPerMeter, setDynamicPixelsPerMeter] = useState(DEFAULT_PIXELS_PER_METER)
  const zoomScale = scale / 100

  // Memoizar handler de selección de zona para prevenir re-renders
  const handleZoneClick = useCallback((_zoneId: string, e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true
  }, [])

  // Memoizar handler de inicio de arrastre
  const handleZoneDragStart = useCallback((e: KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true
    setIsDraggingZone(true)
  }, [])

  // Memoizar handler de fin de arrastre
  const handleZoneDragEnd = useCallback((zone: ProtectionZone, e: KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true
    setIsDraggingZone(false)
    let newX = e.target.x()
    let newY = e.target.y()

    // Validar que el pararrayos esté dentro del área del edificio
    if (areas.length > 0) {
      const area = areas[0] // Primera área (edificio)
      const points = area.points

      // Calcular límites del área
      const minX = Math.min(...points.filter((_, i) => i % 2 === 0))
      const maxX = Math.max(...points.filter((_, i) => i % 2 === 0))
      const minY = Math.min(...points.filter((_, i) => i % 2 === 1))
      const maxY = Math.max(...points.filter((_, i) => i % 2 === 1))

      // Restringir posición a los límites del edificio
      newX = Math.max(minX, Math.min(maxX, newX))
      newY = Math.max(minY, Math.min(maxY, newY))

      // Actualizar posición visual del elemento
      e.target.x(newX)
      e.target.y(newY)
    }

    // Confirmar la posición final
    const newZones = protectionZones.map((z) =>
      z.id === zone.id ? { ...z, x: newX, y: newY, placedOnMap: true } : z
    )
    setProtectionZones(newZones)
    onZonesChange?.(newZones)
  }, [protectionZones, areas, onZonesChange])
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingMeasurement, setEditingMeasurement] = useState<{
    areaId: string
    sideIndex: number
    currentValue: number
  } | null>(null)
  const [newMeasurementValue, setNewMeasurementValue] = useState('')

  // Estados para calibración (modo mapa) - selección de lado que representa el ancho
  const [pendingArea, setPendingArea] = useState<{ points: number[], currentArea: Point[] } | null>(null)
  const [selectingWidthSide, setSelectingWidthSide] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const stageRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const onZonesChangeRef = useRef(onZonesChange)
  const onCaptureImageRef = useRef(onCaptureImage)

  // Refs para generación automática de grid
  const hasGeneratedGridArea = useRef(false)
  const isSettingUpGrid = useRef(false)
  const lastDimensions = useRef({ width: 0, height: 0 })
  const userDeletedStructure = useRef(false)

  // Función para cancelar el modo dibujo
  const cancelDrawing = useCallback(() => {
    setDrawingMode('none')
    setCurrentArea([])
  }, [])

  // Función para eliminar la estructura y los pararrayos
  const deleteStructure = useCallback(() => {
    // Marcar que la estructura fue eliminada manualmente para evitar regeneración automática
    hasGeneratedGridArea.current = true // Mantener en true para evitar que se regenere
    userDeletedStructure.current = true // Flag para indicar eliminación manual

    setAreas([])
    setCurrentArea([])
    setDrawingMode('none')
    setProtectionZones([])
    setDynamicPixelsPerMeter(DEFAULT_PIXELS_PER_METER)
    onZonesChange?.([])
  }, [onZonesChange])

  // Función para resetear completamente el canvas (quitar imagen y volver a selección)
  const resetCanvas = useCallback(() => {
    setUploadedImage(null)
    setAreas([])
    setCurrentArea([])
    setDrawingMode('none')
    setMode('select')
    setScale(100)
    setStagePosition({ x: 0, y: 0 })
    setProtectionZones([])
    setDynamicPixelsPerMeter(DEFAULT_PIXELS_PER_METER)
    onZonesChange?.([])
    hasGeneratedGridArea.current = false
  }, [onZonesChange])

  // Verificar si hay estructura dibujada (incluye modo edición)
  const hasStructure = areas.length > 0 && (drawingMode === 'none' || drawingMode === 'edit')

  // Handler para iniciar arrastre de vértice
  const handleVertexDragStart = useCallback((index: number) => {
    setDraggingVertexIndex(index)
  }, [])

  // Handler para mover vértice durante arrastre
  const handleVertexDragMove = useCallback((areaId: string, vertexIndex: number, newX: number, newY: number) => {
    setAreas(prevAreas => prevAreas.map(area => {
      if (area.id !== areaId) return area
      const newPoints = [...area.points]
      newPoints[vertexIndex * 2] = newX
      newPoints[vertexIndex * 2 + 1] = newY
      return { ...area, points: newPoints }
    }))
  }, [])

  // Handler para finalizar arrastre de vértice
  const handleVertexDragEnd = useCallback(() => {
    setDraggingVertexIndex(null)
    // Recalcular escala basada en dimensiones lineales del bounding box
    if (areas.length > 0) {
      const areaPoints = areas[0].points
      const xCoords = areaPoints.filter((_, i) => i % 2 === 0)
      const yCoords = areaPoints.filter((_, i) => i % 2 === 1)
      const drawnWidthPx = Math.max(...xCoords) - Math.min(...xCoords)
      const drawnHeightPx = Math.max(...yCoords) - Math.min(...yCoords)
      if (drawnWidthPx > 0 && drawnHeightPx > 0 && buildingLength > 0 && buildingWidth > 0) {
        const scaleX = drawnWidthPx / buildingLength
        const scaleY = drawnHeightPx / buildingWidth
        const calculatedPxPerMeter = (scaleX + scaleY) / 2
        setDynamicPixelsPerMeter(calculatedPxPerMeter)
      }
    }
  }, [areas, buildingLength, buildingWidth])

  // Handler para escalar toda la estructura
  const handleScaleStructure = useCallback((scaleFactor: number) => {
    if (areas.length === 0) return

    setAreas(prevAreas => prevAreas.map(area => {
      const points = area.points
      // Calcular centro del polígono
      const xCoords = points.filter((_, i) => i % 2 === 0)
      const yCoords = points.filter((_, i) => i % 2 === 1)
      const centerX = (Math.min(...xCoords) + Math.max(...xCoords)) / 2
      const centerY = (Math.min(...yCoords) + Math.max(...yCoords)) / 2

      // Escalar cada punto desde el centro
      const newPoints = points.map((coord, i) => {
        if (i % 2 === 0) {
          // X coordinate
          return centerX + (coord - centerX) * scaleFactor
        } else {
          // Y coordinate
          return centerY + (coord - centerY) * scaleFactor
        }
      })

      return { ...area, points: newPoints }
    }))
  }, [areas])

  // Referencia para finishEditing (se asigna después de placeZonesInArea)
  const finishEditingRef = useRef<() => void>(() => {})

  // Hook para diálogos de confirmación
  const { dialogState, handleConfirm, handleCancel } = useConfirmDialog()

  // Dimensiones responsivas del canvas
  const [stageDimensions, setStageDimensions] = useState({ width: 800, height: 500 })

  // Observar cambios de tamaño del contenedor
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          setStageDimensions({ width, height })
        }
      }
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  const stageWidth = stageDimensions.width
  const stageHeight = stageDimensions.height

  // Función para editar la estructura (entrar en modo edición)
  const editStructure = useCallback(() => {
    if (areas.length > 0) {
      // Calcular centro del edificio
      const points = areas[0].points
      const xCoords = points.filter((_, i) => i % 2 === 0)
      const yCoords = points.filter((_, i) => i % 2 === 1)
      const buildingCenterX = (Math.min(...xCoords) + Math.max(...xCoords)) / 2
      const buildingCenterY = (Math.min(...yCoords) + Math.max(...yCoords)) / 2

      // Centrar la vista en el edificio con la escala actual
      const currentScale = scale / 100
      const viewportCenterX = stageWidth / 2
      const viewportCenterY = stageHeight / 2
      const newX = viewportCenterX - buildingCenterX * currentScale
      const newY = viewportCenterY - buildingCenterY * currentScale

      setStagePosition({ x: newX, y: newY })
      setEditingAreaId(areas[0].id)
      setDrawingMode('edit')
    }
  }, [areas, scale, stageWidth, stageHeight])

  // Notificar cambios en el modo de dibujo (después de que editStructure esté definido)
  useEffect(() => {
    const isDrawingOrEditing = drawingMode === 'area' || drawingMode === 'edit'
    onDrawingModeChange?.(isDrawingOrEditing, currentArea.length, cancelDrawing, hasStructure, editStructure, deleteStructure)
  }, [drawingMode, currentArea.length, onDrawingModeChange, cancelDrawing, hasStructure, editStructure, deleteStructure])

  // Calcular los límites del área para restringir el arrastre de pararrayos
  const areaBounds = useMemo<AreaBounds | null>(() => {
    if (areas.length === 0) return null
    const points = areas[0].points
    const xCoords = points.filter((_, i) => i % 2 === 0)
    const yCoords = points.filter((_, i) => i % 2 === 1)
    const bounds = {
      minX: Math.min(...xCoords),
      maxX: Math.max(...xCoords),
      minY: Math.min(...yCoords),
      maxY: Math.max(...yCoords)
    }
    return bounds
  }, [areas])

  // Calcular cobertura de protección (porcentaje del edificio cubierto por los círculos de protección)
  const coveragePercent = useMemo<number>(() => {
    if (areas.length === 0 || protectionZones.length === 0 || !areaBounds) return 0

    const points = areas[0].points
    if (points.length < 6) return 0 // Necesita al menos 3 puntos (6 coordenadas)

    // Función para verificar si un punto está dentro del polígono (ray casting)
    const isPointInPolygon = (px: number, py: number, polygon: number[]): boolean => {
      let inside = false
      const n = polygon.length / 2
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = polygon[i * 2], yi = polygon[i * 2 + 1]
        const xj = polygon[j * 2], yj = polygon[j * 2 + 1]
        if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
          inside = !inside
        }
      }
      return inside
    }

    // Función para verificar si un punto está cubierto por al menos un círculo de protección
    const isPointCovered = (px: number, py: number): boolean => {
      return protectionZones.some(zone => {
        const dx = px - zone.x
        const dy = py - zone.y
        const distanceSquared = dx * dx + dy * dy
        return distanceSquared <= zone.radius * zone.radius
      })
    }

    // Muestreo de puntos dentro del edificio (grid de 50x50 puntos)
    const gridResolution = 50
    const stepX = (areaBounds.maxX - areaBounds.minX) / gridResolution
    const stepY = (areaBounds.maxY - areaBounds.minY) / gridResolution

    let pointsInsideBuilding = 0
    let pointsCovered = 0

    for (let i = 0; i <= gridResolution; i++) {
      for (let j = 0; j <= gridResolution; j++) {
        const px = areaBounds.minX + i * stepX
        const py = areaBounds.minY + j * stepY

        // Verificar si el punto está dentro del polígono del edificio
        if (isPointInPolygon(px, py, points)) {
          pointsInsideBuilding++
          // Verificar si está cubierto por algún pararrayos
          if (isPointCovered(px, py)) {
            pointsCovered++
          }
        }
      }
    }

    if (pointsInsideBuilding === 0) return 0
    return (pointsCovered / pointsInsideBuilding) * 100
  }, [areas, protectionZones, areaBounds])

  const coverageLabel = useMemo(() => {
    if (coveragePercent >= COVERAGE_CONFIG.minimumCoverage) return 'ALTO'
    if (coveragePercent >= COVERAGE_CONFIG.minimumCoverage - 10) return 'MEDIO'
    return 'BAJO'
  }, [coveragePercent])

  const coveragePercentLabel = useMemo(
    () => coveragePercent.toFixed(1).replace('.', ','),
    [coveragePercent]
  )

  // Mantener las referencias actualizadas sin causar re-renders
  useEffect(() => {
    onZonesChangeRef.current = onZonesChange
    onCaptureImageRef.current = onCaptureImage
  })

  const getDefaultZoneCenter = useCallback(() => {
    if (areas.length > 0) {
      const points = areas[0].points
      const xPoints = points.filter((_, i) => i % 2 === 0)
      const yPoints = points.filter((_, i) => i % 2 === 1)
      const minX = Math.min(...xPoints)
      const maxX = Math.max(...xPoints)
      const minY = Math.min(...yPoints)
      const maxY = Math.max(...yPoints)
      return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
    }

    return { x: stageWidth / 2, y: stageHeight / 2 }
  }, [areas, stageWidth, stageHeight])

  const applyDefaultZonePosition = useCallback((zones: ProtectionZone[]) => {
    const center = getDefaultZoneCenter()
    let didAdjust = false
    const nextZones = zones.map((zone) => {
      const missingPosition = !Number.isFinite(zone.x) || !Number.isFinite(zone.y)
      const needsCenter = missingPosition || !zone.placedOnMap
      if (!needsCenter) return zone
      didAdjust = true
      return {
        ...zone,
        x: center.x,
        y: center.y,
        placedOnMap: true,
      }
    })

    return { zones: nextZones, didAdjust }
  }, [getDefaultZoneCenter])

  // Calcular radio de protección en píxeles usando escala dinámica
  const getProtectionRadius = (model: string, level: string): number => {
    const radiusMeters = PROTECTION_RADII[model]?.[level] || 60
    return radiusMeters * dynamicPixelsPerMeter
  }

  // Sincronizar zonas iniciales con el estado interno
  // Usamos JSON.stringify para detectar cambios en el contenido del array
  // (React no hace comparación profunda de arrays/objetos por defecto)
  const initialZonesSerializ = useMemo(
    () => JSON.stringify(initialProtectionZones),
    [initialProtectionZones]
  )

  useEffect(() => {
    if (initialProtectionZones && initialProtectionZones.length > 0) {
      // Actualizar las zonas con los radios recalculados
      const zonesWithUpdatedRadii = initialProtectionZones.map((zone) => {
        const zoneModel = zone.model || cabezalModel
        const zoneLevel = zone.level || protectionLevel
        const newRadius = getProtectionRadius(zoneModel, zoneLevel)
        return {
          ...zone,
          radius: newRadius,
        }
      })
      const { zones: centeredZones, didAdjust } = applyDefaultZonePosition(zonesWithUpdatedRadii)
      setProtectionZones(centeredZones)
      if (didAdjust) {
        onZonesChangeRef.current?.(centeredZones)
      }
    }
  }, [initialZonesSerializ, dynamicPixelsPerMeter, cabezalModel, protectionLevel, applyDefaultZonePosition])

  useEffect(() => {
    if (protectionZones.length === 0) return
    const { zones: centeredZones, didAdjust } = applyDefaultZonePosition(protectionZones)
    if (didAdjust) {
      setProtectionZones(centeredZones)
      onZonesChangeRef.current?.(centeredZones)
    }
  }, [areas.length, stageWidth, stageHeight, applyDefaultZonePosition, protectionZones])

  // Manejar subida de imagen
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
        setMode('map')
        setDrawingMode('area') // Activar dibujo automáticamente
      }
      reader.readAsDataURL(file)
    }
  }

  // Dibujar cuadrícula
  const renderGrid = () => {
    const lines = []
    const gridSize = 25

    // Líneas verticales
    for (let i = 0; i <= stageWidth; i += gridSize) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, stageHeight]}
          stroke={COLOR_TOKENS.gridLight}
          strokeWidth={0.5}
        />
      )
    }

    // Líneas horizontales
    for (let i = 0; i <= stageHeight; i += gridSize) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i, stageWidth, i]}
          stroke={COLOR_TOKENS.gridLight}
          strokeWidth={0.5}
        />
      )
    }

    return lines
  }

  // Calcular el área de un polígono (en píxeles cuadrados)
  const calculatePolygonArea = (points: number[]): number => {
    let area = 0
    const n = points.length / 2
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      area += points[i * 2] * points[j * 2 + 1]
      area -= points[j * 2] * points[i * 2 + 1]
    }
    return Math.abs(area / 2)
  }

  // Calcular cuántos pararrayos se necesitan para cubrir un área (estimación inicial)
  const calculateRequiredZones = (areaPoints: number[], radiusPixels: number): number => {
    const buildingArea = calculatePolygonArea(areaPoints)
    const zoneArea = Math.PI * radiusPixels * radiusPixels
    // Usar factor de eficiencia del 40% para garantizar mayor cobertura inicial
    const effectiveZoneArea = zoneArea * 0.4
    return Math.max(1, Math.ceil(buildingArea / effectiveZoneArea))
  }

  // Función para verificar cobertura de un conjunto de zonas sobre el edificio
  const checkCoverage = (areaPoints: number[], zones: { x: number; y: number; radius: number }[]): number => {
    if (zones.length === 0) return 0

    // Calcular bounding box
    const xCoords = areaPoints.filter((_, i) => i % 2 === 0)
    const yCoords = areaPoints.filter((_, i) => i % 2 === 1)
    const minX = Math.min(...xCoords)
    const maxX = Math.max(...xCoords)
    const minY = Math.min(...yCoords)
    const maxY = Math.max(...yCoords)

    // Ray casting para verificar si un punto está dentro del polígono
    const isPointInPolygon = (px: number, py: number): boolean => {
      let inside = false
      const n = areaPoints.length / 2
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = areaPoints[i * 2], yi = areaPoints[i * 2 + 1]
        const xj = areaPoints[j * 2], yj = areaPoints[j * 2 + 1]
        if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
          inside = !inside
        }
      }
      return inside
    }

    // Verificar si un punto está cubierto por alguna zona
    const isPointCovered = (px: number, py: number): boolean => {
      return zones.some(zone => {
        const dx = px - zone.x
        const dy = py - zone.y
        return dx * dx + dy * dy <= zone.radius * zone.radius
      })
    }

    // Muestreo de puntos (grid de 30x30 para rapidez)
    const gridResolution = 30
    const stepX = (maxX - minX) / gridResolution
    const stepY = (maxY - minY) / gridResolution

    let pointsInside = 0
    let pointsCovered = 0

    for (let i = 0; i <= gridResolution; i++) {
      for (let j = 0; j <= gridResolution; j++) {
        const px = minX + i * stepX
        const py = minY + j * stepY
        if (isPointInPolygon(px, py)) {
          pointsInside++
          if (isPointCovered(px, py)) {
            pointsCovered++
          }
        }
      }
    }

    return pointsInside > 0 ? (pointsCovered / pointsInside) * 100 : 0
  }

  // Distribuir pararrayos uniformemente dentro del edificio (solo dentro del polígono)
  const distributeZonesInBuilding = (areaPoints: number[], count: number): { x: number; y: number }[] => {
    // Calcular bounding box
    const xPoints = areaPoints.filter((_, i) => i % 2 === 0)
    const yPoints = areaPoints.filter((_, i) => i % 2 === 1)
    const minX = Math.min(...xPoints)
    const maxX = Math.max(...xPoints)
    const minY = Math.min(...yPoints)
    const maxY = Math.max(...yPoints)
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2
    const width = maxX - minX
    const height = maxY - minY

    // Función para verificar si un punto está dentro del polígono (ray casting)
    const isPointInPolygon = (px: number, py: number): boolean => {
      let inside = false
      const n = areaPoints.length / 2
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = areaPoints[i * 2], yi = areaPoints[i * 2 + 1]
        const xj = areaPoints[j * 2], yj = areaPoints[j * 2 + 1]
        if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
          inside = !inside
        }
      }
      return inside
    }

    // Función para ajustar un punto hacia el centro si está fuera del polígono
    const adjustToPolygon = (px: number, py: number): { x: number; y: number } => {
      if (isPointInPolygon(px, py)) {
        return { x: px, y: py }
      }
      // Mover gradualmente hacia el centro hasta estar dentro
      for (let t = 0.1; t <= 1; t += 0.1) {
        const newX = px + (centerX - px) * t
        const newY = py + (centerY - py) * t
        if (isPointInPolygon(newX, newY)) {
          return { x: newX, y: newY }
        }
      }
      // Si no se encuentra, usar el centro
      return { x: centerX, y: centerY }
    }

    const positions: { x: number; y: number }[] = []

    if (count === 1) {
      positions.push(adjustToPolygon(centerX, centerY))
    } else if (count === 2) {
      positions.push(adjustToPolygon(centerX - width * 0.25, centerY))
      positions.push(adjustToPolygon(centerX + width * 0.25, centerY))
    } else if (count <= 4) {
      // Distribuir en cuadrícula 2x2
      const offsetX = width * 0.25
      const offsetY = height * 0.25
      positions.push(adjustToPolygon(centerX - offsetX, centerY - offsetY))
      positions.push(adjustToPolygon(centerX + offsetX, centerY - offsetY))
      if (count > 2) positions.push(adjustToPolygon(centerX - offsetX, centerY + offsetY))
      if (count > 3) positions.push(adjustToPolygon(centerX + offsetX, centerY + offsetY))
    } else {
      // Distribuir en cuadrícula dinámica
      const cols = Math.ceil(Math.sqrt(count * (width / height)))
      const rows = Math.ceil(count / cols)
      const stepX = width / (cols + 1)
      const stepY = height / (rows + 1)

      for (let row = 0; row < rows && positions.length < count; row++) {
        for (let col = 0; col < cols && positions.length < count; col++) {
          const candidateX = minX + stepX * (col + 1)
          const candidateY = minY + stepY * (row + 1)
          positions.push(adjustToPolygon(candidateX, candidateY))
        }
      }
    }

    return positions
  }

  // Función para calcular la longitud en píxeles de cada lado del polígono
  const calculateSideLengths = (points: Point[]): number[] => {
    const lengths: number[] = []
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i]
      const p2 = points[(i + 1) % points.length] // Conectar último con primero
      const length = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
      lengths.push(length)
    }
    return lengths
  }

  // Función para cerrar el polígono y posicionar pararrayos
  const closeCurrentArea = () => {
    if (currentArea.length > 2) {
      const areaPoints = currentArea.flatMap((p) => [p.x, p.y])

      // En modo mapa, entrar en modo de selección de lado (para indicar el ancho)
      if (mode === 'map') {
        setPendingArea({ points: areaPoints, currentArea: [...currentArea] })
        setSelectingWidthSide(true)
        setDrawingMode('none')
        return
      }

      // En modo grid, procesar directamente
      finishAreaCreation(areaPoints)
    }
  }

  // Handler para cuando el usuario hace clic en un lado del polígono (el lado que representa el ancho)
  const handleWidthSideClick = (sideIndex: number) => {
    if (!pendingArea || !buildingWidth || buildingWidth <= 0) {
      toast.error('No se encontró el ancho del edificio. Verifica el Paso 2.')
      return
    }

    // En modo GRID, ajustar las dimensiones del rectángulo según el lado seleccionado
    if (mode === 'grid') {
      // Determinar si el lado seleccionado es horizontal (0=arriba, 2=abajo) o vertical (1=derecha, 3=izquierda)
      const isHorizontalSide = sideIndex === 0 || sideIndex === 2

      // Calcular centro del canvas
      const centerX = stageWidth / 2
      const centerY = stageHeight / 2

      let finalLengthPx: number
      let finalWidthPx: number

      if (isHorizontalSide) {
        // El usuario seleccionó un lado horizontal como ancho
        // Entonces: horizontal = buildingWidth, vertical = buildingLength
        finalWidthPx = buildingWidth * DEFAULT_PIXELS_PER_METER  // Este va en horizontal (ancho visual)
        finalLengthPx = buildingLength * DEFAULT_PIXELS_PER_METER // Este va en vertical (largo visual)
      } else {
        // El usuario seleccionó un lado vertical como ancho
        // Entonces: vertical = buildingWidth, horizontal = buildingLength (esto es el default)
        finalLengthPx = buildingLength * DEFAULT_PIXELS_PER_METER // Horizontal
        finalWidthPx = buildingWidth * DEFAULT_PIXELS_PER_METER   // Vertical
      }

      // Crear el rectángulo con las dimensiones ajustadas
      const x1 = centerX - finalWidthPx / 2
      const y1 = centerY - finalLengthPx / 2
      const x2 = centerX + finalWidthPx / 2
      const y2 = centerY + finalLengthPx / 2

      const areaPoints = [
        x1, y1,  // Superior izquierda
        x2, y1,  // Superior derecha
        x2, y2,  // Inferior derecha
        x1, y2,  // Inferior izquierda
      ]

      // Resetear escala y crear el área
      setDynamicPixelsPerMeter(DEFAULT_PIXELS_PER_METER)
      setSelectingWidthSide(false)
      setPendingArea(null)

      const rectangleArea: Area = {
        id: `area-auto-${Date.now()}`,
        points: areaPoints,
        closed: true,
      }

      setAreas([rectangleArea])
      setDrawingMode('none')

      // Posicionar pararrayos automáticamente con la escala correcta
      placeZonesInArea(areaPoints, DEFAULT_PIXELS_PER_METER)

      const orientation = isHorizontalSide ? 'horizontal' : 'vertical'
      toast.success(`Lado ${sideIndex + 1} seleccionado como ancho (${buildingWidth}m ${orientation})`)
      return
    }

    // En modo MAPA, calcular escala basada en el lado seleccionado
    // Calcular longitud en píxeles del lado seleccionado
    const sideLengthsPx = calculateSideLengths(pendingArea.currentArea)
    const selectedSidePx = sideLengthsPx[sideIndex]

    // Calcular escala: píxeles por metro usando buildingWidth
    const calculatedPixelsPerMeter = selectedSidePx / buildingWidth

    // Finalizar creación del área con la escala calculada
    setSelectingWidthSide(false)
    finishAreaCreation(pendingArea.points, calculatedPixelsPerMeter)
    setPendingArea(null)

    toast.success(`Escala calibrada: ${calculatedPixelsPerMeter.toFixed(1)} px/m (ancho = ${buildingWidth}m)`)
  }

  // Función para calcular escala basada en dimensiones lineales del bounding box
  const calculateScaleFromBoundingBox = (areaPoints: number[], widthMeters: number, heightMeters: number): number => {
    const xCoords = areaPoints.filter((_, i) => i % 2 === 0)
    const yCoords = areaPoints.filter((_, i) => i % 2 === 1)
    const drawnWidthPx = Math.max(...xCoords) - Math.min(...xCoords)
    const drawnHeightPx = Math.max(...yCoords) - Math.min(...yCoords)

    // Calcular escala usando dimensiones lineales (promedio de X e Y)
    const scaleX = drawnWidthPx / widthMeters
    const scaleY = drawnHeightPx / heightMeters
    return (scaleX + scaleY) / 2
  }

  // Función para finalizar la creación del área (usado después de calibración o directamente en grid)
  const finishAreaCreation = (areaPoints: number[], pixelsPerMeter?: number) => {
    const newArea: Area = {
      id: `area-${Date.now()}`,
      points: areaPoints,
      closed: true,
    }

    // Determinar la escala final a usar
    let finalPixelsPerMeter: number
    if (pixelsPerMeter && pixelsPerMeter > 0) {
      // Usar escala proporcionada (desde calibración manual)
      finalPixelsPerMeter = pixelsPerMeter
    } else {
      // Calcular escala basada en dimensiones lineales del bounding box
      finalPixelsPerMeter = calculateScaleFromBoundingBox(areaPoints, buildingLength, buildingWidth)
    }

    setDynamicPixelsPerMeter(finalPixelsPerMeter)

    // Reemplazar áreas existentes con la nueva (no agregar)
    setAreas([newArea])
    setCurrentArea([])
    setDrawingMode('none')

    // Posicionar pararrayos automáticamente con la escala correcta
    setTimeout(() => {
      placeZonesInArea(areaPoints, finalPixelsPerMeter)
    }, 0)
  }

  // Cancelar todo el proceso de calibración
  const handleCancelCalibration = () => {
    setSelectingWidthSide(false)
    setPendingArea(null)
    setCurrentArea([])
  }

  // Detectar si un clic está cerca del primer punto
  const isNearFirstPoint = (clickPoint: Point): boolean => {
    if (currentArea.length < 3) return false
    const firstPoint = currentArea[0]
    const distance = Math.sqrt(
      Math.pow(clickPoint.x - firstPoint.x, 2) + Math.pow(clickPoint.y - firstPoint.y, 2)
    )
    return distance < 15 // 15 píxeles de tolerancia
  }

  // Listener de teclado para cerrar con Enter
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && drawingMode === 'area' && currentArea.length > 2) {
        closeCurrentArea()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [drawingMode, currentArea])

  // Preservar posición del Stage cuando cambia el modo de edición
  useEffect(() => {
    if (stageRef.current && drawingMode === 'edit') {
      // Forzar que el Stage use la posición del estado
      stageRef.current.position({ x: stagePosition.x, y: stagePosition.y })
      stageRef.current.batchDraw()
    }
  }, [drawingMode, stagePosition])

  // Actualizar radios cuando cambie la escala (solo recalcular sin cambiar modelo/nivel)
  useEffect(() => {
    setProtectionZones((prevZones) => {
      if (prevZones.length === 0) return prevZones

      const updatedZones = prevZones.map((zone) => {
        // Mantener el modelo y nivel de cada zona, solo recalcular el radio
        const newRadius = getProtectionRadius(zone.model, zone.level)
        return {
          ...zone,
          radius: newRadius,
        }
      })

      return updatedZones
    })
  }, [dynamicPixelsPerMeter])

  // Guardar la medida editada
  const handleSaveMeasurement = () => {
    if (!editingMeasurement) return

    const parsedValue = parseFloat(newMeasurementValue)
    if (!isNaN(parsedValue) && parsedValue > 0) {
      const key = `${editingMeasurement.areaId}-${editingMeasurement.sideIndex}`
      setCustomDistances({
        ...customDistances,
        [key]: parsedValue,
      })
      setEditModalOpen(false)
      setEditingMeasurement(null)
      setNewMeasurementValue('')
    } else {
      toast.error('Por favor, ingresa un valor numérico válido mayor que 0')
    }
  }

  // Refs para el estado actual del zoom (evitar closures obsoletas)
  const scaleRef = useRef(scale)
  const stagePositionRef = useRef(stagePosition)
  const areasRef = useRef(areas)

  useEffect(() => {
    scaleRef.current = scale
    stagePositionRef.current = stagePosition
    areasRef.current = areas
  }, [scale, stagePosition, areas])

  // Calcular el centro del edificio (estructura dibujada)
  const getBuildingCenter = useCallback(() => {
    const currentAreas = areasRef.current
    if (currentAreas.length > 0) {
      const points = currentAreas[0].points
      const xCoords = points.filter((_, i) => i % 2 === 0)
      const yCoords = points.filter((_, i) => i % 2 === 1)
      return {
        x: (Math.min(...xCoords) + Math.max(...xCoords)) / 2,
        y: (Math.min(...yCoords) + Math.max(...yCoords)) / 2
      }
    }
    // Si no hay edificio, usar el centro del canvas
    return { x: stageWidth / 2, y: stageHeight / 2 }
  }, [stageWidth, stageHeight])

  // Función para hacer zoom manteniendo el edificio centrado
  const zoomToBuilding = useCallback((newScalePercent: number) => {
    const newScale = newScalePercent / 100
    const buildingCenter = getBuildingCenter()

    // Centro del viewport (donde queremos que esté el edificio)
    const viewportCenterX = stageWidth / 2
    const viewportCenterY = stageHeight / 2

    // Nueva posición para mantener el edificio en el centro del viewport
    const newX = viewportCenterX - buildingCenter.x * newScale
    const newY = viewportCenterY - buildingCenter.y * newScale

    setScale(newScalePercent)
    setStagePosition({ x: newX, y: newY })
  }, [getBuildingCenter, stageWidth, stageHeight])

  // Manejar zoom con la rueda del mouse (listener nativo para mejor control)
  useEffect(() => {
    const container = containerRef.current
    if (!container || mode === 'select') return

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // Ajustar el zoom centrado en el edificio
      const direction = e.deltaY > 0 ? -1 : 1
      const scaleBy = 15 // Incrementos de 15%
      const currentScale = scaleRef.current
      const newScalePercent = direction > 0
        ? Math.min(300, currentScale + scaleBy)
        : Math.max(20, currentScale - scaleBy)

      // Usar la función de zoom centrado en edificio
      const newScale = newScalePercent / 100
      const currentAreas = areasRef.current
      let buildingCenterX = stageWidth / 2
      let buildingCenterY = stageHeight / 2

      if (currentAreas.length > 0) {
        const points = currentAreas[0].points
        const xCoords = points.filter((_: number, i: number) => i % 2 === 0)
        const yCoords = points.filter((_: number, i: number) => i % 2 === 1)
        buildingCenterX = (Math.min(...xCoords) + Math.max(...xCoords)) / 2
        buildingCenterY = (Math.min(...yCoords) + Math.max(...yCoords)) / 2
      }

      // Nueva posición para mantener el edificio en el centro del viewport
      const newX = stageWidth / 2 - buildingCenterX * newScale
      const newY = stageHeight / 2 - buildingCenterY * newScale

      setScale(newScalePercent)
      setStagePosition({ x: newX, y: newY })
    }

    container.addEventListener('wheel', handleNativeWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleNativeWheel)
  }, [mode, stageWidth, stageHeight])

  // Zoom in con botón
  const handleZoomIn = useCallback(() => {
    const newScale = Math.min(300, scale + 20)
    zoomToBuilding(newScale)
  }, [scale, zoomToBuilding])

  // Zoom out con botón
  const handleZoomOut = useCallback(() => {
    const newScale = Math.max(20, scale - 20)
    zoomToBuilding(newScale)
  }, [scale, zoomToBuilding])

  // Manejar clic en el stage (ajustado para zoom)
  const handleStageClickWithZoom = (e: KonvaEventObject<MouseEvent>) => {
    if (drawingMode === 'area') {
      const stage = e.target.getStage()
      if (!stage) return

      const pointer = stage.getPointerPosition()
      if (!pointer) return

      const point = {
        x: (pointer.x - stagePosition.x) / zoomScale,
        y: (pointer.y - stagePosition.y) / zoomScale,
      }

      // Si hace clic cerca del primer punto, cerrar el polígono
      if (isNearFirstPoint(point)) {
        closeCurrentArea()
      } else {
        setCurrentArea([...currentArea, point])
      }
    }
  }

  // Capturar imagen del canvas automáticamente (sin notificaciones)
  const captureImage = useCallback(() => {
    if (!stageRef.current || !onCaptureImageRef.current) {
      return
    }

    try {
      // Capturar el canvas como imagen (PNG de alta calidad)
      const dataURL = stageRef.current.toDataURL({
        pixelRatio: 2, // Mayor calidad (2x resolución)
        mimeType: 'image/png',
      })

      const timestamp = Date.now()
      onCaptureImageRef.current(dataURL, timestamp)
    } catch (error) {
      // Silenciosamente ignorar errores de captura automática
      logger.error('Error al capturar imagen automáticamente', error as Error)
    }
  }, [])

  // Efecto para capturar automáticamente cuando hay cambios en el esquema
  useEffect(() => {
    // No capturar durante la configuración inicial del grid para evitar re-renders innecesarios
    if (isSettingUpGrid.current) {
      return
    }

    // Solo capturar si hay contenido en el canvas (áreas o zonas de protección)
    if (areas.length > 0 || protectionZones.length > 0 || uploadedImage) {
      // Usar timeout para esperar a que el canvas se actualice completamente
      const timeoutId = setTimeout(() => {
        captureImage()
      }, 500) // 500ms de delay para asegurar que el canvas esté renderizado

      return () => clearTimeout(timeoutId)
    }
  }, [protectionZones, areas, uploadedImage, captureImage])
  // Posicionar y crear pararrayos necesarios después de definir un área (garantiza 100% cobertura)
  const placeZonesInArea = useCallback((areaPoints: number[], customPixelsPerMeter?: number) => {
    // Usar escala personalizada si se proporciona, sino usar la del estado
    const pixelsPerMeter = customPixelsPerMeter ?? dynamicPixelsPerMeter

    // Calcular radio de protección con la escala correcta
    const radiusMeters = PROTECTION_RADII[cabezalModel]?.[protectionLevel] || 60
    const currentRadius = radiusMeters * pixelsPerMeter

    // Calcular estimación inicial de pararrayos necesarios
    let requiredCount = calculateRequiredZones(areaPoints, currentRadius)

    // Si hay zonas existentes, usar al menos esa cantidad
    const existingCount = protectionZones.length
    requiredCount = Math.max(existingCount, requiredCount)

    // Función para crear zonas con una cantidad dada
    const createZonesWithCount = (count: number): { x: number; y: number; radius: number }[] => {
      const positions = distributeZonesInBuilding(areaPoints, count)
      return positions.map(pos => ({ x: pos.x, y: pos.y, radius: currentRadius }))
    }

    // Iterativamente aumentar el número de zonas hasta lograr 100% de cobertura
    let zones = createZonesWithCount(requiredCount)
    let coverage = checkCoverage(areaPoints, zones)
    const maxIterations = 20 // Límite de seguridad
    let iterations = 0

    while (coverage < 99.5 && iterations < maxIterations) {
      requiredCount += 1
      zones = createZonesWithCount(requiredCount)
      coverage = checkCoverage(areaPoints, zones)
      iterations++
    }

    // Crear las zonas de protección finales
    const updatedZones: ProtectionZone[] = []
    const positions = distributeZonesInBuilding(areaPoints, requiredCount)

    // Reutilizar zonas existentes con sus propiedades
    protectionZones.forEach((zone, index) => {
      if (index < positions.length) {
        updatedZones.push({
          ...zone,
          x: positions[index].x,
          y: positions[index].y,
          radius: currentRadius,
          placedOnMap: true,
        })
      }
    })

    // Agregar zonas adicionales si se necesitan más
    const additionalNeeded = requiredCount - existingCount
    if (additionalNeeded > 0) {
      for (let i = existingCount; i < requiredCount; i++) {
        const newZone: ProtectionZone = {
          id: `zone-auto-${Date.now()}-${i}`,
          x: positions[i].x,
          y: positions[i].y,
          radius: currentRadius,
          model: cabezalModel,
          level: protectionLevel,
          placedOnMap: true,
        }
        updatedZones.push(newZone)
      }
      toast.success(`Se agregaron ${additionalNeeded} pararrayos para cubrir el 100% del edificio`)
    }

    setProtectionZones(updatedZones)
    onZonesChange?.(updatedZones)
  }, [cabezalModel, protectionLevel, protectionZones, onZonesChange, dynamicPixelsPerMeter])

  // Finalizar edición y guardar cambios
  const finishEditing = useCallback(() => {
    setDrawingMode('none')
    setEditingAreaId(null)
    setDraggingVertexIndex(null)
    // Recalcular escala basada en dimensiones lineales y reposicionar pararrayos
    if (areas.length > 0) {
      const areaPoints = areas[0].points
      const xCoords = areaPoints.filter((_, i) => i % 2 === 0)
      const yCoords = areaPoints.filter((_, i) => i % 2 === 1)
      const drawnWidthPx = Math.max(...xCoords) - Math.min(...xCoords)
      const drawnHeightPx = Math.max(...yCoords) - Math.min(...yCoords)
      if (drawnWidthPx > 0 && drawnHeightPx > 0 && buildingLength > 0 && buildingWidth > 0) {
        const scaleX = drawnWidthPx / buildingLength
        const scaleY = drawnHeightPx / buildingWidth
        const calculatedPxPerMeter = (scaleX + scaleY) / 2
        setDynamicPixelsPerMeter(calculatedPxPerMeter)
        // Reposicionar pararrayos con la escala correcta
        placeZonesInArea(areaPoints, calculatedPxPerMeter)
      }
    }
  }, [areas, buildingLength, buildingWidth, placeZonesInArea])

  // Actualizar la referencia
  useEffect(() => {
    finishEditingRef.current = finishEditing
  }, [finishEditing])

  // Generar área rectangular automáticamente basado en dimensiones del Paso 2
  // En modo grid, primero entra en modo selección de lado para que el usuario indique cuál es el ancho
  const generateRectangleArea = useCallback(() => {
    // Calcular escala dinámica para que el rectángulo ocupe ~70% del canvas
    // Convertir metros a píxeles usando escala fija
    const lengthPx = buildingLength * DEFAULT_PIXELS_PER_METER
    const widthPx = buildingWidth * DEFAULT_PIXELS_PER_METER

    const centerX = stageWidth / 2
    const centerY = stageHeight / 2

    const x1 = centerX - lengthPx / 2
    const y1 = centerY - widthPx / 2
    const x2 = centerX + lengthPx / 2
    const y2 = centerY + widthPx / 2

    const areaPoints = [
      x1, y1,  // Superior izquierda
      x2, y1,  // Superior derecha
      x2, y2,  // Inferior derecha
      x1, y2,  // Inferior izquierda
    ]

    // Convertir a formato Point[] para el modo de selección
    const currentAreaPoints: Point[] = [
      { x: x1, y: y1 },
      { x: x2, y: y1 },
      { x: x2, y: y2 },
      { x: x1, y: y2 },
    ]

    // Entrar en modo selección de lado para que el usuario indique cuál es el ancho
    setPendingArea({ points: areaPoints, currentArea: currentAreaPoints })
    setSelectingWidthSide(true)
    setDrawingMode('none')
  }, [buildingLength, buildingWidth, stageWidth, stageHeight])

  // Generar automáticamente el área rectangular cuando se entra en modo grid por primera vez
  useEffect(() => {
    // Resetear los flags cuando se limpia todo (vuelve a modo selección)
    if (mode === 'select') {
      hasGeneratedGridArea.current = false
      isSettingUpGrid.current = false
      lastDimensions.current = { width: 0, height: 0 }
      userDeletedStructure.current = false // Permitir regenerar en futuras sesiones
      return
    }

    // No regenerar si el usuario eliminó la estructura manualmente
    if (userDeletedStructure.current) {
      return
    }

    // No regenerar si estamos en modo edición o dibujando
    if (drawingMode === 'edit' || drawingMode === 'area') {
      return
    }

    // Solo generar si estamos en modo grid y las dimensiones son válidas
    if (mode === 'grid' && stageWidth > 100 && stageHeight > 100) {
      const dimensionsChanged =
        Math.abs(lastDimensions.current.width - stageWidth) > 50 ||
        Math.abs(lastDimensions.current.height - stageHeight) > 50

      // Generar si es la primera vez o si las dimensiones cambiaron significativamente
      if (!hasGeneratedGridArea.current || (dimensionsChanged && areas.length > 0)) {
        hasGeneratedGridArea.current = true
        isSettingUpGrid.current = true
        lastDimensions.current = { width: stageWidth, height: stageHeight }
        generateRectangleArea()
        setTimeout(() => {
          isSettingUpGrid.current = false
        }, 100)
      }
    }
  }, [mode, stageWidth, stageHeight, generateRectangleArea, areas.length, drawingMode])

  return (
    <div className="flex h-full flex-col">
      {/* Header con badge de cobertura */}
      {mode !== 'select' && areas.length > 0 && protectionZones.length > 0 && (
        <div className="flex justify-end mb-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-500 bg-green-50 px-5 py-1.5 text-sm font-medium text-green-700">
            Nivel de protección: {coverageLabel} = {coveragePercentLabel}%
          </div>
        </div>
      )}
      {/* Canvas siempre visible */}
      <div className="relative flex-1">
        <div ref={containerRef} className="absolute inset-0 overflow-hidden rounded-lg bg-card">
        <Stage
          ref={stageRef}
          width={stageWidth}
          height={stageHeight}
          scaleX={zoomScale}
          scaleY={zoomScale}
          x={stagePosition.x}
          y={stagePosition.y}
          onClick={mode !== 'select' ? handleStageClickWithZoom : undefined}
          draggable={mode !== 'select' && drawingMode === 'none' && !isDraggingZone}
          onDragEnd={(e) => {
            if (mode !== 'select') {
              setStagePosition({ x: e.target.x(), y: e.target.y() })
            }
          }}
        >
          {/* Capa de fondo con cuadrícula o imagen */}
          <Layer>
            {mode !== 'map' && renderGrid()}
            {mode === 'map' && uploadedImage && (
              <BackgroundImage image={uploadedImage} width={stageWidth} height={stageHeight} />
            )}
          </Layer>

          {mode !== 'select' && (
            <>
              {/* Capa de dibujo actual (mientras se dibuja) */}
              {drawingMode === 'area' && currentArea.length > 0 && (
                <Layer>
                  {/* Líneas del polígono en progreso */}
                  <Line
                    points={currentArea.flatMap((p) => [p.x, p.y])}
                    stroke={COLOR_TOKENS.brandBlue}
                    strokeWidth={2}
                    closed={false}
                  />
                  {/* Puntos del polígono en progreso */}
                  {currentArea.map((point, idx) => (
                    <Circle
                      key={`current-${idx}`}
                      x={point.x}
                      y={point.y}
                      radius={6}
                      fill={idx === 0 ? COLOR_TOKENS.brandYellow : COLOR_TOKENS.brandBlue}
                      stroke={COLOR_TOKENS.white}
                      strokeWidth={2}
                    />
                  ))}
                </Layer>
              )}

              {/* Capa de áreas dibujadas */}
              <Layer>
                {areas.map((area) => {
                  const points: Point[] = []
                  for (let i = 0; i < area.points.length; i += 2) {
                    points.push({ x: area.points[i], y: area.points[i + 1] })
                  }

                  // Calcular centro del área para el nombre del edificio
                  const xCoords = area.points.filter((_, i) => i % 2 === 0)
                  const yCoords = area.points.filter((_, i) => i % 2 === 1)
                  const centerX = (Math.min(...xCoords) + Math.max(...xCoords)) / 2
                  const centerY = (Math.min(...yCoords) + Math.max(...yCoords)) / 2

                  return (
                    <React.Fragment key={area.id}>
                      <Line
                        points={area.points}
                        stroke={COLOR_TOKENS.boxStroke}
                        strokeWidth={1}
                        closed={area.closed}
                        fill={COLOR_TOKENS.boxFillAlpha}
                      />
                      {/* Nombre del edificio en el centro del área */}
                      {buildingName && area.closed && (
                        <Text
                          x={centerX - 100}
                          y={centerY - 8}
                          width={200}
                          text={buildingName.toUpperCase()}
                          fontSize={12}
                          fontStyle="600"
                          fill={COLOR_TOKENS.boxStroke}
                          align="center"
                          letterSpacing={1.5}
                          listening={false}
                        />
                      )}
                      {/* Vértices en modo dibujo (no arrastrables) */}
                      {drawingMode === 'area' && points.map((point, idx) => (
                        <Circle
                          key={`${area.id}-vertex-${idx}`}
                          x={point.x}
                          y={point.y}
                          radius={5}
                          fill={COLOR_TOKENS.brandBlue}
                          stroke={COLOR_TOKENS.white}
                          strokeWidth={1}
                        />
                      ))}
                      {/* Vértices en modo edición (arrastrables) */}
                      {drawingMode === 'edit' && editingAreaId === area.id && points.map((point, idx) => (
                        <Circle
                          key={`${area.id}-edit-vertex-${idx}`}
                          x={point.x}
                          y={point.y}
                          radius={8}
                          fill={draggingVertexIndex === idx ? COLOR_TOKENS.brandYellow : COLOR_TOKENS.brandBlue}
                          stroke={COLOR_TOKENS.white}
                          strokeWidth={2}
                          draggable
                          onDragStart={(e) => {
                            e.cancelBubble = true
                            handleVertexDragStart(idx)
                          }}
                          onDragMove={(e) => {
                            e.cancelBubble = true
                            const newX = e.target.x()
                            const newY = e.target.y()
                            handleVertexDragMove(area.id, idx, newX, newY)
                          }}
                          onDragEnd={(e) => {
                            e.cancelBubble = true
                            handleVertexDragEnd()
                          }}
                          style={{ cursor: 'move' }}
                        />
                      ))}
                    </React.Fragment>
                  )
                })}
              </Layer>

              {/* Capa de selección de lado para calibración (seleccionar el lado que representa el ancho) */}
              {selectingWidthSide && pendingArea && (
                <Layer>
                  {/* Dibujar el polígono pendiente */}
                  <Line
                    points={pendingArea.points}
                    stroke={COLOR_TOKENS.boxStroke}
                    strokeWidth={2}
                    closed={true}
                    fill={COLOR_TOKENS.boxFillAlpha}
                  />
                  {/* Lados clickeables con números */}
                  {pendingArea.currentArea.map((point, idx) => {
                    const nextPoint = pendingArea.currentArea[(idx + 1) % pendingArea.currentArea.length]
                    const midX = (point.x + nextPoint.x) / 2
                    const midY = (point.y + nextPoint.y) / 2
                    const sideLengthsPx = calculateSideLengths(pendingArea.currentArea)
                    const lengthPx = sideLengthsPx[idx]

                    // En modo grid, determinar si este lado es horizontal o vertical
                    // y mostrar la dimensión correspondiente en metros
                    const isHorizontalSide = idx === 0 || idx === 2
                    let sideLabel: string
                    if (mode === 'grid') {
                      // En grid, el rectángulo inicial tiene buildingLength en horizontal y buildingWidth en vertical
                      const lengthMeters = isHorizontalSide ? buildingLength : buildingWidth
                      sideLabel = `${lengthMeters}m`
                    } else {
                      sideLabel = `${lengthPx.toFixed(0)}px`
                    }

                    return (
                      <React.Fragment key={`side-${idx}`}>
                        {/* Línea del lado (clickeable) */}
                        <Line
                          points={[point.x, point.y, nextPoint.x, nextPoint.y]}
                          stroke={COLOR_TOKENS.brandBlue}
                          strokeWidth={4}
                          hitStrokeWidth={20}
                          onClick={() => handleWidthSideClick(idx)}
                          onTap={() => handleWidthSideClick(idx)}
                          style={{ cursor: 'pointer' }}
                        />
                        {/* Círculo con número en el centro del lado */}
                        <Circle
                          x={midX}
                          y={midY}
                          radius={16}
                          fill={COLOR_TOKENS.brandBlue}
                          stroke={COLOR_TOKENS.white}
                          strokeWidth={2}
                          onClick={() => handleWidthSideClick(idx)}
                          onTap={() => handleWidthSideClick(idx)}
                          style={{ cursor: 'pointer' }}
                        />
                        <Text
                          x={midX - 8}
                          y={midY - 6}
                          width={16}
                          text={String(idx + 1)}
                          fontSize={12}
                          fontStyle="bold"
                          fill={COLOR_TOKENS.white}
                          align="center"
                          listening={false}
                        />
                        {/* Mostrar longitud debajo del número (metros en grid, px en mapa) */}
                        <Text
                          x={midX - 25}
                          y={midY + 18}
                          width={50}
                          text={sideLabel}
                          fontSize={10}
                          fill={COLOR_TOKENS.brandBlue}
                          align="center"
                          listening={false}
                        />
                      </React.Fragment>
                    )
                  })}
                </Layer>
              )}

              {/* Capa de zonas de protección - visible solo si hay edificio y no se está editando/dibujando */}
              {areas.length > 0 && drawingMode === 'none' && !selectingWidthSide && (
                <Layer>
                  {protectionZones.map((zone, index) => (
                    <ProtectionZoneCircle
                      key={zone.id}
                      zone={zone}
                      zoneNumber={index + 1}
                      isSelected={zone.id === selectedZoneId}
                      areaBounds={areaBounds}
                      areaPoints={areas.length > 0 ? areas[0].points : null}
                      onZoneClick={handleZoneClick}
                      onDragStart={handleZoneDragStart}
                      onDragEnd={handleZoneDragEnd}
                    />
                  ))}
                </Layer>
              )}
            </>
          )}
        </Stage>
        </div>
        {/* Modo de selección inicial - overlay sobre la cuadrícula */}
        {mode === 'select' && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="flex flex-col gap-6 border rounded-lg py-6 px-12 bg-card shadow-lg">
              <h4 className="text-md font-semibold">Selecciona cómo quieres comenzar:</h4>
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary hover:bg-primary/90"
              >
                <Upload className="mr-2 h-4 w-4" />
                Subir tu mapa
              </Button>
              <Button
                variant="outline"
                onClick={() => setMode('grid')}
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                Dibujar sobre cuadrícula
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Badge "Modo Dibujo" en esquina superior izquierda */}
        {drawingMode === 'area' && mode !== 'select' && (
          <div className="absolute top-4 left-4 z-10">
            <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg">
              <PenTool className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold">Modo Dibujo</span>
                <span className="text-[10px] opacity-80">Añade vértices o cierra la forma</span>
              </div>
            </div>
          </div>
        )}

        {/* Badge "Seleccionar Lado del Ancho" para calibración */}
        {selectingWidthSide && (
          <div className="absolute top-4 left-4 z-10">
            <div className="flex items-center gap-3 bg-primary text-primary-foreground px-4 py-3 rounded-md shadow-lg">
              <Ruler className="h-5 w-5" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Selecciona el lado que representa el ANCHO</span>
                {mode === 'grid' ? (
                  <span className="text-[10px] opacity-80">
                    Dimensiones: {buildingLength}m (longitud) × {buildingWidth}m (ancho)
                  </span>
                ) : (
                  <span className="text-[10px] opacity-80">Ancho del edificio: {buildingWidth}m (del Paso 2)</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelCalibration}
                className="ml-2 h-7 px-2 text-primary-foreground hover:bg-primary-foreground/20"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Botones de Zoom en esquina superior derecha */}
        {mode !== 'select' && (
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-card/90 hover:bg-card shadow-md"
              onClick={handleZoomIn}
              title="Acercar"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-card/90 hover:bg-card shadow-md"
              onClick={handleZoomOut}
              title="Alejar"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Panel de opciones para modo cuadrícula - crear estructura (cuando no hay ninguna) */}
        {mode === 'grid' && areas.length === 0 && drawingMode === 'none' && !selectingWidthSide && (
          <div className="absolute bottom-4 left-4 z-10 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-card/90 hover:bg-card shadow-md"
              onClick={() => {
                userDeletedStructure.current = false
                generateRectangleArea()
              }}
              title="Generar rectángulo automático"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Generar rectángulo
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-card/90 hover:bg-card shadow-md"
              onClick={() => {
                setDrawingMode('area')
              }}
              title="Dibujar polígono personalizado"
            >
              <Hexagon className="h-4 w-4 mr-2" />
              Dibujar polígono
            </Button>
          </div>
        )}

        {/* Panel de opciones para modo cuadrícula - editar o dibujar polígono (cuando ya hay estructura) */}
        {mode === 'grid' && areas.length > 0 && drawingMode === 'none' && !selectingWidthSide && (
          <div className="absolute bottom-4 left-4 z-10 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-card/90 hover:bg-card shadow-md"
              onClick={(e) => {
                e.stopPropagation()
                editStructure()
              }}
              title="Editar estructura actual"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-card/90 hover:bg-card shadow-md"
              onClick={() => {
                setAreas([])
                setProtectionZones([])
                setDrawingMode('area')
              }}
              title="Dibujar polígono personalizado"
            >
              <Hexagon className="h-4 w-4 mr-2" />
              Dibujar polígono
            </Button>
          </div>
        )}

        {/* Badge "Modo Edición" con controles de escala */}
        {drawingMode === 'edit' && mode !== 'select' && (
          <div className="absolute top-4 left-4 z-10">
            <div className="flex flex-col gap-2 bg-primary text-primary-foreground p-3 rounded-md shadow-lg">
              <div className="flex items-center gap-2">
                <Move className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">Modo Edición</span>
                  <span className="text-[10px] opacity-80">Arrastra los vértices para modificar</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-primary-foreground/20">
                <span className="text-[10px]">Escala:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={() => handleScaleStructure(0.9)}
                  title="Reducir 10%"
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={() => handleScaleStructure(1.1)}
                  title="Aumentar 10%"
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-primary-foreground hover:bg-primary-foreground/20 ml-auto"
                  onClick={finishEditing}
                  title="Finalizar edición"
                >
                  <Check className="h-3 w-3 mr-1" />
                  <span className="text-[10px]">Listo</span>
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modal para editar medidas */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar medida del lado</DialogTitle>
            <DialogDescription>
              Ingresa la nueva medida en metros para este lado del edificio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="measurement">Medida (metros)</Label>
              <Input
                id="measurement"
                type="number"
                min="0.1"
                step="0.1"
                value={newMeasurementValue}
                onChange={(e) => setNewMeasurementValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveMeasurement()
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditModalOpen(false)
                setEditingMeasurement(null)
                setNewMeasurementValue('')
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveMeasurement}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación reutilizable */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        description={dialogState.description}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        variant="destructive"
        confirmText="Confirmar"
        cancelText="Cancelar"
      />

      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full border border-dashed"
              style={{ borderColor: COLOR_TOKENS.brandBlue, borderWidth: 2 }}
            />
            <span>Radio de Protección</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-sm border border-[var(--border-strong)] bg-[var(--surface-muted)]" />
            <span>Estructuras</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span>Grid: 10m x 10m</span>
          {mode !== 'select' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetCanvas}
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-destructive"
              title="Reiniciar canvas"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

const areProtectionSchemePropsEqual = (
  prev: ProtectionSchemeCanvasProps,
  next: ProtectionSchemeCanvasProps
) => {
  const zonesChanged = JSON.stringify(prev.initialProtectionZones ?? []) !== JSON.stringify(next.initialProtectionZones ?? [])

  return (
    prev.cabezalModel === next.cabezalModel &&
    prev.protectionLevel === next.protectionLevel &&
    prev.buildingLength === next.buildingLength &&
    prev.buildingWidth === next.buildingWidth &&
    prev.mastType === next.mastType &&
    prev.mastHeight === next.mastHeight &&
    prev.anchorType === next.anchorType &&
    prev.anchorSeparation === next.anchorSeparation &&
    prev.selectedZoneId === next.selectedZoneId &&
    prev.onZonesChange === next.onZonesChange &&
    prev.onCaptureImage === next.onCaptureImage &&
    !zonesChanged
  )
}

const MemoizedProtectionSchemeCanvas = React.memo(ProtectionSchemeCanvas, areProtectionSchemePropsEqual)
MemoizedProtectionSchemeCanvas.displayName = 'ProtectionSchemeCanvas'

export { MemoizedProtectionSchemeCanvas as ProtectionSchemeCanvas }
