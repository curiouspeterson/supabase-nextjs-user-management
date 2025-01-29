/**
 * Error handling types and interfaces for the application's error management system.
 * This module provides a comprehensive set of types for error tracking, monitoring,
 * and internationalization.
 * @module types/error
 */

import { createClient } from '@/utils/supabase/client'

/**
 * Enum for error recovery strategies
 */
export enum ErrorRecoveryStrategy {
  /** Retry the failed operation */
  RETRY = 'RETRY',
  /** Refresh the page */
  REFRESH = 'REFRESH',
  /** Reset application state */
  RESET = 'RESET',
  /** Use fallback functionality */
  FALLBACK = 'FALLBACK',
  /** No automatic recovery possible */
  NONE = 'NONE'
}

/**
 * Enum for error severity levels
 */
export enum ErrorSeverity {
  /** Low impact errors */
  LOW = 'LOW',
  /** Medium impact errors */
  MEDIUM = 'MEDIUM',
  /** High impact errors */
  HIGH = 'HIGH',
  /** Critical errors */
  CRITICAL = 'CRITICAL'
}

/**
 * Enum for error categories
 */
export enum ErrorCategory {
  /** Network-related errors */
  NETWORK = 'NETWORK',
  /** Authentication errors */
  AUTH = 'AUTH',
  /** Validation errors */
  VALIDATION = 'VALIDATION',
  /** Performance errors */
  PERFORMANCE = 'PERFORMANCE',
  /** Security errors */
  SECURITY = 'SECURITY',
  /** Data-related errors */
  DATA = 'DATA',
  /** Storage-related errors */
  STORAGE = 'STORAGE',
  /** Rate limiting errors */
  RATE_LIMIT = 'RATE_LIMIT',
  /** Monitoring errors */
  MONITORING = 'MONITORING',
  /** Unknown errors */
  UNKNOWN = 'UNKNOWN'
}

/**
 * Interface for error metadata that provides context about an error occurrence.
 * This includes support for internationalization through the i18n property.
 */
export interface ErrorMetadata {
  /** Unique error code for identification */
  code?: string;
  /** Context in which the error occurred */
  context?: string;
  /** ID of the user who encountered the error */
  userId?: string;
  /** 
   * Internationalization data for error messages.
   * Used by getLocalizedMessage to provide translated error messages.
   */
  i18n?: {
    /** Translation key for looking up the localized message */
    key: string;
    /** Values to interpolate into the translated message */
    values?: Record<string, string | number>;
  };
  /** Additional contextual data */
  [key: string]: unknown;
}

/**
 * Interface for tracking error metrics and analytics.
 * Used by the error monitoring system to track error patterns and recovery effectiveness.
 */
export interface ErrorMetrics {
  /** Number of occurrences */
  count: number;
  /** First occurrence timestamp */
  firstSeen: string;
  /** Last occurrence timestamp */
  lastSeen: string;
  /** Error contexts */
  contexts: string[];
  /** User agents */
  userAgents: string[];
  /** URLs where error occurred */
  urls: string[];
  /** Error severity */
  severity: ErrorSeverity;
  /** Error category */
  category: ErrorCategory;
  /** Recovery strategy */
  recoveryStrategy: ErrorRecoveryStrategy;
  /** Number of affected users */
  impactedUsers: number;
  /** Recovery success rate */
  recoveryRate: number;
  /** Average resolution time */
  avgResolutionTime: number;
  /** Related error keys */
  relatedErrors: string[];
  /** Error frequency */
  frequency: number;
  /** Total recovery attempts */
  totalAttempts: number;
  /** Successful recovery attempts */
  successfulAttempts: number;
  /** Consecutive failures */
  consecutiveFailures: number;
  /** Last resolution time */
  lastResolutionTime: number;
  /** Maximum resolution time */
  maxResolutionTime: number;
  /** Minimum resolution time */
  minResolutionTime: number;
  /** Last recovery timestamp */
  lastRecoveryTime: string | null;
  /** Recovery attempts by strategy */
  recoveryAttempts: Record<ErrorRecoveryStrategy, {
    attempts: number;
    successes: number;
  }>;
}

/**
 * Interface for analyzing error trends over time.
 * Used by the analytics system to track error patterns and identify recurring issues.
 */
export interface ErrorTrend {
  /** Trend timestamp */
  timestamp: string;
  /** Error count */
  count: number;
  /** Error severity */
  severity: ErrorSeverity;
  /** Error category */
  category: ErrorCategory;
  /** Affected users count */
  impactedUsers: number;
}

/**
 * Interface for internationalized error messages.
 * Used by error classes to support multiple languages through the translation system.
 */
export interface I18nErrorMessage {
  /** Default message in English, used as fallback */
  defaultMessage: string;
  /** Translation key for looking up the localized message */
  i18nKey: string;
  /** Values to interpolate into the translated message */
  values?: Record<string, string | number>;
}

/**
 * Base error class
 */
export class AppError extends Error {
  private static supabase = createClient();
  private static statusCodeCache = new Map<string, number>();

  constructor(
    message: string | I18nErrorMessage,
    public code: string = 'APP_ERROR',
    public severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    public category: ErrorCategory = ErrorCategory.UNKNOWN,
    public metadata: ErrorMetadata = {},
    public recoveryStrategy: ErrorRecoveryStrategy = ErrorRecoveryStrategy.RETRY
  ) {
    super(typeof message === 'string' ? message : message.defaultMessage);
    this.name = 'AppError';
    
    if (typeof message !== 'string') {
      this.metadata = {
        ...this.metadata,
        i18n: {
          key: message.i18nKey,
          values: message.values
        }
      };
    }

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Get HTTP status code for the error
   */
  async getStatusCode(): Promise<number> {
    try {
      // Check cache first
      const cachedCode = AppError.statusCodeCache.get(this.code);
      if (cachedCode) return cachedCode;

      // Query database for status code
      const { data, error } = await AppError.supabase
        .rpc('get_error_http_code', {
          p_error_code: this.code
        });

      if (error) throw error;

      const statusCode = data || 500;
      AppError.statusCodeCache.set(this.code, statusCode);
      
      return statusCode;
    } catch (error) {
      console.error('Failed to get HTTP status code:', error);
      return 500;
    }
  }

  /**
   * Get localized error message
   */
  getLocalizedMessage(t: (key: string, values?: Record<string, string | number>) => string): string {
    if (this.metadata.i18n) {
      return t(this.metadata.i18n.key as string, this.metadata.i18n.values);
    }
    return this.message;
  }
}

/**
 * Network error class
 */
export class NetworkError extends AppError {
  constructor(message: string | I18nErrorMessage, metadata: ErrorMetadata = {}) {
    super(
      message,
      'NETWORK_ERROR',
      ErrorSeverity.HIGH,
      ErrorCategory.NETWORK,
      metadata,
      ErrorRecoveryStrategy.RETRY
    );
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Validation error class
 */
export class ValidationError extends AppError {
  constructor(message: string | I18nErrorMessage, metadata: ErrorMetadata = {}) {
    super(
      message,
      'VALIDATION_ERROR',
      ErrorSeverity.LOW,
      ErrorCategory.VALIDATION,
      metadata,
      ErrorRecoveryStrategy.NONE
    );
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Authentication error class
 */
export class AuthError extends AppError {
  constructor(message: string | I18nErrorMessage, metadata: ErrorMetadata = {}) {
    super(
      message,
      'AUTH_ERROR',
      ErrorSeverity.HIGH,
      ErrorCategory.AUTH,
      metadata,
      ErrorRecoveryStrategy.REFRESH
    );
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * Security error class
 */
export class SecurityError extends AppError {
  constructor(message: string | I18nErrorMessage, metadata: ErrorMetadata = {}) {
    super(
      message,
      'SECURITY_ERROR',
      ErrorSeverity.CRITICAL,
      ErrorCategory.SECURITY,
      metadata,
      ErrorRecoveryStrategy.NONE
    );
    this.name = 'SecurityError';
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

/**
 * Performance error class
 */
export class PerformanceError extends AppError {
  constructor(message: string | I18nErrorMessage, metadata: ErrorMetadata = {}) {
    super(
      message,
      'PERFORMANCE_ERROR',
      ErrorSeverity.MEDIUM,
      ErrorCategory.PERFORMANCE,
      metadata,
      ErrorRecoveryStrategy.RESET
    );
    this.name = 'PerformanceError';
    Object.setPrototypeOf(this, PerformanceError.prototype);
  }
}

/**
 * Rate limit error class
 */
export class RateLimitError extends AppError {
  constructor(message: string | I18nErrorMessage, metadata: ErrorMetadata = {}) {
    super(
      message,
      'RATE_LIMIT_ERROR',
      ErrorSeverity.MEDIUM,
      ErrorCategory.RATE_LIMIT,
      metadata,
      ErrorRecoveryStrategy.NONE
    );
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Not found error class
 */
export class NotFoundError extends AppError {
  constructor(message: string | I18nErrorMessage, metadata: ErrorMetadata = {}) {
    super(
      message,
      'NOT_FOUND_ERROR',
      ErrorSeverity.LOW,
      ErrorCategory.DATA,
      metadata,
      ErrorRecoveryStrategy.NONE
    );
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Conflict error class
 */
export class ConflictError extends AppError {
  constructor(message: string | I18nErrorMessage, metadata: ErrorMetadata = {}) {
    super(
      message,
      'CONFLICT_ERROR',
      ErrorSeverity.MEDIUM,
      ErrorCategory.DATA,
      metadata,
      ErrorRecoveryStrategy.NONE
    );
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class ServerError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ServerError'
  }
} 