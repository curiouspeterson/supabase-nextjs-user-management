// Custom error classes
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public shouldLog: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class AuthError extends AppError {
  constructor(message: string, code: string = 'AUTH_ERROR') {
    super(message, code, 401)
    this.name = 'AuthError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code: string = 'VALIDATION_ERROR') {
    super(message, code, 400)
    this.name = 'ValidationError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, code: string = 'DATABASE_ERROR') {
    super(message, code, 500)
    this.name = 'DatabaseError'
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network connection error', code: string = 'NETWORK_ERROR') {
    super(message, code, 503)
    this.name = 'NetworkError'
  }
}

// Error handler service
export class ErrorHandler {
  private static instance: ErrorHandler
  private logger: Console = console

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  setLogger(logger: Console) {
    this.logger = logger
  }

  handleError(error: Error | AppError | unknown, context?: string) {
    if (error instanceof AppError) {
      if (error.shouldLog) {
        this.logger.error(
          JSON.stringify({
            name: error.name,
            code: error.code,
            message: error.message,
            context,
            timestamp: new Date().toISOString(),
            stack: error.stack
          })
        )
      }
      return {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode
      }
    }

    // Handle unknown errors
    const unknownError = error as Error
    this.logger.error(
      JSON.stringify({
        name: unknownError.name || 'UnknownError',
        message: unknownError.message || 'An unexpected error occurred',
        context,
        timestamp: new Date().toISOString(),
        stack: unknownError.stack
      })
    )

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500
    }
  }

  // Helper method to format user-facing error messages
  formatErrorMessage(error: Error | AppError | unknown): string {
    if (error instanceof ValidationError) {
      return error.message // Show validation errors directly to users
    }
    if (error instanceof AuthError) {
      return error.message // Show auth errors directly to users
    }
    if (error instanceof NetworkError) {
      return 'Unable to connect to the server. Please check your internet connection and try again.'
    }
    if (error instanceof DatabaseError) {
      return 'A database error occurred. Please try again later.'
    }
    return 'An unexpected error occurred. Please try again later.'
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance() 