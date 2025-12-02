/**
 * Constantes y tablas para cálculos IEC 62305-2
 * Gestión de riesgo de rayos
 */

/**
 * Riesgos Tolerables (RT) según IEC 62305-2
 */
export const TOLERABLE_RISK = {
  R1: 1e-5, // Pérdida de vidas humanas (1 en 100,000)
  R2: 1e-3, // Pérdida de servicio público (1 en 1,000)
  R3: 1e-3, // Pérdida de patrimonio cultural (1 en 1,000)
  // R4 no tiene RT definido (se evalúa costo-beneficio)
} as const

/**
 * Factor de localización (Cd) según situación de la estructura
 * Tabla A.1 de IEC 62305-2
 */
export const LOCATION_FACTOR: Record<string, number> = {
  EstructuraAislada: 2.0,
  RodeadaMasAltos: 0.5,
  RodeadaAlturaSimilar: 1.0,
  CentroUrbano: 0.25,
} as const

/**
 * Densidad de rayos a tierra (Ng) por región - España
 * Valores en rayos/km²/año
 * Nota: Aplicar factor de seguridad 1.25 según recomendación IEC
 */
export const LIGHTNING_DENSITY: Record<string, number> = {
  // Norte
  Galicia: 1.5,
  Asturias: 1.5,
  Cantabria: 2.0,
  PaisVasco: 2.0,

  // Centro
  Madrid: 2.5,
  CastillaLeon: 2.0,
  CastillaLaMancha: 3.0,
  Extremadura: 3.0,

  // Levante
  Valencia: 4.0,
  Murcia: 3.5,
  Cataluna: 3.0,

  // Sur
  Andalucia: 3.0,

  // Islas
  Baleares: 2.5,
  Canarias: 2.0,

  // Zonas especiales
  Montanoso: 6.0,

  // Por defecto
  Default: 2.5,
} as const

/**
 * Factor de seguridad para Ng
 */
export const NG_SAFETY_FACTOR = 1.25

/**
 * Factor ambiental (Ce)
 */
export const ENVIRONMENTAL_FACTOR: Record<string, number> = {
  Urbano: 0.5,
  Suburbano: 1.0,
  Rural: 1.5,
  Montanoso: 2.0,
} as const

/**
 * Probabilidad según nivel de protección
 * Para PA, PB (protección física)
 */
export const PROTECTION_PROBABILITY: Record<string, number> = {
  None: 1.0,
  I: 0.2,
  II: 0.1,
  III: 0.05,
  IV: 0.02,
} as const

/**
 * Probabilidad PTA (tensiones de paso/contacto)
 * Tabla B.1 de IEC 62305-2
 */
export const TOUCH_VOLTAGE_PROBABILITY: Record<string, number> = {
  // Sin protección
  SinProteccion: 1.0,
  // Con protección básica (aislamiento)
  Aislamiento: 0.01,
  // Con medidas adicionales
  ConMedidas: 0.001,
} as const

/**
 * Probabilidad PSPD (Dispositivos de Protección contra Sobretensiones)
 * Tabla B.3 de IEC 62305-2
 */
export const SPD_PROBABILITY: Record<string, number> = {
  // Sin SPD
  None: 1.0,
  // Con SPD según nivel
  'SPD-I': 0.05,
  'SPD-II': 0.02,
  'SPD-III': 0.01,
  // SPD coordinado
  Coordinado: 0.005,
} as const

/**
 * Factor de reducción por tipo de superficie (rt)
 * Para cálculo de LA
 */
export const SURFACE_REDUCTION_FACTOR: Record<string, number> = {
  // Superficies conductoras
  Asfalto: 0.01,
  Hormigon: 0.01,
  Baldosa: 0.01,
  // Superficies aislantes
  Grava: 0.0001,
  Moqueta: 0.0001,
  Madera: 0.0001,
} as const

/**
 * Factor de reducción por protección contra incendios (rp)
 */
export const FIRE_PROTECTION_FACTOR: Record<string, number> = {
  SinProteccion: 1.0,
  Detectores: 0.5,
  ExtintoresAutomaticos: 0.2,
  Hidrantes: 0.5,
  SistemaCompleto: 0.1, // Detectores + Extinción automática
} as const

/**
 * Factor de riesgo de incendio (rf)
 * Tabla C.3 de IEC 62305-2
 */
export const FIRE_RISK_FACTOR: Record<string, number> = {
  Nulo: 0.0,
  Bajo: 0.5,
  Comun: 1.0,
  Alto: 2.0,
  MuyAlto: 3.0,
} as const

/**
 * Factor de incremento por peligro especial (hu)
 * Tabla C.4 de IEC 62305-2
 */
export const SPECIAL_HAZARD_FACTOR: Record<string, number> = {
  Normal: 1.0,
  PanicoLimitado: 2.0, // < 100 personas
  PanicoModerado: 5.0, // Dificultad de evacuación
  PanicoAlto: 10.0, // Hospital, escuela, guardería
  Explosivos: 20.0, // Riesgo de explosión
} as const

/**
 * Tipo de pérdida (LT)
 * Valores típicos según tipo de estructura
 */
export const LOSS_TYPE_FACTOR: Record<string, number> = {
  // Pérdida de vidas humanas
  VidasHumanas: 1.0,
  // Pérdida de servicio
  ServicioLimitado: 0.5,
  ServicioImportante: 1.0,
  // Pérdida de patrimonio
  PatrimonioBajo: 0.5,
  PatrimonioAlto: 1.0,
} as const

/**
 * Eficiencia de protección por nivel LPL
 */
export const PROTECTION_EFFICIENCY: Record<string, number> = {
  I: 0.98,
  II: 0.95,
  III: 0.90,
  IV: 0.80,
} as const

/**
 * Constantes matemáticas útiles
 */
export const MATH_CONSTANTS = {
  PI: Math.PI,
  NINE_PI: 9 * Math.PI, // ≈ 28.27
} as const

/**
 * Tipo de estructura - para factores de pérdida
 */
export const STRUCTURE_TYPE_FACTORS: Record<
  string,
  {
    occupancyFactor: number
    valueFactor: number
    hazardFactor: number
  }
> = {
  Residencial: {
    occupancyFactor: 1.0,
    valueFactor: 1.0,
    hazardFactor: 1.0,
  },
  Comercial: {
    occupancyFactor: 1.2,
    valueFactor: 1.5,
    hazardFactor: 1.0,
  },
  Industrial: {
    occupancyFactor: 0.8,
    valueFactor: 2.0,
    hazardFactor: 1.5,
  },
  Hospital: {
    occupancyFactor: 1.5,
    valueFactor: 2.0,
    hazardFactor: 10.0,
  },
  Escuela: {
    occupancyFactor: 2.0,
    valueFactor: 1.0,
    hazardFactor: 5.0,
  },
  Museo: {
    occupancyFactor: 1.0,
    valueFactor: 5.0,
    hazardFactor: 1.0,
  },
  Datacenter: {
    occupancyFactor: 0.5,
    valueFactor: 10.0,
    hazardFactor: 1.0,
  },
} as const

/**
 * Factor de instalación de líneas (Cl, Ci)
 */
export const LINE_INSTALLATION_FACTOR: Record<string, number> = {
  Aereas: 1.0,
  Enterradas: 0.5,
  EnTuberia: 0.3,
} as const

/**
 * Factor de transformador (Ct)
 */
export const TRANSFORMER_FACTOR: Record<string, number> = {
  SinTransformador: 1.0,
  ConTransformador: 0.2, // Transformador MT/BT reduce riesgo
} as const

/**
 * Factor de apantallamiento de cable (PSPD para líneas)
 */
export const CABLE_SHIELDING_FACTOR: Record<string, number> = {
  NoApantallado: 1.0,
  Apantallado: 0.1,
  ApantalladoYConectado: 0.01,
} as const

/**
 * Obtener Ng para una región con factor de seguridad aplicado
 */
export function getNgForRegion(region: string): number {
  const baseNg = LIGHTNING_DENSITY[region] || LIGHTNING_DENSITY.Default
  return baseNg * NG_SAFETY_FACTOR
}

/**
 * Obtener factor Cd según situación
 */
export function getCdFactor(situation: string): number {
  return LOCATION_FACTOR[situation] || LOCATION_FACTOR.EstructuraAislada
}

/**
 * Obtener probabilidad según nivel de protección
 */
export function getProtectionProbability(level: string | undefined): number {
  if (!level) return PROTECTION_PROBABILITY.None
  return PROTECTION_PROBABILITY[level] || PROTECTION_PROBABILITY.None
}

/**
 * Obtener eficiencia de protección
 */
export function getProtectionEfficiency(level: string | undefined): number {
  if (!level) return 0
  return PROTECTION_EFFICIENCY[level] || 0
}
