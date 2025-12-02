/**
 * Cálculo de componentes de riesgo según IEC 62305-2
 * Capítulo 5 - Risk assessment
 */

import type { FrequencyData } from './frequencyCalculations'
import type { ProbabilityData } from './probabilityCalculations'
import type { LossFactorData } from './lossFactors'

/**
 * Interfaz para los componentes de riesgo calculados
 */
export interface RiskComponents {
  // === COMPONENTES PARA R1 (Pérdida de vidas humanas) ===
  RA1: number // Impacto directo en estructura
  RB1: number // Impacto cercano a estructura
  RC1: number // Impacto en línea eléctrica
  RM1: number // Impacto cercano a línea eléctrica
  RU1: number // Impacto en línea telecom
  RV1: number // Impacto cercano a línea telecom
  RW1: number // (Reservado)
  RZ1: number // (Reservado)

  // === COMPONENTES PARA R2 (Pérdida de servicio público) ===
  RB2: number // Impacto cercano a estructura
  RC2: number // Impacto en línea eléctrica
  RM2: number // Impacto cercano a línea eléctrica
  RV2: number // Impacto cercano a línea telecom
  RW2: number // (Reservado)
  RZ2: number // (Reservado)

  // === COMPONENTES PARA R3 (Pérdida de patrimonio cultural) ===
  RB3: number // Impacto cercano a estructura
  RV3: number // Impacto cercano a línea telecom

  // === COMPONENTES PARA R4 (Pérdida económica) ===
  RA4: number // Impacto directo en estructura
  RB4: number // Impacto cercano a estructura
  RC4: number // Impacto en línea eléctrica
  RM4: number // Impacto cercano a línea eléctrica
  RU4: number // Impacto en línea telecom
  RV4: number // Impacto cercano a línea telecom
  RW4: number // (Reservado)
  RZ4: number // (Reservado)
}

/**
 * Calcula un componente de riesgo genérico
 *
 * Fórmula IEC 62305-2: RX = NX × PX × LX
 *
 * Donde:
 * - NX = Frecuencia del evento peligroso (eventos/año)
 * - PX = Probabilidad de daño
 * - LX = Factor de pérdida
 *
 * @param frequency - Frecuencia del evento (NX)
 * @param probability - Probabilidad de daño (PX)
 * @param lossFactor - Factor de pérdida (LX)
 * @returns Componente de riesgo RX
 *
 * @example
 * ```typescript
 * const RA1 = calculateRiskComponent(0.154, 0.02, 0.001)
 * // RA1 = 3.08 × 10⁻⁶
 * ```
 */
export function calculateRiskComponent(
  frequency: number,
  probability: number,
  lossFactor: number
): number {
  // Validar entradas
  if (frequency < 0 || probability < 0 || lossFactor < 0) {
    throw new Error('Los parámetros de riesgo deben ser no negativos')
  }

  if (probability > 1) {
    throw new Error('La probabilidad debe estar entre 0 y 1')
  }

  // RX = NX × PX × LX
  return frequency * probability * lossFactor
}

/**
 * FUNCIÓN PRINCIPAL
 * Calcula todos los componentes de riesgo para R1, R2, R3 y R4
 *
 * @param frequencies - Frecuencias de eventos peligrosos
 * @param probabilities - Probabilidades de daño
 * @param lossFactorsR1 - Factores de pérdida para R1
 * @param lossFactorsR2 - Factores de pérdida para R2 (opcional)
 * @param lossFactorsR3 - Factores de pérdida para R3 (opcional)
 * @param lossFactorsR4 - Factores de pérdida para R4 (opcional)
 * @returns Todos los componentes de riesgo calculados
 *
 * @example
 * ```typescript
 * const components = calculateAllRiskComponents(
 *   frequencies,
 *   probabilities,
 *   lossFactorsR1
 * )
 * console.log(`RA1 = ${components.RA1.toExponential(2)}`)
 * ```
 */
export function calculateAllRiskComponents(
  frequencies: FrequencyData,
  probabilities: ProbabilityData,
  lossFactorsR1: LossFactorData,
  lossFactorsR2?: Partial<LossFactorData>,
  lossFactorsR3?: Partial<LossFactorData>,
  lossFactorsR4?: LossFactorData
): RiskComponents {
  // === COMPONENTES PARA R1 (Pérdida de vidas humanas) ===

  const RA1 = calculateRiskComponent(frequencies.ND, probabilities.PA, lossFactorsR1.LA)

  const RB1 = calculateRiskComponent(frequencies.NM, probabilities.PB, lossFactorsR1.LB)

  const RC1 = calculateRiskComponent(frequencies.NL, probabilities.PC, lossFactorsR1.LC)

  const RM1 = calculateRiskComponent(frequencies.NI, probabilities.PM, lossFactorsR1.LM)

  const RU1 = calculateRiskComponent(frequencies.NU, probabilities.PU, lossFactorsR1.LU)

  const RV1 = calculateRiskComponent(frequencies.NV, probabilities.PV, lossFactorsR1.LV)

  const RW1 = calculateRiskComponent(frequencies.NW, probabilities.PW, lossFactorsR1.LW)

  const RZ1 = calculateRiskComponent(frequencies.NZ, probabilities.PZ, lossFactorsR1.LZ)

  // === COMPONENTES PARA R2 (Pérdida de servicio público) ===
  // R2 no incluye RA (impacto directo no afecta servicio)

  const RB2 = lossFactorsR2?.LB
    ? calculateRiskComponent(frequencies.NM, probabilities.PB, lossFactorsR2.LB)
    : 0

  const RC2 = lossFactorsR2?.LC
    ? calculateRiskComponent(frequencies.NL, probabilities.PC, lossFactorsR2.LC)
    : 0

  const RM2 = lossFactorsR2?.LM
    ? calculateRiskComponent(frequencies.NI, probabilities.PM, lossFactorsR2.LM)
    : 0

  const RV2 = lossFactorsR2?.LV
    ? calculateRiskComponent(frequencies.NV, probabilities.PV, lossFactorsR2.LV)
    : 0

  const RW2 = 0 // Reservado
  const RZ2 = 0 // Reservado

  // === COMPONENTES PARA R3 (Pérdida de patrimonio cultural) ===
  // R3 solo incluye RB y RV

  const RB3 = lossFactorsR3?.LB
    ? calculateRiskComponent(frequencies.NM, probabilities.PB, lossFactorsR3.LB)
    : 0

  const RV3 = lossFactorsR3?.LV
    ? calculateRiskComponent(frequencies.NV, probabilities.PV, lossFactorsR3.LV)
    : 0

  // === COMPONENTES PARA R4 (Pérdida económica) ===

  const RA4 = lossFactorsR4?.LA
    ? calculateRiskComponent(frequencies.ND, probabilities.PA, lossFactorsR4.LA)
    : 0

  const RB4 = lossFactorsR4?.LB
    ? calculateRiskComponent(frequencies.NM, probabilities.PB, lossFactorsR4.LB)
    : 0

  const RC4 = lossFactorsR4?.LC
    ? calculateRiskComponent(frequencies.NL, probabilities.PC, lossFactorsR4.LC)
    : 0

  const RM4 = lossFactorsR4?.LM
    ? calculateRiskComponent(frequencies.NI, probabilities.PM, lossFactorsR4.LM)
    : 0

  const RU4 = lossFactorsR4?.LU
    ? calculateRiskComponent(frequencies.NU, probabilities.PU, lossFactorsR4.LU)
    : 0

  const RV4 = lossFactorsR4?.LV
    ? calculateRiskComponent(frequencies.NV, probabilities.PV, lossFactorsR4.LV)
    : 0

  const RW4 = 0 // Reservado
  const RZ4 = 0 // Reservado

  return {
    // R1 components
    RA1,
    RB1,
    RC1,
    RM1,
    RU1,
    RV1,
    RW1,
    RZ1,

    // R2 components
    RB2,
    RC2,
    RM2,
    RV2,
    RW2,
    RZ2,

    // R3 components
    RB3,
    RV3,

    // R4 components
    RA4,
    RB4,
    RC4,
    RM4,
    RU4,
    RV4,
    RW4,
    RZ4,
  }
}

/**
 * Obtiene un resumen legible de los componentes de riesgo
 *
 * @param components - Componentes de riesgo calculados
 * @returns Objeto con valores formateados
 */
export function getRiskComponentsSummary(components: RiskComponents): {
  R1_components: Record<string, string>
  R2_components: Record<string, string>
  R3_components: Record<string, string>
  R4_components: Record<string, string>
} {
  const formatRisk = (r: number): string => {
    if (r === 0) return '0'
    if (r < 1e-8) return r.toExponential(2)
    if (r < 0.0001) return r.toFixed(8)
    return r.toFixed(6)
  }

  return {
    R1_components: {
      RA1: formatRisk(components.RA1),
      RB1: formatRisk(components.RB1),
      RC1: formatRisk(components.RC1),
      RM1: formatRisk(components.RM1),
      RU1: formatRisk(components.RU1),
      RV1: formatRisk(components.RV1),
    },
    R2_components: {
      RB2: formatRisk(components.RB2),
      RC2: formatRisk(components.RC2),
      RM2: formatRisk(components.RM2),
      RV2: formatRisk(components.RV2),
    },
    R3_components: {
      RB3: formatRisk(components.RB3),
      RV3: formatRisk(components.RV3),
    },
    R4_components: {
      RA4: formatRisk(components.RA4),
      RB4: formatRisk(components.RB4),
      RC4: formatRisk(components.RC4),
      RM4: formatRisk(components.RM4),
      RU4: formatRisk(components.RU4),
      RV4: formatRisk(components.RV4),
    },
  }
}

/**
 * Identifica el componente de riesgo dominante para cada tipo de riesgo
 *
 * @param components - Componentes de riesgo
 * @returns Componentes dominantes para cada riesgo
 */
export function identifyDominantComponents(components: RiskComponents): {
  R1_dominant: { component: string; value: number }
  R2_dominant: { component: string; value: number }
  R3_dominant: { component: string; value: number }
  R4_dominant: { component: string; value: number }
} {
  // R1 components
  const r1Components = {
    RA1: components.RA1,
    RB1: components.RB1,
    RC1: components.RC1,
    RM1: components.RM1,
    RU1: components.RU1,
    RV1: components.RV1,
  }
  const r1Max = Object.entries(r1Components).reduce((max, [key, value]) =>
    value > max.value ? { component: key, value } : max
  , { component: 'RA1', value: r1Components.RA1 })

  // R2 components
  const r2Components = {
    RB2: components.RB2,
    RC2: components.RC2,
    RM2: components.RM2,
    RV2: components.RV2,
  }
  const r2Max = Object.entries(r2Components).reduce((max, [key, value]) =>
    value > max.value ? { component: key, value } : max
  , { component: 'RB2', value: r2Components.RB2 })

  // R3 components
  const r3Components = {
    RB3: components.RB3,
    RV3: components.RV3,
  }
  const r3Max = Object.entries(r3Components).reduce((max, [key, value]) =>
    value > max.value ? { component: key, value } : max
  , { component: 'RB3', value: r3Components.RB3 })

  // R4 components
  const r4Components = {
    RA4: components.RA4,
    RB4: components.RB4,
    RC4: components.RC4,
    RM4: components.RM4,
    RU4: components.RU4,
    RV4: components.RV4,
  }
  const r4Max = Object.entries(r4Components).reduce((max, [key, value]) =>
    value > max.value ? { component: key, value } : max
  , { component: 'RA4', value: r4Components.RA4 })

  return {
    R1_dominant: r1Max,
    R2_dominant: r2Max,
    R3_dominant: r3Max,
    R4_dominant: r4Max,
  }
}

/**
 * Calcula el porcentaje de contribución de cada componente al riesgo total
 *
 * @param components - Componentes de riesgo
 * @returns Porcentajes de contribución
 */
export function calculateComponentContributions(components: RiskComponents): {
  R1: Record<string, number>
  R2: Record<string, number>
  R3: Record<string, number>
  R4: Record<string, number>
} {
  // R1 total
  const R1_total = components.RA1 + components.RB1 + components.RC1 +
                   components.RM1 + components.RU1 + components.RV1

  // R2 total
  const R2_total = components.RB2 + components.RC2 + components.RM2 + components.RV2

  // R3 total
  const R3_total = components.RB3 + components.RV3

  // R4 total
  const R4_total = components.RA4 + components.RB4 + components.RC4 +
                   components.RM4 + components.RU4 + components.RV4

  const safePercent = (value: number, total: number): number => {
    return total > 0 ? (value / total) * 100 : 0
  }

  return {
    R1: {
      RA1: safePercent(components.RA1, R1_total),
      RB1: safePercent(components.RB1, R1_total),
      RC1: safePercent(components.RC1, R1_total),
      RM1: safePercent(components.RM1, R1_total),
      RU1: safePercent(components.RU1, R1_total),
      RV1: safePercent(components.RV1, R1_total),
    },
    R2: {
      RB2: safePercent(components.RB2, R2_total),
      RC2: safePercent(components.RC2, R2_total),
      RM2: safePercent(components.RM2, R2_total),
      RV2: safePercent(components.RV2, R2_total),
    },
    R3: {
      RB3: safePercent(components.RB3, R3_total),
      RV3: safePercent(components.RV3, R3_total),
    },
    R4: {
      RA4: safePercent(components.RA4, R4_total),
      RB4: safePercent(components.RB4, R4_total),
      RC4: safePercent(components.RC4, R4_total),
      RM4: safePercent(components.RM4, R4_total),
      RU4: safePercent(components.RU4, R4_total),
      RV4: safePercent(components.RV4, R4_total),
    },
  }
}

/**
 * Valida que los componentes de riesgo estén en rangos razonables
 *
 * @param components - Componentes a validar
 * @returns Objeto con estado de validación y advertencias
 */
export function validateRiskComponents(components: RiskComponents): {
  isValid: boolean
  warnings: string[]
} {
  const warnings: string[] = []

  // Verificar valores negativos
  Object.entries(components).forEach(([key, value]) => {
    if (value < 0) {
      warnings.push(`${key} tiene valor negativo: ${value}`)
    }
  })

  // Verificar componentes extremadamente altos
  Object.entries(components).forEach(([key, value]) => {
    if (value > 1e-2) {
      warnings.push(`${key} muy alto: ${value.toExponential(2)}. Esto indica riesgo significativo.`)
    }
  })

  return {
    isValid: warnings.length === 0,
    warnings,
  }
}
