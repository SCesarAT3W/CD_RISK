/**
 * Tipos e interfaces para cálculos IEC 62305-2
 */

/**
 * Datos de entrada para el cálculo de riesgo
 */
export interface RiskCalculationInput {
  // === DIMENSIONES DE LA ESTRUCTURA ===
  dimensions: {
    length: number // Longitud (m)
    width: number // Anchura (m)
    height: number // Altura (m)
    protrusionHeight?: number // Altura de prominencias (m)
  }

  // === UBICACIÓN Y ENTORNO ===
  location: {
    province: string // Provincia/región para obtener Ng
    ng?: number // Densidad de rayos (si se proporciona manualmente)
    situation:
      | 'EstructuraAislada'
      | 'RodeadaMasAltos'
      | 'RodeadaAlturaSimilar'
      | 'CentroUrbano' // Factor Cd
    environmentalFactor: 'Urbano' | 'Suburbano' | 'Rural' | 'Montanoso' // Factor Ce
    groundType: 'Rocoso' | 'Arenoso' | 'Arcilloso' // Tipo de terreno
  }

  // === TIPO DE ESTRUCTURA ===
  structure: {
    type:
      | 'Residencial'
      | 'Comercial'
      | 'Industrial'
      | 'Hospital'
      | 'Escuela'
      | 'Museo'
      | 'Datacenter'
    typeOfConstruction: 'Hormigon' | 'Metal' | 'Madera' // Material
    fireRisk: 'Nulo' | 'Bajo' | 'Comun' | 'Alto' | 'MuyAlto'
    occupants: number // Número de ocupantes
    totalValue: number // Valor total de la estructura (€)
    contentValue: number // Valor del contenido (€)
    isWorkplace: boolean // ¿Es centro de trabajo?
    isNewConstruction: boolean // ¿Es obra nueva?
  }

  // === PROTECCIÓN ACTUAL ===
  protection: {
    // Protección externa
    hasLPS: boolean // ¿Tiene sistema de protección contra rayos?
    lpsLevel?: 'I' | 'II' | 'III' | 'IV' // Nivel de protección LPS
    hasEquipotential: boolean // ¿Tiene enlace equipotencial?

    // Protección interna
    hasSPD: boolean // ¿Tiene SPD?
    spdType?: 'SPD-I' | 'SPD-II' | 'SPD-III' | 'Coordinado'
    hasFireProtection: boolean // ¿Tiene protección contra incendios?
    fireProtectionType?:
      | 'SinProteccion'
      | 'Detectores'
      | 'ExtintoresAutomaticos'
      | 'Hidrantes'
      | 'SistemaCompleto'

    // Aislamiento
    surfaceType?:
      | 'Asfalto'
      | 'Hormigon'
      | 'Baldosa'
      | 'Grava'
      | 'Moqueta'
      | 'Madera'
  }

  // === SERVICIOS (LÍNEAS) ===
  services: {
    // Líneas eléctricas
    powerLine?: {
      exists: boolean
      situation: 'Aereas' | 'Enterradas' | 'EnTuberia'
      isShielded: boolean
      hasTransformer: boolean
      length: number // Longitud de la línea (m)
    }

    // Líneas de telecomunicaciones
    telecomLines?: {
      exists: boolean
      situation: 'Aereas' | 'Enterradas' | 'EnTuberia'
      isShielded: boolean
      count: number // Número de líneas
      length: number // Longitud de la línea (m)
    }
  }

  // === FACTORES DE PÉRDIDA ESPECÍFICOS ===
  lossFactors?: {
    specialHazard?:
      | 'Normal'
      | 'PanicoLimitado'
      | 'PanicoModerado'
      | 'PanicoAlto'
      | 'Explosivos'
    culturalHeritageValue?: number // Valor patrimonial
    serviceImportance?: 'ServicioLimitado' | 'ServicioImportante'
  }
}

/**
 * Resultado del cálculo de riesgo
 */
export interface RiskCalculationResult {
  // === RIESGOS CALCULADOS ===
  risks: {
    R1: number // Pérdida de vidas humanas
    R2: number // Pérdida de servicio público
    R3: number // Pérdida de patrimonio cultural
    R4: number // Pérdida económica
  }

  // === COMPONENTES DE RIESGO ===
  components: {
    // Para R1
    RA1: number
    RB1: number
    RC1: number
    RM1: number
    RU1: number
    RV1: number
    RW1: number
    RZ1: number

    // Para R2
    RB2: number
    RC2: number
    RM2: number
    RV2: number
    RW2: number
    RZ2: number

    // Para R3
    RB3: number
    RV3: number

    // Para R4
    RA4: number
    RB4: number
    RC4: number
    RM4: number
    RU4: number
    RV4: number
    RW4: number
    RZ4: number
  }

  // === COMPARACIÓN CON RIESGO TOLERABLE ===
  comparison: {
    R1_tolerable: number // RT1 = 1×10⁻⁵
    R2_tolerable: number // RT2 = 1×10⁻³
    R3_tolerable: number // RT3 = 1×10⁻³

    R1_needsProtection: boolean // R1 > RT1
    R2_needsProtection: boolean
    R3_needsProtection: boolean
  }

  // === RECOMENDACIÓN ===
  recommendation: {
    needsProtection: boolean // Si algún riesgo excede RT
    recommendedLevel: 'I' | 'II' | 'III' | 'IV' | 'none'
    recommendedSPD: boolean
    recommendedFireProtection: boolean
  }

  // === DATOS INTERMEDIOS (PARA DEBUGGING) ===
  intermediateData: {
    // Frecuencias
    frequencies: {
      ND: number // Impactos directos en estructura
      NM: number // Impactos cercanos a estructura
      NL: number // Impactos en línea eléctrica
      NI: number // Impactos cerca de línea
      NU: number // Impactos en línea telecom
      NV: number // Impactos cerca de línea telecom
    }

    // Áreas de colección
    collectionAreas: {
      Ad: number // Área de estructura (m²)
      Am: number // Área de impactos cercanos
      Al: number // Área de línea eléctrica
      Ai: number // Área cercana a línea
    }

    // Probabilidades
    probabilities: {
      PA: number
      PB: number
      PC: number
      PM: number
      PU: number
      PV: number
      PW: number
      PZ: number
    }

    // Factores de pérdida
    lossFactors: {
      LA: number
      LB: number
      LC: number
      LM: number
      LU: number
      LV: number
      LW: number
      LZ: number
    }
  }

  // === ANÁLISIS ECONÓMICO (Para R4) ===
  economicAnalysis?: {
    annualLossWithoutProtection: number // Pérdida anual sin protección
    annualLossWithProtection: number // Pérdida anual con protección
    annualProtectionCost: number // Costo anual de la protección
    savingsPerYear: number // Ahorro anual
    paybackPeriod: number // Período de retorno (años)
  }
}

/**
 * Parámetros para recalcular con protección propuesta
 */
export interface ProtectionScenario {
  lpsLevel: 'I' | 'II' | 'III' | 'IV'
  hasSPD: boolean
  spdType?: 'SPD-I' | 'SPD-II' | 'SPD-III' | 'Coordinado'
  hasFireProtection: boolean
  fireProtectionType?:
    | 'SinProteccion'
    | 'Detectores'
    | 'ExtintoresAutomaticos'
    | 'Hidrantes'
    | 'SistemaCompleto'
  estimatedCost: number // Costo de implementación
}

/**
 * Resultado de comparación de escenarios
 */
export interface ScenarioComparison {
  withoutProtection: RiskCalculationResult
  withProtection: RiskCalculationResult
  protectionScenario: ProtectionScenario
  isEffective: boolean // Si reduce riesgos por debajo de RT
  costBenefit: {
    totalInvestment: number
    annualSavings: number
    paybackYears: number
    recommendImplementation: boolean
  }
}

/**
 * Datos exportables para reporting
 */
export interface RiskAssessmentReport {
  project: {
    name: string
    location: string
    date: string
    calculatedBy: string
  }
  input: RiskCalculationInput
  result: RiskCalculationResult
  recommendations: string[]
  normativeCompliance: {
    IEC62305: boolean
    UNE21186: boolean
  }
}

/**
 * Errores de validación
 */
export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

/**
 * Resultado de validación de entrada
 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}
