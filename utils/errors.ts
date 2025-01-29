// Custom error types for better error handling
export class AuthError extends Error {
  code: string
  
  constructor(message: string, code: string = 'AUTH_ERROR') {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

export class DatabaseError extends Error {
  code: string
  details?: any
  
  constructor(message: string, code: string = 'DB_ERROR', details?: any) {
    super(message)
    this.name = 'DatabaseError'
    this.code = code
    this.details = details
  }
}

// Server-side error codes
export const ServerErrorCode = {
  // Authentication errors
  INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  INVALID_EMAIL: 'AUTH_INVALID_EMAIL',
  INVALID_PASSWORD: 'AUTH_INVALID_PASSWORD',
  USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  EMAIL_IN_USE: 'AUTH_EMAIL_IN_USE',
  EMAIL_NOT_CONFIRMED: 'AUTH_EMAIL_NOT_CONFIRMED',
  SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  INVALID_SESSION: 'AUTH_INVALID_SESSION',
  SESSION_REFRESH: 'AUTH_SESSION_REFRESH',
  AUTH_API_ERROR: 'AUTH_API_ERROR',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  
  // Database errors
  DATABASE_ERROR: 'DB_ERROR',
  CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
  QUERY_ERROR: 'DB_QUERY_ERROR',
  ROLE_UPDATE_FAILED: 'AUTH_ROLE_UPDATE_FAILED',
  PROFILE_CREATE_FAILED: 'AUTH_PROFILE_CREATE_FAILED',
  EMPLOYEE_CREATE_FAILED: 'AUTH_EMPLOYEE_CREATE_FAILED',
  
  // Server errors
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
  
  // Cookie errors
  COOKIE_ERROR: 'COOKIE_ERROR',
  INVALID_CONTEXT: 'COOKIE_INVALID_CONTEXT',
  SET_FAILED: 'COOKIE_SET_FAILED',
  REMOVE_FAILED: 'COOKIE_REMOVE_FAILED',
  SET_ALL_FAILED: 'COOKIE_SET_ALL_FAILED',
  
  // Session errors
  SESSION_ERROR: 'SESSION_ERROR',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  SESSION_INVALID: 'SESSION_INVALID'
} as const

// Helper function to parse Supabase errors
export function parseSupabaseError(error: any): AuthError {
  if (!error) {
    return new AuthError('Unknown error occurred', ServerErrorCode.UNKNOWN)
  }

  // Handle Supabase auth errors
  if (error.message?.includes('Invalid login credentials')) {
    return new AuthError('Invalid email or password', ServerErrorCode.INVALID_CREDENTIALS)
  }

  if (error.message?.includes('Email not confirmed')) {
    return new AuthError('Please confirm your email address', ServerErrorCode.EMAIL_NOT_CONFIRMED)
  }

  if (error.message?.includes('User not found')) {
    return new AuthError('User not found', ServerErrorCode.USER_NOT_FOUND)
  }

  if (error.message?.includes('JWT expired')) {
    return new AuthError('Session expired, please sign in again', ServerErrorCode.SESSION_EXPIRED)
  }

  // Database-related errors
  if (error.code?.startsWith('22') || error.code?.startsWith('23')) {
    return new DatabaseError(error.message, ServerErrorCode.DATABASE_ERROR, error)
  }

  return new AuthError(error.message || 'An unknown error occurred', ServerErrorCode.UNKNOWN)
} 