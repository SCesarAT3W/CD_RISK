/**
 * Cálculo de probabilidades según IEC 62305-2
 * Anexo B - Probability of damage
 */

import {
  PROTECTION_PROBABILITY,
  TOUCH_VOLTAGE_PROBABILITY,
  SPD_PROBABILITY,
  CABLE_SHIELDING_FACTOR,
  getProtectionProbability,
} from './constants'
import type { RiskCalculationInput } from './types'

/**
 * Interfaz para los datos de probabilidad calculados
 */
export interface ProbabilityData {
  PA: number // Probabilidad de daño por impacto directo en estructura
  PB: number // Probabilidad de daño por impacto cercano a estructura
  PC: number // Probabilidad de daño por impacto en línea eléctrica
  PM: number // Probabilidad de daño por impacto cercano a línea eléctrica
  PU: number // Probabilidad de daño por impacto en línea telecom
  PV: number // Probabilidad de daño por impacto cercano a línea telecom
  PW: number // (Reservado para extensiones futuras)
  PZ: number // (Reservado para extensiones futuras)
}

/**
 * Calcula PTA - Probabilidad de daño por tensiones de paso/contacto
 *
 * Fórmula IEC 62305-2: PTA según tipo de superficie y medidas de protección
 *
 * @param hasTouchVoltageProtection - ¿Tiene protección contra tensiones de contacto?
 * @param surfaceType - Tipo de superficie (si no hay protección específica)
 * @returns Probabilidad PTA (0 a 1)
 *
 * @example
 * ```typescript
 * const PTA = calculatePTA(true) // 0.01 (con protección)
 * const PTA = calculatePTA(false, 'Asfalto') // 1.0 (sin protección)
 * ```
 */
export function calculatePTA(
  hasTouchVoltageProtection: boolean,
  surfaceType?: string
): number {
  if (hasTouchVoltageProtection) {
    return TOUCH_VOLTAGE_PROBABILITY.Aislamiento // 0.01
  }

  // Sin protección específica
  return TOUCH_VOLTAGE_PROBABILITY.SinProteccion // 1.0
}

/**
 * Calcula PA - Probabilidad de daño por impacto directo en estructura
 *
 * Fórmula IEC 62305-2: PA = PTA × PB
 *
 * Donde:
 * - PTA = Probabilidad por tensiones de paso/contacto
 * - PB = Probabilidad según nivel de protección física (LPS)
 *
 * @param hasTouchVoltageProtection - ¿Tiene protección contra tensiones de contacto?
 * @param lpsLevel - Nivel de protección LPS (I, II, III, IV o undefined)
 * @param surfaceType - Tipo de superficie
 * @returns Probabilidad PA
 */
export function calculatePA(
  hasTouchVoltageProtection: boolean,
  lpsLevel?: 'I' | 'II' | 'III' | 'IV',
  surfaceType?: string
): number {
  const PTA = calculatePTA(hasTouchVoltageProtection, surfaceType)
  const PB_protection = getProtectionProbability(lpsLevel)

  return PTA * PB_protection
}

/**
 * Calcula PSPD - Probabilidad según protección SPD
 *
 * @param hasSPD - ¿Tiene SPD instalado?
 * @param spdType - Tipo de SPD (I, II, III, Coordinado)
 * @returns Probabilidad PSPD
 */
export function calculatePSPD(
  hasSPD: boolean,
  spdType?: 'SPD-I' | 'SPD-II' | 'SPD-III' | 'Coordinado'
): number {
  if (!hasSPD || !spdType) {
    return SPD_PROBABILITY.None // 1.0
  }

  return SPD_PROBABILITY[spdType] || SPD_PROBABILITY.None
}

/**
 * Calcula PEB - Probabilidad según equipotencialización
 *
 * @param hasEquipotential - ¿Tiene enlace equipotencial?
 * @returns Probabilidad PEB (0.01 si tiene, 1.0 si no tiene)
 */
export function calculatePEB(hasEquipotential: boolean): number {
  return hasEquipotential ? 0.01 : 1.0
}

/**
 * Calcula PB - Probabilidad de daño por impacto cercano a estructura
 *
 * Fórmula IEC 62305-2: PB = PSPD × PEB
 *
 * Donde:
 * - PSPD = Probabilidad según SPD
 * - PEB = Probabilidad según equipotencialización
 *
 * @param hasSPD - ¿Tiene SPD?
 * @param spdType - Tipo de SPD
 * @param hasEquipotential - ¿Tiene equipotencialización?
 * @returns Probabilidad PB
 */
export function calculatePB(
  hasSPD: boolean,
  spdType?: 'SPD-I' | 'SPD-II' | 'SPD-III' | 'Coordinado',
  hasEquipotential: boolean = true
): number {
  const PSPD = calculatePSPD(hasSPD, spdType)
  const PEB = calculatePEB(hasEquipotential)

  return PSPD * PEB
}

/**
 * Calcula CLD - Factor de apantallamiento de línea
 *
 * @param isShielded - ¿La línea está apantallada?
 * @param isGrounded - ¿El apantallamiento está conectado a tierra?
 * @returns Factor CLD
 */
export function calculateCLD(isShielded: boolean, isGrounded: boolean = true): number {
  if (!isShielded) {
    return CABLE_SHIELDING_FACTOR.NoApantallado // 1.0
  }

  if (isGrounded) {
    return CABLE_SHIELDING_FACTOR.ApantalladoYConectado // 0.01
  }

  return CABLE_SHIELDING_FACTOR.Apantallado // 0.1
}

/**
 * Calcula PC - Probabilidad de daño por impacto directo en línea eléctrica
 *
 * Fórmula IEC 62305-2: PC = PSPD × PEB × CLD
 *
 * @param hasSPD - ¿Tiene SPD?
 * @param spdType - Tipo de SPD
 * @param hasEquipotential - ¿Tiene equipotencialización?
 * @param isLineShielded - ¿La línea está apantallada?
 * @returns Probabilidad PC
 */
export function calculatePC(
  hasSPD: boolean,
  spdType: 'SPD-I' | 'SPD-II' | 'SPD-III' | 'Coordinado' | undefined,
  hasEquipotential: boolean,
  isLineShielded: boolean
): number {
  const PSPD = calculatePSPD(hasSPD, spdType)
  const PEB = calculatePEB(hasEquipotential)
  const CLD = calculateCLD(isLineShielded, true)

  return PSPD * PEB * CLD
}

/**
 * Calcula PM - Probabilidad de daño por impacto cercano a línea eléctrica
 *
 * Fórmula IEC 62305-2: PM = PSPD × PEB × CLI
 *
 * Similar a PC pero para impactos cercanos (CLI ≈ CLD)
 *
 * @param hasSPD - ¿Tiene SPD?
 * @param spdType - Tipo de SPD
 * @param hasEquipotential - ¿Tiene equipotencialización?
 * @param isLineShielded - ¿La línea está apantallada?
 * @returns Probabilidad PM
 */
export function calculatePM(
  hasSPD: boolean,
  spdType: 'SPD-I' | 'SPD-II' | 'SPD-III' | 'Coordinado' | undefined,
  hasEquipotential: boolean,
  isLineShielded: boolean
): number {
  // PM es típicamente igual a PC para impactos cercanos
  return calculatePC(hasSPD, spdType, hasEquipotential, isLineShielded)
}

/**
 * Calcula PU - Probabilidad de daño por impacto en línea de telecomunicaciones
 *
 * Similar a PC pero para líneas telecom
 *
 * @param hasSPD - ¿Tiene SPD en línea telecom?
 * @param hasEquipotential - ¿Tiene equipotencialización?
 * @param isLineShielded - ¿La línea está apantallada?
 * @returns Probabilidad PU
 */
export function calculatePU(
  hasSPD: boolean,
  hasEquipotential: boolean,
  isLineShielded: boolean
): number {
  // Para líneas telecom, típicamente se usa SPD-III
  const PSPD = hasSPD ? SPD_PROBABILITY['SPD-III'] : SPD_PROBABILITY.None
  const PEB = calculatePEB(hasEquipotential)
  const CLD = calculateCLD(isLineShielded, true)

  return PSPD * PEB * CLD
}

/**
 * Calcula PV - Probabilidad de daño por impacto cercano a línea telecom
 *
 * Similar a PM pero para líneas telecom
 *
 * @param hasSPD - ¿Tiene SPD?
 * @param hasEquipotential - ¿Tiene equipotencialización?
 * @param isLineShielded - ¿La línea está apantallada?
 * @returns Probabilidad PV
 */
export function calculatePV(
  hasSPD: boolean,
  hasEquipotential: boolean,
  isLineShielded: boolean
): number {
  // PV es típicamente igual a PU para impactos cercanos
  return calculatePU(hasSPD, hasEquipotential, isLineShielded)
}

/**
 * FUNCIÓN PRINCIPAL
 * Calcula todas las probabilidades de daño
 *
 * @param input - Datos de entrada del cálculo de riesgo
 * @returns Objeto con todas las probabilidades calculadas
 *
 * @example
 * ```typescript
 * const probabilities = calculateAllProbabilities(input)
 * console.log(`PA = ${probabilities.PA}`)
 * console.log(`PB = ${probabilities.PB}`)
 * ```
 */
export function calculateAllProbabilities(input: RiskCalculationInput): ProbabilityData {
  const { protection, services } = input

  // === PROBABILIDADES DE ESTRUCTURA ===

  // PA: Impacto directo en estructura
  const PA = calculatePA(
    protection.hasEquipotential, // Usamos equipotencial como proxy de protección touch voltage
    protection.lpsLevel,
    protection.surfaceType
  )

  // PB: Impacto cercano a estructura
  const PB = calculatePB(protection.hasSPD, protection.spdType, protection.hasEquipotential)

  // === PROBABILIDADES DE LÍNEA ELÉCTRICA ===

  let PC = 1.0
  let PM = 1.0

  if (services.powerLine?.exists) {
    PC = calculatePC(
      protection.hasSPD,
      protection.spdType,
      protection.hasEquipotential,
      services.powerLine.isShielded
    )

    PM = calculatePM(
      protection.hasSPD,
      protection.spdType,
      protection.hasEquipotential,
      services.powerLine.isShielded
    )
  }

  // === PROBABILIDADES DE LÍNEA TELECOM ===

  let PU = 1.0
  let PV = 1.0

  if (services.telecomLines?.exists) {
    PU = calculatePU(
      protection.hasSPD,
      protection.hasEquipotential,
      services.telecomLines.isShielded
    )

    PV = calculatePV(
      protection.hasSPD,
      protection.hasEquipotential,
      services.telecomLines.isShielded
    )
  }

  // === PROBABILIDADES ADICIONALES (W, Z) ===
  // Reservadas para extensiones futuras
  const PW = 1.0
  const PZ = 1.0

  return {
    PA,
    PB,
    PC,
    PM,
    PU,
    PV,
    PW,
    PZ,
  }
}

/**
 * Obtiene un resumen legible de las probabilidades calculadas
 *
 * @param probabilities - Datos de probabilidades
 * @returns Objeto con valores formateados para display
 */
export function getProbabilitySummary(probabilities: ProbabilityData): {
  structure: { direct: string; nearby: string }
  powerLine: { direct: string; nearby: string }
  telecomLine: { direct: string; nearby: string }
} {
  const formatProb = (p: number): string => {
    if (p === 1.0) return '1.00 (sin protección)'
    if (p >= 0.01) return p.toFixed(3)
    return p.toExponential(2)
  }

  return {
    structure: {
      direct: formatProb(probabilities.PA),
      nearby: formatProb(probabilities.PB),
    },
    powerLine: {
      direct: formatProb(probabilities.PC),
      nearby: formatProb(probabilities.PM),
    },
    telecomLine: {
      direct: formatProb(probabilities.PU),
      nearby: formatProb(probabilities.PV),
    },
  }
}

/**
 * Valida que las probabilidades estén en rangos válidos
 *
 * @param probabilities - Probabilidades a validar
 * @returns Objeto con estado de validación y advertencias
 */
export function validateProbabilities(probabilities: ProbabilityData): {
  isValid: boolean
  warnings: string[]
} {
  const warnings: string[] = []

  // Verificar rango válido [0, 1]
  Object.entries(probabilities).forEach(([key, value]) => {
    if (value < 0 || value > 1) {
      warnings.push(`${key} fuera de rango [0,1]: ${value}`)
    }
  })

  // Verificar valores muy altos (sin protección adecuada)
  if (probabilities.PA > 0.5) {
    warnings.push(
      `PA muy alto (${probabilities.PA.toFixed(3)}). Considere instalar sistema de protección contra rayos (LPS).`
    )
  }

  if (probabilities.PB > 0.5) {
    warnings.push(
      `PB muy alto (${probabilities.PB.toFixed(3)}). Considere instalar SPD y equipotencialización.`
    )
  }

  if (probabilities.PC > 0.5 || probabilities.PM > 0.5) {
    warnings.push(
      `Probabilidades de línea eléctrica altas. Considere apantallamiento y SPD coordinado.`
    )
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  }
}

/**
 * Calcula la reducción de probabilidad al añadir protección
 *
 * @param currentProbability - Probabilidad actual
 * @param proposedProtection - Protección propuesta
 * @returns Porcentaje de reducción
 */
export function calculateProbabilityReduction(
  currentProbability: number,
  proposedProtection: {
    lpsLevel?: 'I' | 'II' | 'III' | 'IV'
    spdType?: 'SPD-I' | 'SPD-II' | 'SPD-III' | 'Coordinado'
    hasEquipotential?: boolean
  }
): {
  newProbability: number
  reductionPercent: number
} {
  // Calcular nueva probabilidad con protección propuesta
  let reductionFactor = 1.0

  if (proposedProtection.lpsLevel) {
    reductionFactor *= getProtectionProbability(proposedProtection.lpsLevel)
  }

  if (proposedProtection.spdType) {
    reductionFactor *= SPD_PROBABILITY[proposedProtection.spdType]
  }

  if (proposedProtection.hasEquipotential) {
    reductionFactor *= 0.01
  }

  const newProbability = currentProbability * reductionFactor
  const reductionPercent = ((currentProbability - newProbability) / currentProbability) * 100

  return {
    newProbability,
    reductionPercent,
  }
}
