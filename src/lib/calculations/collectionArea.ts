/**
 * Cálculo de áreas de colección según IEC 62305-2
 * Anexo A - Collection areas
 */

import { MATH_CONSTANTS } from './constants'

/**
 * Calcula el área equivalente de colección (Ad) para una estructura aislada
 *
 * Fórmula IEC 62305-2: Ad = L×W + 6H(L + W) + 9πH²
 *
 * @param length - Longitud de la estructura (m)
 * @param width - Anchura de la estructura (m)
 * @param height - Altura de la estructura (m)
 * @returns Área de colección en m²
 *
 * @example
 * ```typescript
 * const Ad = calculateCollectionArea(80, 50, 20)
 * // Ad = 30,910 m²
 * ```
 */
export function calculateCollectionArea(
  length: number,
  width: number,
  height: number
): number {
  // Validar entradas
  if (length <= 0 || width <= 0 || height <= 0) {
    throw new Error('Las dimensiones deben ser mayores que cero')
  }

  // 1. Área base del edificio
  const baseArea = length * width

  // 2. Áreas laterales (efecto perímetro)
  const sideArea = 6 * height * (length + width)

  // 3. Áreas de esquinas/bordes
  const cornerArea = MATH_CONSTANTS.NINE_PI * height * height

  // Área total de colección
  const totalArea = baseArea + sideArea + cornerArea

  return totalArea
}

/**
 * Calcula el área de colección para impactos cercanos (Am)
 *
 * Para impactos cercanos que pueden causar daños por sobretensiones
 *
 * @param length - Longitud de la estructura (m)
 * @param width - Anchura de la estructura (m)
 * @param height - Altura de la estructura (m)
 * @param distance - Distancia máxima de influencia (típicamente 250m para Nivel III)
 * @returns Área de colección para impactos cercanos en m²
 */
export function calculateNearbyCollectionArea(
  length: number,
  width: number,
  height: number,
  distance: number = 250
): number {
  // Validar entradas
  if (length <= 0 || width <= 0 || height <= 0 || distance <= 0) {
    throw new Error('Las dimensiones deben ser mayores que cero')
  }

  // Am = (L + distance)(W + distance) - L×W
  const totalArea = (length + distance) * (width + distance)
  const structureArea = length * width
  const nearbyArea = totalArea - structureArea

  return nearbyArea
}

/**
 * Calcula el área de colección para una línea (Al)
 *
 * Para líneas eléctricas o de telecomunicaciones que entran a la estructura
 *
 * @param lineLength - Longitud de la línea (m)
 * @param lineHeight - Altura promedio de la línea sobre el terreno (m)
 * @returns Área de colección de la línea en m²
 */
export function calculateLineCollectionArea(
  lineLength: number,
  lineHeight: number
): number {
  // Validar entradas
  if (lineLength <= 0 || lineHeight < 0) {
    throw new Error('La longitud debe ser mayor que cero')
  }

  // Al = lineLength × lineWidth
  // lineWidth = 4 × lineHeight (para líneas aéreas)
  const lineWidth = 4 * lineHeight
  const lineArea = lineLength * lineWidth

  return lineArea
}

/**
 * Calcula el área de colección para impactos cercanos a una línea (Ai)
 *
 * @param lineLength - Longitud de la línea (m)
 * @param distance - Distancia de influencia (típicamente 1000m)
 * @returns Área de colección para impactos cercanos a la línea en m²
 */
export function calculateLineNearbyCollectionArea(
  lineLength: number,
  distance: number = 1000
): number {
  // Validar entradas
  if (lineLength <= 0 || distance <= 0) {
    throw new Error('Las dimensiones deben ser mayores que cero')
  }

  // Ai = lineLength × distance
  const nearbyArea = lineLength * distance

  return nearbyArea
}

/**
 * Calcula todas las áreas de colección necesarias
 *
 * @param dimensions - Dimensiones de la estructura
 * @param services - Información de servicios (líneas)
 * @returns Objeto con todas las áreas calculadas
 */
export function calculateAllCollectionAreas(
  dimensions: {
    length: number
    width: number
    height: number
  },
  services?: {
    powerLine?: {
      exists: boolean
      length: number
      height?: number
    }
    telecomLines?: {
      exists: boolean
      length: number
      height?: number
    }
  }
): {
  Ad: number // Área de estructura
  Am: number // Área de impactos cercanos
  Al: number // Área de línea eléctrica
  Ai: number // Área cercana a línea eléctrica
  Au: number // Área de línea telecom
  Av: number // Área cercana a línea telecom
} {
  // Calcular áreas de la estructura
  const Ad = calculateCollectionArea(
    dimensions.length,
    dimensions.width,
    dimensions.height
  )

  const Am = calculateNearbyCollectionArea(
    dimensions.length,
    dimensions.width,
    dimensions.height
  )

  // Calcular áreas de líneas
  let Al = 0
  let Ai = 0
  if (services?.powerLine?.exists && services.powerLine.length > 0) {
    const lineHeight = services.powerLine.height || 6 // Altura típica 6m
    Al = calculateLineCollectionArea(services.powerLine.length, lineHeight)
    Ai = calculateLineNearbyCollectionArea(services.powerLine.length)
  }

  let Au = 0
  let Av = 0
  if (services?.telecomLines?.exists && services.telecomLines.length > 0) {
    const lineHeight = services.telecomLines.height || 6
    Au = calculateLineCollectionArea(services.telecomLines.length, lineHeight)
    Av = calculateLineNearbyCollectionArea(services.telecomLines.length)
  }

  return {
    Ad,
    Am,
    Al,
    Ai,
    Au,
    Av,
  }
}

/**
 * Desglose detallado del cálculo de Ad para debugging/reporting
 *
 * @param length - Longitud (m)
 * @param width - Anchura (m)
 * @param height - Altura (m)
 * @returns Objeto con desglose de cada componente
 */
export function calculateCollectionAreaDetailed(
  length: number,
  width: number,
  height: number
): {
  total: number
  breakdown: {
    baseArea: number
    sideArea: number
    cornerArea: number
  }
  formula: string
} {
  const baseArea = length * width
  const sideArea = 6 * height * (length + width)
  const cornerArea = MATH_CONSTANTS.NINE_PI * height * height
  const total = baseArea + sideArea + cornerArea

  return {
    total,
    breakdown: {
      baseArea,
      sideArea,
      cornerArea,
    },
    formula: `Ad = L×W + 6H(L+W) + 9πH² = ${length}×${width} + 6×${height}×(${length}+${width}) + 9π×${height}² = ${total.toFixed(2)} m²`,
  }
}
