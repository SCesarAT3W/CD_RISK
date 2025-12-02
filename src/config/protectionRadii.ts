/**
 * Configuración de radios de protección para pararrayos
 * Basado en la normativa IEC 62305 y modelos DAT CONTROLER
 */

export interface ProtectionRadiiConfig {
  [model: string]: {
    [level: string]: number
  }
}

/**
 * Tabla de radios de protección en metros
 *
 * Modelos disponibles:
 * - DAT CONTROLER PLUS (15, 30, 45, 60)
 * - DAT CONTROLER REMOTE (15, 30, 45, 60)
 *
 * Niveles de protección:
 * - Nivel I: Mayor protección (edificios críticos)
 * - Nivel II: Protección alta
 * - Nivel III: Protección media (uso general)
 * - Nivel IV: Protección básica
 */
export const PROTECTION_RADII: ProtectionRadiiConfig = {
  'DAT CONTROLER PLUS 15': {
    I: 32,
    II: 38,
    III: 46,
    IV: 52,
  },
  'DAT CONTROLER PLUS 30': {
    I: 48,
    II: 55,
    III: 64,
    IV: 72,
  },
  'DAT CONTROLER PLUS 45': {
    I: 63,
    II: 71,
    III: 81,
    IV: 90,
  },
  'DAT CONTROLER PLUS 60': {
    I: 79,
    II: 87,
    III: 97,
    IV: 107,
  },
  'DAT CONTROLER REMOTE 15': {
    I: 32,
    II: 38,
    III: 46,
    IV: 52,
  },
  'DAT CONTROLER REMOTE 30': {
    I: 48,
    II: 55,
    III: 64,
    IV: 72,
  },
  'DAT CONTROLER REMOTE 45': {
    I: 63,
    II: 71,
    III: 81,
    IV: 90,
  },
  'DAT CONTROLER REMOTE 60': {
    I: 79,
    II: 87,
    III: 97,
    IV: 107,
  },
}

/**
 * Modelos de cabezal disponibles por serie
 */
export const CABEZAL_MODELS = {
  'DAT CONTROLER® REMOTE': [
    'DAT CONTROLER REMOTE 15',
    'DAT CONTROLER REMOTE 30',
    'DAT CONTROLER REMOTE 45',
    'DAT CONTROLER REMOTE 60',
  ],
  'DAT CONTROLER® PLUS': [
    'DAT CONTROLER PLUS 15',
    'DAT CONTROLER PLUS 30',
    'DAT CONTROLER PLUS 45',
    'DAT CONTROLER PLUS 60',
  ],
} as const

/**
 * Niveles de protección disponibles
 */
export const PROTECTION_LEVELS = ['I', 'II', 'III', 'IV'] as const

export type ProtectionLevel = (typeof PROTECTION_LEVELS)[number]

/**
 * Obtener radio de protección para un modelo y nivel específico
 * @param model - Modelo de cabezal (ej: 'DAT CONTROLER REMOTE 60')
 * @param level - Nivel de protección ('I', 'II', 'III', 'IV')
 * @returns Radio de protección en metros
 */
export function getProtectionRadiusMeters(model: string, level: string): number {
  return PROTECTION_RADII[model]?.[level] || 60 // Default 60m si no se encuentra
}

/**
 * Verificar si un modelo es válido
 */
export function isValidModel(model: string): boolean {
  return model in PROTECTION_RADII
}

/**
 * Verificar si un nivel de protección es válido
 */
export function isValidLevel(level: string): boolean {
  return PROTECTION_LEVELS.includes(level as ProtectionLevel)
}
