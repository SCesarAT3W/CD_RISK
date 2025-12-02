/**
 * Configuración del canvas de esquema de protección
 */

/**
 * Escala de conversión entre píxeles y metros
 * 1 metro = 3 píxeles en el canvas
 */
export const PIXELS_PER_METER = 3

/**
 * Dimensiones del stage del canvas
 */
export const CANVAS_DIMENSIONS = {
  width: 800,
  height: 500,
} as const

/**
 * Configuración de la cuadrícula
 */
export const GRID_CONFIG = {
  size: 25, // Tamaño de celda en píxeles
  heavyMultiplier: 5, // Cada N líneas es más gruesa
  colors: {
    normal: '#d0d0d0',
    heavy: '#b0b0b0',
  },
} as const

/**
 * Configuración del grid sampling para cálculo de cobertura
 */
export const COVERAGE_CONFIG = {
  gridSpacing: 20, // Píxeles entre puntos de muestra
  minimumCoverage: 95, // Porcentaje mínimo de cobertura tolerable
} as const

/**
 * Tolerancia en píxeles para detección de clic cerca del primer punto
 */
export const CLICK_TOLERANCE_PX = 15

/**
 * Configuración de colores del canvas
 */
export const CANVAS_COLORS = {
  // Edificio
  building: {
    stroke: '#243469', // Azul corporativo
    strokeWidth: 2,
    fill: 'rgba(247, 168, 0, 0.25)', // Amarillo semi-transparente
  },

  // Área en construcción (dibujando)
  drawing: {
    strokeBorder: '#243469',
    strokeBorderWidth: 8,
    strokeMain: '#f7a800',
    strokeMainWidth: 4,
    vertexFill: '#f7a800',
    vertexStroke: '#243469',
    vertexRadius: 6,
    firstVertexFill: '#22c55e', // Verde cuando es clicable
    firstVertexStroke: '#16a34a',
    firstVertexRadius: 10,
  },

  // Zonas de protección
  protection: {
    stroke: '#f7a800',
    strokeWidth: 2,
    dash: [10, 5],
    fill: 'transparent',
    iconColor: '#f7a800',
  },

  // Cobertura
  coverage: {
    uncovered: 'rgba(239, 68, 68, 0.3)', // Rojo semi-transparente
    covered: 'rgba(34, 197, 94, 0.2)', // Verde semi-transparente
  },

  // Etiquetas de distancia
  labels: {
    background: '#243469',
    backgroundWidth: 4,
    text: '#ffffff',
    fontSize: 14,
  },
} as const

/**
 * Configuración de optimización automática
 */
export const OPTIMIZATION_CONFIG = {
  maxIterations: 10, // Límite de pararrayos a añadir
  targetCoverage: 95, // Objetivo de cobertura en porcentaje
} as const

/**
 * Límites de dimensiones
 */
export const DIMENSION_LIMITS = {
  building: {
    minLength: 1, // metros
    maxLength: 1000, // metros
    minWidth: 1,
    maxWidth: 1000,
    minHeight: 1,
    maxHeight: 500,
  },
  canvas: {
    minZoom: 10, // porcentaje
    maxZoom: 200, // porcentaje
  },
} as const

/**
 * Convertir metros a píxeles
 */
export function metersToPixels(meters: number): number {
  return meters * PIXELS_PER_METER
}

/**
 * Convertir píxeles a metros
 */
export function pixelsToMeters(pixels: number): number {
  return pixels / PIXELS_PER_METER
}

/**
 * Calcular distancia entre dos puntos en píxeles
 */
export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

/**
 * Verificar si un punto está dentro de un rango de tolerancia
 */
export function isPointNear(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  tolerance: number = CLICK_TOLERANCE_PX
): boolean {
  return calculateDistance(x1, y1, x2, y2) < tolerance
}
