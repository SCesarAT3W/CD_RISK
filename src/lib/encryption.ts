/**
 * Utilidad de encriptación para localStorage
 * Usa Web Crypto API para encriptar/desencriptar datos sensibles
 */

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12 // 96 bits para AES-GCM

/**
 * Genera una clave de encriptación a partir de una contraseña
 * @param password - Contraseña base
 * @param salt - Salt para la derivación de clave
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)

  // Importar la contraseña como clave base
  const baseKey = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, ['deriveKey'])

  // Derivar clave usando PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000, // OWASP recomienda mínimo 100,000 iteraciones
      hash: 'SHA-256',
    },
    baseKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Obtiene o genera una clave de encriptación única para la sesión
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  // En producción, esto debería venir de un servicio de autenticación seguro
  // Por ahora, usamos una combinación de identificadores del navegador
  const password = `cd-risk-${navigator.userAgent}-${window.location.origin}`

  // Salt único por instalación (se almacena en localStorage sin encriptar)
  let saltHex = localStorage.getItem('_encryption_salt')
  let salt: Uint8Array

  if (!saltHex) {
    // Generar nuevo salt
    salt = crypto.getRandomValues(new Uint8Array(16))
    saltHex = Array.from(salt)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    localStorage.setItem('_encryption_salt', saltHex)
  } else {
    // Convertir hex a Uint8Array
    const matches = saltHex.match(/.{1,2}/g)
    if (!matches) throw new Error('Invalid salt format')
    salt = new Uint8Array(matches.map((byte) => parseInt(byte, 16)))
  }

  return deriveKey(password, salt)
}

/**
 * Encripta datos usando AES-GCM
 * @param data - Datos a encriptar (objeto JavaScript)
 * @returns String encriptado en formato base64
 */
export async function encrypt(data: unknown): Promise<string> {
  try {
    const key = await getEncryptionKey()
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

    // Serializar datos a JSON
    const encoder = new TextEncoder()
    const dataString = JSON.stringify(data)
    const dataBuffer = encoder.encode(dataString)

    // Encriptar
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv,
      },
      key,
      dataBuffer
    )

    // Combinar IV + datos encriptados
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(encryptedBuffer), iv.length)

    // Convertir a base64
    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Desencripta datos previamente encriptados
 * @param encryptedData - String encriptado en formato base64
 * @returns Datos desencriptados
 */
export async function decrypt<T = unknown>(encryptedData: string): Promise<T> {
  try {
    const key = await getEncryptionKey()

    // Convertir de base64 a Uint8Array
    const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0))

    // Extraer IV y datos encriptados
    const iv = combined.slice(0, IV_LENGTH)
    const encryptedBuffer = combined.slice(IV_LENGTH)

    // Desencriptar
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv,
      },
      key,
      encryptedBuffer
    )

    // Convertir a string y parsear JSON
    const decoder = new TextDecoder()
    const dataString = decoder.decode(decryptedBuffer)
    return JSON.parse(dataString) as T
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Wrapper para localStorage con encriptación automática
 */
export const secureStorage = {
  /**
   * Guarda un item en localStorage de forma encriptada
   */
  async setItem(key: string, value: unknown): Promise<void> {
    const encrypted = await encrypt(value)
    localStorage.setItem(key, encrypted)
  },

  /**
   * Obtiene un item de localStorage y lo desencripta
   */
  async getItem<T = unknown>(key: string): Promise<T | null> {
    const encrypted = localStorage.getItem(key)
    if (!encrypted) return null

    try {
      return await decrypt<T>(encrypted)
    } catch (error) {
      console.error(`Failed to decrypt item ${key}:`, error)
      return null
    }
  },

  /**
   * Elimina un item de localStorage
   */
  removeItem(key: string): void {
    localStorage.removeItem(key)
  },

  /**
   * Limpia todo el localStorage
   */
  clear(): void {
    localStorage.clear()
  },
}
