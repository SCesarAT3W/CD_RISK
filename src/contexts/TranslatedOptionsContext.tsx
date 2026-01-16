import { createContext, useContext, useMemo, type ReactNode } from 'react'
import {
  COUNTRIES,
  NORMATIVES,
  STRUCTURE_TYPES,
  FIRE_RISK_LEVELS,
  SITUATION_OPTIONS,
  ENVIRONMENTAL_FACTOR_OPTIONS,
  GROUND_TYPE_OPTIONS,
  FIRE_PROTECTION_LEVELS,
  ROOF_FIRE_RESISTANCE,
  YES_NO_OPTIONS,
  DUE_TO_FIRE_OPTIONS,
  RISK_OF_PANIC_OPTIONS,
  CONSEQUENCES_OF_DAMAGES_OPTIONS,
  DUE_TO_OVERVOLTAGES_1_OPTIONS,
  LOSS_OF_SERVICES_OPTIONS,
  LOSS_OF_CULTURAL_HERITAGE_OPTIONS,
  SPECIAL_HAZARDS_OPTIONS,
  DUE_TO_FIRE_2_OPTIONS,
  DUE_TO_OVERVOLTAGES_2_OPTIONS,
  DUE_TO_STEP_TOUCH_VOLTAGES_OPTIONS,
  TOLERABLE_RISK_OPTIONS,
  CABLE_SITUATION_OPTIONS,
  CABLE_SHIELDED_OPTIONS,
  TRANSFORMER_MVLV_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  BURIED_SERVICE_TYPE_OPTIONS,
  MAST_TYPES,
  ANCHOR_SEPARATION_OPTIONS,
  PROTECTION_LEVELS,
  PROTECTION_LEVELS_CTE,
  CONDUCTOR_TYPES,
  ROOF_COVER_TYPES,
  GROUND_SYSTEM_TYPES,
  GROUND_MATERIAL_TYPES,
  CONDUCTOR_MATERIALS,
  ROOF_TYPES,
  GROUND_TYPES,
  DIFFERENTIAL_OPTIONS,
  VOLTAGE_OPTIONS,
  getTranslatedOptions,
  type SelectOption,
  type CountryOption,
  type NormativeOption,
} from '@/config/formConfig'

interface TranslatedOptionsContextValue {
  COUNTRIES: Array<{ value: string; label: string }>
  NORMATIVES: Array<{ value: string; label: string }>
  STRUCTURE_TYPES: Array<{ value: string; label: string }>
  FIRE_RISK_LEVELS: Array<{ value: string; label: string }>
  SITUATION_OPTIONS: Array<{ value: string; label: string }>
  ENVIRONMENTAL_FACTOR_OPTIONS: Array<{ value: string; label: string }>
  GROUND_TYPE_OPTIONS: Array<{ value: string; label: string }>
  FIRE_PROTECTION_LEVELS: Array<{ value: string; label: string }>
  ROOF_FIRE_RESISTANCE: Array<{ value: string; label: string }>
  YES_NO_OPTIONS: Array<{ value: string; label: string }>
  DUE_TO_FIRE_OPTIONS: Array<{ value: string; label: string }>
  RISK_OF_PANIC_OPTIONS: Array<{ value: string; label: string }>
  CONSEQUENCES_OF_DAMAGES_OPTIONS: Array<{ value: string; label: string }>
  DUE_TO_OVERVOLTAGES_1_OPTIONS: Array<{ value: string; label: string }>
  LOSS_OF_SERVICES_OPTIONS: Array<{ value: string; label: string }>
  LOSS_OF_CULTURAL_HERITAGE_OPTIONS: Array<{ value: string; label: string }>
  SPECIAL_HAZARDS_OPTIONS: Array<{ value: string; label: string }>
  DUE_TO_FIRE_2_OPTIONS: Array<{ value: string; label: string }>
  DUE_TO_OVERVOLTAGES_2_OPTIONS: Array<{ value: string; label: string }>
  DUE_TO_STEP_TOUCH_VOLTAGES_OPTIONS: Array<{ value: string; label: string }>
  TOLERABLE_RISK_OPTIONS: Array<{ value: string; label: string }>
  CABLE_SITUATION_OPTIONS: Array<{ value: string; label: string }>
  CABLE_SHIELDED_OPTIONS: Array<{ value: string; label: string }>
  TRANSFORMER_MVLV_OPTIONS: Array<{ value: string; label: string }>
  SERVICE_TYPE_OPTIONS: Array<{ value: string; label: string }>
  BURIED_SERVICE_TYPE_OPTIONS: Array<{ value: string; label: string }>
  MAST_TYPES: Array<{ value: string; label: string }>
  ANCHOR_SEPARATION_OPTIONS: Array<{ value: string; label: string }>
  PROTECTION_LEVELS: Array<{ value: string; label: string }>
  PROTECTION_LEVELS_CTE: Array<{ value: string; label: string }>
  CONDUCTOR_TYPES: Array<{ value: string; label: string }>
  ROOF_COVER_TYPES: Array<{ value: string; label: string }>
  GROUND_SYSTEM_TYPES: Array<{ value: string; label: string }>
  GROUND_MATERIAL_TYPES: Array<{ value: string; label: string }>
  CONDUCTOR_MATERIALS: Array<{ value: string; label: string }>
  ROOF_TYPES: Array<{ value: string; label: string }>
  GROUND_TYPES: Array<{ value: string; label: string }>
  DIFFERENTIAL_OPTIONS: Array<{ value: string; label: string }>
  VOLTAGE_OPTIONS: Array<{ value: string; label: string }>
}

const TranslatedOptionsContext = createContext<TranslatedOptionsContextValue | null>(null)

export function TranslatedOptionsProvider({ children }: { children: ReactNode }) {
  const value = useMemo<TranslatedOptionsContextValue>(() => ({
    COUNTRIES: getTranslatedOptions(COUNTRIES as SelectOption[]),
    NORMATIVES: getTranslatedOptions(NORMATIVES as SelectOption[]),
    STRUCTURE_TYPES: getTranslatedOptions(STRUCTURE_TYPES),
    FIRE_RISK_LEVELS: getTranslatedOptions(FIRE_RISK_LEVELS),
    SITUATION_OPTIONS: getTranslatedOptions(SITUATION_OPTIONS),
    ENVIRONMENTAL_FACTOR_OPTIONS: getTranslatedOptions(ENVIRONMENTAL_FACTOR_OPTIONS),
    GROUND_TYPE_OPTIONS: getTranslatedOptions(GROUND_TYPE_OPTIONS),
    FIRE_PROTECTION_LEVELS: getTranslatedOptions(FIRE_PROTECTION_LEVELS),
    ROOF_FIRE_RESISTANCE: getTranslatedOptions(ROOF_FIRE_RESISTANCE),
    YES_NO_OPTIONS: getTranslatedOptions(YES_NO_OPTIONS),
    DUE_TO_FIRE_OPTIONS: getTranslatedOptions(DUE_TO_FIRE_OPTIONS),
    RISK_OF_PANIC_OPTIONS: getTranslatedOptions(RISK_OF_PANIC_OPTIONS),
    CONSEQUENCES_OF_DAMAGES_OPTIONS: getTranslatedOptions(CONSEQUENCES_OF_DAMAGES_OPTIONS),
    DUE_TO_OVERVOLTAGES_1_OPTIONS: getTranslatedOptions(DUE_TO_OVERVOLTAGES_1_OPTIONS),
    LOSS_OF_SERVICES_OPTIONS: getTranslatedOptions(LOSS_OF_SERVICES_OPTIONS),
    LOSS_OF_CULTURAL_HERITAGE_OPTIONS: getTranslatedOptions(LOSS_OF_CULTURAL_HERITAGE_OPTIONS),
    SPECIAL_HAZARDS_OPTIONS: getTranslatedOptions(SPECIAL_HAZARDS_OPTIONS),
    DUE_TO_FIRE_2_OPTIONS: getTranslatedOptions(DUE_TO_FIRE_2_OPTIONS),
    DUE_TO_OVERVOLTAGES_2_OPTIONS: getTranslatedOptions(DUE_TO_OVERVOLTAGES_2_OPTIONS),
    DUE_TO_STEP_TOUCH_VOLTAGES_OPTIONS: getTranslatedOptions(DUE_TO_STEP_TOUCH_VOLTAGES_OPTIONS),
    TOLERABLE_RISK_OPTIONS: getTranslatedOptions(TOLERABLE_RISK_OPTIONS),
    CABLE_SITUATION_OPTIONS: getTranslatedOptions(CABLE_SITUATION_OPTIONS),
    CABLE_SHIELDED_OPTIONS: getTranslatedOptions(CABLE_SHIELDED_OPTIONS),
    TRANSFORMER_MVLV_OPTIONS: getTranslatedOptions(TRANSFORMER_MVLV_OPTIONS),
    SERVICE_TYPE_OPTIONS: getTranslatedOptions(SERVICE_TYPE_OPTIONS),
    BURIED_SERVICE_TYPE_OPTIONS: getTranslatedOptions(BURIED_SERVICE_TYPE_OPTIONS),
    MAST_TYPES: getTranslatedOptions(MAST_TYPES),
    ANCHOR_SEPARATION_OPTIONS: getTranslatedOptions(ANCHOR_SEPARATION_OPTIONS),
    PROTECTION_LEVELS: getTranslatedOptions(PROTECTION_LEVELS),
    PROTECTION_LEVELS_CTE: getTranslatedOptions(PROTECTION_LEVELS_CTE),
    CONDUCTOR_TYPES: getTranslatedOptions(CONDUCTOR_TYPES),
    ROOF_COVER_TYPES: getTranslatedOptions(ROOF_COVER_TYPES),
    GROUND_SYSTEM_TYPES: getTranslatedOptions(GROUND_SYSTEM_TYPES),
    GROUND_MATERIAL_TYPES: getTranslatedOptions(GROUND_MATERIAL_TYPES),
    CONDUCTOR_MATERIALS: getTranslatedOptions(CONDUCTOR_MATERIALS),
    ROOF_TYPES: getTranslatedOptions(ROOF_TYPES),
    GROUND_TYPES: getTranslatedOptions(GROUND_TYPES),
    DIFFERENTIAL_OPTIONS: getTranslatedOptions(DIFFERENTIAL_OPTIONS),
    VOLTAGE_OPTIONS: getTranslatedOptions(VOLTAGE_OPTIONS),
  }), [])

  return (
    <TranslatedOptionsContext.Provider value={value}>
      {children}
    </TranslatedOptionsContext.Provider>
  )
}

export function useTranslatedOptions() {
  const context = useContext(TranslatedOptionsContext)
  if (!context) {
    throw new Error('useTranslatedOptions debe usarse dentro de TranslatedOptionsProvider')
  }
  return context
}
