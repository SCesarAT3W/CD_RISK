import type { RiskFormData } from '@/hooks/useRiskForm'

/**
 * Tipos fuertemente tipados para los props de los componentes de pasos
 * Reemplaza los 'any' genéricos con tipos específicos
 */

/**
 * Función onChange tipada que garantiza type-safety
 */
export type OnChangeFunction = <K extends keyof RiskFormData>(
  field: K,
  value: RiskFormData[K]
) => void

/**
 * Función para actualizar múltiples campos a la vez
 */
export type OnBulkChangeFunction = (fields: Partial<RiskFormData>) => void

/**
 * Props base para todos los componentes de pasos
 */
export interface BaseStepProps {
  data: RiskFormData
  onChange: OnChangeFunction
  onBulkChange?: OnBulkChangeFunction
}

/**
 * Props específicos para cada paso (en caso de necesitar props adicionales)
 */
export interface ProjectDataStepProps extends BaseStepProps {}

export interface DimensionsStepProps extends BaseStepProps {}

export interface LossesStepProps extends BaseStepProps {}

export interface ResultsStepProps extends BaseStepProps {}

export interface ProtectionSchemeStepProps extends BaseStepProps {}

export interface ExternalProtectionStepProps extends BaseStepProps {}

export interface InternalProtectionStepProps extends BaseStepProps {}

export interface QuoteRequestStepProps extends BaseStepProps {}
