import '@testing-library/jest-dom'
import { server } from './mocks/server'
import 'whatwg-fetch'
import { mockSupabaseClient } from './utils/test-utils'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn()
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams()
}))

// Mock Next.js cookies
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  })
}))

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: () => mockSupabaseClient
}))

// Mock URL methods
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: jest.fn(),
    revokeObjectURL: jest.fn()
  },
  writable: true
})

// Start MSW server before all tests
beforeAll(() => server.listen())

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers()
  jest.clearAllMocks()
})

// Clean up after all tests
afterAll(() => server.close()) 