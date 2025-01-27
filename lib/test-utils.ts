import type { Toast } from '@/types/toast'
import type { SupabaseClient, User, Session } from '@supabase/supabase-js'
import { ErrorSeverity, ErrorCategory, ErrorRecoveryStrategy } from './types/error'
import { AppError } from './errors'
import { Employee, Shift, Schedule } from '@/services/scheduler/types'

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
  return new AppError(
    message,
    code,
    500, // statusCode
    true, // shouldLog
    severity,
    category,
    metadata,
    ErrorRecoveryStrategy.RETRY
  )
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
          data: {
            subscription: {
              id: 'mock-subscription-id',
              unsubscribe: jest.fn(),
              callback
            }
          }
        }
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    } as unknown as SupabaseClient['auth'],
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

export const mockClient = () => {
  const mockFrom = jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    textSearch: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockReturnThis(),
    csv: jest.fn().mockReturnThis()
  });

  const mockRpc = jest.fn().mockResolvedValue({ data: null, error: null });
  const mockStorage = {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: null, error: null }),
      download: jest.fn().mockResolvedValue({ data: null, error: null }),
      remove: jest.fn().mockResolvedValue({ data: null, error: null }),
      list: jest.fn().mockResolvedValue({ data: null, error: null }),
      createSignedUrl: jest.fn().mockResolvedValue({ data: null, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ publicUrl: 'test-url' })
    })
  };

  const mockAuth = {
    getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signUp: jest.fn().mockResolvedValue({ data: null, error: null }),
    signIn: jest.fn().mockResolvedValue({ data: null, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } }, error: null }),
    resetPasswordForEmail: jest.fn().mockResolvedValue({ data: null, error: null }),
    updateUser: jest.fn().mockResolvedValue({ data: null, error: null })
  };

  return {
    from: mockFrom,
    rpc: mockRpc,
    storage: mockStorage,
    auth: mockAuth
  } as unknown as jest.Mocked<SupabaseClient>;
};

export const mockAuthUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'authenticated',
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

export const mockEmployee = (overrides?: Partial<Employee>): Employee => ({
  id: 'test-employee-1',
  user_id: 'test-user-1',
  employee_role: 'Dispatcher',
  weekly_hours_scheduled: 40,
  default_shift_type_id: 'test-shift-type-1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

export const mockShift = (overrides?: Partial<Shift>): Shift => ({
  id: 'test-shift-1',
  shift_type_id: 'test-shift-type-1',
  start_time: '07:00:00',
  end_time: '17:00:00',
  duration_hours: 10,
  duration_category: '10 hours',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

export const mockSchedule = (overrides?: Partial<Schedule>): Schedule => ({
  id: 'test-schedule-1',
  employee_id: 'test-employee-1',
  shift_id: 'test-shift-1',
  date: '2025-01-01',
  status: 'Draft',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

export const mockStaffingRequirement = (overrides = {}) => ({
  id: 'test-requirement-id',
  period_name: 'Day Shift',
  start_time: '07:00:00',
  end_time: '19:00:00',
  minimum_employees: 2,
  shift_supervisor_required: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

export const mockShiftPattern = (overrides = {}) => ({
  id: 'test-pattern-id',
  name: '4x10 Standard',
  pattern_type: '4x10',
  days_on: 4,
  days_off: 3,
  shift_duration: 10,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

export const mockEmployeePattern = (overrides = {}) => ({
  id: 'test-employee-pattern-id',
  employee_id: 'test-employee-id',
  pattern_id: 'test-pattern-id',
  start_date: new Date().toISOString().split('T')[0],
  end_date: null,
  rotation_start_date: new Date().toISOString().split('T')[0],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

export const mockShiftPreference = (overrides = {}) => ({
  id: 'test-preference-id',
  employee_id: 'test-employee-id',
  shift_type_id: 'test-shift-type-id',
  preference_level: 1,
  effective_date: new Date().toISOString().split('T')[0],
  expiry_date: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

// Mock for react-dnd HTML5Backend
jest.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: {}
}));

// Mock for date-fns functions
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  startOfToday: () => new Date('2025-01-01T00:00:00.000Z'),
  addDays: (date: Date, amount: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
  },
  addWeeks: (date: Date, amount: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + (amount * 7));
    return result;
  },
  addMonths: (date: Date, amount: number) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + amount);
    return result;
  }
}));

// Setup for testing drag and drop functionality
export const mockDndHooks = () => {
  const useDrag = jest.fn(() => [
    { isDragging: false },
    jest.fn(),
    jest.fn()
  ]);

  const useDrop = jest.fn(() => [
    { isOver: false, canDrop: true },
    jest.fn()
  ]);

  return { useDrag, useDrop };
};

// Mock for testing coverage calculations
export const mockCoverageData = (overrides?: any) => ({
  date: '2025-01-01',
  periods: {
    '07:00:00-19:00:00': {
      required: 2,
      actual: 1,
      supervisors: 0,
      overtime: 0
    },
    '19:00:00-07:00:00': {
      required: 2,
      actual: 2,
      supervisors: 1,
      overtime: 0
    }
  },
  ...overrides
}); 