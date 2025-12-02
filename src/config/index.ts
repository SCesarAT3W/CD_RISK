/**
 * Archivo de configuración centralizado
 * Exporta todas las configuraciones del proyecto
 */

// Configuración de canvas
export * from './canvas'

// Configuración de radios de protección
export * from './protectionRadii'

/**
 * Configuración general de la aplicación
 */
export const APP_CONFIG = {
  name: 'CD-Risk',
  version: '1.0.0',
  defaultLanguage: 'es',
} as const

/**
 * Configuración de TanStack Query
 */
export const QUERY_CONFIG = {
  staleTime: 1000 * 60 * 5, // 5 minutos
  gcTime: 1000 * 60 * 10, // 10 minutos
  retry: 1,
  refetchOnWindowFocus: false,
} as const

/**
 * Storage keys para localStorage
 */
export const STORAGE_KEYS = {
  riskForm: 'riskFormData',
  mockAuth: 'mock-auth-user',
} as const

/**
 * Rutas de la aplicación
 */
export const ROUTES = {
  login: '/login',
  home: '/',
  riskCalculation: '/',
} as const

/**
 * Configuración de formularios
 */
export const FORM_CONFIG = {
  defaultBuildingsToProtect: 1,
  defaultNewConstruction: true,
  defaultCalculationNormative: 'lightning' as const,
  defaultDimensions: {
    length: '80.00',
    width: '50.00',
    height: '20.00',
    protrusionHeight: '20.00',
  },
} as const

/**
 * Pasos del wizard
 */
export const WIZARD_STEPS = [
  { id: 'project_data', title: 'Datos del Proyecto', number: 1 },
  { id: 'dimensions', title: 'Dimensiones', number: 2 },
  { id: 'losses', title: 'Pérdidas', number: 3 },
  { id: 'calculation_results', title: 'Resultados', number: 4 },
  { id: 'protection_scheme_map', title: 'Esquema Protección', number: 5 },
  { id: 'external_protection', title: 'Prot. Externa', number: 6 },
  { id: 'internal_protection', title: 'Prot. Interna', number: 7 },
  { id: 'request_quote', title: 'Solicitar Presupuesto', number: 8 },
] as const

export type WizardStep = (typeof WIZARD_STEPS)[number]
