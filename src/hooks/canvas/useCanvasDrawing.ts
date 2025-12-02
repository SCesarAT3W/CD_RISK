import { useState, useEffect } from 'react'
import { PIXELS_PER_METER, CLICK_TOLERANCE_PX } from '@/config/canvas'
import { toast } from 'sonner'

/**
 * Hook para manejar el dibujo de áreas en el canvas
 * Separa la lógica de dibujo del componente principal
 */

export interface Point {
  x: number
  y: number
}

export interface Area {
  id: string
  points: number[]
  closed: boolean
}

interface UseCanvasDrawingProps {
  buildingLength: number
  buildingWidth: number
}

export function useCanvasDrawing({ buildingLength, buildingWidth }: UseCanvasDrawingProps) {
  const [drawingMode, setDrawingMode] = useState<'area' | 'none'>('none')
  const [currentArea, setCurrentArea] = useState<Point[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [customDistances, setCustomDistances] = useState<Record<string, number>>({})

  // Función para cerrar el polígono actual
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
    return distance < CLICK_TOLERANCE_PX
  }

  // Manejar clic en el stage para dibujar áreas
  const handleStageClick = (point: Point) => {
    if (drawingMode === 'area') {
      // Si hace clic cerca del primer punto, cerrar el polígono
      if (isNearFirstPoint(point)) {
        closeCurrentArea()
      } else {
        setCurrentArea([...currentArea, point])
      }
    }
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

  // Eliminar área actual
  const handleDeleteArea = () => {
    if (areas.length > 0) {
      setAreas(areas.slice(0, -1))
    }
  }

  // Editar distancia manualmente
  const handleEditDistance = (areaId: string, sideIndex: number, currentValue: number) => {
    const newValue = prompt(`Editar medida del lado ${sideIndex + 1}:`, currentValue.toString())
    if (newValue !== null && newValue.trim() !== '') {
      const parsedValue = parseFloat(newValue)
      if (!isNaN(parsedValue) && parsedValue > 0) {
        const key = `${areaId}-${sideIndex}`
        setCustomDistances({
          ...customDistances,
          [key]: parsedValue,
        })
      } else {
        toast.error('Por favor, ingresa un valor numérico válido mayor que 0')
      }
    }
  }

  // Generar área rectangular automáticamente
  const handleAutoGenerateArea = (stageWidth: number, stageHeight: number, force = false) => {
    // Si ya hay áreas y no se fuerza la generación, no hacer nada
    // El componente que llama debe manejar la confirmación antes de llamar con force=true
    if (areas.length > 0 && !force) {
      return false
    }

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
        x1, y1, // Superior izquierda
        x2, y1, // Superior derecha
        x2, y2, // Inferior derecha
        x1, y2, // Inferior izquierda
      ],
      closed: true,
    }

    setAreas([rectangleArea])
    setDrawingMode('none')
    return true
  }

  return {
    drawingMode,
    setDrawingMode,
    currentArea,
    setCurrentArea,
    areas,
    setAreas,
    customDistances,
    closeCurrentArea,
    isNearFirstPoint,
    handleStageClick,
    handleDeleteArea,
    handleEditDistance,
    handleAutoGenerateArea,
    PIXELS_PER_METER,
  }
}
