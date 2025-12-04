import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { validateStep, getFormattedErrors, completeRiskFormSchema } from '@/lib/validations/riskFormSchemas'
import { logger } from '@/lib/logger'
import { safeParse } from '@/lib/safeParse'

export interface RiskResult {
  type: string
  tolerableRisk: string
  initialRisk: string
  proposedRisk: string
  isInitialDanger: boolean
}

export interface RiskFormData {
  // Datos del Proyecto (Step 1)
  projectName?: string
  projectCountry?: string
  projectAddress?: string
  projectTown?: string
  projectProvince?: string
  buildingsToProtect?: number
  newConstruction?: boolean
  workplace?: boolean
  protectedArea?: boolean
  touristCamp?: boolean
  calculationNormative?: 'lightning' | 'cte'
  clientName?: string
  clientCIF?: string
  clientAddress?: string
  clientTown?: string
  clientProvince?: string
  clientPhone?: string
  clientEmail?: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string

  // Dimensiones (Step 2)
  length?: string
  width?: string
  height?: string
  protrusionHeight?: string
  calculatedCollectionArea?: string
  manualArea?: boolean
  typeOfStructure?: string
  riskOfFire?: string
  specialFireDanger?: string
  fireProtectionLevel?: string
  roofFireResistance?: string
  magneticShielding?: string
  powerLines?: string
  telecomLines?: string

  // Pérdidas (Step 3)
  dueToFire?: string
  riskOfPanic?: string
  consequencesOfDamages?: string
  dueToOvervoltages1?: string
  lossOfServices?: string
  lossOfCulturalHeritage?: string
  specialHazards?: string
  dueToFire2?: string
  dueToOvervoltages2?: string
  dueToStepTouchVoltages?: string
  tolerableRisk?: string
  cableSituation?: string
  cableShielded?: string
  transformerMVLV?: string
  aerialServicesCount?: string
  aerialServiceType?: string
  buriedServicesCount?: string
  buriedServiceType?: string

  // Resultados (Step 4)
  calculatedRisks?: RiskResult[]
  protectionLevel?: string
  internalProtection?: string

  // Esquema de Protección (Step 5)
  captureMethod?: string
  headType?: string
  headModel?: string
  mastType?: string
  mastHeight?: string
  anchorType?: string
  anchorSeparation?: string
  protectionZones?: Array<{
    id: string
    x: number
    y: number
    radius: number
    model: string
    level: string
    mastType?: string
    mastHeight?: string
    anchorType?: string
    anchorSeparation?: string
    placedOnMap?: boolean
  }>

  // Protección Externa (Step 6)
  buildingName?: string
  // Configuraciones individuales por cada pararrayos
  externalProtectionZones?: Array<{
    id: string // Mismo ID que en protectionZones para vincular
    externalCabezal?: string
    conductorType?: string
    conductorMaterial?: string
    fixingType?: string
    useOtherBajantes?: string
    useNaturalComponents?: string
    metrosConductor?: string
    tipoCubierta?: string
    bajantesNumber?: string
    totalLength?: string
    distanceGroundLevel?: string
    groundType?: string
    groundMaterial?: string
    generalGround?: string
    generalGroundConductor?: string
    antenasNumber?: string
    antenasLength?: string
  }>
  // Campos legacy (para compatibilidad)
  externalCabezal?: string
  conductorType?: string
  conductorMaterial?: string
  fixingType?: string
  useOtherBajantes?: string
  useNaturalComponents?: string
  metrosConductor?: string
  tipoCubierta?: string
  bajantesNumber?: string
  totalLength?: string
  distanceGroundLevel?: string
  groundType?: string
  groundMaterial?: string
  generalGround?: string
  generalGroundConductor?: string
  antenasNumber?: string
  antenasLength?: string

  // Protección Interna (Step 7)
  diffGeneral30mA?: string
  intensity?: string
  principalPanel400v?: string
  principalPanel230v?: string
  principalPanel230vM?: string
  principalPanel120vM?: string
  principalPanel400vNeutro?: string
  principalPanel230vNeutro?: string
  secondaryPanel400v?: string
  secondaryPanel230v?: string
  secondaryPanel230vM?: string
  secondaryPanel120vM?: string
  secondaryPanel400vNeutro?: string
  secondaryPanel230vNeutro?: string
  analogLinesNumber?: string
  digitalLinesNumber?: string
  ethernetLines?: string
  busLines5v?: string
  serialLines12v?: string
  controlLines24v?: string
  controlLines48v?: string

  // Solicitar Presupuesto (Step 8)
  captchaCheck?: boolean
  termsConsent?: boolean

  // Esquema de Protección - Imagen capturada
  schemeImage?: string // Base64 data URL
  schemeImageTimestamp?: number // Timestamp de captura

  // Control de validación
  skipValidation?: boolean // Si está activo, permite avanzar sin validar campos requeridos
}

const RISK_FORM_KEY = 'riskFormData'

// Simular API - En producción esto vendría de un backend
const mockAPI = {
  // Obtener datos del formulario desde localStorage
  getFormData: async (): Promise<RiskFormData> => {
    const stored = localStorage.getItem(RISK_FORM_KEY)

    if (stored) {
      try {
        // Parsear datos almacenados de forma segura (previene prototype pollution)
        const parsed = safeParse<RiskFormData>(stored)

        // Migración: Manejar zonas de protección antiguas sin la propiedad placedOnMap
        if (parsed.protectionZones && Array.isArray(parsed.protectionZones)) {
          parsed.protectionZones = parsed.protectionZones.map((zone: unknown) => {
            const z = zone as Record<string, unknown>
            return {
              ...z,
              // Marcar zonas antiguas sin placedOnMap como pendientes (no colocadas en el mapa)
              placedOnMap: z.placedOnMap !== undefined ? z.placedOnMap : false
            }
          })
        }

        // Intentar validar datos con Zod schema (parcial para permitir datos incompletos)
        // Usar safeParse para no lanzar excepciones
        const validation = completeRiskFormSchema.partial().safeParse(parsed)

        if (validation.success) {
          // Si la validación pasa, devolver los datos validados
          return validation.data
        } else {
          // Si la validación falla, loguear el error pero DEVOLVER LOS DATOS SIN VALIDAR
          // No eliminar localStorage - los datos del usuario son valiosos
          logger.warn('Stored form data failed validation, using unvalidated data', validation.error)
          return parsed
        }
      } catch (error) {
        // Solo limpiar localStorage si hay error crítico de parsing (JSON inválido)
        logger.error('Critical error parsing stored form data', error)

        // Intentar recuperar los datos brutos sin parsear
        try {
          const rawData = JSON.parse(stored)
          logger.info('Recovered raw data despite parsing error')
          return rawData as RiskFormData
        } catch {
          // Solo ahora eliminamos localStorage si es completamente irrecuperable
          logger.error('Data is completely corrupted, clearing localStorage')
          localStorage.removeItem(RISK_FORM_KEY)

          // Devolver valores por defecto mínimos
          return {
            buildingsToProtect: 1,
            calculationNormative: 'lightning',
          }
        }
      }
    }

    // Valores por defecto mínimos si no hay datos almacenados
    return {
      buildingsToProtect: 1,
      calculationNormative: 'lightning',
    }
  },

  // Guardar datos del formulario en localStorage
  saveFormData: async (data: RiskFormData): Promise<RiskFormData> => {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 100))
    localStorage.setItem(RISK_FORM_KEY, JSON.stringify(data))
    return data
  },

  // Limpiar datos del formulario
  clearFormData: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 100))
    localStorage.removeItem(RISK_FORM_KEY)
  },
}

/**
 * Hook personalizado para manejar el formulario de riesgo con TanStack Query
 */
export function useRiskForm() {
  const queryClient = useQueryClient()
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingDataRef = useRef<RiskFormData | null>(null)

  // Query para obtener los datos del formulario
  const {
    data: formData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['riskForm'],
    queryFn: mockAPI.getFormData,
  })

  // Mutation para actualizar los datos del formulario
  const updateFormMutation = useMutation({
    mutationFn: mockAPI.saveFormData,
    onSuccess: (data) => {
      // Actualizar el cache con los nuevos datos
      queryClient.setQueryData(['riskForm'], data)
    },
    onError: (error: Error) => {
      logger.error('Error saving form', error)
      toast.error('Error al guardar', {
        description: error.message || 'No se pudieron guardar los cambios. Inténtalo de nuevo.',
      })
    },
  })

  // Programar guardado con debounce para no bloquear la escritura en inputs
  const scheduleSave = useCallback((data: RiskFormData) => {
    pendingDataRef.current = data
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      if (pendingDataRef.current) {
        updateFormMutation.mutate(pendingDataRef.current)
      }
    }, 350)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Mutation para limpiar el formulario
  const clearFormMutation = useMutation({
    mutationFn: mockAPI.clearFormData,
    onSuccess: () => {
      // Resetear los datos del formulario al estado inicial mínimo
      queryClient.setQueryData(['riskForm'], {
        buildingsToProtect: 1,
        calculationNormative: 'lightning',
      })
      toast.success('Formulario limpiado correctamente')
    },
    onError: (error: Error) => {
      logger.error('Error limpiando formulario', error)
      toast.error('Error al limpiar el formulario')
    },
  })

  // Función helper para actualizar un campo del formulario (memoizada)
  const updateField = useCallback(
    (field: string, value: unknown) => {
      const currentData = queryClient.getQueryData<RiskFormData>(['riskForm']) || {}
      // Convertir strings vacíos a null
      const normalizedValue = value === '' ? null : value
      const newData = {
        ...currentData,
        [field]: normalizedValue,
      }
      // Actualizar cache inmediatamente para un input fluido
      queryClient.setQueryData(['riskForm'], newData)
      // Guardar con debounce para evitar bloquear el hilo principal al tipear
      scheduleSave(newData as RiskFormData)
    },
    [queryClient, scheduleSave]
  )

  // Función helper para actualizar múltiples campos (memoizada)
  const updateFields = useCallback(
    (fields: Partial<RiskFormData>) => {
      const currentData = queryClient.getQueryData<RiskFormData>(['riskForm']) || {}
      // Convertir strings vacíos a null en todos los campos
      const normalizedFields = Object.entries(fields).reduce((acc, [key, value]) => {
        acc[key as keyof RiskFormData] = value === '' ? null : value
        return acc
      }, {} as Partial<RiskFormData>)
      const newData = {
        ...currentData,
        ...normalizedFields,
      }
      queryClient.setQueryData(['riskForm'], newData)
      scheduleSave(newData as RiskFormData)
    },
    [queryClient, scheduleSave]
  )

  // Limpiar timeout en desmontaje
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Función para limpiar el formulario (memoizada)
  const clearForm = useCallback(() => {
    clearFormMutation.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Función para validar un paso del formulario (memoizada)
  const validateFormStep = useCallback(
    (stepId: string): boolean => {
      const currentData = queryClient.getQueryData<RiskFormData>(['riskForm']) || {}
      const validation = validateStep(stepId, currentData)

      if (!validation.success && validation.errors) {
        const errors = getFormattedErrors(validation.errors)
        const firstError = Object.values(errors)[0]

        toast.error('Errores de validación', {
          description: firstError || 'Por favor, corrige los errores en el formulario',
        })

        logger.error('Validation errors', validation.errors)
        return false
      }

      return true
    },
    [queryClient]
  )

  return {
    formData: formData || {},
    isLoading,
    error,
    updateField,
    updateFields,
    clearForm,
    validateFormStep,
    isSaving: updateFormMutation.isPending,
    isClearing: clearFormMutation.isPending,
  }
}
