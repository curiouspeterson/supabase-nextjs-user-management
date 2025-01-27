import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactElement } from 'react'
import { ErrorRecoveryStrategy } from '@/lib/types/error'
import { NextRequest } from 'next/server'

// Constants
export const TEST_BASE_URL = 'http://localhost:3000'

// Mock Supabase client
export const createMockSupabaseClient = () => ({
  auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null })
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockImplementation((data) => Promise.resolve({ data: [data], error: null })),
    update: jest.fn().mockImplementation((data) => Promise.resolve({ data: [data], error: null })),
    upsert: jest.fn().mockImplementation((data) => Promise.resolve({ data: [data], error: null })),
    delete: jest.fn().mockResolvedValue({ data: [], error: null }),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockImplementation(() => Promise.resolve({ data: {}, error: null }))
  }),
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: { path: 'test.jpg' }, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://test.com/test.jpg' } })
    })
  }
})

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image(props: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', { ...props, alt: props.alt || '' })
  }
}))

// Mock next/navigation
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
  pathname: '/',
  query: {}
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams()
}))

// Mock ErrorAnalyticsService
const mockErrorAnalytics = {
  trackError: jest.fn().mockResolvedValue('error-123'),
  getErrorMetrics: jest.fn().mockReturnValue({}),
  updateErrorResolution: jest.fn(),
  suggestRecoveryStrategy: jest.fn().mockReturnValue(ErrorRecoveryStrategy.RETRY)
}

jest.mock('@/lib/error-analytics', () => ({
  ErrorAnalyticsService: {
    getInstance: jest.fn(() => mockErrorAnalytics)
  }
}))

// Mock toast notifications
export const createMockErrorToast = (description: string) => ({
  title: 'Error',
  description,
  variant: 'destructive'
})

const mockToast = {
  error: jest.fn(),
  success: jest.fn()
}

jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => mockToast
}))

// Create mock requests and responses
export function createMockRequest(overrides: Partial<NextRequest> = {}) {
  const url = new URL(`${TEST_BASE_URL}/api/test`)
  return new NextRequest(url, overrides)
}

export function createMockResponse(overrides: Partial<Response> = {}) {
  return new Response(null, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...overrides
  })
}

// Custom render function
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return {
    user: userEvent.setup(),
    ...render(ui, { ...options })
  }
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }
export { mockErrorAnalytics, mockRouter, mockToast } 