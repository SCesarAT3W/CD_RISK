/**
 * Configuración declarativa para los formularios del proyecto CD-Risk
 * Todos los datos estáticos, opciones de selects, y configuraciones se centralizan aquí
 */

// === PASO 1: DATOS DEL PROYECTO ===

export interface CountryOption {
  value: string
  label: string
}

export const COUNTRIES: CountryOption[] = [
  { value: 'ES', label: 'ESPAÑA' },
  { value: 'PT', label: 'PORTUGAL' },
  { value: 'FR', label: 'FRANCIA' },
  { value: 'MA', label: 'MARRUECOS' },
]

export interface NormativeOption {
  value: 'lightning' | 'cte'
  label: string
}

export const NORMATIVES: NormativeOption[] = [
  { value: 'lightning', label: 'Según normas de protección contra el rayo' },
  { value: 'cte', label: 'Según CTE' },
]

// === PASO 2: DIMENSIONES ===

export interface SelectOption {
  value: string
  label: string
}

export const STRUCTURE_TYPES: SelectOption[] = [
  { value: 'Hormigon', label: 'B. Hormigón.' },
  { value: 'Metal', label: 'Metal' },
  { value: 'Madera', label: 'Madera' },
]

export const FIRE_RISK_LEVELS: SelectOption[] = [
  { value: 'Comun', label: 'B. Común.' },
  { value: 'Alto', label: 'Alto' },
  { value: 'Nulo', label: 'Nulo' },
]

export const SITUATION_OPTIONS: SelectOption[] = [
  { value: 'EstructuraAislada', label: 'C. Estructura aislada.' },
  { value: 'CentroUrbano', label: 'Centro Urbano' },
  { value: 'ZonaRural', label: 'Zona Rural' },
]

export const ENVIRONMENTAL_FACTOR_OPTIONS: SelectOption[] = [
  { value: 'Urbano', label: 'B. Urbano.' },
  { value: 'Rural', label: 'Rural' },
  { value: 'Costero', label: 'Costero' },
]

export const GROUND_TYPE_OPTIONS: SelectOption[] = [
  { value: 'Arenoso', label: 'B. Arenoso.' },
  { value: 'Rocoso', label: 'Rocoso' },
  { value: 'Arcilloso', label: 'Arcilloso' },
]

export const FIRE_PROTECTION_LEVELS: SelectOption[] = [
  { value: 'automatic', label: 'Automático (sprinklers, etc.)' },
  { value: 'manual', label: 'Manual (extintores)' },
  { value: 'none', label: 'Sin protección' },
]

export const ROOF_FIRE_RESISTANCE: SelectOption[] = [
  { value: 'resistant', label: 'Resistente al fuego' },
  { value: 'non_resistant', label: 'No resistente al fuego' },
]

export const YES_NO_OPTIONS: SelectOption[] = [
  { value: 'yes', label: 'Sí' },
  { value: 'no', label: 'No' },
]

// === PASO 3: PÉRDIDAS ===

export const DUE_TO_FIRE_OPTIONS: SelectOption[] = [
  { value: 'A', label: 'C. Ocupadas regularmente.' },
  { value: 'B', label: 'B. Bajo (menos de 100 personas)' },
]

export const RISK_OF_PANIC_OPTIONS: SelectOption[] = [
  { value: 'C', label: 'B. Bajo (menos de 100 personas)' },
  { value: 'D', label: 'D. Moderado' },
]

export const CONSEQUENCES_OF_DAMAGES_OPTIONS: SelectOption[] = [
  { value: 'No aplica', label: 'A. Sin consecuencias.' },
  { value: 'Graves', label: 'Graves' },
]

export const DUE_TO_OVERVOLTAGES_1_OPTIONS: SelectOption[] = [
  { value: 'Comun', label: 'A. No aplica.' },
  { value: 'Critico', label: 'Crítico' },
]

export const LOSS_OF_SERVICES_OPTIONS: SelectOption[] = [
  { value: 'No aplica', label: 'A. No aplica.' },
  { value: 'Interrupcion', label: 'Interrupción' },
]

export const LOSS_OF_CULTURAL_HERITAGE_OPTIONS: SelectOption[] = [
  { value: 'No aplica', label: 'A. No aplica.' },
  { value: 'Irreversible', label: 'Irreversible' },
]

export const SPECIAL_HAZARDS_OPTIONS: SelectOption[] = [
  { value: 'Sin consecuencias', label: 'A. Sin consecuencias.' },
  { value: 'Riesgo', label: 'Riesgo' },
]

export const DUE_TO_FIRE_2_OPTIONS: SelectOption[] = [
  { value: 'Comun', label: 'A. Valor común.' },
  { value: 'Critico', label: 'Crítico' },
]

export const DUE_TO_OVERVOLTAGES_2_OPTIONS: SelectOption[] = [
  { value: 'Comun', label: 'B. Valor común.' },
  { value: 'Critico', label: 'Crítico' },
]

export const DUE_TO_STEP_TOUCH_VOLTAGES_OPTIONS: SelectOption[] = [
  { value: 'Sin riesgo', label: 'A. Sin riesgo de shock.' },
  { value: 'Riesgo', label: 'Riesgo' },
]

export const TOLERABLE_RISK_OPTIONS: SelectOption[] = [
  { value: '1E-03', label: 'C. 1 en 1.000 años.' },
  { value: '1E-04', label: '1 en 10.000 años' },
]

export const CABLE_SITUATION_OPTIONS: SelectOption[] = [
  { value: 'Aereo', label: 'Aéreo' },
  { value: 'Enterrado', label: 'Enterrado' },
  { value: 'NoConectado', label: 'No conectado' },
]

export const CABLE_SHIELDED_OPTIONS: SelectOption[] = [
  { value: 'Apantallado', label: 'Apantallado' },
  { value: 'NoApantallado', label: 'No apantallado' },
]

export const TRANSFORMER_MVLV_OPTIONS: SelectOption[] = [
  { value: 'SinTransformador', label: 'Sin transformador' },
  { value: 'ConTransformador', label: 'Con transformador' },
]

export const SERVICE_TYPE_OPTIONS: SelectOption[] = [
  { value: 'Coaxial', label: 'Coaxial' },
  { value: 'FibraOptica', label: 'Fibra Óptica' },
]

export const BURIED_SERVICE_TYPE_OPTIONS: SelectOption[] = [
  { value: 'No aplica', label: 'No aplica' },
  { value: 'Coaxial', label: 'Coaxial' },
  { value: 'FibraOptica', label: 'Fibra Óptica' },
]

// === PASO 5: ESQUEMA DE PROTECCIÓN ===

export interface HeadConfig {
  type: 'DAT CONTROLER® REMOTE' | 'DAT CONTROLER® PLUS'
  models: string[]
}

export const HEAD_CONFIGS: HeadConfig[] = [
  {
    type: 'DAT CONTROLER® REMOTE',
    models: [
      'DAT CONTROLER REMOTE 15',
      'DAT CONTROLER REMOTE 30',
      'DAT CONTROLER REMOTE 45',
      'DAT CONTROLER REMOTE 60',
    ],
  },
  {
    type: 'DAT CONTROLER® PLUS',
    models: [
      'DAT CONTROLER PLUS 15',
      'DAT CONTROLER PLUS 30',
      'DAT CONTROLER PLUS 45',
      'DAT CONTROLER PLUS 60',
    ],
  },
]

export const MAST_TYPES: SelectOption[] = [
  { value: 'Mastil', label: 'Mástil' },
  { value: 'TCelosia', label: 'Torretas de celosía' },
  { value: 'MAutonomo', label: 'Mástil autónomo' },
  { value: 'TAutosoportada', label: 'Torre autosoportada' },
]

export const MAST_HEIGHTS: SelectOption[] = [
  { value: '3m', label: '3m' },
  { value: '6m', label: '6m' },
  { value: '8m', label: '8m' },
]

export const ANCHOR_TYPES: SelectOption[] = [
  { value: 'AEnU', label: 'Anclaje en U' },
  { value: 'ABAngulo', label: 'Barra en ángulo' },
  { value: 'ALigero', label: 'Ligero' },
  { value: 'EATPlano', label: 'Tejado plano' },
  { value: 'AAjustable', label: 'Ajustable' },
  { value: 'Pared', label: 'Pared' },
  { value: 'Suelo', label: 'Suelo' },
  { value: 'Tejado', label: 'Tejado' },
]

export const ANCHOR_SEPARATION_OPTIONS: SelectOption[] = [
  { value: '15cm', label: '15cm' },
  { value: '30cm', label: '30cm' },
  { value: '60cm', label: '60cm' },
]

export const PROTECTION_LEVELS: SelectOption[] = [
  { value: 'I', label: 'NIVEL I' },
  { value: 'II', label: 'NIVEL II' },
  { value: 'III', label: 'NIVEL III' },
  { value: 'IV', label: 'NIVEL IV' },
]

// === PASO 6: PROTECCIÓN EXTERNA ===

export const CONDUCTOR_TYPES: SelectOption[] = [
  { value: 'cable_50mm2', label: 'Cable de cobre 50mm²' },
  { value: 'cable_70mm2', label: 'Cable de cobre 70mm²' },
  { value: 'pletina_30x2mm', label: 'Pletina de cobre 30x2mm' },
  { value: 'pletina_30x3mm', label: 'Pletina de cobre 30x3mm' },
]

export const CONDUCTOR_MATERIALS: SelectOption[] = [
  { value: 'copper', label: 'Cobre' },
  { value: 'aluminum', label: 'Aluminio' },
  { value: 'galvanized_steel', label: 'Acero galvanizado' },
]

export const ROOF_TYPES: SelectOption[] = [
  { value: 'flat', label: 'Plana' },
  { value: 'sloped', label: 'Inclinada' },
  { value: 'mixed', label: 'Mixta' },
]

export const GROUND_TYPES: SelectOption[] = [
  { value: 'picas', label: 'Picas verticales' },
  { value: 'horizontal', label: 'Conductor horizontal' },
  { value: 'anillo', label: 'Anillo perimetral' },
  { value: 'mixto', label: 'Mixto' },
]

// === PASO 7: PROTECCIÓN INTERNA ===

export const DIFFERENTIAL_OPTIONS: SelectOption[] = [
  { value: '10mA', label: '10mA' },
  { value: '30mA', label: '30mA' },
  { value: '100mA', label: '100mA' },
  { value: '300mA', label: '300mA' },
]

export const VOLTAGE_OPTIONS: SelectOption[] = [
  { value: '120V', label: '120V' },
  { value: '230V', label: '230V' },
  { value: '400V', label: '400V' },
]

// === HELPERS ===

/**
 * Obtiene el label de una opción dado su valor
 */
export function getOptionLabel(options: SelectOption[], value: string): string {
  return options.find((opt) => opt.value === value)?.label || value
}

/**
 * Gets available models for a head type
 */
export function getModelsByType(type: string | undefined): string[] {
  const config = HEAD_CONFIGS.find((c) => c.type === type)
  return config?.models || []
}

/**
 * Gets the head type based on a model
 */
export function getHeadType(model: string): 'DAT CONTROLER® REMOTE' | 'DAT CONTROLER® PLUS' | undefined {
  for (const config of HEAD_CONFIGS) {
    if (config.models.includes(model)) {
      return config.type
    }
  }
  return undefined
}
