/**
 * Logging utility for the application
 * - In development: logs to console
 * - In production: can be extended to send to error tracking service
 */

const isDev = import.meta.env.DEV

export const logger = {
  /**
   * Log informational messages (only in development)
   */
  info: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.log(`[INFO] ${message}`, ...args)
    }
  },

  /**
   * Log warning messages (only in development)
   */
  warn: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  },

  /**
   * Log error messages
   * In production, this should be sent to an error tracking service
   */
  error: (message: string, error?: Error | unknown) => {
    if (isDev) {
      console.error(`[ERROR] ${message}`, error)
    } else {
      // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
      // Example: Sentry.captureException(error, { message })
    }
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  },
}
