/**
 * Sistema de labels bilingües para formConfig
 * En modo dev, usa español por defecto
 */

// Tipo para labels bilingües
export interface BilingualLabel {
  es: string
  en: string
}

// Tipo para opciones con labels bilingües
export interface BilingualSelectOption {
  value: string
  label: BilingualLabel
}

// Idioma actual (en producción vendría del login, en dev usa español)
const getCurrentLanguage = (): 'es' | 'en' => {
  // TODO: En producción, obtener del contexto de autenticación/login
  // Por ahora en modo dev usa español
  const isDev = import.meta.env.DEV
  if (isDev) {
    return 'es'
  }

  // En producción, intentar obtener del localStorage o contexto
  const storedLang = localStorage.getItem('app-language') as 'es' | 'en' | null
  return storedLang || 'es'
}

/**
 * Transforma un label bilingüe a string según el idioma actual
 */
export function transformLabel(label: BilingualLabel | string): string {
  if (typeof label === 'string') {
    return label
  }

  const lang = getCurrentLanguage()
  return label[lang]
}

/**
 * Transforma un array de opciones bilingües a opciones normales
 * según el idioma actual
 */
export function transformOptions<T extends { label: BilingualLabel | string }>(
  options: T[]
): Array<Omit<T, 'label'> & { label: string }> {
  return options.map(option => ({
    ...option,
    label: transformLabel(option.label),
  }))
}

/**
 * Hook React para obtener opciones traducidas
 */
export function useTranslatedOptions<T extends { label: BilingualLabel | string }>(
  options: T[]
): Array<Omit<T, 'label'> & { label: string }> {
  // Por ahora no es necesario un efecto reactivo porque el idioma
  // solo cambia al hacer login, pero se puede agregar un listener
  return transformOptions(options)
}

/**
 * Helper para crear labels bilingües fácilmente
 */
export function createBilingualLabel(es: string, en: string): BilingualLabel {
  return { es, en }
}
