/**
 * Cálculo principal de riesgo según IEC 62305-2
 * Integración de todos los módulos de cálculo
 */

import { TOLERABLE_RISK } from './constants'
import { calculateAllCollectionAreas } from './collectionArea'
import { calculateAllFrequencies } from './frequencyCalculations'
import { calculateAllProbabilities } from './probabilityCalculations'
import {
  calculateAllLossFactors,
  calculateLossFactorsR2,
  calculateLossFactorsR3,
  calculateLossFactorsR4,
} from './lossFactors'
import { calculateAllRiskComponents } from './riskComponents'
import type { RiskCalculationInput, RiskCalculationResult } from './types'

/**
 * FUNCIÓN PRINCIPAL
 * Calcula todos los riesgos R1, R2, R3, R4 según IEC 62305-2
 *
 * @param input - Datos de entrada completos del proyecto
 * @returns Resultado completo del cálculo de riesgo
 *
 * @throws {Error} Si los datos de entrada son inválidos
 *
 * @example
 * ```typescript
 * const input: RiskCalculationInput = {
 *   dimensions: { length: 80, width: 50, height: 20 },
 *   location: { province: 'Madrid', situation: 'EstructuraAislada', ... },
 *   structure: { type: 'Comercial', occupants: 50, ... },
 *   protection: { hasLPS: false, hasSPD: false, ... },
 *   services: { powerLine: { exists: true, length: 500, ... } },
 * }
 *
 * const result = calculateRisk(input)
 * console.log(`R1 = ${result.risks.R1.toExponential(2)}`)
 * console.log(`Necesita protección: ${result.comparison.R1_needsProtection}`)
 * ```
 */
export function calculateRisk(input: RiskCalculationInput): RiskCalculationResult {
  // === PASO 1: CALCULAR ÁREAS DE COLECCIÓN ===
  const collectionAreas = calculateAllCollectionAreas(input.dimensions, input.services)

  // === PASO 2: CALCULAR FRECUENCIAS ===
  const frequencies = calculateAllFrequencies(input, collectionAreas)

  // === PASO 3: CALCULAR PROBABILIDADES ===
  const probabilities = calculateAllProbabilities(input)

  // === PASO 4: CALCULAR FACTORES DE PÉRDIDA ===

  // R1: Pérdida de vidas humanas
  const lossFactorsR1 = calculateAllLossFactors(input)

  // R2: Pérdida de servicio público
  const lossFactorsR2 = calculateLossFactorsR2(input)

  // R3: Pérdida de patrimonio cultural
  const lossFactorsR3 = calculateLossFactorsR3(input)

  // R4: Pérdida económica
  const lossFactorsR4 = calculateLossFactorsR4(input)

  // === PASO 5: CALCULAR COMPONENTES DE RIESGO ===
  const components = calculateAllRiskComponents(
    frequencies,
    probabilities,
    lossFactorsR1,
    lossFactorsR2,
    lossFactorsR3,
    lossFactorsR4
  )

  // === PASO 6: SUMAR COMPONENTES PARA CADA RIESGO ===

  /**
   * R1 - Pérdida de vidas humanas
   * R1 = RA1 + RB1 + RC1 + RM1 + RU1 + RV1
   */
  const R1 =
    components.RA1 +
    components.RB1 +
    components.RC1 +
    components.RM1 +
    components.RU1 +
    components.RV1 +
    components.RW1 +
    components.RZ1

  /**
   * R2 - Pérdida de servicio público
   * R2 = RB2 + RC2 + RM2 + RV2
   * (No incluye RA porque impacto directo no afecta servicio)
   */
  const R2 =
    components.RB2 +
    components.RC2 +
    components.RM2 +
    components.RV2 +
    components.RW2 +
    components.RZ2

  /**
   * R3 - Pérdida de patrimonio cultural
   * R3 = RB3 + RV3
   * (Solo impactos que pueden causar incendio)
   */
  const R3 = components.RB3 + components.RV3

  /**
   * R4 - Pérdida económica
   * R4 = RA4 + RB4 + RC4 + RM4 + RU4 + RV4
   */
  const R4 =
    components.RA4 +
    components.RB4 +
    components.RC4 +
    components.RM4 +
    components.RU4 +
    components.RV4 +
    components.RW4 +
    components.RZ4

  // === PASO 7: COMPARAR CON RIESGOS TOLERABLES ===

  const comparison = {
    R1_tolerable: TOLERABLE_RISK.R1, // 1×10⁻⁵
    R2_tolerable: TOLERABLE_RISK.R2, // 1×10⁻³
    R3_tolerable: TOLERABLE_RISK.R3, // 1×10⁻³
    R1_needsProtection: R1 > TOLERABLE_RISK.R1,
    R2_needsProtection: R2 > TOLERABLE_RISK.R2,
    R3_needsProtection: R3 > TOLERABLE_RISK.R3,
  }

  // === PASO 8: GENERAR RECOMENDACIONES ===

  const recommendation = generateRecommendations(
    { R1, R2, R3, R4 },
    comparison,
    input,
    components
  )

  // === PASO 9: ANÁLISIS ECONÓMICO (R4) ===

  const economicAnalysis = calculateEconomicAnalysis(R4, input)

  // === RETORNAR RESULTADO COMPLETO ===

  return {
    risks: { R1, R2, R3, R4 },
    components,
    comparison,
    recommendation,
    intermediateData: {
      frequencies,
      collectionAreas,
      probabilities,
      lossFactors: lossFactorsR1,
    },
    economicAnalysis,
  }
}

/**
 * Genera recomendaciones basadas en los riesgos calculados
 *
 * @param risks - Riesgos calculados
 * @param comparison - Comparación con riesgos tolerables
 * @param input - Datos de entrada
 * @param components - Componentes de riesgo
 * @returns Recomendaciones de protección
 */
function generateRecommendations(
  risks: { R1: number; R2: number; R3: number; R4: number },
  comparison: {
    R1_needsProtection: boolean
    R2_needsProtection: boolean
    R3_needsProtection: boolean
  },
  input: RiskCalculationInput,
  components: any
): {
  needsProtection: boolean
  recommendedLevel: 'I' | 'II' | 'III' | 'IV' | 'none'
  recommendedSPD: boolean
  recommendedFireProtection: boolean
  reasons: string[]
} {
  const reasons: string[] = []

  // Determinar si necesita protección
  const needsProtection =
    comparison.R1_needsProtection ||
    comparison.R2_needsProtection ||
    comparison.R3_needsProtection

  if (!needsProtection) {
    return {
      needsProtection: false,
      recommendedLevel: 'none',
      recommendedSPD: false,
      recommendedFireProtection: false,
      reasons: ['Los riesgos están por debajo de los valores tolerables. No se requiere protección adicional.'],
    }
  }

  // Determinar nivel de protección LPS recomendado
  let recommendedLevel: 'I' | 'II' | 'III' | 'IV' = 'III'

  if (risks.R1 > 10 * TOLERABLE_RISK.R1) {
    recommendedLevel = 'I'
    reasons.push(`R1 muy alto (${risks.R1.toExponential(2)}). Se recomienda protección nivel I (eficiencia 98%).`)
  } else if (risks.R1 > 5 * TOLERABLE_RISK.R1) {
    recommendedLevel = 'II'
    reasons.push(`R1 alto (${risks.R1.toExponential(2)}). Se recomienda protección nivel II (eficiencia 95%).`)
  } else if (risks.R1 > TOLERABLE_RISK.R1) {
    recommendedLevel = 'III'
    reasons.push(`R1 supera tolerable (${risks.R1.toExponential(2)} > ${TOLERABLE_RISK.R1.toExponential(2)}). Se recomienda protección nivel III (eficiencia 90%).`)
  } else {
    recommendedLevel = 'IV'
  }

  // Determinar si necesita SPD
  const recommendedSPD = !input.protection.hasSPD && (
    components.RB1 > TOLERABLE_RISK.R1 * 0.1 ||
    components.RC1 > TOLERABLE_RISK.R1 * 0.1 ||
    components.RM1 > TOLERABLE_RISK.R1 * 0.1
  )

  if (recommendedSPD) {
    reasons.push(
      'Los componentes por impactos cercanos y en líneas son significativos. Se recomienda instalación de SPD (Dispositivos de Protección contra Sobretensiones).'
    )
  }

  // Determinar si necesita protección contra incendios
  const recommendedFireProtection = !input.protection.hasFireProtection && (
    input.structure.fireRisk === 'Alto' ||
    input.structure.fireRisk === 'MuyAlto' ||
    components.RB1 > TOLERABLE_RISK.R1 * 0.3
  )

  if (recommendedFireProtection) {
    reasons.push(
      `Riesgo de incendio ${input.structure.fireRisk}. Se recomienda sistema de protección contra incendios (detectores y extinción automática).`
    )
  }

  // Recomendaciones específicas según tipo de estructura
  if (input.structure.type === 'Hospital' || input.structure.type === 'Escuela') {
    reasons.push(
      `Estructura de tipo ${input.structure.type} - se recomienda protección reforzada por alto riesgo para ocupantes.`
    )
  }

  if (input.structure.type === 'Museo' && risks.R3 > TOLERABLE_RISK.R3) {
    reasons.push(
      `R3 (patrimonio cultural) supera tolerable. Se requieren medidas especiales de protección contra incendios.`
    )
  }

  if (input.structure.type === 'Datacenter' && risks.R2 > TOLERABLE_RISK.R2) {
    reasons.push(
      `R2 (servicio público) supera tolerable. Se recomienda protección coordinada y redundancia de sistemas.`
    )
  }

  // Recomendaciones sobre líneas
  if (input.services.powerLine?.exists && !input.services.powerLine.isShielded) {
    reasons.push(
      'Línea eléctrica no apantallada. Considere reemplazar con cable apantallado o instalar SPD coordinado.'
    )
  }

  if (input.services.powerLine?.exists && !input.services.powerLine.hasTransformer) {
    reasons.push(
      'Línea eléctrica sin transformador MT/BT. Un transformador reduciría el riesgo en factor 5.'
    )
  }

  return {
    needsProtection,
    recommendedLevel,
    recommendedSPD,
    recommendedFireProtection,
    reasons,
  }
}

/**
 * Calcula el análisis económico para R4
 *
 * @param R4 - Riesgo económico calculado
 * @param input - Datos de entrada
 * @returns Análisis económico
 */
function calculateEconomicAnalysis(
  R4: number,
  input: RiskCalculationInput
): {
  annualLossWithoutProtection: number
  annualLossWithProtection: number
  annualProtectionCost: number
  savingsPerYear: number
  paybackPeriod: number
} {
  // Valor total en riesgo
  const totalValue = input.structure.totalValue + input.structure.contentValue

  // Pérdida anual sin protección
  const annualLossWithoutProtection = R4 * totalValue

  // Estimar pérdida con protección (reducción ~90% con LPS III + SPD)
  const protectionEfficiency = 0.9
  const annualLossWithProtection = annualLossWithoutProtection * (1 - protectionEfficiency)

  // Estimar costo anual de protección
  // Costo inicial: ~2-5% del valor de la estructura
  // Costo anual: ~10% del costo inicial (mantenimiento, inspecciones)
  const initialProtectionCost = input.structure.totalValue * 0.03 // 3% del valor
  const annualProtectionCost = initialProtectionCost * 0.1 // 10% anual

  // Ahorro anual
  const savingsPerYear = annualLossWithoutProtection - annualLossWithProtection - annualProtectionCost

  // Período de retorno
  const paybackPeriod = savingsPerYear > 0 ? initialProtectionCost / savingsPerYear : Infinity

  return {
    annualLossWithoutProtection,
    annualLossWithProtection,
    annualProtectionCost,
    savingsPerYear,
    paybackPeriod,
  }
}

/**
 * Valida los datos de entrada antes del cálculo
 *
 * @param input - Datos de entrada a validar
 * @returns true si es válido, lanza error si no
 * @throws {Error} Si los datos son inválidos
 */
export function validateInput(input: RiskCalculationInput): boolean {
  // Validar dimensiones
  if (input.dimensions.length <= 0 || input.dimensions.width <= 0 || input.dimensions.height <= 0) {
    throw new Error('Las dimensiones deben ser mayores que cero')
  }

  // Validar ocupantes
  if (input.structure.occupants < 0) {
    throw new Error('El número de ocupantes no puede ser negativo')
  }

  // Validar valores económicos
  if (input.structure.totalValue < 0 || input.structure.contentValue < 0) {
    throw new Error('Los valores económicos no pueden ser negativos')
  }

  // Validar servicios
  if (input.services.powerLine?.exists && input.services.powerLine.length <= 0) {
    throw new Error('La longitud de la línea eléctrica debe ser mayor que cero')
  }

  return true
}

/**
 * Calcula escenario con protección propuesta
 *
 * Permite simular el efecto de añadir protección
 *
 * @param input - Datos de entrada actuales
 * @param proposedProtection - Protección propuesta
 * @returns Nuevo resultado con protección propuesta
 */
export function calculateWithProposedProtection(
  input: RiskCalculationInput,
  proposedProtection: {
    lpsLevel?: 'I' | 'II' | 'III' | 'IV'
    spdType?: 'SPD-I' | 'SPD-II' | 'SPD-III' | 'Coordinado'
    hasFireProtection?: boolean
    fireProtectionType?: string
  }
): RiskCalculationResult {
  // Crear copia del input con protección propuesta
  const inputWithProtection: RiskCalculationInput = {
    ...input,
    protection: {
      ...input.protection,
      hasLPS: proposedProtection.lpsLevel !== undefined,
      lpsLevel: proposedProtection.lpsLevel,
      hasSPD: proposedProtection.spdType !== undefined,
      spdType: proposedProtection.spdType,
      hasFireProtection: proposedProtection.hasFireProtection ?? input.protection.hasFireProtection,
      fireProtectionType: proposedProtection.fireProtectionType as any,
    },
  }

  // Recalcular con nueva protección
  return calculateRisk(inputWithProtection)
}

/**
 * Compara resultado actual vs resultado con protección propuesta
 *
 * @param currentResult - Resultado actual sin protección
 * @param proposedResult - Resultado con protección propuesta
 * @returns Análisis comparativo
 */
export function compareProtectionScenarios(
  currentResult: RiskCalculationResult,
  proposedResult: RiskCalculationResult
): {
  reductionR1: number
  reductionR2: number
  reductionR3: number
  reductionR4: number
  reductionPercentR1: number
  reductionPercentR2: number
  reductionPercentR3: number
  reductionPercentR4: number
  meetsRequirements: boolean
} {
  const safePercent = (current: number, proposed: number): number => {
    if (current === 0) return 0
    return ((current - proposed) / current) * 100
  }

  const reductionR1 = currentResult.risks.R1 - proposedResult.risks.R1
  const reductionR2 = currentResult.risks.R2 - proposedResult.risks.R2
  const reductionR3 = currentResult.risks.R3 - proposedResult.risks.R3
  const reductionR4 = currentResult.risks.R4 - proposedResult.risks.R4

  return {
    reductionR1,
    reductionR2,
    reductionR3,
    reductionR4,
    reductionPercentR1: safePercent(currentResult.risks.R1, proposedResult.risks.R1),
    reductionPercentR2: safePercent(currentResult.risks.R2, proposedResult.risks.R2),
    reductionPercentR3: safePercent(currentResult.risks.R3, proposedResult.risks.R3),
    reductionPercentR4: safePercent(currentResult.risks.R4, proposedResult.risks.R4),
    meetsRequirements:
      !proposedResult.comparison.R1_needsProtection &&
      !proposedResult.comparison.R2_needsProtection &&
      !proposedResult.comparison.R3_needsProtection,
  }
}

/**
 * Determina el nivel de protección según la normativa seleccionada
 *
 * @param normative - Normativa a aplicar ('lightning' = IEC 62305, 'cte' = CTE DB-SUA-8)
 * @param R1 - Riesgo R1 (pérdida de vidas humanas)
 * @param structureType - Tipo de estructura
 * @param structureHeight - Altura de la estructura (metros)
 * @returns Nivel de protección recomendado (I-IV) o 'none' si no necesita
 */
export function determineProtectionLevel(
  normative: 'lightning' | 'cte',
  R1: number,
  structureType?: string,
  structureHeight?: number
): 'I' | 'II' | 'III' | 'IV' | '1' | '2' | '3' | '4' | 'none' {
  if (normative === 'cte') {
    // CTE DB-SUA-8: Criterios simplificados
    // El CTE determina el nivel basándose principalmente en la altura
    // CTE usa números arábigos (1, 2, 3, 4) en lugar de romanos

    // Por altura del edificio (criterio principal del CTE)
    if (structureHeight) {
      if (structureHeight >= 43) {
        return '1' // Edificios muy altos - CTE usa números normales
      } else if (structureHeight >= 20) {
        return '2' // Edificios altos
      } else if (structureHeight >= 15) {
        return '3' // Edificios medios
      } else if (structureHeight >= 10) {
        return '4' // Edificios bajos
      }
    }

    // Si no hay altura pero R1 supera tolerable, nivel 3 por defecto
    if (R1 > TOLERABLE_RISK.R1) {
      return '3'
    }

    return 'none'
  } else {
    // IEC 62305: Determinación basada en el riesgo calculado
    // Niveles según factor de superación del riesgo tolerable

    if (R1 > 10 * TOLERABLE_RISK.R1) {
      return 'I' // Riesgo muy alto - Nivel I (eficiencia 98%)
    } else if (R1 > 5 * TOLERABLE_RISK.R1) {
      return 'II' // Riesgo alto - Nivel II (eficiencia 95%)
    } else if (R1 > 2 * TOLERABLE_RISK.R1) {
      return 'III' // Riesgo moderado - Nivel III (eficiencia 90%)
    } else if (R1 > TOLERABLE_RISK.R1) {
      return 'IV' // Riesgo bajo pero supera tolerable - Nivel IV (eficiencia 80%)
    }

    return 'none' // No necesita protección
  }
}
