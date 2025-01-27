/**
 * Error handling types and interfaces
 * @module types/error
 */

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
  /** Unknown errors */
  UNKNOWN = 'UNKNOWN'
}

/**
 * Interface for error metadata
 */
export interface ErrorMetadata {
  /** Error code */
  code?: string;
  /** Error context */
  context?: string;
  /** User ID if applicable */
  userId?: string;
  /** Additional data */
  [key: string]: unknown;
}

/**
 * Interface for error metrics
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
 * Interface for error trends
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
 * Base error class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'APP_ERROR',
    public severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    public category: ErrorCategory = ErrorCategory.UNKNOWN,
    public metadata: ErrorMetadata = {},
    public recoveryStrategy: ErrorRecoveryStrategy = ErrorRecoveryStrategy.RETRY
  ) {
    super(message);
    this.name = 'AppError';
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Network error class
 */
export class NetworkError extends AppError {
  constructor(message: string, metadata: ErrorMetadata = {}) {
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
  constructor(message: string, metadata: ErrorMetadata = {}) {
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
  constructor(message: string, metadata: ErrorMetadata = {}) {
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
  constructor(message: string, metadata: ErrorMetadata = {}) {
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
  constructor(message: string, metadata: ErrorMetadata = {}) {
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