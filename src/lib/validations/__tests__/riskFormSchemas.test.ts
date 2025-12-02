import { describe, it, expect } from 'vitest'
import {
  projectDataSchema,
  dimensionsSchema,
  validateStep,
  getFormattedErrors,
} from '../riskFormSchemas'
import { z } from 'zod'

describe('Risk Form Schemas', () => {
  describe('projectDataSchema', () => {
    it('should validate valid project data', () => {
      const validData = {
        projectName: 'Test Project',
        buildingsToProtect: 1,
        calculationNormative: 'lightning' as const,
        clientEmail: 'test@example.com',
      }

      const result = projectDataSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject project name shorter than 3 characters', () => {
      const invalidData = {
        projectName: 'AB',
        buildingsToProtect: 1,
        calculationNormative: 'lightning' as const,
      }

      const result = projectDataSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('al menos 3 caracteres')
      }
    })

    it('should reject invalid email format', () => {
      const invalidData = {
        projectName: 'Test Project',
        buildingsToProtect: 1,
        calculationNormative: 'lightning' as const,
        clientEmail: 'invalid-email',
      }

      const result = projectDataSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Email inválido')
      }
    })

    it('should reject buildings count less than 1', () => {
      const invalidData = {
        projectName: 'Test Project',
        buildingsToProtect: 0,
        calculationNormative: 'lightning' as const,
      }

      const result = projectDataSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('al menos 1 edificio')
      }
    })

    it('should reject invalid CIF format', () => {
      const invalidData = {
        projectName: 'Test Project',
        buildingsToProtect: 1,
        calculationNormative: 'lightning' as const,
        clientCIF: 'INVALID',
      }

      const result = projectDataSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('CIF inválido')
      }
    })

    it('should accept valid CIF format', () => {
      const validData = {
        projectName: 'Test Project',
        buildingsToProtect: 1,
        calculationNormative: 'lightning' as const,
        clientCIF: 'A12345678',
      }

      const result = projectDataSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate phone number format', () => {
      const validData = {
        projectName: 'Test Project',
        buildingsToProtect: 1,
        calculationNormative: 'lightning' as const,
        clientPhone: '+34 123 456 789',
      }

      const result = projectDataSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('dimensionsSchema', () => {
    it('should validate valid dimensions', () => {
      const validData = {
        length: '80.00',
        width: '50.00',
        height: '20.00',
      }

      const result = dimensionsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject non-numeric length', () => {
      const invalidData = {
        length: 'abc',
        width: '50.00',
        height: '20.00',
      }

      const result = dimensionsSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('número válido')
      }
    })

    it('should reject length greater than 1000m', () => {
      const invalidData = {
        length: '1500',
        width: '50.00',
        height: '20.00',
      }

      const result = dimensionsSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('no puede exceder 1000m')
      }
    })

    it('should reject zero or negative dimensions', () => {
      const invalidData = {
        length: '0',
        width: '50.00',
        height: '20.00',
      }

      const result = dimensionsSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('mayor que 0')
      }
    })

    it('should validate enum values for structure type', () => {
      const validData = {
        length: '80.00',
        width: '50.00',
        height: '20.00',
        typeOfStructure: 'Hormigon' as const,
      }

      const result = dimensionsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid structure type', () => {
      const invalidData = {
        length: '80.00',
        width: '50.00',
        height: '20.00',
        typeOfStructure: 'InvalidType',
      }

      const result = dimensionsSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('validateStep', () => {
    it('should validate project_data step successfully', () => {
      const validData = {
        projectName: 'Test Project',
        buildingsToProtect: 1,
        calculationNormative: 'lightning',
      }

      const result = validateStep('project_data', validData)
      expect(result.success).toBe(true)
      expect(result.errors).toBeUndefined()
    })

    it('should return errors for invalid project_data step', () => {
      const invalidData = {
        projectName: 'AB', // Too short
        buildingsToProtect: 0, // Too low
        calculationNormative: 'invalid',
      }

      const result = validateStep('project_data', invalidData)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should validate dimensions step successfully', () => {
      const validData = {
        length: '80.00',
        width: '50.00',
        height: '20.00',
      }

      const result = validateStep('dimensions', validData)
      expect(result.success).toBe(true)
    })

    it('should return success for unknown step', () => {
      const result = validateStep('unknown_step', {})
      expect(result.success).toBe(true)
    })
  })

  describe('getFormattedErrors', () => {
    it('should format Zod errors correctly', () => {
      const schema = z.object({
        name: z.string().min(3),
        age: z.number().min(18),
      })

      const result = schema.safeParse({ name: 'AB', age: 10 })
      if (!result.success) {
        const formatted = getFormattedErrors(result.error)

        expect(formatted).toHaveProperty('name')
        expect(formatted).toHaveProperty('age')
        expect(typeof formatted.name).toBe('string')
        expect(typeof formatted.age).toBe('string')
      }
    })

    it('should handle nested path errors', () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string().min(3),
          }),
        }),
      })

      const result = schema.safeParse({ user: { profile: { name: 'AB' } } })
      if (!result.success) {
        const formatted = getFormattedErrors(result.error)

        expect(formatted).toHaveProperty('user.profile.name')
      }
    })

    it('should return empty object for no errors', () => {
      const schema = z.object({ name: z.string() })
      const validResult = schema.safeParse({ name: 'Valid' })

      // This test checks the function behavior with a hypothetically empty error
      // In practice, getFormattedErrors should only be called with actual errors
      const formatted = getFormattedErrors(new z.ZodError([]))
      expect(formatted).toEqual({})
    })
  })

  describe('Complex Validation Scenarios', () => {
    it('should validate complete form data', () => {
      const completeData = {
        // Project data
        projectName: 'Complete Project',
        buildingsToProtect: 2,
        calculationNormative: 'lightning' as const,
        clientEmail: 'client@example.com',
        clientPhone: '+34 123456789',

        // Dimensions
        length: '100.00',
        width: '60.00',
        height: '25.00',
        typeOfStructure: 'Hormigon' as const,
        riskOfFire: 'Comun' as const,
      }

      const projectResult = projectDataSchema.safeParse(completeData)
      const dimensionsResult = dimensionsSchema.safeParse(completeData)

      expect(projectResult.success).toBe(true)
      expect(dimensionsResult.success).toBe(true)
    })

    it('should handle optional fields correctly', () => {
      const minimalData = {
        projectName: 'Minimal Project',
        buildingsToProtect: 1,
        calculationNormative: 'lightning' as const,
        // All optional fields omitted
      }

      const result = projectDataSchema.safeParse(minimalData)
      expect(result.success).toBe(true)
    })
  })
})
