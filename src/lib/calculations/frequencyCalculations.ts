/**
 * Cálculo de frecuencias de eventos peligrosos según IEC 62305-2
 * Anexo A - Frequency of dangerous events
 */

import { getNgForRegion, getCdFactor, LINE_INSTALLATION_FACTOR, TRANSFORMER_FACTOR } from './constants'
import type { RiskCalculationInput } from './types'

/**
 * Calcula la frecuencia de impactos directos en la estructura (ND)
 *
 * Fórmula IEC 62305-2: ND = Ng × Ad × Cd × 10⁻⁶
 *
 * @param ng - Densidad de rayos a tierra (rayos/km²/año)
 * @param ad - Área equivalente de colección de la estructura (m²)
 * @param cd - Factor de localización/situación
 * @returns Frecuencia de impactos directos (eventos/año)
 *
 * @example
 * ```typescript
 * const ND = calculateDirectStrikesFrequency(2.5, 30910, 2.0)
 * // ND = 0.154 impactos/año
 * ```
 */
export function calculateDirectStrikesFrequency(
  ng: number,
  ad: number,
  cd: number
): number {
  if (ng <= 0 || ad <= 0 || cd <= 0) {
    throw new Error('Los parámetros deben ser mayores que cero')
  }

  return ng * ad * cd * 1e-6
}

/**
 * Calcula la frecuencia de impactos cercanos a la estructura (NM)
 *
 * Fórmula IEC 62305-2: NM = Ng × Am × 10⁻⁶
 *
 * Los impactos cercanos pueden causar sobretensiones sin impacto directo
 *
 * @param ng - Densidad de rayos a tierra (rayos/km²/año)
 * @param am - Área equivalente de colección para impactos cercanos (m²)
 * @returns Frecuencia de impactos cercanos (eventos/año)
 */
export function calculateNearbyStrikesFrequency(ng: number, am: number): number {
  if (ng <= 0 || am <= 0) {
    throw new Error('Los parámetros deben ser mayores que cero')
  }

  return ng * am * 1e-6
}

/**
 * Calcula la frecuencia de impactos directos en líneas eléctricas (NL)
 *
 * Fórmula IEC 62305-2: NL = Ng × Al × Cl × Ct × 10⁻⁶
 *
 * @param ng - Densidad de rayos a tierra (rayos/km²/año)
 * @param al - Área equivalente de colección de la línea (m²)
 * @param cl - Factor de instalación de la línea (1.0 aérea, 0.5 enterrada)
 * @param ct - Factor de transformador (1.0 sin transformador, 0.2 con transformador)
 * @returns Frecuencia de impactos en línea eléctrica (eventos/año)
 */
export function calculateLineStrikesFrequency(
  ng: number,
  al: number,
  cl: number,
  ct: number = 1.0
): number {
  if (ng <= 0 || al < 0 || cl <= 0 || ct <= 0) {
    throw new Error('Los parámetros deben ser válidos')
  }

  // Si no hay línea (Al = 0), retornar 0
  if (al === 0) return 0

  return ng * al * cl * ct * 1e-6
}

/**
 * Calcula la frecuencia de impactos cercanos a líneas eléctricas (NI)
 *
 * Fórmula IEC 62305-2: NI = Ng × Ai × Ci × Ct × 10⁻⁶
 *
 * @param ng - Densidad de rayos a tierra (rayos/km²/año)
 * @param ai - Área equivalente de colección para impactos cercanos a la línea (m²)
 * @param ci - Factor de instalación para impactos cercanos
 * @param ct - Factor de transformador
 * @returns Frecuencia de impactos cercanos a línea (eventos/año)
 */
export function calculateLineNearbyStrikesFrequency(
  ng: number,
  ai: number,
  ci: number,
  ct: number = 1.0
): number {
  if (ng <= 0 || ai < 0 || ci <= 0 || ct <= 0) {
    throw new Error('Los parámetros deben ser válidos')
  }

  // Si no hay línea (Ai = 0), retornar 0
  if (ai === 0) return 0

  return ng * ai * ci * ct * 1e-6
}

/**
 * Calcula la frecuencia de impactos directos en líneas de telecomunicaciones (NU)
 *
 * Similar a NL pero para líneas de telecomunicaciones
 *
 * @param ng - Densidad de rayos a tierra (rayos/km²/año)
 * @param au - Área equivalente de colección de la línea telecom (m²)
 * @param cu - Factor de instalación de la línea
 * @returns Frecuencia de impactos en línea telecom (eventos/año)
 */
export function calculateTelecomLineStrikesFrequency(
  ng: number,
  au: number,
  cu: number
): number {
  if (ng <= 0 || au < 0 || cu <= 0) {
    throw new Error('Los parámetros deben ser válidos')
  }

  if (au === 0) return 0

  return ng * au * cu * 1e-6
}

/**
 * Calcula la frecuencia de impactos cercanos a líneas de telecomunicaciones (NV)
 *
 * @param ng - Densidad de rayos a tierra (rayos/km²/año)
 * @param av - Área equivalente de colección para impactos cercanos (m²)
 * @param cv - Factor de instalación para impactos cercanos
 * @returns Frecuencia de impactos cercanos a línea telecom (eventos/año)
 */
export function calculateTelecomLineNearbyStrikesFrequency(
  ng: number,
  av: number,
  cv: number
): number {
  if (ng <= 0 || av < 0 || cv <= 0) {
    throw new Error('Los parámetros deben ser válidos')
  }

  if (av === 0) return 0

  return ng * av * cv * 1e-6
}

/**
 * Interfaz para los datos de frecuencia calculados
 */
export interface FrequencyData {
  ND: number // Impactos directos en estructura
  NM: number // Impactos cercanos a estructura
  NL: number // Impactos directos en línea eléctrica
  NI: number // Impactos cercanos a línea eléctrica
  NU: number // Impactos directos en línea telecom
  NV: number // Impactos cercanos a línea telecom
  NW: number // (Reservado para extensiones futuras)
  NZ: number // (Reservado para extensiones futuras)
}

/**
 * FUNCIÓN PRINCIPAL
 * Calcula todas las frecuencias de eventos peligrosos
 *
 * @param input - Datos de entrada del cálculo de riesgo
 * @param collectionAreas - Áreas de colección previamente calculadas
 * @returns Objeto con todas las frecuencias calculadas
 *
 * @example
 * ```typescript
 * const frequencies = calculateAllFrequencies(input, areas)
 * console.log(`ND = ${frequencies.ND} impactos/año`)
 * ```
 */
export function calculateAllFrequencies(
  input: RiskCalculationInput,
  collectionAreas: {
    Ad: number
    Am: number
    Al: number
    Ai: number
    Au: number
    Av: number
  }
): FrequencyData {
  // Obtener densidad de rayos (Ng)
  const ng = input.location.ng || getNgForRegion(input.location.province)

  // Obtener factor de localización (Cd)
  const cd = getCdFactor(input.location.situation)

  // === FRECUENCIAS DE ESTRUCTURA ===

  // ND: Impactos directos en estructura
  const ND = calculateDirectStrikesFrequency(ng, collectionAreas.Ad, cd)

  // NM: Impactos cercanos a estructura
  const NM = calculateNearbyStrikesFrequency(ng, collectionAreas.Am)

  // === FRECUENCIAS DE LÍNEA ELÉCTRICA ===

  let NL = 0
  let NI = 0

  if (input.services.powerLine?.exists && input.services.powerLine.length > 0) {
    // Factor de instalación (Cl)
    const cl =
      LINE_INSTALLATION_FACTOR[input.services.powerLine.situation] ||
      LINE_INSTALLATION_FACTOR.Aereas

    // Factor de transformador (Ct)
    const ct = input.services.powerLine.hasTransformer
      ? TRANSFORMER_FACTOR.ConTransformador
      : TRANSFORMER_FACTOR.SinTransformador

    // NL: Impactos directos en línea
    NL = calculateLineStrikesFrequency(ng, collectionAreas.Al, cl, ct)

    // NI: Impactos cercanos a línea
    // Ci es típicamente el mismo que Cl
    NI = calculateLineNearbyStrikesFrequency(ng, collectionAreas.Ai, cl, ct)
  }

  // === FRECUENCIAS DE LÍNEA TELECOM ===

  let NU = 0
  let NV = 0

  if (input.services.telecomLines?.exists) {
    // Factor de instalación (Cu)
    const cu =
      LINE_INSTALLATION_FACTOR[input.services.telecomLines.situation] ||
      LINE_INSTALLATION_FACTOR.Aereas

    // NU: Impactos directos en línea telecom
    NU = calculateTelecomLineStrikesFrequency(ng, collectionAreas.Au, cu)

    // NV: Impactos cercanos a línea telecom
    NV = calculateTelecomLineNearbyStrikesFrequency(ng, collectionAreas.Av, cu)
  }

  // === FRECUENCIAS ADICIONALES (W, Z) ===
  // Reservadas para extensiones futuras o líneas adicionales
  const NW = 0
  const NZ = 0

  return {
    ND,
    NM,
    NL,
    NI,
    NU,
    NV,
    NW,
    NZ,
  }
}

/**
 * Calcula la frecuencia total de eventos que afectan a la estructura
 *
 * @param frequencies - Datos de frecuencias calculadas
 * @returns Suma de todas las frecuencias relevantes
 */
export function calculateTotalFrequency(frequencies: FrequencyData): number {
  return frequencies.ND + frequencies.NM + frequencies.NL + frequencies.NI + frequencies.NU + frequencies.NV
}

/**
 * Obtiene un resumen legible de las frecuencias calculadas
 *
 * @param frequencies - Datos de frecuencias
 * @returns Objeto con valores formateados para display
 */
export function getFrequencySummary(frequencies: FrequencyData): {
  structure: { direct: string; nearby: string }
  powerLine: { direct: string; nearby: string }
  telecomLine: { direct: string; nearby: string }
  total: string
} {
  const formatFreq = (n: number): string => {
    if (n === 0) return '0'
    if (n < 0.001) return n.toExponential(2)
    return n.toFixed(4)
  }

  return {
    structure: {
      direct: formatFreq(frequencies.ND),
      nearby: formatFreq(frequencies.NM),
    },
    powerLine: {
      direct: formatFreq(frequencies.NL),
      nearby: formatFreq(frequencies.NI),
    },
    telecomLine: {
      direct: formatFreq(frequencies.NU),
      nearby: formatFreq(frequencies.NV),
    },
    total: formatFreq(calculateTotalFrequency(frequencies)),
  }
}

/**
 * Valida que las frecuencias calculadas estén en rangos razonables
 *
 * @param frequencies - Frecuencias a validar
 * @returns Objeto con estado de validación y advertencias
 */
export function validateFrequencies(frequencies: FrequencyData): {
  isValid: boolean
  warnings: string[]
} {
  const warnings: string[] = []

  // Verificar valores negativos
  Object.entries(frequencies).forEach(([key, value]) => {
    if (value < 0) {
      warnings.push(`${key} tiene valor negativo: ${value}`)
    }
  })

  // Verificar valores extremadamente altos (> 10 eventos/año)
  const total = calculateTotalFrequency(frequencies)
  if (total > 10) {
    warnings.push(`Frecuencia total muy alta: ${total.toFixed(2)} eventos/año. Revisar datos de entrada.`)
  }

  // Verificar si ND es mucho mayor que lo esperado
  if (frequencies.ND > 1) {
    warnings.push(
      `ND muy alto: ${frequencies.ND.toFixed(3)} eventos/año. Esto indica una estructura muy grande o en zona de alta actividad de rayos.`
    )
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  }
}
