/**
 * Configuración declarativa para los formularios del proyecto CD-Risk
 * Todos los datos estáticos, opciones de selects, y configuraciones se centralizan aquí
 */

import type { BilingualLabel } from '@/lib/i18n-labels'
import { transformLabel } from '@/lib/i18n-labels'

// === PASO 1: DATOS DEL PROYECTO ===

export interface CountryOption {
  value: string
  label: string | BilingualLabel
}

export const COUNTRIES: CountryOption[] = [
  { value: 'ES', label: { es: 'ESPAÑA', en: 'SPAIN' } },
  { value: 'PT', label: { es: 'PORTUGAL', en: 'PORTUGAL' } },
  { value: 'FR', label: { es: 'FRANCIA', en: 'FRANCE' } },
  { value: 'MA', label: { es: 'MARRUECOS', en: 'MOROCCO' } },
]

export interface NormativeOption {
  value: 'lightning' | 'cte'
  label: string | BilingualLabel
}

export const NORMATIVES: NormativeOption[] = [
  { value: 'lightning', label: { es: 'Según normas de protección contra el rayo', en: 'According to lightning protection standards' } },
  { value: 'cte', label: { es: 'Según CTE', en: 'According to CTE' } },
]

// === PASO 2: DIMENSIONES ===

export interface SelectOption {
  value: string
  label: string | BilingualLabel // Soporta labels simples o bilingües
}

export const STRUCTURE_TYPES: SelectOption[] = [
  { value: 'Hormigon', label: { es: 'B. Hormigón.', en: 'B. Concrete.' } },
  { value: 'Metal', label: { es: 'Metal', en: 'Metal' } },
  { value: 'Madera', label: { es: 'Madera', en: 'Wood' } },
]

export const FIRE_RISK_LEVELS: SelectOption[] = [
  { value: 'Comun', label: { es: 'B. Común.', en: 'B. Common.' } },
  { value: 'Alto', label: { es: 'Alto', en: 'High' } },
  { value: 'Nulo', label: { es: 'Nulo', en: 'None' } },
]

export const SITUATION_OPTIONS: SelectOption[] = [
  { value: 'EstructuraAislada', label: { es: 'C. Estructura aislada.', en: 'C. Isolated structure.' } },
  { value: 'CentroUrbano', label: { es: 'Centro Urbano', en: 'Urban Center' } },
  { value: 'ZonaRural', label: { es: 'Zona Rural', en: 'Rural Area' } },
]

export const ENVIRONMENTAL_FACTOR_OPTIONS: SelectOption[] = [
  { value: 'Urbano', label: { es: 'B. Urbano.', en: 'B. Urban.' } },
  { value: 'Rural', label: { es: 'Rural', en: 'Rural' } },
  { value: 'Costero', label: { es: 'Costero', en: 'Coastal' } },
]

export const GROUND_TYPE_OPTIONS: SelectOption[] = [
  { value: 'Arenoso', label: { es: 'B. Arenoso.', en: 'B. Sandy.' } },
  { value: 'Rocoso', label: { es: 'Rocoso', en: 'Rocky' } },
  { value: 'Arcilloso', label: { es: 'Arcilloso', en: 'Clay' } },
]

export const FIRE_PROTECTION_LEVELS: SelectOption[] = [
  { value: 'automatic', label: { es: 'Automático (sprinklers, etc.)', en: 'Automatic (sprinklers, etc.)' } },
  { value: 'manual', label: { es: 'Manual (extintores)', en: 'Manual (extinguishers)' } },
  { value: 'none', label: { es: 'Sin protección', en: 'No protection' } },
]

export const ROOF_FIRE_RESISTANCE: SelectOption[] = [
  { value: 'resistant', label: { es: 'Resistente al fuego', en: 'Fire resistant' } },
  { value: 'non_resistant', label: { es: 'No resistente al fuego', en: 'Non fire resistant' } },
]

export const YES_NO_OPTIONS: SelectOption[] = [
  { value: 'yes', label: { es: 'Sí', en: 'Yes' } },
  { value: 'no', label: { es: 'No', en: 'No' } },
]

// === PASO 3: PÉRDIDAS ===

export const DUE_TO_FIRE_OPTIONS: SelectOption[] = [
  { value: 'A', label: { es: 'C. Ocupadas regularmente.', en: 'C. Regularly occupied.' } },
  { value: 'B', label: { es: 'B. Bajo (menos de 100 personas)', en: 'B. Low (less than 100 people)' } },
]

export const RISK_OF_PANIC_OPTIONS: SelectOption[] = [
  { value: 'C', label: { es: 'B. Bajo (menos de 100 personas)', en: 'B. Low (less than 100 people)' } },
  { value: 'D', label: { es: 'D. Moderado', en: 'D. Moderate' } },
]

export const CONSEQUENCES_OF_DAMAGES_OPTIONS: SelectOption[] = [
  { value: 'No aplica', label: { es: 'A. Sin consecuencias.', en: 'A. No consequences.' } },
  { value: 'Graves', label: { es: 'Graves', en: 'Severe' } },
]

export const DUE_TO_OVERVOLTAGES_1_OPTIONS: SelectOption[] = [
  { value: 'Comun', label: { es: 'A. No aplica.', en: 'A. Not applicable.' } },
  { value: 'Critico', label: { es: 'Crítico', en: 'Critical' } },
]

export const LOSS_OF_SERVICES_OPTIONS: SelectOption[] = [
  { value: 'No aplica', label: { es: 'A. No aplica.', en: 'A. Not applicable.' } },
  { value: 'Interrupcion', label: { es: 'Interrupción', en: 'Interruption' } },
]

export const LOSS_OF_CULTURAL_HERITAGE_OPTIONS: SelectOption[] = [
  { value: 'No aplica', label: { es: 'A. No aplica.', en: 'A. Not applicable.' } },
  { value: 'Irreversible', label: { es: 'Irreversible', en: 'Irreversible' } },
]

export const SPECIAL_HAZARDS_OPTIONS: SelectOption[] = [
  { value: 'Sin consecuencias', label: { es: 'A. Sin consecuencias.', en: 'A. No consequences.' } },
  { value: 'Riesgo', label: { es: 'Riesgo', en: 'Risk' } },
]

export const DUE_TO_FIRE_2_OPTIONS: SelectOption[] = [
  { value: 'Comun', label: { es: 'A. Valor común.', en: 'A. Common value.' } },
  { value: 'Critico', label: { es: 'Crítico', en: 'Critical' } },
]

export const DUE_TO_OVERVOLTAGES_2_OPTIONS: SelectOption[] = [
  { value: 'Comun', label: { es: 'B. Valor común.', en: 'B. Common value.' } },
  { value: 'Critico', label: { es: 'Crítico', en: 'Critical' } },
]

export const DUE_TO_STEP_TOUCH_VOLTAGES_OPTIONS: SelectOption[] = [
  { value: 'Sin riesgo', label: { es: 'A. Sin riesgo de shock.', en: 'A. No shock risk.' } },
  { value: 'Riesgo', label: { es: 'Riesgo', en: 'Risk' } },
]

export const TOLERABLE_RISK_OPTIONS: SelectOption[] = [
  { value: '1E-03', label: { es: 'C. 1 en 1.000 años.', en: 'C. 1 in 1,000 years.' } },
  { value: '1E-04', label: { es: '1 en 10.000 años', en: '1 in 10,000 years' } },
]

export const CABLE_SITUATION_OPTIONS: SelectOption[] = [
  { value: 'Aereo', label: { es: 'Aéreo', en: 'Aerial' } },
  { value: 'Enterrado', label: { es: 'Enterrado', en: 'Buried' } },
  { value: 'NoConectado', label: { es: 'No conectado', en: 'Not connected' } },
]

export const CABLE_SHIELDED_OPTIONS: SelectOption[] = [
  { value: 'Apantallado', label: { es: 'Apantallado', en: 'Shielded' } },
  { value: 'NoApantallado', label: { es: 'No apantallado', en: 'Non-shielded' } },
]

export const TRANSFORMER_MVLV_OPTIONS: SelectOption[] = [
  { value: 'SinTransformador', label: { es: 'Sin transformador', en: 'Without transformer' } },
  { value: 'ConTransformador', label: { es: 'Con transformador', en: 'With transformer' } },
]

export const SERVICE_TYPE_OPTIONS: SelectOption[] = [
  { value: 'Coaxial', label: { es: 'Coaxial', en: 'Coaxial' } },
  { value: 'FibraOptica', label: { es: 'Fibra Óptica', en: 'Fiber Optic' } },
]

export const BURIED_SERVICE_TYPE_OPTIONS: SelectOption[] = [
  { value: 'No aplica', label: { es: 'No aplica', en: 'Not applicable' } },
  { value: 'Coaxial', label: { es: 'Coaxial', en: 'Coaxial' } },
  { value: 'FibraOptica', label: { es: 'Fibra Óptica', en: 'Fiber Optic' } },
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
  {
    value: 'Mastil',
    label: { es: 'Mástil', en: 'Mast' }
  },
  {
    value: 'TCelosia',
    label: { es: 'Torreta triangular', en: 'Triangular Tower' }
  },
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
]

// Regla 6: Anclajes compatibles con alturas de mástil
export interface AnchorHeightCompat {
  value: string
  label: string | BilingualLabel
  compatibleHeights: string[] // Array de alturas compatibles
}

export const ANCHOR_TYPES_WITH_COMPAT: AnchorHeightCompat[] = [
  // Anclajes para 2m, 3m, 4m y 6m
  { value: 'AnclajePlano3m', label: { es: 'Anclaje tejado plano mast 3m', en: 'Flat roof anchor mast 3m' }, compatibleHeights: ['2m', '3m'] },
  { value: 'AnclajePlano6m', label: { es: 'Anclaje tejado plano mast 6m', en: 'Flat roof anchor mast 6m' }, compatibleHeights: ['4m', '6m'] },
  { value: 'AnclajeU15_2-6', label: { es: 'Anclaje en U 15cm (2-6m)', en: 'U anchor 15cm (2-6m)' }, compatibleHeights: ['2m', '3m', '4m', '6m'] },
  { value: 'AnclajeU30_2-6', label: { es: 'Anclaje en U 30cm (2-6m)', en: 'U anchor 30cm (2-6m)' }, compatibleHeights: ['2m', '3m', '4m', '6m'] },
  { value: 'AnclajeU60_2-6', label: { es: 'Anclaje en U 60cm (2-6m)', en: 'U anchor 60cm (2-6m)' }, compatibleHeights: ['2m', '3m', '4m', '6m'] },
  { value: 'AnclajeLigero30_2-6', label: { es: 'Anclaje ligero 30 cm (2-6m)', en: 'Light anchor 30 cm (2-6m)' }, compatibleHeights: ['2m', '3m', '4m', '6m'] },
  { value: 'AnclajeBrida_2-6', label: { es: 'Anclaje doble brida H (2-6m)', en: 'Double H flange anchor (2-6m)' }, compatibleHeights: ['2m', '3m', '4m', '6m'] },
  { value: 'AnclajeParalelo_2-6', label: { es: 'Anclaje paralelo (2-6m)', en: 'Parallel anchor (2-6m)' }, compatibleHeights: ['2m', '3m', '4m', '6m'] },
  { value: 'AnclajeAjustable_2-6', label: { es: 'Anclaje ajustable 60/80 (2-6m)', en: 'Adjustable anchor 60/80 (2-6m)' }, compatibleHeights: ['2m', '3m', '4m', '6m'] },
  { value: 'AnclajeBarra30_2-6', label: { es: 'Anclaje barra 30cm (2-6m)', en: 'Bar anchor 30cm (2-6m)' }, compatibleHeights: ['2m', '3m', '4m', '6m'] },
  { value: 'AnclajeBarra60_2-6', label: { es: 'Anclaje barra 60cm (2-6m)', en: 'Bar anchor 60cm (2-6m)' }, compatibleHeights: ['2m', '3m', '4m', '6m'] },
  { value: 'AnclajeBarra100_2-6', label: { es: 'Anclaje barra 100cm (2-6m)', en: 'Bar anchor 100cm (2-6m)' }, compatibleHeights: ['2m', '3m', '4m', '6m'] },

  // Anclajes para 8m
  { value: 'AnclajeU15_8', label: { es: 'Anclaje en U 15cm (8m)', en: 'U anchor 15cm (8m)' }, compatibleHeights: ['8m'] },
  { value: 'AnclajeU30_8', label: { es: 'Anclaje en U 30cm (8m)', en: 'U anchor 30cm (8m)' }, compatibleHeights: ['8m'] },
  { value: 'AnclajeU60_8', label: { es: 'Anclaje en U 60cm (8m)', en: 'U anchor 60cm (8m)' }, compatibleHeights: ['8m'] },
  { value: 'AnclajeLigero30_8', label: { es: 'Anclaje ligero 30 cm (8m)', en: 'Light anchor 30 cm (8m)' }, compatibleHeights: ['8m'] },
  { value: 'AnclajeBrida_8', label: { es: 'Anclaje doble brida H (8m)', en: 'Double H flange anchor (8m)' }, compatibleHeights: ['8m'] },
  { value: 'AnclajeParalelo_8', label: { es: 'Anclaje paralelo (8m)', en: 'Parallel anchor (8m)' }, compatibleHeights: ['8m'] },
  { value: 'AnclajeAjustable_8', label: { es: 'Anclaje ajustable 60/80 (8m)', en: 'Adjustable anchor 60/80 (8m)' }, compatibleHeights: ['8m'] },
  { value: 'AnclajeBarra30_8', label: { es: 'Anclaje barra 30cm (8m)', en: 'Bar anchor 30cm (8m)' }, compatibleHeights: ['8m'] },
  { value: 'AnclajeBarra60_8', label: { es: 'Anclaje barra 60cm (8m)', en: 'Bar anchor 60cm (8m)' }, compatibleHeights: ['8m'] },
]

export const ANCHOR_SEPARATION_OPTIONS: SelectOption[] = [
  { value: '15cm', label: { es: '15cm', en: '15cm' } },
  { value: '30cm', label: { es: '30cm', en: '30cm' } },
  { value: '60cm', label: { es: '60cm', en: '60cm' } },
]

export const PROTECTION_LEVELS: SelectOption[] = [
  { value: 'I', label: { es: 'NIVEL I', en: 'LEVEL I' } },
  { value: 'II', label: { es: 'NIVEL II', en: 'LEVEL II' } },
  { value: 'III', label: { es: 'NIVEL III', en: 'LEVEL III' } },
  { value: 'IV', label: { es: 'NIVEL IV', en: 'LEVEL IV' } },
]

export const PROTECTION_LEVELS_CTE: SelectOption[] = [
  { value: '1', label: { es: 'NIVEL 1', en: 'LEVEL 1' } },
  { value: '2', label: { es: 'NIVEL 2', en: 'LEVEL 2' } },
  { value: '3', label: { es: 'NIVEL 3', en: 'LEVEL 3' } },
  { value: '4', label: { es: 'NIVEL 4', en: 'LEVEL 4' } },
]

// === PASO 6: PROTECCIÓN EXTERNA ===

// Tipos de conductor (Cable, Pletina, Redondo)
export const CONDUCTOR_TYPES: SelectOption[] = [
  { value: 'Cable', label: { es: 'Cable', en: 'Cable' } },
  { value: 'Pletina', label: { es: 'Pletina', en: 'Flat bar' } },
  { value: 'Redondo', label: { es: 'Redondo', en: 'Round' } },
]

// Tipos de cubierta (para bajantes)
export const ROOF_COVER_TYPES: SelectOption[] = [
  { value: 'Pared', label: { es: 'Pared', en: 'Wall' } },
  { value: 'Terraza', label: { es: 'Terraza', en: 'Terrace' } },
]

// Tipos de sistema de toma de tierra
export const GROUND_SYSTEM_TYPES: SelectOption[] = [
  { value: 'Tierratriangulos', label: { es: 'Disposición en triángulo', en: 'Triangle arrangement' } },
  { value: 'Tierraenlinea', label: { es: 'Disposición en línea', en: 'Line arrangement' } },
  { value: 'Patadeganso', label: { es: 'Pata de ganso', en: 'Goose foot' } },
  { value: 'Enanillo', label: { es: 'En anillo', en: 'Ring' } },
]

// Materiales de toma de tierra
export const GROUND_MATERIAL_TYPES: SelectOption[] = [
  { value: 'ElectrodosCobrizados', label: { es: 'Electrodos Cobrizados', en: 'Copper-plated electrodes' } },
  { value: 'PlacasdeTT', label: { es: 'Placas de cobre', en: 'Copper plates' } },
  { value: 'ElectrodosDinamicos', label: { es: 'Electrodos dinámicos', en: 'Dynamic electrodes' } },
]

// Regla 7: Material del conductor -> Naturalezas/variantes (jerárquica)
export interface ConductorMaterialConfig {
  type: string
  typeLabel: string | BilingualLabel
  natures: SelectOption[]
}

export const CONDUCTOR_MATERIALS_HIERARCHICAL: ConductorMaterialConfig[] = [
  {
    type: 'Pletina',
    typeLabel: { es: 'Pletina', en: 'Flat bar' },
    natures: [
      { value: 'Pletina_CuEst_30x2', label: { es: 'Pletina cobre estañado 30x2mm', en: 'Tinned copper flat bar 30x2mm' } },
      { value: 'Pletina_Al_25x3', label: { es: 'Pletina de aluminio 25x3mm', en: 'Aluminum flat bar 25x3mm' } },
    ],
  },
  {
    type: 'Cable',
    typeLabel: { es: 'Cable trenzado', en: 'Stranded cable' },
    natures: [
      { value: 'Cable_Cu_50', label: { es: 'Cable Cu trenzado 50mm²', en: 'Cu stranded cable 50mm²' } },
      { value: 'Cable_Cu_70', label: { es: 'Cable Cu trenzado 70mm²', en: 'Cu stranded cable 70mm²' } },
    ],
  },
  {
    type: 'Redondo',
    typeLabel: { es: 'Redondo', en: 'Round' },
    natures: [
      { value: 'Redondo_Cu_8', label: { es: 'Redondo de cobre Ø8mm', en: 'Copper round Ø8mm' } },
      { value: 'Redondo_Al_8', label: { es: 'Redondo aleación Al ø8mm', en: 'Al alloy round ø8mm' } },
    ],
  },
]

export const CONDUCTOR_MATERIALS: SelectOption[] = [
  { value: 'copper', label: { es: 'Cobre', en: 'Copper' } },
  { value: 'aluminum', label: { es: 'Aluminio', en: 'Aluminum' } },
  { value: 'galvanized_steel', label: { es: 'Acero galvanizado', en: 'Galvanized steel' } },
]

// Regla 10: Fijaciones compatibles con materiales
export interface FixingMaterialCompat {
  value: string
  label: string | BilingualLabel
  compatibleMaterials: string[] // Array de materiales compatibles (usar el value de las naturalezas)
}

export const FIXING_TYPES_WITH_COMPAT: FixingMaterialCompat[] = [
  {
    value: 'Grapa_laton_cable',
    label: { es: 'Grapa latón para cable Ø6-10mm', en: 'Brass clamp for cable Ø6-10mm' },
    compatibleMaterials: ['Cable_Cu_50', 'Cable_Cu_70', 'Redondo_Cu_8'],
  },
  {
    value: 'Grapa_nylon',
    label: { es: 'Grapa nylon cable o pletina 17mm', en: 'Nylon clamp cable or flat bar 17mm' },
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
    label: { es: 'Grapa inox para cable Ø6-10mm', en: 'Stainless steel clamp for cable Ø6-10mm' },
    compatibleMaterials: ['Cable_Cu_50', 'Cable_Cu_70', 'Redondo_Cu_8', 'Redondo_Al_8'],
  },
  {
    value: 'Grapa_hebilla_inox',
    label: { es: 'Grapa hebilla inox 30x2-30x3.5mm', en: 'Stainless steel buckle clamp 30x2-30x3.5mm' },
    compatibleMaterials: ['Pletina_CuEst_30x2', 'Pletina_Al_25x3'],
  },
]

export const FIXING_TYPES: SelectOption[] = FIXING_TYPES_WITH_COMPAT.map(f => ({
  value: f.value,
  label: f.label,
}))

export const ROOF_TYPES: SelectOption[] = [
  { value: 'flat', label: { es: 'Plana', en: 'Flat' } },
  { value: 'sloped', label: { es: 'Inclinada', en: 'Sloped' } },
  { value: 'mixed', label: { es: 'Mixta', en: 'Mixed' } },
]

export const GROUND_TYPES: SelectOption[] = [
  { value: 'picas', label: { es: 'Picas verticales', en: 'Vertical rods' } },
  { value: 'horizontal', label: { es: 'Conductor horizontal', en: 'Horizontal conductor' } },
  { value: 'anillo', label: { es: 'Anillo perimetral', en: 'Perimeter ring' } },
  { value: 'mixto', label: { es: 'Mixto', en: 'Mixed' } },
]

// === PASO 7: PROTECCIÓN INTERNA ===

export const DIFFERENTIAL_OPTIONS: SelectOption[] = [
  { value: '10mA', label: { es: '10mA', en: '10mA' } },
  { value: '30mA', label: { es: '30mA', en: '30mA' } },
  { value: '100mA', label: { es: '100mA', en: '100mA' } },
  { value: '300mA', label: { es: '300mA', en: '300mA' } },
]

export const VOLTAGE_OPTIONS: SelectOption[] = [
  { value: '120V', label: { es: '120V', en: '120V' } },
  { value: '230V', label: { es: '230V', en: '230V' } },
  { value: '400V', label: { es: '400V', en: '400V' } },
]

// === HELPERS ===

/**
 * Obtiene el label de una opción dado su valor
 */
export function getOptionLabel(options: SelectOption[], value: string): string {
  const option = options.find((opt) => opt.value === value)
  return option ? transformLabel(option.label) : value
}

/**
 * Transforma un array de opciones con labels bilingües a opciones con labels traducidos
 * Los componentes deben usar esta función para obtener las opciones en el idioma correcto
 */
export function getTranslatedOptions(options: SelectOption[]): Array<{ value: string; label: string }> {
  return options.map(option => ({
    value: option.value,
    label: transformLabel(option.label)
  }))
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
