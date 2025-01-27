import React from 'react'
import { render } from '@testing-library/react'
import { faker } from '@faker-js/faker'
import type { SupabaseClient } from '@supabase/supabase-js'
import { PostgrestQueryBuilder } from '@supabase/postgrest-js'
import 'whatwg-fetch'
import { NextRequest } from 'next/server'
import { mockToast, createMockPromise, createDefaultMockClient, TEST_BASE_URL } from '@/lib/test-utils'

export const BASE_URL = 'http://localhost:3000'

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

interface QueryBuilder {
  select: jest.Mock
  insert: jest.Mock
  update: jest.Mock
  delete: jest.Mock
  eq: jest.Mock
  neq: jest.Mock
  gt: jest.Mock
  gte: jest.Mock
  lt: jest.Mock
  lte: jest.Mock
  like: jest.Mock
  ilike: jest.Mock
  is: jest.Mock
  in: jest.Mock
  contains: jest.Mock
  containedBy: jest.Mock
  overlap: jest.Mock
  order: jest.Mock
  single: jest.Mock
  maybeSingle: jest.Mock
  execute: jest.Mock
}

function createQueryBuilder(table: string): QueryBuilder {
  const builder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
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
    overlap: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    execute: jest.fn().mockResolvedValue({ data: [], error: null })
  }

  tableNames.set(builder as QueryBuilder, table)
  return builder as QueryBuilder
}

const tableNames = new Map<QueryBuilder, string>()

export function getTableName(builder: QueryBuilder): string | undefined {
  return tableNames.get(builder)
}

export const mockSupabaseClient = {
  auth: {
    signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    verifyOtp: jest.fn().mockResolvedValue({ data: { user: null }, error: null })
  },
  from: jest.fn((table: string) => {
    const builder = createQueryBuilder(table)
    const chainedMethods = {
      ...builder,
      select: jest.fn().mockImplementation(() => ({
        ...builder,
        eq: jest.fn().mockImplementation(() => ({
          ...builder,
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
          execute: jest.fn().mockResolvedValue({ data: [], error: null })
        }))
      })),
      insert: jest.fn().mockImplementation(() => ({
        ...builder,
        select: jest.fn().mockImplementation(() => ({
          ...builder,
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
          execute: jest.fn().mockResolvedValue({ data: [], error: null })
        }))
      })),
      update: jest.fn().mockImplementation(() => ({
        ...builder,
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
        execute: jest.fn().mockResolvedValue({ data: null, error: null })
      })),
      delete: jest.fn().mockImplementation(() => ({
        ...builder,
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
        execute: jest.fn().mockResolvedValue({ data: null, error: null })
      })),
      rpc: jest.fn().mockResolvedValue({ data: [], error: null })
    }
    return chainedMethods
  }),
  rpc: jest.fn().mockResolvedValue({ data: [], error: null })
} as unknown as SupabaseClient

export function mockCreateClient(): SupabaseClient {
  jest.clearAllMocks()
  tableNames.clear()
  return mockSupabaseClient
}

export function createMockUser(overrides = {}) {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    role: 'employee',
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides
  }
}

export function createMockEmployee(overrides = {}) {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    weekly_hours: faker.number.int({ min: 20, max: 40 }),
    shift_type_id: faker.string.uuid(),
    role: 'employee',
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides
  }
}

export function createMockTimeOff(overrides = {}) {
  return {
    id: faker.string.uuid(),
    employee_id: faker.string.uuid(),
    start_date: faker.date.future().toISOString(),
    end_date: faker.date.future().toISOString(),
    status: 'Pending',
    notes: faker.lorem.sentence(),
    submitted_at: faker.date.past().toISOString(),
    reviewed_by: null,
    reviewed_at: null,
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides
  }
}

export function customRender(ui: React.ReactElement) {
  return render(ui)
}

export function createMockResponse(overrides = {}) {
  return {
    status: 200,
    headers: new Headers(),
    ok: true,
    json: jest.fn().mockResolvedValue({}),
    ...overrides
  }
}

export function createMockRequest(overrides = {}) {
  return {
    method: 'GET',
    headers: new Headers(),
    url: `${BASE_URL}/api/test`,
    ...overrides
  }
}

export function createMockCookie(overrides = {}) {
  return {
    name: 'test-cookie',
    value: 'test-value',
    ...overrides
  }
}

export function isErrorResponse(response: Response) {
  return !response.ok
}

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Add a helper function to create error responses
export function createErrorResponse(message: string) {
  return { data: null, error: new Error(message) }
}

type SafeRequestInit = Omit<RequestInit, 'signal'> & {
  signal?: AbortSignal | undefined
}

type NextRequestInit = {
  [K in keyof RequestInit]: K extends 'signal'
    ? AbortSignal | undefined
    : RequestInit[K]
}

export function createTestRequest(path: string, options: Partial<SafeRequestInit> = {}) {
  const url = new URL(`${TEST_BASE_URL}${path}`)
  const safeOptions = { ...options }
  if (safeOptions.signal === null) {
    delete safeOptions.signal
  }
  return new NextRequest(url, safeOptions as NextRequestInit)
}

export function createTestResponse() {
  return {
    status: 200,
    headers: new Headers(),
    json: jest.fn(),
  }
}

export const createMockSupabaseClient = (): SupabaseClient => {
  const client = {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      verifyOtp: jest.fn(),
      getUser: jest.fn(),
      getSession: jest.fn(),
      setSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      admin: {
        createUser: jest.fn(),
        deleteUser: jest.fn(),
        listUsers: jest.fn(),
        updateUser: jest.fn(),
      },
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    storage: {
      from: jest.fn().mockReturnThis(),
      upload: jest.fn(),
      download: jest.fn(),
      remove: jest.fn(),
      list: jest.fn(),
      createSignedUrl: jest.fn(),
    },
    realtime: {
      on: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    },
  }
  return client as unknown as SupabaseClient
}

export function mockToast() {
  return {
    toast: jest.fn(),
  }
}

export function mockNextRouter() {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    reload: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    beforePopState: jest.fn(),
    isFallback: false,
    isReady: true,
    isPreview: false,
  }
}

export function mockNextAuth() {
  return {
    getSession: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    useSession: jest.fn(),
  }
}

export function mockSupabaseAuthUI() {
  return {
    Auth: jest.fn(),
    ThemeSupa: {},
  }
}

export function mockSupabaseAuthHelpers() {
  return {
    createServerSupabaseClient: jest.fn(),
    createBrowserSupabaseClient: jest.fn(),
    createMiddlewareSupabaseClient: jest.fn(),
  }
}

describe('Test Utilities', () => {
  describe('mockToast', () => {
    it('should be a mock function', () => {
      expect(typeof mockToast).toBe('function')
      expect(jest.isMockFunction(mockToast)).toBe(true)
    })
  })

  describe('createMockPromise', () => {
    it('should resolve with provided data', async () => {
      const data = { test: 'data' }
      const promise = createMockPromise(data)
      await expect(promise).resolves.toEqual(data)
    })

    it('should reject with provided error', async () => {
      const error = new Error('test error')
      const promise = createMockPromise(null, error)
      await expect(promise).rejects.toEqual(error)
    })
  })

  describe('createDefaultMockClient', () => {
    it('should return a mock client with auth methods', () => {
      const mockClient = createDefaultMockClient()
      expect(mockClient.auth).toBeDefined()
      expect(mockClient.auth.getUser).toBeDefined()
      expect(jest.isMockFunction(mockClient.auth.getUser)).toBe(true)
    })
  })
}) 