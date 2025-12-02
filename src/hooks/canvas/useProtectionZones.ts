import { useState, useEffect } from 'react'
import type { Area, Point } from './useCanvasDrawing'
import { PROTECTION_RADII, getProtectionRadiusMeters } from '@/config/protectionRadii'
import { PIXELS_PER_METER } from '@/config/canvas'
import { toast } from 'sonner'

/**
 * Hook para manejar zonas de protección de pararrayos
 * Incluye lógica de validación, optimización y gestión
 */

export interface ProtectionZone {
  id: string
  x: number
  y: number
  radius: number
  model: string
  level: string
}

interface UseProtectionZonesProps {
  cabezalModel: string
  protectionLevel: string
  areas: Area[]
  onZonesChange?: (zones: ProtectionZone[]) => void
}

export function useProtectionZones({
  cabezalModel,
  protectionLevel,
  areas,
  onZonesChange,
}: UseProtectionZonesProps) {
  const [protectionZones, setProtectionZones] = useState<ProtectionZone[]>([])
  const [selectedZone, setSelectedZone] = useState<string | null>(null)

  // Calcular radio de protección en píxeles
  const getProtectionRadius = (model: string, level: string): number => {
    const radiusMeters = getProtectionRadiusMeters(model, level)
    return radiusMeters * PIXELS_PER_METER
  }

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

      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi

      if (intersect) inside = !inside

      j = i
    }

    return inside
  }

  // Verificar si un punto está dentro de cualquier área dibujada
  const isPointInAnyArea = (point: Point): boolean => {
    return areas.some((area) => isPointInPolygon(point, area.points))
  }

  // Añadir pararrayos
  const handleAddPararrayos = () => {
    if (areas.length === 0) {
      toast.warning('Primero debes dibujar el área del edificio antes de añadir pararrayos.')
      return
    }

    // Calcular el centroide del primer área
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

    const newZone: ProtectionZone = {
      id: `zone-${Date.now()}`,
      x: centerX,
      y: centerY,
      radius: getProtectionRadius(cabezalModel, protectionLevel),
      model: cabezalModel,
      level: protectionLevel,
    }
    const newZones = [...protectionZones, newZone]
    setProtectionZones(newZones)
    onZonesChange?.(newZones)
  }

  // Eliminar pararrayos seleccionado
  const handleDeleteZone = () => {
    if (selectedZone) {
      const newZones = protectionZones.filter((z) => z.id !== selectedZone)
      setProtectionZones(newZones)
      setSelectedZone(null)
      onZonesChange?.(newZones)
    }
  }

  // Manejar drag de zona de protección
  const handleZoneDrag = (zoneId: string, newX: number, newY: number, isEnd: boolean) => {
    const newPoint = { x: newX, y: newY }

    if (isEnd) {
      // Al finalizar drag, verificar si está dentro del área
      const isInside = isPointInAnyArea(newPoint)

      if (!isInside && areas.length > 0) {
        toast.warning('El pararrayos debe estar dentro del área del edificio')
        return false // Indicar que debe revertir
      }
    }

    // Actualizar posición
    const newZones = protectionZones.map((z) => (z.id === zoneId ? { ...z, x: newX, y: newY } : z))
    setProtectionZones(newZones)

    if (isEnd) {
      onZonesChange?.(newZones)
    }

    return true // Posición válida
  }

  // Actualizar radios cuando cambien modelo o nivel
  useEffect(() => {
    if (protectionZones.length > 0) {
      const newRadius = getProtectionRadius(cabezalModel, protectionLevel)
      const updatedZones = protectionZones.map((zone) => ({
        ...zone,
        radius: newRadius,
        model: cabezalModel,
        level: protectionLevel,
      }))
      setProtectionZones(updatedZones)
      onZonesChange?.(updatedZones)
    }
  }, [cabezalModel, protectionLevel])

  return {
    protectionZones,
    setProtectionZones,
    selectedZone,
    setSelectedZone,
    getProtectionRadius,
    isPointInPolygon,
    isPointInAnyArea,
    handleAddPararrayos,
    handleDeleteZone,
    handleZoneDrag,
    PROTECTION_RADII,
  }
}
