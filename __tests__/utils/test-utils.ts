import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { faker } from '@faker-js/faker'
import type { SupabaseClient, User, Session } from '@supabase/supabase-js'
import { PostgrestQueryBuilder } from '@supabase/postgrest-js'
import 'whatwg-fetch'
import { NextRequest } from 'next/server'
import { ErrorAnalyticsService, ErrorRecoveryStrategy, ErrorSeverity, ErrorCategory } from '@/lib/error-analytics'
import userEvent from '@testing-library/user-event'
import { ReactElement } from 'react'
import { createClient } from '@supabase/supabase-js'

export const TEST_BASE_URL = 'http://localhost:3000'

// Create a wrapper around fetch that handles relative URLs
const originalFetch = global.fetch
global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  let url = input
  if (typeof input === 'string' && !input.startsWith('http')) {
    url = `${TEST_BASE_URL}${input}`
  } else if (input instanceof Request && !input.url.startsWith('http')) {
    url = new Request(`${TEST_BASE_URL}${input.url}`, input)
  }
  return originalFetch(url, init)
}

// Mock toast functions
export const mockToast = {
  error: jest.fn(),
  success: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
}

// Mock Supabase user and session
export const createMockSupabaseUser = (overrides: Partial<User> = {}): User => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  created_at: faker.date.past().toISOString(),
  updated_at: faker.date.recent().toISOString(),
  user_metadata: { role: 'Employee' },
  ...overrides
})

export const createMockSupabaseSession = (overrides: Partial<Session> = {}): Session => ({
  user: createMockSupabaseUser(),
  access_token: faker.string.alphanumeric(32),
  refresh_token: faker.string.alphanumeric(32),
  expires_at: Date.now() + 3600,
  ...overrides
})

// Mock Supabase client
export const mockSupabase = {
  auth: {
    getUser: jest.fn(),
    signOut: jest.fn(),
    signInWithOAuth: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    updateUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  })),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      download: jest.fn(),
      remove: jest.fn(),
      list: jest.fn(),
    })),
  },
}

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(() => mockSupabase),
}))

// Mock error analytics
export const mockErrorAnalytics = {
  trackError: jest.fn().mockResolvedValue('error-123'),
  getErrorById: jest.fn(),
  getAllErrors: jest.fn(),
  clearErrors: jest.fn(),
}

// Mock router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
  pathname: '/',
  query: {},
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image(props: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', { ...props, alt: props.alt || '' })
  }
}))

// Mock toast hook
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => mockToast,
}))

// Custom render function
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return {
    ...render(ui, { ...options }),
    user: userEvent.setup(),
  }
}

// Create mock requests and responses
export const createMockRequest = (options = {}) => {
  const {
    method = 'GET',
    url = '/api/test',
    headers = {},
    body = null,
    searchParams = {},
  } = options

  const searchParamsString = new URLSearchParams(searchParams).toString()
  const fullUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${url}${searchParamsString ? `?${searchParamsString}` : ''}`

  return new Request(fullUrl, {
    method,
    headers: new Headers({
      'Content-Type': 'application/json',
      ...headers,
    }),
    body: body ? JSON.stringify(body) : null,
  })
}

export const createMockResponse = (options = {}) => {
  const {
    status = 200,
    statusText = 'OK',
    headers = {},
    body = {},
  } = options

  return new Response(JSON.stringify(body), {
    status,
    statusText,
    headers: new Headers({
      'Content-Type': 'application/json',
      ...headers,
    }),
  })
}

// Create mock promises
export const createMockPromise = (data: any) => Promise.resolve({ data, error: null })
export const createMockErrorPromise = (error: any) => Promise.resolve({ data: null, error })

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
})

// Mock ErrorAnalyticsService
jest.mock('@/lib/error-analytics', () => ({
  ErrorAnalyticsService: {
    getInstance: jest.fn(() => mockErrorAnalytics),
  },
}))

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase),
}))

export * from '@testing-library/react'
export { customRender as render }
export { mockErrorAnalytics, mockSupabase, mockRouter, mockToast } 