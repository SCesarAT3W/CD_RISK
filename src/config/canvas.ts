/**
 * Configuración del canvas de esquema de protección
 */

import { COLOR_TOKENS } from '@/lib/colorTokens'

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
    normal: COLOR_TOKENS.gridNormal,
    heavy: COLOR_TOKENS.gridHeavy,
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
    stroke: COLOR_TOKENS.brandBlue, // Azul corporativo
    strokeWidth: 2,
    fill: COLOR_TOKENS.brandYellowAlpha, // Amarillo semi-transparente
  },

  // Área en construcción (dibujando)
  drawing: {
    strokeBorder: COLOR_TOKENS.brandBlue,
    strokeBorderWidth: 8,
    strokeMain: COLOR_TOKENS.brandYellow,
    strokeMainWidth: 4,
    vertexFill: COLOR_TOKENS.brandYellow,
    vertexStroke: COLOR_TOKENS.brandBlue,
    vertexRadius: 6,
    firstVertexFill: COLOR_TOKENS.success, // Verde cuando es clicable
    firstVertexStroke: COLOR_TOKENS.successDark,
    firstVertexRadius: 10,
  },

  // Zonas de protección
  protection: {
    stroke: COLOR_TOKENS.brandYellow,
    strokeWidth: 2,
    dash: [10, 5],
    fill: 'transparent',
    iconColor: COLOR_TOKENS.brandYellow,
  },

  // Cobertura
  coverage: {
    uncovered: COLOR_TOKENS.dangerAlpha, // Rojo semi-transparente
    covered: COLOR_TOKENS.successAlpha, // Verde semi-transparente
  },

  // Etiquetas de distancia
  labels: {
    background: COLOR_TOKENS.brandBlue,
    backgroundWidth: 4,
    text: COLOR_TOKENS.white,
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
