import type { Toast } from '@/types/toast'
import type { SupabaseClient, User, Session } from '@supabase/supabase-js'
import { ErrorSeverity, ErrorCategory, AppError } from './error-analytics'

/**
 * Mock function for toast notifications
 * @example
 * expect(mockToast).toHaveBeenCalledWith(createMockErrorToast('Error message'))
 */
export const mockToast = jest.fn()

/**
 * Creates a mock promise that resolves with data or rejects with an error
 * @param data - The data to resolve with
 * @param error - Optional error to reject with
 * @returns A promise that resolves with the data or rejects with the error
 * @example
 * const promise = createMockPromise({ id: 1 }, new Error('Failed'))
 */
export const createMockPromise = <T>(data: T, error?: Error): Promise<T> => {
  return new Promise((resolve, reject) => {
    if (error) {
      reject(error)
    } else {
      resolve(data)
    }
  })
}

/**
 * Creates a mock error for testing
 */
export const createMockError = (
  message: string,
  code: string = 'TEST_ERROR',
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  metadata: Record<string, any> = {}
): AppError => {
  return new AppError(message, code, severity, category, metadata)
}

/**
 * Creates a mock error metrics object for testing
 */
export const createMockErrorMetrics = (overrides = {}) => ({
  count: 1,
  firstSeen: new Date().toISOString(),
  lastSeen: new Date().toISOString(),
  contexts: new Set(['test-context']),
  userAgents: new Set(['test-agent']),
  urls: new Set(['test-url']),
  severity: ErrorSeverity.MEDIUM,
  category: ErrorCategory.UNKNOWN,
  impactedUsers: new Set(['test-user']),
  recoveryRate: 0,
  avgResolutionTime: 0,
  relatedErrors: new Set(),
  successfulAttempts: 0,
  totalAttempts: 0,
  lastResolutionTime: 0,
  maxResolutionTime: 0,
  minResolutionTime: Number.MAX_VALUE,
  consecutiveFailures: 0,
  lastRecoveryTime: null,
  ...overrides
})

/**
 * Creates a mock error trend object for testing
 */
export const createMockErrorTrend = (overrides = {}) => ({
  period: new Date().toISOString(),
  count: 1,
  severity: ErrorSeverity.MEDIUM,
  category: ErrorCategory.UNKNOWN,
  impactedUsers: new Set(['test-user']),
  ...overrides
})

/**
 * Creates a mock storage adapter for testing
 */
export const createMockStorageAdapter = () => ({
  getData: jest.fn().mockResolvedValue(null),
  saveData: jest.fn().mockResolvedValue(undefined),
  clearData: jest.fn().mockResolvedValue(undefined)
})

/**
 * Creates a mock user object for Supabase
 */
export const createMockSupabaseUser = (overrides = {}): User => ({
  id: 'test-id',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  confirmed_at: new Date().toISOString(),
  email: 'test@example.com',
  phone: '',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
  ...overrides
})

/**
 * Creates a mock session object for Supabase
 */
export const createMockSupabaseSession = (overrides = {}): Session => ({
  access_token: 'test-token',
  token_type: 'bearer',
  expires_in: 3600,
  refresh_token: 'test-refresh-token',
  user: createMockSupabaseUser(),
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  ...overrides
})

/**
 * Creates a mock Supabase client with basic functionality
 * @param role - The role to use for the mock client (default: 'employee')
 * @returns A partial mock Supabase client
 * @example
 * const mockClient = createDefaultMockClient('admin')
 */
export const createDefaultMockClient = (role: string = 'employee'): Partial<SupabaseClient> => {
  const mockUser = createMockSupabaseUser()
  const mockSession = createMockSupabaseSession({ user: mockUser })

  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      onAuthStateChange: jest.fn((callback) => {
        callback('SIGNED_IN', mockSession)
        return {
          data: { subscription: { unsubscribe: jest.fn() } }
        }
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { role }, error: null })
        })
      })
    })
  }
}

/**
 * Creates a mock HTTP response
 * @param status - HTTP status code (default: 200)
 * @param data - Response data
 * @returns A mock response object
 * @example
 * const response = createMockResponse(200, { success: true })
 */
export const createMockResponse = (status: number = 200, data: any = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data)
})

/**
 * Creates a mock HTTP error response
 * @param status - HTTP status code (default: 500)
 * @param message - Error message
 * @returns A mock error response object
 * @example
 * const errorResponse = createMockErrorResponse(404, 'Not found')
 */
export const createMockErrorResponse = (status: number = 500, message: string = 'Internal Server Error') => ({
  ok: false,
  status,
  json: () => Promise.resolve({ error: { message } })
})

/**
 * Creates a mock success toast notification
 * @param message - Success message
 * @returns A toast notification object
 * @example
 * const toast = createMockToast('Operation successful')
 */
export const createMockToast = (message: string): Toast => ({
  title: 'Success',
  description: message,
  variant: 'default'
})

/**
 * Creates a mock error toast notification
 * @param message - Error message
 * @returns A toast notification object
 * @example
 * const errorToast = createMockErrorToast('Operation failed')
 */
export const createMockErrorToast = (message: string): Toast => ({
  title: 'Error',
  description: message,
  variant: 'destructive'
})

/**
 * Creates a mock user object
 * @param overrides - Optional properties to override defaults
 * @returns A mock user object
 * @example
 * const user = createMockUser({ role: 'admin' })
 */
export const createMockUser = (overrides = {}) => ({
  id: 'test-id',
  email: 'test@example.com',
  role: 'employee',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

/**
 * Creates a mock employee object
 * @param overrides - Optional properties to override defaults
 * @returns A mock employee object
 * @example
 * const employee = createMockEmployee({ weekly_hours: 30 })
 */
export const createMockEmployee = (overrides = {}) => ({
  id: 'test-id',
  email: 'test@example.com',
  weekly_hours: 40,
  shift_type_id: 'shift-type-id',
  role: 'employee',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

/**
 * Base URL for testing environment
 */
export const TEST_BASE_URL = 'http://localhost:3000' 