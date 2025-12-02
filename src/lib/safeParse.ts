/**
 * Utilidad para parsear JSON de forma segura
 * Previene ataques de prototype pollution
 */

/**
 * Recursivamente sanitiza un objeto eliminando propiedades peligrosas
 * que podrían causar prototype pollution
 */
function sanitizeObject(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // Si es un array, sanitizar cada elemento
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item))
  }

  // Si es un objeto, crear uno nuevo sin propiedades peligrosas
  const sanitized: Record<string, unknown> = {}

  for (const key in obj) {
    // Ignorar propiedades peligrosas que podrían modificar el prototipo
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue
    }

    // Verificar que la propiedad pertenezca al objeto y no al prototipo
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = (obj as Record<string, unknown>)[key]
      // Recursivamente sanitizar valores anidados
      sanitized[key] = sanitizeObject(value)
    }
  }

  return sanitized
}

/**
 * Parsea JSON de forma segura previniendo prototype pollution
 * @param jsonString - String JSON a parsear
 * @returns Objeto parseado y sanitizado
 * @throws Error si el JSON es inválido
 */
export function safeParse<T = unknown>(jsonString: string): T {
  try {
    const parsed = JSON.parse(jsonString)
    const sanitized = sanitizeObject(parsed)
    return sanitized as T
  } catch (error) {
    throw new Error(`Error parsing JSON: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Parsea JSON de forma segura con valor por defecto en caso de error
 * @param jsonString - String JSON a parsear
 * @param defaultValue - Valor a retornar si el parseo falla
 * @returns Objeto parseado y sanitizado o el valor por defecto
 */
export function safeParseWithDefault<T>(jsonString: string, defaultValue: T): T {
  try {
    return safeParse<T>(jsonString)
  } catch {
    return defaultValue
  }
}
