import { server } from './mocks/server'
import { TextEncoder, TextDecoder } from 'util'
import { ReadableStream, WritableStream, TransformStream } from 'web-streams-polyfill'
import fetch from 'node-fetch'
import { Headers, Request, Response } from 'node-fetch'
import 'whatwg-fetch'

// Polyfill globals
if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder as typeof global.TextEncoder
}
if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder as typeof global.TextDecoder
}
if (!global.ReadableStream) {
  global.ReadableStream = ReadableStream as typeof global.ReadableStream
}
if (!global.WritableStream) {
  global.WritableStream = WritableStream as typeof global.WritableStream
}
if (!global.TransformStream) {
  global.TransformStream = TransformStream as typeof global.TransformStream
}

// Mock fetch-related globals
global.Response = Response as unknown as typeof global.Response
global.Headers = Headers as unknown as typeof global.Headers
global.Request = Request as unknown as typeof global.Request
global.fetch = fetch as any

// Mock URL methods
if (typeof window !== 'undefined') {
  jest.spyOn(URL, 'createObjectURL').mockImplementation(() => 'blob:mock-url')
  jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
}

// Mock process.env
process.env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key'
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null
  readonly rootMargin: string = '0px'
  readonly thresholds: ReadonlyArray<number> = [0]
  
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {}
  
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return [] }
}

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

// Setup MSW
beforeAll(() => {
  // Start the interception of requests
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  // Reset any runtime request handlers we may add during the tests
  server.resetHandlers()
  // Clear all mocks
  jest.clearAllMocks()
})

afterAll(() => {
  // Clean up after the tests are finished
  server.close()
}) 