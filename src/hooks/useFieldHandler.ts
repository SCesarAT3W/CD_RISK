import { useCallback, useMemo } from 'react'

/**
 * Hook para crear handlers memorizados para campos de formulario
 * Evita re-renders innecesarios al memoizar las funciones onChange
 */
export function useFieldHandlers<T extends Record<string, unknown>>(
  onChange: (field: string, value: unknown) => void,
  fields: (keyof T)[]
) {
  // Crear un mapa de handlers memorizados para cada campo
  const handlers = useMemo(() => {
    const handlerMap: Record<string, (value: unknown) => void> = {}

    fields.forEach((field) => {
      handlerMap[field as string] = (value: unknown) => {
        onChange(field as string, value)
      }
    })

    return handlerMap
  }, [onChange, fields])

  return handlers
}

/**
 * Hook simplificado para crear un handler memoizado para un campo específico
 */
export function useFieldHandler(
  onChange: (field: string, value: unknown) => void,
  field: string
) {
  return useCallback(
    (value: unknown) => {
      onChange(field, value)
    },
    [onChange, field]
  )
}
