import { z } from 'zod'

/**
 * Schemas de validación con Zod para el formulario de riesgo CD-Risk
 * Cada paso tiene su propio schema para validación granular
 */

/**
 * Schema para números opcionales que convierte strings a números automáticamente
 * Esto soluciona el problema de datos antiguos guardados como strings en localStorage
 */
const coercedNumber = z.preprocess(
  (val) => {
    if (val === undefined || val === null || val === '') return undefined
    if (typeof val === 'number') return val
    if (typeof val === 'string') {
      const parsed = Number(val)
      return isNaN(parsed) ? undefined : parsed
    }
    return undefined
  },
  z.number().optional()
)

// ============================================
// PASO 1: DATOS DEL PROYECTO
// ============================================
export const projectDataSchema = z.object({
  projectName: z
    .string()
    .min(3, 'El nombre del proyecto debe tener al menos 3 caracteres')
    .max(100, 'El nombre del proyecto no puede exceder 100 caracteres'),

  projectCountry: z
    .string()
    .min(2, 'Selecciona un país válido')
    .optional(),

  projectAddress: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .optional(),

  projectTown: z.string().optional(),
  projectProvince: z.string().optional(),

  buildingsToProtect: z
    .number()
    .int('Debe ser un número entero')
    .min(1, 'Debe proteger al menos 1 edificio')
    .max(100, 'No se pueden proteger más de 100 edificios'),

  newConstruction: z.boolean().optional(),
  workplace: z.boolean().optional(),
  protectedArea: z.boolean().optional(),
  touristCamp: z.boolean().optional(),

  calculationNormative: z.enum(['lightning', 'cte']),

  // Datos del cliente (todos opcionales)
  clientName: z.string().optional().or(z.literal('')),
  clientCIF: z
    .string()
    .refine((val) => !val || /^[A-Z0-9]{9}$/.test(val), 'CIF inválido (formato: A12345678)')
    .optional()
    .or(z.literal('')),
  clientAddress: z.string().optional().or(z.literal('')),
  clientTown: z.string().optional().or(z.literal('')),
  clientProvince: z.string().optional().or(z.literal('')),
  clientPhone: z
    .string()
    .refine((val) => !val || /^\+?[0-9\s-]{9,15}$/.test(val), 'Teléfono inválido')
    .optional()
    .or(z.literal('')),
  clientEmail: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
})

export type ProjectDataForm = z.infer<typeof projectDataSchema>

// ============================================
// PASO 2: DIMENSIONES
// ============================================
export const dimensionsSchema = z.object({
  length: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), 'Debe ser un número válido')
    .refine((val) => parseFloat(val) > 0, 'La longitud debe ser mayor que 0')
    .refine((val) => parseFloat(val) <= 1000, 'La longitud no puede exceder 1000m'),

  width: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), 'Debe ser un número válido')
    .refine((val) => parseFloat(val) > 0, 'La anchura debe ser mayor que 0')
    .refine((val) => parseFloat(val) <= 1000, 'La anchura no puede exceder 1000m'),

  height: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), 'Debe ser un número válido')
    .refine((val) => parseFloat(val) > 0, 'La altura debe ser mayor que 0')
    .refine((val) => parseFloat(val) <= 500, 'La altura no puede exceder 500m'),

  protrusionHeight: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), 'Debe ser un número válido')
    .optional(),

  calculatedCollectionArea: z.string().optional(),
  manualArea: z.boolean().optional(),

  typeOfStructure: z.enum(['Hormigon', 'Metal', 'Madera']).optional(),
  riskOfFire: z.enum(['Comun', 'Alto', 'Nulo']).optional(),
  specialFireDanger: z.string().optional(),
  fireProtectionLevel: z.string().optional(),
  roofFireResistance: z.string().optional(),
  magneticShielding: z.string().optional(),
  powerLines: z.string().optional(),
  telecomLines: z.string().optional(),
  situation: z.enum(['EstructuraAislada', 'CentroUrbano', 'ZonaRural']).optional(),
  environmentalFactor: z.enum(['Urbano', 'Rural', 'Costero']).optional(),
  groundType: z.enum(['Arenoso', 'Rocoso', 'Arcilloso']).optional(),
})

export type DimensionsForm = z.infer<typeof dimensionsSchema>

// ============================================
// PASO 3: PÉRDIDAS
// ============================================
export const lossesSchema = z.object({
  dueToFire: z.string().optional(),
  riskOfPanic: z.string().optional(),
  consequencesOfDamages: z.string().optional(),
  dueToOvervoltages1: z.string().optional(),
  lossOfServices: z.string().optional(),
  lossOfCulturalHeritage: z.string().optional(),
  specialHazards: z.string().optional(),
  dueToFire2: z.string().optional(),
  dueToOvervoltages2: z.string().optional(),
  dueToStepTouchVoltages: z.string().optional(),
  tolerableRisk: z.string().optional(),
  cableSituation: z.string().optional(),
  cableShielded: z.string().optional(),
  transformerMVLV: z.string().optional(),

  aerialServicesCount: z
    .string()
    .refine((val) => val === '' || !isNaN(parseInt(val)), 'Debe ser un número entero')
    .optional(),

  aerialServiceType: z.string().optional(),

  buriedServicesCount: z
    .string()
    .refine((val) => val === '' || !isNaN(parseInt(val)), 'Debe ser un número entero')
    .optional(),

  buriedServiceType: z.string().optional(),
})

export type LossesForm = z.infer<typeof lossesSchema>

// ============================================
// PASO 4: RESULTADOS
// ============================================
export const riskResultSchema = z.object({
  type: z.string(),
  tolerableRisk: z.string(),
  initialRisk: z.string(),
  proposedRisk: z.string(),
  isInitialDanger: z.boolean(),
})

export const resultsSchema = z.object({
  calculatedRisks: z.array(riskResultSchema).optional(),
  protectionLevel: z.enum(['I', 'II', 'III', 'IV']).optional(),
  internalProtection: z.string().optional(),
})

export type ResultsForm = z.infer<typeof resultsSchema>

// ============================================
// PASO 5: ESQUEMA DE PROTECCIÓN
// ============================================
export const protectionZoneSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  radius: z.number().positive('El radio debe ser positivo'),
  model: z.string(),
  level: z.string(),
  mastType: z.string().optional(),
  mastHeight: z.string().optional(),
  anchorType: z.string().optional(),
  anchorSeparation: z.string().optional(),
})

export const protectionSchemeSchema = z.object({
  headType: z.enum(['DAT CONTROLER® REMOTE', 'DAT CONTROLER® PLUS']).optional(),

  headModel: z
    .string()
    .refine(
      (val) =>
        !val ||
        [
          'DAT CONTROLER REMOTE 15', 'DAT CONTROLER REMOTE 30',
          'DAT CONTROLER REMOTE 45', 'DAT CONTROLER REMOTE 60',
          'DAT CONTROLER PLUS 15', 'DAT CONTROLER PLUS 30',
          'DAT CONTROLER PLUS 45', 'DAT CONTROLER PLUS 60',
        ].includes(val),
      'Selecciona un modelo válido'
    )
    .optional(),

  mastType: z.enum(['Mastil', 'TCelosia']).optional(),
  mastHeight: z.enum(['3m', '6m', '8m']).optional(),
  anchorType: z.enum(['AEnU', 'ABAngulo', 'ALigero', 'EATPlano', 'AAjustable']).optional(),
  anchorSeparation: z.enum(['15cm', '30cm', '60cm']).optional(),

  protectionZones: z.array(protectionZoneSchema).optional(),
  skipValidation: z.boolean().optional(),
})

export type ProtectionSchemeForm = z.infer<typeof protectionSchemeSchema>
export type ProtectionZone = z.infer<typeof protectionZoneSchema>

// ============================================
// PASO 6: PROTECCIÓN EXTERNA
// ============================================
export const externalProtectionZoneSchema = z.object({
  id: z.string(),
  externalCabezal: z.string().optional(),
  conductorType: z.string().optional(),
  conductorMaterial: z.string().optional(),
  fixingType: z.string().optional(),
  useOtherBajantes: z.string().optional(),
  useNaturalComponents: z.string().optional(),
  metrosConductor: coercedNumber,
  tipoCubierta: z.string().optional(),
  bajantesNumber: coercedNumber,
  totalLength: coercedNumber,
  distanceGroundLevel: coercedNumber,
  groundType: z.string().optional(),
  groundMaterial: z.string().optional(),
  generalGround: z.string().optional(),
  generalGroundConductor: coercedNumber,
  antenasNumber: coercedNumber,
  antenasLength: coercedNumber,
  extraMargin: coercedNumber,
})

export const externalProtectionSchema = z.object({
  externalProtectionZones: z.array(externalProtectionZoneSchema).optional(),
})

export type ExternalProtectionZone = z.infer<typeof externalProtectionZoneSchema>
export type ExternalProtectionForm = z.infer<typeof externalProtectionSchema>

// ============================================
// PASO 7: PROTECCIÓN INTERNA
// ============================================
export const internalProtectionSchema = z.object({
  diffGeneral30mA: z.string().optional(),
  intensity: z.string().optional(),
  principalPanel400v: coercedNumber,
  principalPanel230v: coercedNumber,
  principalPanel230vM: coercedNumber,
  principalPanel120vM: coercedNumber,
  principalPanel400vNeutro: z.string().optional(),
  principalPanel230vNeutro: z.string().optional(),
  secondaryPanel400v: coercedNumber,
  secondaryPanel230v: coercedNumber,
  secondaryPanel230vM: coercedNumber,
  secondaryPanel120vM: coercedNumber,
  secondaryPanel400vNeutro: z.string().optional(),
  secondaryPanel230vNeutro: z.string().optional(),

  analogLinesNumber: coercedNumber,
  digitalLinesNumber: coercedNumber,
  ethernetLines: coercedNumber,
  busLines5v: coercedNumber,
  serialLines12v: coercedNumber,
  controlLines24v: coercedNumber,
  controlLines48v: coercedNumber,
})

export type InternalProtectionForm = z.infer<typeof internalProtectionSchema>

// ============================================
// PASO 8: SOLICITAR PRESUPUESTO
// ============================================
export const quoteRequestSchema = z.object({
  captchaCheck: z
    .boolean()
    .refine((val) => val === true, 'Debes completar el captcha'),

  termsConsent: z
    .boolean()
    .refine((val) => val === true, 'Debes aceptar los términos y condiciones'),
})

export type QuoteRequestForm = z.infer<typeof quoteRequestSchema>

// ============================================
// SCHEMA COMPLETO DEL FORMULARIO
// ============================================
export const completeRiskFormSchema = z.object({
  // Paso 1
  ...projectDataSchema.shape,

  // Paso 2
  ...dimensionsSchema.shape,

  // Paso 3
  ...lossesSchema.shape,

  // Paso 4
  ...resultsSchema.shape,

  // Paso 5
  ...protectionSchemeSchema.shape,

  // Paso 6
  ...externalProtectionSchema.shape,

  // Paso 7
  ...internalProtectionSchema.shape,

  // Paso 8
  ...quoteRequestSchema.shape,
})

export type CompleteRiskForm = z.infer<typeof completeRiskFormSchema>

/**
 * Función helper para validar un paso específico
 */
export function validateStep(stepId: string, data: Partial<CompleteRiskForm>): { success: boolean; errors?: z.ZodError } {
  // Si skipValidation está activo, permitir avanzar sin validar
  if (data.skipValidation === true) {
    return { success: true }
  }

  const schemaMap: Record<string, z.ZodSchema> = {
    project_data: projectDataSchema,
    dimensions: dimensionsSchema,
    losses: lossesSchema,
    calculation_results: resultsSchema,
    protection_scheme_map: protectionSchemeSchema,
    external_protection: externalProtectionSchema,
    internal_protection: internalProtectionSchema,
    request_quote: quoteRequestSchema,
  }

  const schema = schemaMap[stepId]
  if (!schema) {
    return { success: true }
  }

  try {
    schema.parse(data)
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    return { success: false }
  }
}

/**
 * Función helper para obtener errores formateados
 */
export function getFormattedErrors(zodError: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}

  zodError.issues.forEach((error) => {
    const path = error.path.join('.')
    errors[path] = error.message
  })

  return errors
}
