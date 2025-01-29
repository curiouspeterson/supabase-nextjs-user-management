import { z } from 'zod'

// Security Configuration
export const SECURITY_CONFIG = {
  password: {
    minLength: 12,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecial: true,
    specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    commonPasswords: new Set([
      'password123',
      'admin123',
      '123456789',
      'qwerty123'
      // Add more common passwords here
    ])
  }
}

// Validation Schemas
export const EmailSchema = z
  .string()
  .email()
  .min(5)
  .max(254)
  .transform(email => email.toLowerCase().trim())

export const PasswordSchema = z
  .string()
  .min(SECURITY_CONFIG.password.minLength)
  .max(SECURITY_CONFIG.password.maxLength)
  .refine(
    password => /[A-Z]/.test(password),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    password => /[a-z]/.test(password),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    password => /[0-9]/.test(password),
    'Password must contain at least one number'
  )
  .refine(
    password => new RegExp(`[${SECURITY_CONFIG.password.specialChars}]`).test(password),
    'Password must contain at least one special character'
  )
  .refine(
    password => !SECURITY_CONFIG.password.commonPasswords.has(password),
    'Password is too common'
  )

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required'),
  redirect_to: z.string().optional()
})

/**
 * Validate password strength
 */
export function validatePassword(password: string): { 
  isValid: boolean;
  errors: string[];
} {
  try {
    PasswordSchema.parse(password)
    return { isValid: true, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(err => err.message)
      }
    }
    return {
      isValid: false,
      errors: ['Failed to validate password']
    }
  }
} 