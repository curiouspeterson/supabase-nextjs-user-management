import '@testing-library/jest-dom'

// Mock TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
    }
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    }
  },
  redirect: jest.fn(),
}))

// Mock Supabase client
const mockSupabaseFrom = jest.fn().mockReturnValue({
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: null, error: null }),
  insert: jest.fn().mockResolvedValue({ data: null, error: null }),
  upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
  update: jest.fn().mockResolvedValue({ data: null, error: null }),
  delete: jest.fn().mockResolvedValue({ data: null, error: null }),
})

jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: jest.fn().mockResolvedValue({ error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
    },
    from: mockSupabaseFrom,
    storage: {
      from: (bucket: string) => ({
        download: jest.fn().mockResolvedValue({ data: new Blob(), error: null }),
        upload: jest.fn().mockResolvedValue({ data: { path: 'test.jpg' }, error: null }),
      }),
    },
  }),
}))

// Mock useUser hook with default values that can be overridden
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-03-14T00:00:00.000Z',
  role: 'authenticated',
  updated_at: '2024-03-14T00:00:00.000Z'
}

jest.mock('@/lib/hooks', () => ({
  useUser: jest.fn().mockReturnValue({
    user: mockUser,
    isLoading: false,
    error: null
  })
}))

// Mock URL constructor and methods
class MockURL {
  href: string
  pathname: string
  search: string
  hash: string
  host: string
  hostname: string
  protocol: string
  origin: string

  constructor(url: string) {
    this.href = url
    this.pathname = '/test'
    this.search = ''
    this.hash = ''
    this.host = 'test.com'
    this.hostname = 'test.com'
    this.protocol = 'https:'
    this.origin = 'https://test.com'
  }

  static createObjectURL() {
    return 'blob:test'
  }

  static revokeObjectURL() {
    // No-op
  }
}

global.URL = MockURL as any

// Mock form submission
HTMLFormElement.prototype.requestSubmit = function() {
  const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
  this.dispatchEvent(submitEvent)
}

// Suppress console errors/warnings during tests
const originalError = console.error
const originalWarn = console.warn

console.error = (...args: any[]) => {
  const message = args[0]
  if (
    typeof message === 'string' &&
    (message.includes('Not implemented: HTMLFormElement.prototype.requestSubmit') ||
     message.includes('Error submitting time off request:') ||
     message.includes('Warning: An update to') ||
     message.includes('inside a test was not wrapped in act'))
  ) {
    return
  }
  originalError.call(console, ...args)
}

console.warn = (...args: any[]) => {
  const message = args[0]
  if (
    typeof message === 'string' &&
    (message.includes('Invalid prop') ||
     message.includes('componentWillReceiveProps') ||
     message.includes('inside a test was not wrapped in act'))
  ) {
    return
  }
  originalWarn.call(console, ...args)
} 