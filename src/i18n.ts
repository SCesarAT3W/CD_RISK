import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translations
import esCommon from './locales/es/common.json'
import esSteps from './locales/es/steps.json'
import esValidation from './locales/es/validation.json'

import enCommon from './locales/en/common.json'
import enSteps from './locales/en/steps.json'
import enValidation from './locales/en/validation.json'

// Translation resources
const resources = {
  es: {
    common: esCommon,
    steps: esSteps,
    validation: esValidation,
  },
  en: {
    common: enCommon,
    steps: enSteps,
    validation: enValidation,
  },
}

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Init i18next
  .init({
    resources,
    fallbackLng: 'es', // Fallback to Spanish if language not found
    defaultNS: 'common',
    ns: ['common', 'steps', 'validation'],

    interpolation: {
      escapeValue: false, // React already escapes by default
    },

    detection: {
      // Order and from where user language should be detected
      order: ['localStorage', 'navigator'],

      // Keys or params to lookup language from
      lookupLocalStorage: 'i18nextLng',

      // Cache user language on
      caches: ['localStorage'],
    },
  })

export default i18n
