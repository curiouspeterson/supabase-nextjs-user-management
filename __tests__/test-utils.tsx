import React from 'react'
import { 
  render, 
  screen, 
  within, 
  fireEvent, 
  waitFor,
  cleanup
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type RenderOptions } from '@testing-library/react'
import { type ReactElement, type ReactNode } from 'react'
import { createClient, type User, type Session } from '@supabase/supabase-js'
import type { PostgrestQueryBuilder } from '@supabase/postgrest-js'
import { NextRequest } from 'next/server'
import { TestToast } from './types/toast'

// Modern mock data generators with proper types
export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  app_metadata: {
    provider: 'email',
    providers: ['email']
  },
  user_metadata: {
    full_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg'
  },
  aud: 'authenticated',
  role: 'authenticated',
  phone: '',
  confirmation_sent_at: undefined,
  confirmed_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  phone_confirmed_at: undefined,
  last_sign_in_at: new Date().toISOString(),
  factors: [],
  identities: []
}

export const mockSession: Session = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: mockUser,
  provider_token: null,
  provider_refresh_token: null,
}

// Modern test data generators with proper types
export interface TimeOffRequest {
  id: string
  user_id: string
  start_date: string
  end_date: string
  status: 'pending' | 'approved' | 'rejected'
  type: 'vacation' | 'sick' | 'personal'
  created_at: string
  updated_at: string
}

export interface Schedule {
  id: string
  employee_id: string
  week_start_date: string
  day_of_week: string
  shift_start: string
  shift_end: string
  created_at: string
  updated_at: string
}

export const generateTimeOffRequest = (overrides: Partial<TimeOffRequest> = {}): TimeOffRequest => ({
  id: 'test-request-id',
  user_id: mockUser.id,
  start_date: '2024-03-20',
  end_date: '2024-03-21',
  status: 'pending',
  type: 'vacation',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

export const generateSchedule = (overrides: Partial<Schedule> = {}): Schedule => ({
  id: 'test-schedule-id',
  employee_id: mockUser.id,
  week_start_date: '2024-03-18',
  day_of_week: 'monday',
  shift_start: '09:00',
  shift_end: '17:00',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

// Modern test setup helpers with proper types
export const setupSupabaseMocks = () => {
  const supabase = createClient('http://localhost', 'fake-key')
  
  // Auth mocks with proper types
  jest.spyOn(supabase.auth, 'getSession').mockResolvedValue({
    data: { session: mockSession },
    error: null
  })
  
  jest.spyOn(supabase.auth, 'getUser').mockResolvedValue({
    data: { user: mockUser },
    error: null
  })

  // Database mocks with proper types
  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ 
      data: null, 
      error: null,
      count: null,
      status: 200,
      statusText: 'OK'
    }),
    maybeSingle: jest.fn().mockResolvedValue({ 
      data: null, 
      error: null,
      count: null,
      status: 200,
      statusText: 'OK'
    }),
    execute: jest.fn().mockResolvedValue({ 
      data: [], 
      error: null,
      count: null,
      status: 200,
      statusText: 'OK'
    }),
  } as unknown as PostgrestQueryBuilder<any, any, any>

  jest.spyOn(supabase, 'from').mockImplementation(() => mockQueryBuilder)

  return supabase
}

// Modern test setup with proper types
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string
  initialState?: Record<string, unknown>
}

// Modern test wrapper with proper types
interface WrapperProps {
  children: ReactNode
  initialState?: Record<string, unknown>
}

// Modern test wrapper component
function Wrapper({ children, initialState = {} }: WrapperProps): ReactElement {
  // Add providers here if needed
  return children as ReactElement
}

// Modern render utility
function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { route, initialState, ...renderOptions } = options

  if (route) {
    window.history.pushState({}, 'Test page', route)
  }

  return render(ui, {
    wrapper: ({ children }) => (
      <Wrapper initialState={initialState}>{children}</Wrapper>
    ),
    ...renderOptions,
  })
}

// Modern user event setup
export const setupUser = () => userEvent.setup({
  advanceTimers: jest.advanceTimersByTime,
  delay: null // Disable delay to speed up tests
})

// Modern component testing helpers
export const findByAriaDescription = (text: string) =>
  screen.findByRole('generic', { description: text })

export const queryByAriaDescription = (text: string) =>
  screen.queryByRole('generic', { description: text })

export const getByAriaDescription = (text: string) =>
  screen.getByRole('generic', { description: text })

// Modern style testing helpers
export const hasStyles = (element: HTMLElement, styles: Record<string, string>) =>
  Object.entries(styles).every(
    ([property, value]) =>
      window.getComputedStyle(element).getPropertyValue(property) === value
  )

export const hasClasses = (element: HTMLElement, classes: string[]) =>
  classes.every((className) => element.classList.contains(className))

// Modern async helpers
export const waitForLoadingToFinish = () =>
  screen.findByRole('status').then((el) =>
    el.getAttribute('aria-busy') === 'false'
      ? Promise.resolve()
      : new Promise((resolve) => {
          const observer = new MutationObserver((mutations) => {
            if (mutations.some((m) => (m.target as HTMLElement).getAttribute('aria-busy') === 'false')) {
              observer.disconnect()
              resolve(undefined)
            }
          })
          observer.observe(el, { attributes: true })
        })
  )

// Modern form helpers
export const fillForm = async (formElement: HTMLElement, fields: Record<string, string>) => {
  const user = setupUser()
  for (const [label, value] of Object.entries(fields)) {
    const input = within(formElement).getByLabelText(label)
    await user.type(input, value)
  }
}

// Modern cleanup utility
export const cleanupAfterEach = () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    localStorage.clear()
    sessionStorage.clear()
  })
}

const TEST_BASE_URL = 'http://localhost:3000'

export const createMockToast = (overrides?: Partial<TestToast>): TestToast => ({
  id: '1',
  title: 'Test Toast',
  description: 'This is a test toast',
  variant: 'default',
  duration: undefined,
  position: 'bottom',
  ...overrides
})

// Request and Response Mocking
export const createMockRequest = ({
  url = TEST_BASE_URL,
  method = 'GET',
  headers = {},
  body = null
} = {}) => {
  const urlObj = new URL(url)
  const headersObj = new Headers(headers)
  const bodyStr = body ? JSON.stringify(body) : null
  
  return new NextRequest(urlObj, {
    method,
    headers: headersObj,
    body: bodyStr
  })
}

export const createMockResponse = (options: {
  status?: number
  headers?: Record<string, string>
  body?: any
} = {}) => {
  const {
    status = 200,
    headers = { 'Content-Type': 'application/json' },
    body = {}
  } = options

  return new Response(JSON.stringify(body), {
    status,
    headers: new Headers(headers)
  })
}

// Mock toast functions
export const mockToast = {
  error: jest.fn(),
  success: jest.fn(),
  info: jest.fn(),
  warning: jest.fn()
}

// Test utilities
describe('Test Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates mock request correctly', () => {
    const request = createMockRequest({
      url: 'http://localhost:3000/api/test',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { test: 'value' }
    })

    expect(request.method).toBe('POST')
    expect(request.url).toContain('/api/test')
    expect(request.url).toContain('test=value')
    expect(request.headers.get('Content-Type')).toBe('application/json')
  })

  it('provides mock toast functions', () => {
    expect(mockToast.error).toBeDefined()
    expect(mockToast.success).toBeDefined()
    expect(typeof mockToast.error).toBe('function')
    expect(typeof mockToast.success).toBe('function')
  })
})

// Re-export testing utilities
export {
  render,
  screen,
  within,
  fireEvent,
  userEvent,
  waitFor,
  cleanup
}

// Mock Next.js modules
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server')
  return {
    ...originalModule,
    NextResponse: {
      json: (data: any, init?: ResponseInit) => createMockNextResponse({
        body: data,
        ...init
      }),
      redirect: (url: string) => createMockRedirect(url)
    }
  }
}) 