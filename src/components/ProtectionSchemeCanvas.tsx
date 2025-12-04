import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Stage, Layer, Line, Circle, Image as KonvaImage, Text, Group } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Upload, Plus, Trash2, Calculator, LayoutGrid, Check } from 'lucide-react'
import useImage from 'use-image'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import { toast } from 'sonner'

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
  mastType?: string
  mastHeight?: string
  anchorType?: string
  anchorSeparation?: string
  initialProtectionZones?: ProtectionZone[]
  selectedZoneId?: string // ID del pararrayos seleccionado para resaltarlo
  onZonesChange?: (zones: ProtectionZone[]) => void
  onCaptureImage?: (imageData: string, timestamp: number) => void // Callback para capturar imagen del canvas
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

const PIXELS_PER_METER = 3 // Escala: 1 metro = 3 píxeles

function BackgroundImage({ image }: { image: string }) {
  const [img] = useImage(image)
  return <KonvaImage image={img} />
}

// Componente memoizado para las zonas de protección (evita re-renders innecesarios)
interface ProtectionZoneCircleProps {
  zone: ProtectionZone
  isSelected: boolean
  onZoneClick: (zoneId: string, e: KonvaEventObject<MouseEvent>) => void
  onDragStart: (e: KonvaEventObject<DragEvent>) => void
  onDragMove: (zoneId: string, newX: number, newY: number, e: KonvaEventObject<DragEvent>) => void
  onDragEnd: (zone: ProtectionZone, e: KonvaEventObject<DragEvent>) => void
}

const ProtectionZoneCircle = React.memo(({
  zone,
  isSelected,
  onZoneClick,
  onDragStart,
  onDragMove,
  onDragEnd
}: ProtectionZoneCircleProps) => {
  // Estilos diferentes para el pararrayos seleccionado
  const strokeColor = isSelected ? '#3b82f6' : '#f7a800' // Azul en lugar de verde
  const strokeWidth = isSelected ? 4 : 2
  const fillOpacity = isSelected ? 0.1 : 0
  const iconSize = isSelected ? 28 : 24

  return (
    <Group
      x={zone.x}
      y={zone.y}
      draggable
      onClick={(e) => onZoneClick(zone.id, e)}
      onDragStart={onDragStart}
      onDragMove={(e) => {
        e.cancelBubble = true
        const newX = e.target.x()
        const newY = e.target.y()
        onDragMove(zone.id, newX, newY, e)
      }}
      onDragEnd={(e) => onDragEnd(zone, e)}
    >
      <Circle
        x={0}
        y={0}
        radius={zone.radius}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        dash={[10, 5]}
        fill={isSelected ? strokeColor : 'transparent'}
        opacity={isSelected ? fillOpacity : 1}
      />
      <Text
        x={isSelected ? -14 : -10}
        y={isSelected ? -14 : -10}
        text="⚡"
        fontSize={iconSize}
        fill={strokeColor}
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
  mastType,
  mastHeight,
  anchorType,
  anchorSeparation,
  initialProtectionZones = [],
  selectedZoneId,
  onZonesChange,
  onCaptureImage,
}: ProtectionSchemeCanvasProps) {
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

  // Memoizar handler de selección de zona para prevenir re-renders
  const handleZoneClick = useCallback((zoneId: string, e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true
    setSelectedZone(zoneId)
  }, [])

  // Memoizar handler de inicio de arrastre
  const handleZoneDragStart = useCallback((e: KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true
    setIsDraggingZone(true)
  }, [])

  // Memoizar handler de movimiento durante arrastre
  // Durante el arrastre, Konva maneja la posición visual internamente
  // No actualizamos el estado React para evitar re-renders innecesarios
  const handleZoneDragMove = useCallback((_zoneId: string, _newX: number, _newY: number, e: KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true
    // No llamamos a setProtectionZones aquí - solo en handleZoneDragEnd
  }, [])

  // Verificar si un punto está dentro de cualquier área dibujada
  const isPointInAnyArea = useCallback((point: Point): boolean => {
    return areas.some((area) => isPointInPolygon(point, area.points))
  }, [areas])

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
      z.id === zone.id ? { ...z, x: newX, y: newY } : z
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
  const [hoveredMeasurement, setHoveredMeasurement] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const stageRef = useRef<any>(null)
  const onZonesChangeRef = useRef(onZonesChange)
  const onCaptureImageRef = useRef(onCaptureImage)

  // Hook para diálogos de confirmación
  const { dialogState, showConfirm, handleConfirm, handleCancel } = useConfirmDialog()

  const stageWidth = 800
  const stageHeight = 500

  // Mantener las referencias actualizadas sin causar re-renders
  useEffect(() => {
    onZonesChangeRef.current = onZonesChange
    onCaptureImageRef.current = onCaptureImage
  })

  // Calcular escala dinámica (píxeles por metro) basada en las medidas personalizadas
  const dynamicPixelsPerMeter = useMemo(() => {
    if (areas.length === 0) return PIXELS_PER_METER

    const area = areas[0]
    const points: Point[] = []
    for (let i = 0; i < area.points.length; i += 2) {
      points.push({ x: area.points[i], y: area.points[i + 1] })
    }

    // Calcular dimensiones del área en píxeles
    const xCoords = points.map(p => p.x)
    const yCoords = points.map(p => p.y)
    const areaWidthPx = Math.max(...xCoords) - Math.min(...xCoords)
    const areaHeightPx = Math.max(...yCoords) - Math.min(...yCoords)

    // Buscar la primera medida personalizada horizontal y vertical para calcular escala
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

    // Si hay medidas personalizadas, calcular escala basada en el primer lado de cada tipo
    if (hasHorizontal && hasVertical) {
      // Usar promedio de escalas horizontal y vertical
      const scaleH = firstHorizontalPx / firstHorizontalMeters
      const scaleV = firstVerticalPx / firstVerticalMeters
      return (scaleH + scaleV) / 2
    } else if (hasHorizontal) {
      return firstHorizontalPx / firstHorizontalMeters
    } else if (hasVertical) {
      return firstVerticalPx / firstVerticalMeters
    }

    // Si no hay medidas personalizadas, usar las dimensiones del edificio
    const scaleH = areaWidthPx / buildingLength
    const scaleV = areaHeightPx / buildingWidth
    return (scaleH + scaleV) / 2
  }, [areas, customDistances, buildingLength, buildingWidth])

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
      setProtectionZones(zonesWithUpdatedRadii)
    }
  }, [initialZonesSerializ, dynamicPixelsPerMeter, cabezalModel, protectionLevel])

  // Verifica si un punto está cubierto por algún pararrayos
  const isPointCovered = (point: Point, zones: ProtectionZone[]): boolean => {
    return zones.some((zone) => {
        const distance = Math.sqrt(
          Math.pow(point.x - zone.x, 2) + Math.pow(point.y - zone.y, 2)
        )
        return distance <= zone.radius
      })
  }

  // Calcular cobertura del área (retorna porcentaje 0-100)
  const calculateCoverage = (): { coverage: number; uncoveredPoints: Point[] } => {
    if (areas.length === 0) return { coverage: 100, uncoveredPoints: [] }

    const area = areas[0]
    const uncoveredPoints: Point[] = []

    // Obtener bounds del área
    const xCoords = area.points.filter((_, i) => i % 2 === 0)
    const yCoords = area.points.filter((_, i) => i % 2 === 1)
    const minX = Math.min(...xCoords)
    const maxX = Math.max(...xCoords)
    const minY = Math.min(...yCoords)
    const maxY = Math.max(...yCoords)

    // Crear cuadrícula de puntos para verificar cobertura
    const gridSpacing = 20 // píxeles entre puntos de muestra
    let totalPoints = 0
    let coveredPoints = 0

    for (let x = minX; x <= maxX; x += gridSpacing) {
      for (let y = minY; y <= maxY; y += gridSpacing) {
        const point = { x, y }
        // Solo contar puntos dentro del área
        if (isPointInPolygon(point, area.points)) {
          totalPoints++
          if (isPointCovered(point, protectionZones)) {
            coveredPoints++
          } else {
            uncoveredPoints.push(point)
          }
        }
      }
    }

    const coverage = totalPoints > 0 ? (coveredPoints / totalPoints) * 100 : 0
    return { coverage, uncoveredPoints }
  }

  // Optimizar ubicación de pararrayos automáticamente
  const handleOptimizeParrays = useCallback(() => {
    if (areas.length === 0) {
      toast.warning('Primero debes dibujar el área del edificio.')
      return
    }

    const { coverage, uncoveredPoints } = calculateCoverage()

    if (coverage >= 95) {
      toast.success(`La cobertura actual es del ${coverage.toFixed(1)}%. El edificio está bien protegido.`)
      return
    }

    // Agrupar puntos no cubiertos en clusters usando un algoritmo simple
    const radius = getProtectionRadius(cabezalModel, protectionLevel)
    const newZones: ProtectionZone[] = [...protectionZones]

    // Mientras haya puntos sin cubrir, añadir pararrayos
    let remainingPoints = [...uncoveredPoints]
    let iterations = 0
    const maxIterations = 10 // Límite de seguridad

    while (remainingPoints.length > 0 && iterations < maxIterations) {
      // Encontrar el centroide de los puntos no cubiertos
      const sumX = remainingPoints.reduce((sum, p) => sum + p.x, 0)
      const sumY = remainingPoints.reduce((sum, p) => sum + p.y, 0)
      const centroid = {
        x: sumX / remainingPoints.length,
        y: sumY / remainingPoints.length,
      }

      // Verificar que el centroide esté dentro del área
      if (!isPointInPolygon(centroid, areas[0].points)) {
        // Si el centroide está fuera, usar el primer punto no cubierto
        centroid.x = remainingPoints[0].x
        centroid.y = remainingPoints[0].y
      }

      // Añadir nuevo pararrayos en el centroide
      const newZone: ProtectionZone = {
        id: `zone-auto-${Date.now()}-${iterations}`,
        x: centroid.x,
        y: centroid.y,
        radius,
        model: cabezalModel,
        level: protectionLevel,
        mastType,
        mastHeight,
        anchorType,
        anchorSeparation,
        placedOnMap: true,
      }
      newZones.push(newZone)

      // Filtrar puntos que ahora están cubiertos
      remainingPoints = remainingPoints.filter((point) => {
        const distance = Math.sqrt(
          Math.pow(point.x - centroid.x, 2) + Math.pow(point.y - centroid.y, 2)
        )
        return distance > radius
      })

      iterations++
    }

    // Actualizar estado
    setProtectionZones(newZones)
    onZonesChangeRef.current?.(newZones)

    const finalCoverage = calculateCoverage()
    toast.success('Optimización completa', {
      description:
        `Pararrayos añadidos: ${newZones.length - protectionZones.length}\n` +
        `Cobertura anterior: ${coverage.toFixed(1)}%\n` +
        `Cobertura actual: ${finalCoverage.coverage.toFixed(1)}%\n` +
        `Total de pararrayos: ${newZones.length}`,
    })
  }, [areas, protectionZones, cabezalModel, protectionLevel, mastType, mastHeight, anchorType, anchorSeparation, dynamicPixelsPerMeter])

  // Verificar si un punto está dentro de un polígono (algoritmo ray casting)
  const isPointInPolygon = (point: Point, polygonPoints: number[]): boolean => {
    const x = point.x
    const y = point.y
    let inside = false

    for (let i = 0, j = polygonPoints.length - 2; i < polygonPoints.length; i += 2) {
      const xi = polygonPoints[i]
      const yi = polygonPoints[i + 1]
      const xj = polygonPoints[j]
      const yj = polygonPoints[j + 1]

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi

      if (intersect) inside = !inside

      j = i
    }

    return inside
  }
  // Manejar subida de imagen
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
        setMode('map')
      }
      reader.readAsDataURL(file)
    }
  }

  // Dibujar cuadrícula
  const renderGrid = () => {
    const lines = []
    const gridSize = 25
    const heavyGridSize = gridSize * 5

    // Líneas verticales
    for (let i = 0; i <= stageWidth; i += gridSize) {
      const isHeavy = i % heavyGridSize === 0
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, stageHeight]}
          stroke={isHeavy ? '#b0b0b0' : '#d0d0d0'}
          strokeWidth={isHeavy ? 1.5 : 1}
        />
      )
    }

    // Líneas horizontales
    for (let i = 0; i <= stageHeight; i += gridSize) {
      const isHeavy = i % heavyGridSize === 0
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i, stageWidth, i]}
          stroke={isHeavy ? '#b0b0b0' : '#d0d0d0'}
          strokeWidth={isHeavy ? 1.5 : 1}
        />
      )
    }

    return lines
  }

  // Función para cerrar el polígono
  const closeCurrentArea = () => {
    if (currentArea.length > 2) {
      const newArea: Area = {
        id: `area-${Date.now()}`,
        points: currentArea.flatMap((p) => [p.x, p.y]),
        closed: true,
      }
      setAreas([...areas, newArea])
      setCurrentArea([])
      setDrawingMode('none')
    }
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

  // Añadir pararrayos desde el canvas
  // Los pararrayos agregados desde aquí se marcan como colocados en el mapa
  const handleAddPararrayos = useCallback(() => {
    // Si no hay áreas dibujadas, mostrar alerta
    if (areas.length === 0) {
      toast.warning('Primero debes dibujar el área del edificio antes de añadir pararrayos.')
      return
    }

    // Calcular el centroide del primer área para colocar el pararrayos
    const firstArea = areas[0]
    let sumX = 0
    let sumY = 0
    const numPoints = firstArea.points.length / 2

    for (let i = 0; i < firstArea.points.length; i += 2) {
      sumX += firstArea.points[i]
      sumY += firstArea.points[i + 1]
    }

    const centerX = sumX / numPoints
    const centerY = sumY / numPoints

    // Buscar si hay pararrayos pendientes (no colocados en el mapa)
    const pendingZoneIndex = protectionZones.findIndex(z => z.placedOnMap === false)

    if (pendingZoneIndex !== -1) {
      // Si hay un pararrayos pendiente, colocarlo en el mapa
      const updatedZones = protectionZones.map((zone, index) => {
        if (index === pendingZoneIndex) {
          return {
            ...zone,
            x: centerX,
            y: centerY,
            radius: getProtectionRadius(zone.model, zone.level),
            placedOnMap: true,
          }
        }
        return zone
      })
      setProtectionZones(updatedZones)
      onZonesChangeRef.current?.(updatedZones)
    } else {
      // Si no hay pendientes, crear uno nuevo
      const newZone: ProtectionZone = {
        id: `zone-${Date.now()}`,
        x: centerX,
        y: centerY,
        radius: getProtectionRadius(cabezalModel, protectionLevel),
        model: cabezalModel,
        level: protectionLevel,
        mastType,
        mastHeight,
        anchorType,
        anchorSeparation,
        placedOnMap: true, // Colocado en el mapa
      }
      const newZones = [...protectionZones, newZone]
      setProtectionZones(newZones)
      onZonesChangeRef.current?.(newZones)
    }
  }, [areas, protectionZones, cabezalModel, protectionLevel, mastType, mastHeight, anchorType, anchorSeparation])

  // Eliminar pararrayos seleccionado
  const handleDeleteZone = useCallback(() => {
    if (selectedZone) {
      const newZones = protectionZones.filter((z) => z.id !== selectedZone)
      setProtectionZones(newZones)
      setSelectedZone(null)
      onZonesChangeRef.current?.(newZones)
    }
  }, [selectedZone, protectionZones])

  // Eliminar área actual
  const handleDeleteArea = useCallback(() => {
    if (areas.length > 0) {
      setAreas(areas.slice(0, -1))
    }
  }, [areas])

  // Editar distancia manualmente
  const handleEditDistance = (areaId: string, sideIndex: number, currentValue: number) => {
    setEditingMeasurement({ areaId, sideIndex, currentValue })
    setNewMeasurementValue(currentValue.toString())
    setEditModalOpen(true)
  }

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

  // Manejar zoom con la rueda del mouse
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()

    const stage = stageRef.current
    if (!stage) return

    const oldScale = scale / 100
    const pointer = stage.getPointerPosition()

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }

    // Ajustar el zoom (más sensible)
    const direction = e.evt.deltaY > 0 ? -1 : 1
    const scaleBy = 1.05
    const newScaleValue = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy

    // Limitar el zoom entre 10% y 200%
    const clampedScale = Math.max(0.1, Math.min(2, newScaleValue))
    setScale(Math.round(clampedScale * 100))

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    }
    setStagePosition(newPos)
  }

  // Manejar clic en el stage (ajustado para zoom)
  const handleStageClickWithZoom = (e: KonvaEventObject<MouseEvent>) => {
    if (drawingMode === 'area') {
      const stage = e.target.getStage()
      const scaleValue = scale / 100
      const pointer = stage.getPointerPosition()

      // Ajustar coordenadas según el zoom y posición
      const point = {
        x: (pointer.x - stagePosition.x) / scaleValue,
        y: (pointer.y - stagePosition.y) / scaleValue,
      }

      // Si hace clic cerca del primer punto, cerrar el polígono
      if (isNearFirstPoint(point)) {
        closeCurrentArea()
      } else {
        setCurrentArea([...currentArea, point])
      }
    }
  }

  // Resetear zoom y posición
  const handleResetZoom = () => {
    setScale(100)
    setStagePosition({ x: 0, y: 0 })
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
      console.error('Error al capturar imagen automáticamente:', error)
    }
  }, [])

  // Efecto para capturar automáticamente cuando hay cambios en el esquema
  useEffect(() => {
    // Solo capturar si hay contenido en el canvas (áreas o zonas de protección)
    if (areas.length > 0 || protectionZones.length > 0 || uploadedImage) {
      // Usar timeout para esperar a que el canvas se actualice completamente
      const timeoutId = setTimeout(() => {
        captureImage()
      }, 500) // 500ms de delay para asegurar que el canvas esté renderizado

      return () => clearTimeout(timeoutId)
    }
  }, [protectionZones, areas, uploadedImage, captureImage])
  // Generar área rectangular automáticamente basado en dimensiones del Paso 2
  const generateRectangleArea = useCallback(() => {
    // Convertir metros a píxeles y centrar el rectángulo
    const lengthPx = buildingLength * PIXELS_PER_METER
    const widthPx = buildingWidth * PIXELS_PER_METER

    const centerX = stageWidth / 2
    const centerY = stageHeight / 2

    const x1 = centerX - lengthPx / 2
    const y1 = centerY - widthPx / 2
    const x2 = centerX + lengthPx / 2
    const y2 = centerY + widthPx / 2

    const rectangleArea: Area = {
      id: `area-auto-${Date.now()}`,
      points: [
        x1, y1,  // Superior izquierda
        x2, y1,  // Superior derecha
        x2, y2,  // Inferior derecha
        x1, y2,  // Inferior izquierda
      ],
      closed: true,
    }

    setAreas([rectangleArea])
    setDrawingMode('none')
  }, [buildingLength, buildingWidth])

  const handleAutoGenerateArea = useCallback(() => {
    if (areas.length > 0) {
      showConfirm({
        title: 'Reemplazar área existente',
        description: '¿Deseas reemplazar el área existente con un rectángulo basado en las dimensiones del edificio?',
        onConfirm: () => {
          generateRectangleArea()
        },
      })
      return
    }

    generateRectangleArea()
  }, [areas, showConfirm, generateRectangleArea])

  const handleClearAll = useCallback(() => {
    showConfirm({
      title: 'Limpiar todo el esquema',
      description: '¿Estás seguro de que quieres limpiar todo el esquema? Esta acción no se puede deshacer.',
      onConfirm: () => {
        setUploadedImage(null)
        setAreas([])
        setProtectionZones([])
        setCurrentArea([])
        setCustomDistances({})
        setMode('select') // Volver al modo de selección inicial
        handleResetZoom()
        onZonesChangeRef.current?.([])
        toast.success('Esquema limpiado correctamente')
      },
    })
  }, [showConfirm])

  const staticLayers = useMemo(() => (
    <>
      {/* Capa de fondo */}
      <Layer>
        {mode === 'grid' && renderGrid()}
        {mode === 'map' && uploadedImage && (
          <BackgroundImage image={uploadedImage} />
        )}
      </Layer>

      {/* Capa de áreas dibujadas */}
      <Layer>
        {areas.map((area) => {
          // Convertir puntos a array de objetos Point
          const points: Point[] = []
          for (let i = 0; i < area.points.length; i += 2) {
            points.push({ x: area.points[i], y: area.points[i + 1] })
          }

          return (
            <React.Fragment key={area.id}>
              <Line
                points={area.points}
                stroke="#243469"
                strokeWidth={2}
                closed={area.closed}
                fill="rgba(247, 168, 0, 0.25)"
              />
              {/* Puntos de vértices del área completada */}
              {points.map((point, idx) => (
                <Circle
                  key={`${area.id}-vertex-${idx}`}
                  x={point.x}
                  y={point.y}
                  radius={5}
                  fill="#243469"
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
              {/* Etiquetas con distancias para áreas completadas */}
              {points.map((point, idx) => {
                const nextIdx = (idx + 1) % points.length
                const nextPoint = points[nextIdx]

                const distancePx = Math.sqrt(
                  Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.y - point.y, 2)
                )

                // Calcular bounding box del área para escalar
                const xCoords = points.map(p => p.x)
                const yCoords = points.map(p => p.y)
                const areaWidthPx = Math.max(...xCoords) - Math.min(...xCoords)
                const areaHeightPx = Math.max(...yCoords) - Math.min(...yCoords)

                // Determinar si esta línea es más horizontal o vertical
                const deltaX = Math.abs(nextPoint.x - point.x)
                const deltaY = Math.abs(nextPoint.y - point.y)
                const isHorizontal = deltaX > deltaY

                // Escalar según las dimensiones reales del edificio
                let calculatedDistance: number
                if (isHorizontal) {
                  // Línea horizontal: escalar usando longitud del edificio
                  calculatedDistance = Math.round((distancePx / areaWidthPx) * buildingLength)
                } else {
                  // Línea vertical: escalar usando anchura del edificio
                  calculatedDistance = Math.round((distancePx / areaHeightPx) * buildingWidth)
                }

                // Usar distancia personalizada si existe, o la calculada
                const distanceKey = `${area.id}-${idx}`
                const distanceMeters = customDistances[distanceKey] ?? calculatedDistance

                // Calcular punto medio de la línea
                const midX = (point.x + nextPoint.x) / 2
                const midY = (point.y + nextPoint.y) / 2

                const labelKey = `${area.id}-${idx}`
                const isHovered = hoveredMeasurement === labelKey

                return (
                  <React.Fragment key={`${area.id}-distance-${idx}`}>
                    {/* Fondo del texto */}
                    <Text
                      x={midX}
                      y={midY - 8}
                      text={`${distanceMeters}m`}
                      fontSize={isHovered ? 16 : 14}
                      fill={isHovered ? "#f7a800" : "#243469"}
                      stroke={isHovered ? "#f7a800" : "#243469"}
                      strokeWidth={isHovered ? 5 : 4}
                      align="center"
                      offsetX={isHovered ? 24 : 20}
                      onClick={() => handleEditDistance(area.id, idx, distanceMeters)}
                      onTap={() => handleEditDistance(area.id, idx, distanceMeters)}
                      onMouseEnter={() => setHoveredMeasurement(labelKey)}
                      onMouseLeave={() => setHoveredMeasurement(null)}
                      style={{ cursor: 'pointer' }}
                    />
                    {/* Texto principal */}
                    <Text
                      x={midX}
                      y={midY - 8}
                      text={`${distanceMeters}m`}
                      fontSize={isHovered ? 16 : 14}
                      fill="#ffffff"
                      align="center"
                      offsetX={isHovered ? 24 : 20}
                      onClick={() => handleEditDistance(area.id, idx, distanceMeters)}
                      onTap={() => handleEditDistance(area.id, idx, distanceMeters)}
                      onMouseEnter={() => setHoveredMeasurement(labelKey)}
                      onMouseLeave={() => setHoveredMeasurement(null)}
                      style={{ cursor: 'pointer' }}
                    />
                  </React.Fragment>
                )
              })}
            </React.Fragment>
          )
        })}

        {/* Área en construcción */}
        {currentArea.length > 0 && (
          <>
            {/* Borde oscuro de la línea */}
            <Line
              points={currentArea.flatMap((p) => [p.x, p.y])}
              stroke="#243469"
              strokeWidth={8}
            />
            {/* Línea amarilla principal */}
            <Line
              points={currentArea.flatMap((p) => [p.x, p.y])}
              stroke="#f7a800"
              strokeWidth={4}
            />
            {/* Puntos de corte (vértices) */}
            {currentArea.map((point, index) => (
              <Circle
                key={`point-${index}`}
                x={point.x}
                y={point.y}
                radius={index === 0 && currentArea.length > 2 ? 10 : 6}
                fill={index === 0 && currentArea.length > 2 ? "#22c55e" : "#f7a800"}
                stroke={index === 0 && currentArea.length > 2 ? "#16a34a" : "#243469"}
                strokeWidth={index === 0 && currentArea.length > 2 ? 3 : 2}
              />
            ))}
            {/* Etiquetas con distancias en metros */}
            {currentArea.map((point, index) => {
              if (index === 0) return null // No hay línea anterior al primer punto

              const prevPoint = currentArea[index - 1]
              const distancePx = Math.sqrt(
                Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2)
              )

              // Si hay al menos 2 puntos, calcular escala basada en el bounding box
              let calculatedDistance: number
              if (currentArea.length >= 2) {
                const xCoords = currentArea.map(p => p.x)
                const yCoords = currentArea.map(p => p.y)
                const areaWidthPx = Math.max(...xCoords) - Math.min(...xCoords)
                const areaHeightPx = Math.max(...yCoords) - Math.min(...yCoords)

                // Determinar si esta línea es más horizontal o vertical
                const deltaX = Math.abs(point.x - prevPoint.x)
                const deltaY = Math.abs(point.y - prevPoint.y)
                const isHorizontal = deltaX > deltaY

                // Escalar según las dimensiones reales del edificio
                if (areaWidthPx > 0 && areaHeightPx > 0) {
                  if (isHorizontal) {
                    calculatedDistance = Math.round((distancePx / areaWidthPx) * buildingLength)
                  } else {
                    calculatedDistance = Math.round((distancePx / areaHeightPx) * buildingWidth)
                  }
                } else {
                  // Fallback si el área es muy pequeña
                  calculatedDistance = Math.round(distancePx / PIXELS_PER_METER)
                }
              } else {
                // Fallback para primeros puntos
                calculatedDistance = Math.round(distancePx / PIXELS_PER_METER)
              }

              // Usar distancia personalizada si existe, o la calculada
              const distanceKey = `current-${index}`
              const distanceMeters = customDistances[distanceKey] ?? calculatedDistance

              // Calcular punto medio de la línea
              const midX = (point.x + prevPoint.x) / 2
              const midY = (point.y + prevPoint.y) / 2

              const labelKey = `current-${index}`
              const isHovered = hoveredMeasurement === labelKey

              return (
                <React.Fragment key={`distance-${index}`}>
                  {/* Fondo del texto */}
                  <Text
                    x={midX}
                    y={midY - 8}
                    text={`${distanceMeters}m`}
                    fontSize={isHovered ? 16 : 14}
                    fill={isHovered ? "#f7a800" : "#243469"}
                    stroke={isHovered ? "#f7a800" : "#243469"}
                    strokeWidth={isHovered ? 5 : 4}
                    align="center"
                    offsetX={isHovered ? 24 : 20}
                    onClick={() => handleEditDistance('current', index, distanceMeters)}
                    onTap={() => handleEditDistance('current', index, distanceMeters)}
                    onMouseEnter={() => setHoveredMeasurement(labelKey)}
                    onMouseLeave={() => setHoveredMeasurement(null)}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Texto principal */}
                  <Text
                    x={midX}
                    y={midY - 8}
                    text={`${distanceMeters}m`}
                    fontSize={isHovered ? 16 : 14}
                    fill="#ffffff"
                    align="center"
                    offsetX={isHovered ? 24 : 20}
                    onClick={() => handleEditDistance('current', index, distanceMeters)}
                    onTap={() => handleEditDistance('current', index, distanceMeters)}
                    onMouseEnter={() => setHoveredMeasurement(labelKey)}
                    onMouseLeave={() => setHoveredMeasurement(null)}
                    style={{ cursor: 'pointer' }}
                  />
                </React.Fragment>
              )
            })}
            {/* Texto indicador para el primer punto */}
            {currentArea.length > 2 && (
              <Text
                x={currentArea[0].x + 15}
                y={currentArea[0].y - 10}
                text="Clic aquí para cerrar"
                fontSize={12}
                fill="#22c55e"
                fontStyle="bold"
              />
            )}
          </>
        )}
      </Layer>

      {/* Capa de overlay de área sin cobertura */}
      <Layer>
        {!isDraggingZone && areas.length > 0 && protectionZones.length > 0 && (
          <>
            {/* Área completa del edificio con overlay rojo */}
            {areas.map((area) => (
              <Line
                key={`overlay-${area.id}`}
                points={area.points}
                closed={area.closed}
                fill="rgba(239, 68, 68, 0.3)"
                listening={false}
              />
            ))}
            {/* Áreas cubiertas (azul) para "tapar" el rojo */}
            {protectionZones.map((zone) => (
              <Circle
                key={`coverage-${zone.id}`}
                x={zone.x}
                y={zone.y}
                radius={zone.radius}
                fill="rgba(59, 130, 246, 0.2)"
                listening={false}
              />
            ))}
          </>
        )}
      </Layer>
    </>
  ), [areas, buildingLength, buildingWidth, currentArea, customDistances, handleEditDistance, hoveredMeasurement, isDraggingZone, mode, protectionZones, renderGrid, uploadedImage])

  return (
    <div className="space-y-4">
      {/* Modo de selección inicial */}
      {mode === 'select' && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-accent bg-muted/50 p-12">
          <h4 className="text-lg font-semibold">Selecciona cómo quieres comenzar:</h4>
          <div className="flex gap-4">
            <Button
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary hover:bg-primary/90"
            >
              <Upload className="mr-2 h-5 w-5" />
              Subir tu mapa
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => {
                setMode('grid')
                // Generar automáticamente el rectángulo del edificio al abrir la cuadrícula
                setTimeout(() => {
                  generateRectangleArea()
                }, 100)
              }}
            >
              <LayoutGrid className="mr-2 h-5 w-5" />
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

      {/* Canvas y herramientas */}
      {mode !== 'select' && (
        <>
          {/* Barra de herramientas */}
          <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-muted p-3">
            {/* Herramientas de plano */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Plano</span>
              <Button
                size="sm"
                variant="outline"
                title="Subir plano"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>

            <div className="h-6 w-px bg-border" />

            {/* Herramientas de edificio */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Edificio</span>
              <Button
                size="sm"
                variant="outline"
                title={`Auto-generar área (${buildingLength}m x ${buildingWidth}m)`}
                onClick={handleAutoGenerateArea}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                title="Dibujar área manualmente"
                onClick={() => setDrawingMode('area')}
                className={drawingMode === 'area' ? 'bg-accent' : ''}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                title="Eliminar última área"
                onClick={handleDeleteArea}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="h-6 w-px bg-border" />

            {/* Herramientas de pararrayos */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Pararrayos</span>
              <Button
                size="sm"
                variant="outline"
                title="Añadir pararrayos"
                onClick={handleAddPararrayos}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                title="Optimizar cobertura automáticamente"
                onClick={handleOptimizeParrays}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <Calculator className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                title="Eliminar pararrayos seleccionado"
                onClick={handleDeleteZone}
                disabled={!selectedZone}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleClearAll}
              >
                Limpiar todo
              </Button>
            </div>
          </div>

          {/* Botón para finalizar área (solo visible cuando se está dibujando) */}
          {drawingMode === 'area' && currentArea.length > 2 && (
            <div className="mb-2 flex items-center justify-center gap-2 rounded-lg bg-primary p-3">
              <span className="text-sm font-semibold text-primary-foreground">
                Dibujando área: {currentArea.length} puntos
              </span>
              <Button
                size="sm"
                onClick={closeCurrentArea}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Check className="mr-2 h-4 w-4" />
                Finalizar área (Enter)
              </Button>
            </div>
          )}

          {/* Área del canvas */}
          <div className="relative overflow-hidden rounded-lg border-4 border-accent bg-white">
            <Stage
              ref={stageRef}
              width={stageWidth}
              height={stageHeight}
              scaleX={scale / 100}
              scaleY={scale / 100}
              x={stagePosition.x}
              y={stagePosition.y}
              onClick={handleStageClickWithZoom}
              onWheel={handleWheel}
              draggable={drawingMode === 'none' && !isDraggingZone}
              onDragEnd={(e) => {
                setStagePosition({ x: e.target.x(), y: e.target.y() })
              }}
            >
              {staticLayers}

              {/* Capa de zonas de protección */}
              <Layer>
                {/* Mostrar todos los pararrayos */}
                {protectionZones.map((zone) => (
                  <ProtectionZoneCircle
                    key={zone.id}
                    zone={zone}
                    isSelected={zone.id === selectedZoneId}
                    onZoneClick={handleZoneClick}
                    onDragStart={handleZoneDragStart}
                    onDragMove={handleZoneDragMove}
                    onDragEnd={handleZoneDragEnd}
                  />
                ))}
              </Layer>
            </Stage>
          </div>

          {/* Control de escala y zoom */}
          <div className="flex items-center justify-center gap-4">
           
            <Button
              size="sm"
              variant="secondary"
              onClick={handleResetZoom}
              title="Resetear zoom y posición"
            >
              Resetear vista
            </Button>
          </div>
          <div className="text-center text-xs text-muted-foreground">
            Usa la rueda del mouse para hacer zoom o arrastra el canvas para moverte
          </div>

          {/* Información del esquema */}
        
        </>
      )}

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
