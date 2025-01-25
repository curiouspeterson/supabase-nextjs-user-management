export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'APP_ERROR',
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR', 401)
    this.name = 'AuthError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 'DATABASE_ERROR', 500)
    this.name = 'DatabaseError'
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message, 'NETWORK_ERROR', 503)
    this.name = 'NetworkError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string) {
    super(message, 'RATE_LIMIT_ERROR', 429)
    this.name = 'RateLimitError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 'NOT_FOUND_ERROR', 404)
    this.name = 'NotFoundError'
  }
}

interface ErrorLogData {
  error: Error
  context?: string
  timestamp: string
  userAgent?: string
  url?: string
}

class ErrorHandler {
  private static instance: ErrorHandler
  private errorLog: ErrorLogData[] = []
  private readonly maxLogSize = 100

  private constructor() {
    // Private constructor to enforce singleton
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  handleError(error: unknown, context?: string): AppError {
    const appError = this.normalizeError(error)
    
    // Log error
    this.logError(appError, context)
    
    return appError
  }

  private normalizeError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error
    }

    if (error instanceof Error) {
      // Check for specific error types based on message or name
      if (this.isNetworkError(error)) {
        return new NetworkError(error.message)
      }
      if (this.isAuthError(error)) {
        return new AuthError(error.message)
      }
      if (this.isValidationError(error)) {
        return new ValidationError(error.message)
      }
      if (this.isRateLimitError(error)) {
        return new RateLimitError(error.message)
      }
      if (this.isNotFoundError(error)) {
        return new NotFoundError(error.message)
      }
      
      // Default to generic AppError
      return new AppError(error.message)
    }

    // Handle non-Error objects
    const message = error instanceof Object ? JSON.stringify(error) : String(error)
    return new AppError(message)
  }

  private isNetworkError(error: Error): boolean {
    return (
      error.message.toLowerCase().includes('network') ||
      error.message.toLowerCase().includes('fetch') ||
      error.message.toLowerCase().includes('timeout') ||
      error.name === 'NetworkError'
    )
  }

  private isAuthError(error: Error): boolean {
    return (
      error.message.toLowerCase().includes('unauthorized') ||
      error.message.toLowerCase().includes('unauthenticated') ||
      error.message.toLowerCase().includes('auth') ||
      error.name === 'AuthError'
    )
  }

  private isValidationError(error: Error): boolean {
    return (
      error.message.toLowerCase().includes('validation') ||
      error.message.toLowerCase().includes('invalid') ||
      error.name === 'ValidationError'
    )
  }

  private isRateLimitError(error: Error): boolean {
    return (
      error.message.toLowerCase().includes('rate limit') ||
      error.message.toLowerCase().includes('too many requests') ||
      error.name === 'RateLimitError'
    )
  }

  private isNotFoundError(error: Error): boolean {
    return (
      error.message.toLowerCase().includes('not found') ||
      error.name === 'NotFoundError'
    )
  }

  private logError(error: AppError, context?: string) {
    const errorData: ErrorLogData = {
      error,
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    }

    // Add to log array
    this.errorLog.unshift(errorData)

    // Keep log size under limit
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.pop()
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', {
        name: error.name,
        message: error.message,
        code: error.code,
        context,
        stack: error.stack
      })
    }
  }

  formatErrorMessage(error: unknown): string {
    const appError = this.normalizeError(error)
    
    switch (appError.name) {
      case 'ValidationError':
        return appError.message
      case 'AuthError':
        return 'Authentication error. Please try again or contact support.'
      case 'DatabaseError':
        return 'An error occurred while accessing the database. Please try again later.'
      case 'NetworkError':
        return 'Unable to connect. Please check your internet connection and try again.'
      case 'RateLimitError':
        return appError.message
      case 'NotFoundError':
        return 'The requested resource was not found.'
      default:
        return 'An unexpected error occurred. Please try again later.'
    }
  }

  getErrorLog(): ErrorLogData[] {
    return [...this.errorLog]
  }

  clearErrorLog(): void {
    this.errorLog = []
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance() 