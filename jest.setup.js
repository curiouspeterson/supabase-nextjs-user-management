import '@testing-library/jest-dom'
import 'jest-environment-jsdom'
import { TextEncoder, TextDecoder } from 'util'
import { ReadableStream } from 'web-streams-polyfill'
import { Request, Response } from 'node-fetch'
import React from 'react'

// Set up global Request/Response
global.Request = Request
global.Response = Response

// Define mocks before usage
const nextServerMock = {
  NextRequest: class NextRequest extends Request {
    constructor(url, init = {}) {
      super(url || 'http://localhost:3000', init)
      this.nextUrl = new MockURL(url || 'http://localhost:3000')
    }
  },
  NextResponse: {
    json: (data, init = {}) => {
      const response = new Response(JSON.stringify(data), {
        ...init,
        headers: new Headers({ 'Content-Type': 'application/json', ...init.headers })
      })
      response.status = init.status || 200
      return response
    },
    redirect: (url, init = {}) => {
      const response = new Response(null, {
        ...init,
        status: 302,
        headers: new Headers({ Location: url, ...init.headers })
      })
      return response
    },
    next: (init = {}) => {
      const response = new Response(null, { ...init })
      response.status = init.status || 200
      return response
    },
    error: (data = {}, init = {}) => {
      const response = new Response(JSON.stringify(data), {
        ...init,
        headers: new Headers({ 'Content-Type': 'application/json', ...init.headers })
      })
      response.status = init.status || 500
      return response
    }
  }
}

// Set up mocks
jest.mock('next/server', () => nextServerMock)

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    }
  },
  useSearchParams() {
    return {
      get: jest.fn(),
      getAll: jest.fn(),
      has: jest.fn(),
      forEach: jest.fn(),
      entries: jest.fn(),
      keys: jest.fn(),
      values: jest.fn(),
      toString: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
}))

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies() {
    return {
      get: jest.fn(),
      getAll: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    }
  },
  headers() {
    return {
      get: jest.fn(),
      has: jest.fn(),
      entries: jest.fn(),
      keys: jest.fn(),
      values: jest.fn(),
      forEach: jest.fn(),
      append: jest.fn(),
      delete: jest.fn(),
      set: jest.fn(),
    }
  },
}))

// Mock clipboard API
if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      readText: jest.fn().mockImplementation(() => Promise.resolve('')),
    },
    configurable: true,
    writable: true
  })
} else {
  navigator.clipboard.writeText = jest.fn().mockImplementation(() => Promise.resolve())
  navigator.clipboard.readText = jest.fn().mockImplementation(() => Promise.resolve(''))
}

beforeEach(() => {
  if (navigator.clipboard) {
    jest.clearAllMocks()
  }
})

// Store original URL class
const OriginalURL = global.URL

class MockURL {
  constructor(url) {
    const baseUrl = 'http://localhost:3000'
    const urlString = url || baseUrl
    const originalUrl = new OriginalURL(urlString, baseUrl)
    
    this.href = originalUrl.href
    this.origin = originalUrl.origin
    this.protocol = originalUrl.protocol
    this.username = originalUrl.username
    this.password = originalUrl.password
    this.host = originalUrl.host
    this.hostname = originalUrl.hostname
    this.port = originalUrl.port
    this.pathname = originalUrl.pathname
    this.search = originalUrl.search
    this.searchParams = originalUrl.searchParams
    this.hash = originalUrl.hash
  }

  toString() {
    return this.href
  }
}

// Replace global URL
global.URL = MockURL

// Mock NextRequest and NextResponse
jest.mock('next/server', () => nextServerMock)

// Mock Supabase client
const mockSupabaseClient = {
  from: (table) => ({
    select: (query = '*') => ({
      order: (column, { ascending = true } = {}) => ({
        eq: (field, value) => ({
          single: () => Promise.resolve({ data: null, error: null }),
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
          then: (callback) => Promise.resolve({ data: [], error: null }).then(callback)
        }),
        gte: (field, value) => ({
          lte: (field, value) => ({
            then: (callback) => Promise.resolve({ data: [], error: null }).then(callback)
          })
        }),
        then: (callback) => Promise.resolve({ data: [], error: null }).then(callback)
      }),
      eq: (field, value) => ({
        single: () => Promise.resolve({ data: null, error: null }),
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        then: (callback) => Promise.resolve({ data: [], error: null }).then(callback)
      }),
      single: () => Promise.resolve({ data: null, error: null }),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      then: (callback) => Promise.resolve({ data: [], error: null }).then(callback)
    }),
    insert: (data) => ({
      select: () => Promise.resolve({ data: [data], error: null }),
      then: (callback) => Promise.resolve({ data: [data], error: null }).then(callback)
    }),
    update: (data) => ({
      eq: (field, value) => Promise.resolve({ data: [data], error: null }),
      match: (criteria) => Promise.resolve({ data: [data], error: null }),
      then: (callback) => Promise.resolve({ data: [data], error: null }).then(callback)
    }),
    upsert: (data) => ({
      select: () => Promise.resolve({ data: [data], error: null }),
      then: (callback) => Promise.resolve({ data: [data], error: null }).then(callback)
    }),
    delete: () => ({
      eq: (field, value) => Promise.resolve({ data: null, error: null }),
      match: (criteria) => Promise.resolve({ data: null, error: null }),
      then: (callback) => Promise.resolve({ data: null, error: null }).then(callback)
    })
  }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signUp: (data) => Promise.resolve({ data: { user: data }, error: null }),
    signIn: (data) => Promise.resolve({ data: { user: data }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: (callback) => {
      callback('SIGNED_IN', { user: null })
      return { data: { subscription: { unsubscribe: () => {} } }, error: null }
    },
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    verifyOtp: (data) => Promise.resolve({ data: { user: null }, error: null }),
    updateUser: (data) => Promise.resolve({ data: { user: data }, error: null })
  },
  storage: {
    from: (bucket) => ({
      upload: (path, file) => Promise.resolve({ data: { path }, error: null }),
      getPublicUrl: (path) => ({ data: { publicUrl: `https://example.com/${path}` } }),
      remove: (paths) => Promise.resolve({ data: null, error: null })
    })
  }
}

// Mock Supabase
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => mockSupabaseClient,
  createServerComponentClient: () => mockSupabaseClient,
  createMiddlewareClient: () => mockSupabaseClient
}))

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabaseClient
}))

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    status: 200,
  })
)

// Add TextEncoder/TextDecoder to global scope
Object.defineProperties(globalThis, {
  TextEncoder: { value: TextEncoder },
  TextDecoder: { value: TextDecoder },
  ReadableStream: { value: ReadableStream }
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })),
})

// Mock requestAnimationFrame
window.requestAnimationFrame = jest.fn().mockImplementation(cb => setTimeout(cb, 0))
window.cancelAnimationFrame = jest.fn().mockImplementation(id => clearTimeout(id))

// Mock crypto.getRandomValues
if (!window.crypto.getRandomValues) {
  Object.defineProperty(window.crypto, 'getRandomValues', {
    writable: true,
    value: jest.fn().mockImplementation(arr => {
      return arr.map(() => Math.floor(Math.random() * 256))
    }),
  })
} else {
  window.crypto.getRandomValues = jest.fn().mockImplementation(arr => {
    return arr.map(() => Math.floor(Math.random() * 256))
  })
}

// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: jest.fn().mockImplementation(() => 'mock-url'),
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
})

// Suppress console errors in tests
global.console.error = jest.fn()
global.console.warn = jest.fn()

// Make React available globally
global.React = React 