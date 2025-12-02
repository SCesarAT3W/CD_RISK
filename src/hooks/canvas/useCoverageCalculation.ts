import { useMemo } from 'react'
import type { Area, Point } from './useCanvasDrawing'
import type { ProtectionZone } from './useProtectionZones'
import { COVERAGE_CONFIG, OPTIMIZATION_CONFIG } from '@/config/canvas'
import { toast } from 'sonner'

/**
 * Hook para cálculos de cobertura optimizados
 * Usa useMemo para evitar recálculos innecesarios
 */

interface UseCoverageCalculationProps {
  areas: Area[]
  protectionZones: ProtectionZone[]
  isPointInPolygon: (point: Point, polygonPoints: number[]) => boolean
}

export function useCoverageCalculation({
  areas,
  protectionZones,
  isPointInPolygon,
}: UseCoverageCalculationProps) {
  // Verificar si un punto está cubierto por algún pararrayos
  const isPointCovered = useMemo(
    () => (point: Point): boolean => {
      return protectionZones.some((zone) => {
        const distance = Math.sqrt(Math.pow(point.x - zone.x, 2) + Math.pow(point.y - zone.y, 2))
        return distance <= zone.radius
      })
    },
    [protectionZones]
  )

  // Calcular cobertura del área (memoizado para performance)
  const coverageData = useMemo(() => {
    if (areas.length === 0) {
      return { coverage: 100, uncoveredPoints: [] }
    }

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
    const gridSpacing = COVERAGE_CONFIG.gridSpacing
    let totalPoints = 0
    let coveredPoints = 0

    for (let x = minX; x <= maxX; x += gridSpacing) {
      for (let y = minY; y <= maxY; y += gridSpacing) {
        const point = { x, y }
        // Solo contar puntos dentro del área
        if (isPointInPolygon(point, area.points)) {
          totalPoints++
          if (isPointCovered(point)) {
            coveredPoints++
          } else {
            uncoveredPoints.push(point)
          }
        }
      }
    }

    const coverage = totalPoints > 0 ? (coveredPoints / totalPoints) * 100 : 0
    return { coverage, uncoveredPoints }
  }, [areas, protectionZones, isPointInPolygon, isPointCovered])

  // Optimizar ubicación de pararrayos automáticamente
  const optimizeParrays = (
    currentZones: ProtectionZone[],
    cabezalModel: string,
    protectionLevel: string,
    getProtectionRadius: (model: string, level: string) => number
  ): ProtectionZone[] => {
    if (areas.length === 0) {
      toast.warning('Primero debes dibujar el área del edificio.')
      return currentZones
    }

    const { coverage, uncoveredPoints } = coverageData

    if (coverage >= OPTIMIZATION_CONFIG.targetCoverage) {
      toast.success(`La cobertura actual es del ${coverage.toFixed(1)}%. El edificio está bien protegido.`)
      return currentZones
    }

    // Agrupar puntos no cubiertos en clusters usando un algoritmo simple
    const radius = getProtectionRadius(cabezalModel, protectionLevel)
    const newZones: ProtectionZone[] = [...currentZones]

    // Mientras haya puntos sin cubrir, añadir pararrayos
    let remainingPoints = [...uncoveredPoints]
    let iterations = 0
    const maxIterations = OPTIMIZATION_CONFIG.maxIterations

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

    const finalCoverage = coverageData.coverage
    toast.success('Optimización completa', {
      description:
        `Pararrayos añadidos: ${newZones.length - currentZones.length}\n` +
        `Cobertura anterior: ${coverage.toFixed(1)}%\n` +
        `Cobertura estimada: ${finalCoverage.toFixed(1)}%\n` +
        `Total de pararrayos: ${newZones.length}`,
    })

    return newZones
  }

  return {
    coverage: coverageData.coverage,
    uncoveredPoints: coverageData.uncoveredPoints,
    isPointCovered,
    optimizeParrays,
  }
}
