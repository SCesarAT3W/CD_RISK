/**
 * Cálculo de factores de pérdida según IEC 62305-2
 * Anexo C - Amount of loss
 */

import {
  SURFACE_REDUCTION_FACTOR,
  FIRE_PROTECTION_FACTOR,
  FIRE_RISK_FACTOR,
  SPECIAL_HAZARD_FACTOR,
  LOSS_TYPE_FACTOR,
  STRUCTURE_TYPE_FACTORS,
} from './constants'
import type { RiskCalculationInput } from './types'

/**
 * Interfaz para los factores de pérdida calculados
 */
export interface LossFactorData {
  LA: number // Pérdida por tensiones de paso/contacto (R1)
  LB: number // Pérdida por daño físico (R1)
  LC: number // Pérdida por fallo de sistemas internos (R1)
  LM: number // Pérdida por fallo de sistemas internos (R1)
  LU: number // Pérdida de vidas humanas por línea telecom (R1)
  LV: number // Pérdida de vidas humanas por línea telecom (R1)
  LW: number // (Reservado para extensiones futuras)
  LZ: number // (Reservado para extensiones futuras)
}

/**
 * Calcula LA - Factor de pérdida por tensiones de paso/contacto
 *
 * Fórmula IEC 62305-2: LA = (rt × np) / (nt × 10⁻²)
 *
 * Donde:
 * - rt = Factor de reducción según tipo de superficie
 * - np = Número de personas en riesgo
 * - nt = Número total de personas en estructura
 *
 * @param surfaceType - Tipo de superficie (Asfalto, Hormigón, Grava, etc.)
 * @param personsAtRisk - Número de personas en riesgo
 * @param totalPersons - Número total de personas
 * @returns Factor LA
 *
 * @example
 * ```typescript
 * const LA = calculateLA('Asfalto', 10, 100)
 * // LA = (0.01 × 10) / (100 × 0.01) = 0.1
 * ```
 */
export function calculateLA(
  surfaceType: string,
  personsAtRisk: number,
  totalPersons: number
): number {
  if (totalPersons === 0) {
    return 0
  }

  const rt = SURFACE_REDUCTION_FACTOR[surfaceType] || SURFACE_REDUCTION_FACTOR.Asfalto

  // Fórmula: LA = (rt × np) / (nt × 10⁻²)
  const LA = (rt * personsAtRisk) / (totalPersons * 1e-2)

  return LA
}

/**
 * Calcula LB - Factor de pérdida por daño físico a la estructura
 *
 * Fórmula IEC 62305-2: LB = (rp × rf × hz × LT) / (nt × 10⁻²)
 *
 * Donde:
 * - rp = Factor de reducción por protección contra incendios
 * - rf = Factor de riesgo de incendio
 * - hz = Factor de incremento por peligro especial
 * - LT = Tipo de pérdida (1.0 para pérdida de vidas)
 * - nt = Número total de personas
 *
 * @param fireProtectionType - Tipo de protección contra incendios
 * @param fireRisk - Nivel de riesgo de incendio
 * @param specialHazard - Peligro especial (pánico, explosivos, etc.)
 * @param totalPersons - Número total de personas
 * @param lossType - Tipo de pérdida (default: 1.0)
 * @returns Factor LB
 */
export function calculateLB(
  fireProtectionType: string,
  fireRisk: string,
  specialHazard: string,
  totalPersons: number,
  lossType: number = 1.0
): number {
  if (totalPersons === 0) {
    return 0
  }

  const rp = FIRE_PROTECTION_FACTOR[fireProtectionType] || FIRE_PROTECTION_FACTOR.SinProteccion
  const rf = FIRE_RISK_FACTOR[fireRisk] || FIRE_RISK_FACTOR.Comun
  const hz = SPECIAL_HAZARD_FACTOR[specialHazard] || SPECIAL_HAZARD_FACTOR.Normal

  // Fórmula: LB = (rp × rf × hz × LT) / (nt × 10⁻²)
  const LB = (rp * rf * hz * lossType) / (totalPersons * 1e-2)

  return LB
}

/**
 * Calcula LC - Factor de pérdida por fallo de sistemas internos (línea eléctrica)
 *
 * Fórmula IEC 62305-2: LC = (rp × rf × hz × LT) / (nt × 10⁻²)
 *
 * Similar a LB pero aplicado a fallos causados por impactos en líneas eléctricas
 *
 * @param fireProtectionType - Tipo de protección contra incendios
 * @param fireRisk - Nivel de riesgo de incendio
 * @param specialHazard - Peligro especial
 * @param totalPersons - Número total de personas
 * @param lossType - Tipo de pérdida
 * @returns Factor LC
 */
export function calculateLC(
  fireProtectionType: string,
  fireRisk: string,
  specialHazard: string,
  totalPersons: number,
  lossType: number = 1.0
): number {
  // LC es típicamente igual a LB para pérdida de vidas humanas
  return calculateLB(fireProtectionType, fireRisk, specialHazard, totalPersons, lossType)
}

/**
 * Calcula LM - Factor de pérdida por fallo de sistemas (impactos cercanos a línea)
 *
 * Similar a LC pero para impactos cercanos a la línea eléctrica
 *
 * @param fireProtectionType - Tipo de protección contra incendios
 * @param fireRisk - Nivel de riesgo de incendio
 * @param specialHazard - Peligro especial
 * @param totalPersons - Número total de personas
 * @param lossType - Tipo de pérdida
 * @returns Factor LM
 */
export function calculateLM(
  fireProtectionType: string,
  fireRisk: string,
  specialHazard: string,
  totalPersons: number,
  lossType: number = 1.0
): number {
  // LM es típicamente igual a LC/LB
  return calculateLB(fireProtectionType, fireRisk, specialHazard, totalPersons, lossType)
}

/**
 * Calcula LU - Factor de pérdida por impacto en línea de telecomunicaciones
 *
 * @param fireProtectionType - Tipo de protección contra incendios
 * @param fireRisk - Nivel de riesgo de incendio
 * @param specialHazard - Peligro especial
 * @param totalPersons - Número total de personas
 * @param lossType - Tipo de pérdida
 * @returns Factor LU
 */
export function calculateLU(
  fireProtectionType: string,
  fireRisk: string,
  specialHazard: string,
  totalPersons: number,
  lossType: number = 1.0
): number {
  // LU es similar a LB pero puede ser menor debido a menor energía
  // Aplicamos factor de reducción de 0.5
  const LB = calculateLB(fireProtectionType, fireRisk, specialHazard, totalPersons, lossType)
  return LB * 0.5
}

/**
 * Calcula LV - Factor de pérdida por impacto cercano a línea telecom
 *
 * @param fireProtectionType - Tipo de protección contra incendios
 * @param fireRisk - Nivel de riesgo de incendio
 * @param specialHazard - Peligro especial
 * @param totalPersons - Número total de personas
 * @param lossType - Tipo de pérdida
 * @returns Factor LV
 */
export function calculateLV(
  fireProtectionType: string,
  fireRisk: string,
  specialHazard: string,
  totalPersons: number,
  lossType: number = 1.0
): number {
  // LV es típicamente igual a LU
  return calculateLU(fireProtectionType, fireRisk, specialHazard, totalPersons, lossType)
}

/**
 * FUNCIÓN PRINCIPAL
 * Calcula todos los factores de pérdida
 *
 * @param input - Datos de entrada del cálculo de riesgo
 * @returns Objeto con todos los factores de pérdida calculados
 *
 * @example
 * ```typescript
 * const lossFactors = calculateAllLossFactors(input)
 * console.log(`LA = ${lossFactors.LA}`)
 * console.log(`LB = ${lossFactors.LB}`)
 * ```
 */
export function calculateAllLossFactors(input: RiskCalculationInput): LossFactorData {
  const { structure, protection, lossFactors: customLossFactors } = input

  // Determinar tipo de superficie
  const surfaceType = protection.surfaceType || 'Asfalto'

  // Determinar tipo de protección contra incendios
  const fireProtectionType =
    protection.fireProtectionType ||
    (protection.hasFireProtection ? 'Detectores' : 'SinProteccion')

  // Determinar riesgo de incendio
  const fireRisk = structure.fireRisk || 'Comun'

  // Determinar peligro especial
  const specialHazard = customLossFactors?.specialHazard || 'Normal'

  // Número de personas
  const totalPersons = structure.occupants || 1 // Mínimo 1 para evitar división por 0
  const personsAtRisk = structure.occupants || 1 // En R1, típicamente todos están en riesgo

  // Tipo de pérdida base
  const lossType = LOSS_TYPE_FACTOR.VidasHumanas // 1.0 para R1

  // === CALCULAR FACTORES ===

  // LA: Tensiones de paso/contacto
  const LA = calculateLA(surfaceType, personsAtRisk, totalPersons)

  // LB: Daño físico a estructura
  const LB = calculateLB(fireProtectionType, fireRisk, specialHazard, totalPersons, lossType)

  // LC: Fallo de sistemas por línea eléctrica
  const LC = calculateLC(fireProtectionType, fireRisk, specialHazard, totalPersons, lossType)

  // LM: Fallo de sistemas por impacto cercano a línea
  const LM = calculateLM(fireProtectionType, fireRisk, specialHazard, totalPersons, lossType)

  // LU: Línea telecom impacto directo
  const LU = calculateLU(fireProtectionType, fireRisk, specialHazard, totalPersons, lossType)

  // LV: Línea telecom impacto cercano
  const LV = calculateLV(fireProtectionType, fireRisk, specialHazard, totalPersons, lossType)

  // LW, LZ: Reservados para futuro
  const LW = 0
  const LZ = 0

  return {
    LA,
    LB,
    LC,
    LM,
    LU,
    LV,
    LW,
    LZ,
  }
}

/**
 * Calcula factores de pérdida para R2 (Pérdida de servicio público)
 *
 * Usa fórmulas modificadas según el tipo de servicio
 *
 * @param input - Datos de entrada
 * @returns Factores de pérdida para R2
 */
export function calculateLossFactorsR2(input: RiskCalculationInput): Partial<LossFactorData> {
  const { structure, protection, lossFactors: customLossFactors } = input

  const fireProtectionType =
    protection.fireProtectionType ||
    (protection.hasFireProtection ? 'Detectores' : 'SinProteccion')
  const fireRisk = structure.fireRisk || 'Comun'
  const specialHazard = customLossFactors?.specialHazard || 'Normal'

  // Para R2, usamos factor de servicio
  const serviceImportance =
    customLossFactors?.serviceImportance === 'ServicioImportante'
      ? LOSS_TYPE_FACTOR.ServicioImportante
      : LOSS_TYPE_FACTOR.ServicioLimitado

  // Número de usuarios afectados (usar población como proxy)
  const totalUsers = structure.occupants || 100

  // Calcular factores para R2
  const LB2 = calculateLB(fireProtectionType, fireRisk, specialHazard, totalUsers, serviceImportance)
  const LC2 = calculateLC(fireProtectionType, fireRisk, specialHazard, totalUsers, serviceImportance)
  const LM2 = calculateLM(fireProtectionType, fireRisk, specialHazard, totalUsers, serviceImportance)
  const LV2 = calculateLV(fireProtectionType, fireRisk, specialHazard, totalUsers, serviceImportance)

  return {
    LB: LB2,
    LC: LC2,
    LM: LM2,
    LV: LV2,
  }
}

/**
 * Calcula factores de pérdida para R3 (Pérdida de patrimonio cultural)
 *
 * @param input - Datos de entrada
 * @returns Factores de pérdida para R3
 */
export function calculateLossFactorsR3(input: RiskCalculationInput): Partial<LossFactorData> {
  const { structure, protection, lossFactors: customLossFactors } = input

  const fireProtectionType =
    protection.fireProtectionType ||
    (protection.hasFireProtection ? 'Detectores' : 'SinProteccion')
  const fireRisk = structure.fireRisk || 'Comun'

  // Para R3, el valor cultural es clave
  const culturalValue = customLossFactors?.culturalHeritageValue || 1.0

  const rp = FIRE_PROTECTION_FACTOR[fireProtectionType] || FIRE_PROTECTION_FACTOR.SinProteccion
  const rf = FIRE_RISK_FACTOR[fireRisk] || FIRE_RISK_FACTOR.Comun

  // LB3 y LV3 para patrimonio
  const LB3 = rp * rf * culturalValue
  const LV3 = rp * rf * culturalValue * 0.5 // Menor para líneas telecom

  return {
    LB: LB3,
    LV: LV3,
  }
}

/**
 * Calcula factores de pérdida para R4 (Pérdida económica)
 *
 * @param input - Datos de entrada
 * @returns Factores de pérdida para R4
 */
export function calculateLossFactorsR4(input: RiskCalculationInput): LossFactorData {
  const { structure, protection } = input

  const fireProtectionType =
    protection.fireProtectionType ||
    (protection.hasFireProtection ? 'Detectores' : 'SinProteccion')
  const fireRisk = structure.fireRisk || 'Comun'

  const rp = FIRE_PROTECTION_FACTOR[fireProtectionType] || FIRE_PROTECTION_FACTOR.SinProteccion
  const rf = FIRE_RISK_FACTOR[fireRisk] || FIRE_RISK_FACTOR.Comun

  // Valor total en riesgo
  const totalValue = structure.totalValue + structure.contentValue

  // Factor económico base
  const economicFactor = totalValue > 0 ? 1.0 : 0.1

  // Calcular factores para R4
  const LA4 = rp * rf * economicFactor * 0.01 // Muy bajo para tensiones contacto
  const LB4 = rp * rf * economicFactor
  const LC4 = rp * rf * economicFactor * 0.5
  const LM4 = rp * rf * economicFactor * 0.5
  const LU4 = rp * rf * economicFactor * 0.3
  const LV4 = rp * rf * economicFactor * 0.3

  return {
    LA: LA4,
    LB: LB4,
    LC: LC4,
    LM: LM4,
    LU: LU4,
    LV: LV4,
    LW: 0,
    LZ: 0,
  }
}

/**
 * Obtiene un resumen legible de los factores de pérdida
 *
 * @param lossFactors - Factores de pérdida calculados
 * @returns Objeto con valores formateados
 */
export function getLossFactorSummary(lossFactors: LossFactorData): {
  touchVoltage: string
  physicalDamage: string
  systemFailure: string
  telecomDamage: string
} {
  const formatLoss = (l: number): string => {
    if (l === 0) return '0'
    if (l < 0.0001) return l.toExponential(2)
    if (l < 0.01) return l.toFixed(5)
    return l.toFixed(3)
  }

  return {
    touchVoltage: formatLoss(lossFactors.LA),
    physicalDamage: formatLoss(lossFactors.LB),
    systemFailure: formatLoss(lossFactors.LC),
    telecomDamage: formatLoss(lossFactors.LU),
  }
}

/**
 * Valida que los factores de pérdida estén en rangos razonables
 *
 * @param lossFactors - Factores a validar
 * @returns Objeto con estado de validación y advertencias
 */
export function validateLossFactors(lossFactors: LossFactorData): {
  isValid: boolean
  warnings: string[]
} {
  const warnings: string[] = []

  // Verificar valores negativos
  Object.entries(lossFactors).forEach(([key, value]) => {
    if (value < 0) {
      warnings.push(`${key} tiene valor negativo: ${value}`)
    }
  })

  // Verificar valores extremadamente altos
  Object.entries(lossFactors).forEach(([key, value]) => {
    if (value > 10) {
      warnings.push(`${key} muy alto: ${value.toFixed(2)}. Revisar parámetros de entrada.`)
    }
  })

  // Verificar que LA sea menor que LB (típicamente)
  if (lossFactors.LA > lossFactors.LB && lossFactors.LB > 0) {
    warnings.push(
      `LA (${lossFactors.LA.toFixed(3)}) mayor que LB (${lossFactors.LB.toFixed(3)}). Esto es inusual.`
    )
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  }
}
