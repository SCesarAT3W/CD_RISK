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
  { value: 'TCelosia', label: 'Torreta triangular' },
  { value: 'MAutonomo', label: 'Mástil autónomo' },
  { value: 'TAutosoportada', label: 'Torre cuadrada' },
]

// Regla 4: Alturas disponibles según tipo de soporte
export interface MastHeightConfig {
  mastType: string
  heights: SelectOption[]
}

export const MAST_HEIGHTS_BY_TYPE: MastHeightConfig[] = [
  {
    mastType: 'Mastil',
    heights: [
      { value: '2m', label: '2m' },
      { value: '3m', label: '3m' },
      { value: '4m', label: '4m' },
      { value: '6m', label: '6m' },
      { value: '8m', label: '8m' },
    ],
  },
  {
    mastType: 'TCelosia',
    heights: [
      { value: '5.5m', label: '5.5m' },
      { value: '8.5m', label: '8.5m' },
      { value: '11.5m', label: '11.5m' },
      { value: '14.5m', label: '14.5m' },
      { value: '17.5m', label: '17.5m' },
      { value: '20.5m', label: '20.5m' },
      { value: '23.5m', label: '23.5m' },
      { value: '26.5m', label: '26.5m' },
    ],
  },
  {
    mastType: 'TAutosoportada',
    heights: [
      { value: '14m', label: '14m' },
      { value: '16m', label: '16m' },
      { value: '18m', label: '18m' },
      { value: '20m', label: '20m' },
      { value: '22m', label: '22m' },
      { value: '24m', label: '24m' },
      { value: '26m', label: '26m' },
    ],
  },
  {
    mastType: 'MAutonomo',
    heights: [
      { value: '6m', label: '6m' },
      { value: '8m', label: '8m' },
      { value: '10m', label: '10m' },
      { value: '12m', label: '12m' },
      { value: '15m', label: '15m' },
      { value: '18m', label: '18m' },
      { value: '20m', label: '20m' },
      { value: '25m', label: '25m' },
      { value: '30m', label: '30m' },
      { value: '40m', label: '40m' },
    ],
  },
]

// Legacy export for backward compatibility
export const MAST_HEIGHTS: SelectOption[] = [
  { value: '3m', label: '3m' },
  { value: '6m', label: '6m' },
  { value: '8m', label: '8m' },
]

// Regla 6: Anclajes compatibles con alturas de mástil
export interface AnchorHeightCompat {
  value: string
  label: string
  compatibleHeights: string[] // Array de alturas compatibles
}

export const ANCHOR_TYPES_WITH_COMPAT: AnchorHeightCompat[] = [
  // Anclajes para 2m, 3m, 4m y 6m
  { value: 'AnclajePlano3m', label: 'Anclaje tejado plano mast 3m', compatibleHeights: ['2m', '3m'] },
  { value: 'AnclajePlano6m', label: 'Anclaje tejado plano mast 6m', compatibleHeights: ['4m', '6m'] },
  { value: 'AnclajeU15_2-6', label: 'Anclaje en U 15cm (2-6m)', compatibleHeights: ['2m', '3m', '4m', '6m'] },
  { value: 'AnclajeU30_2-6', label: 'Anclaje en U 30cm (2-6m)', compatibleHeights: ['2m', '3m', '4m', '6m'] },
  { value: 'AnclajeU60_2-6', label: 'Anclaje en U 60cm (2-6m)', compatibleHeights: ['2m', '3m', '4m', '6m'] },
  { value: 'AnclajeLigero30_2-6', label: 'Anclaje ligero 30 cm (2-6m)', compatibleHeights: ['2m', '3m', '4m', '6m'] },
  { value: 'AnclajeBrida_2-6', label: 'Anclaje doble brida H (2-6m)', compatibleHeights: ['2m', '3m', '4m', '6m'] },
  { value: 'AnclajeParalelo_2-6', label: 'Anclaje paralelo (2-6m)', compatibleHeights: ['2m', '3m', '4m', '6m'] },
  { value: 'AnclajeAjustable_2-6', label: 'Anclaje ajustable 60/80 (2-6m)', compatibleHeights: ['2m', '3m', '4m', '6m'] },
  { value: 'AnclajeBarra30_2-6', label: 'Anclaje barra 30cm (2-6m)', compatibleHeights: ['2m', '3m', '4m', '6m'] },
  { value: 'AnclajeBarra60_2-6', label: 'Anclaje barra 60cm (2-6m)', compatibleHeights: ['2m', '3m', '4m', '6m'] },
  { value: 'AnclajeBarra100_2-6', label: 'Anclaje barra 100cm (2-6m)', compatibleHeights: ['2m', '3m', '4m', '6m'] },

  // Anclajes para 8m
  { value: 'AnclajeU15_8', label: 'Anclaje en U 15cm (8m)', compatibleHeights: ['8m'] },
  { value: 'AnclajeU30_8', label: 'Anclaje en U 30cm (8m)', compatibleHeights: ['8m'] },
  { value: 'AnclajeU60_8', label: 'Anclaje en U 60cm (8m)', compatibleHeights: ['8m'] },
  { value: 'AnclajeLigero30_8', label: 'Anclaje ligero 30 cm (8m)', compatibleHeights: ['8m'] },
  { value: 'AnclajeBrida_8', label: 'Anclaje doble brida H (8m)', compatibleHeights: ['8m'] },
  { value: 'AnclajeParalelo_8', label: 'Anclaje paralelo (8m)', compatibleHeights: ['8m'] },
  { value: 'AnclajeAjustable_8', label: 'Anclaje ajustable 60/80 (8m)', compatibleHeights: ['8m'] },
  { value: 'AnclajeBarra30_8', label: 'Anclaje barra 30cm (8m)', compatibleHeights: ['8m'] },
  { value: 'AnclajeBarra60_8', label: 'Anclaje barra 60cm (8m)', compatibleHeights: ['8m'] },
]

// Legacy exports for backward compatibility
export const ANCHOR_TYPES: SelectOption[] = ANCHOR_TYPES_WITH_COMPAT.map(a => ({
  value: a.value,
  label: a.label
}))

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

export const PROTECTION_LEVELS_CTE: SelectOption[] = [
  { value: '1', label: 'NIVEL 1' },
  { value: '2', label: 'NIVEL 2' },
  { value: '3', label: 'NIVEL 3' },
  { value: '4', label: 'NIVEL 4' },
]

// === PASO 6: PROTECCIÓN EXTERNA ===

// Regla 7: Material del conductor -> Naturalezas/variantes (jerárquica)
export interface ConductorMaterialConfig {
  type: string
  typeLabel: string
  natures: SelectOption[]
}

export const CONDUCTOR_MATERIALS_HIERARCHICAL: ConductorMaterialConfig[] = [
  {
    type: 'Pletina',
    typeLabel: 'Pletina',
    natures: [
      { value: 'Pletina_CuEst_30x2', label: 'Pletina cobre estañado 30x2mm' },
      { value: 'Pletina_Al_25x3', label: 'Pletina de aluminio 25x3mm' },
    ],
  },
  {
    type: 'Cable',
    typeLabel: 'Cable trenzado',
    natures: [
      { value: 'Cable_Cu_50', label: 'Cable Cu trenzado 50mm²' },
      { value: 'Cable_Cu_70', label: 'Cable Cu trenzado 70mm²' },
    ],
  },
  {
    type: 'Redondo',
    typeLabel: 'Redondo',
    natures: [
      { value: 'Redondo_Cu_8', label: 'Redondo de cobre Ø8mm' },
      { value: 'Redondo_Al_8', label: 'Redondo aleación Al ø8mm' },
    ],
  },
]

// Legacy exports for backward compatibility
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

// Regla 10: Fijaciones compatibles con materiales
export interface FixingMaterialCompat {
  value: string
  label: string
  compatibleMaterials: string[] // Array de materiales compatibles (usar el value de las naturalezas)
}

export const FIXING_TYPES_WITH_COMPAT: FixingMaterialCompat[] = [
  {
    value: 'Grapa_laton_cable',
    label: 'Grapa latón para cable Ø6-10mm',
    compatibleMaterials: ['Cable_Cu_50', 'Cable_Cu_70', 'Redondo_Cu_8'],
  },
  {
    value: 'Grapa_nylon',
    label: 'Grapa nylon cable o pletina 17mm',
    compatibleMaterials: [
      'Pletina_CuEst_30x2',
      'Pletina_Al_25x3',
      'Cable_Cu_50',
      'Cable_Cu_70',
      'Redondo_Cu_8',
      'Redondo_Al_8',
    ],
  },
  {
    value: 'Grapa_inox_cable',
    label: 'Grapa inox para cable Ø6-10mm',
    compatibleMaterials: ['Cable_Cu_50', 'Cable_Cu_70', 'Redondo_Cu_8', 'Redondo_Al_8'],
  },
  {
    value: 'Grapa_hebilla_inox',
    label: 'Grapa hebilla inox 30x2-30x3.5mm',
    compatibleMaterials: ['Pletina_CuEst_30x2', 'Pletina_Al_25x3'],
  },
]

export const FIXING_TYPES: SelectOption[] = FIXING_TYPES_WITH_COMPAT.map(f => ({
  value: f.value,
  label: f.label,
}))

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

/**
 * Regla 4: Gets available heights for a mast type
 */
export function getHeightsByMastType(mastType: string | undefined): SelectOption[] {
  const config = MAST_HEIGHTS_BY_TYPE.find((c) => c.mastType === mastType)
  return config?.heights || []
}

/**
 * Regla 6: Gets anchors compatible with a specific mast height
 * Only applies to Mástil type
 */
export function getAnchorsByHeight(height: string | undefined): SelectOption[] {
  if (!height) return []
  return ANCHOR_TYPES_WITH_COMPAT
    .filter((anchor) => anchor.compatibleHeights.includes(height))
    .map((anchor) => ({
      value: anchor.value,
      label: anchor.label,
    }))
}

/**
 * Regla 7: Gets natures/variants for a conductor material type
 */
export function getNaturesByMaterialType(materialType: string | undefined): SelectOption[] {
  const config = CONDUCTOR_MATERIALS_HIERARCHICAL.find((c) => c.type === materialType)
  return config?.natures || []
}

/**
 * Regla 10: Gets fixings compatible with a specific material nature
 */
export function getFixingsByMaterial(materialNature: string | undefined): SelectOption[] {
  if (!materialNature) {
    // If no material selected, show all fixings
    return FIXING_TYPES
  }
  return FIXING_TYPES_WITH_COMPAT
    .filter((fixing) => fixing.compatibleMaterials.includes(materialNature))
    .map((fixing) => ({
      value: fixing.value,
      label: fixing.label,
    }))
}

/**
 * Helper to get material type from material nature value
 */
export function getMaterialTypeFromNature(nature: string | undefined): string | undefined {
  if (!nature) return undefined
  for (const config of CONDUCTOR_MATERIALS_HIERARCHICAL) {
    if (config.natures.some((n) => n.value === nature)) {
      return config.type
    }
  }
  return undefined
}
