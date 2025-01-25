import { webcrypto } from 'node:crypto'
import { TextEncoder, TextDecoder } from 'node:util'
import { ReadableStream, TransformStream, WritableStream } from 'node:stream/web'
import fetch, { Headers, Request, Response, RequestInit } from 'node-fetch'

// Polyfill Web Crypto API
Object.defineProperty(globalThis, 'crypto', {
  value: webcrypto
})

// Polyfill Text Encoding API
Object.defineProperty(globalThis, 'TextEncoder', {
  value: TextEncoder
})

Object.defineProperty(globalThis, 'TextDecoder', {
  value: TextDecoder
})

// Polyfill Streams API
Object.defineProperty(globalThis, 'ReadableStream', {
  value: ReadableStream
})

Object.defineProperty(globalThis, 'TransformStream', {
  value: TransformStream
})

Object.defineProperty(globalThis, 'WritableStream', {
  value: WritableStream
})

// Polyfill Fetch API
Object.defineProperty(globalThis, 'Headers', {
  value: Headers
})

Object.defineProperty(globalThis, 'Request', {
  value: Request
})

Object.defineProperty(globalThis, 'Response', {
  value: Response
})

Object.defineProperty(globalThis, 'fetch', {
  value: (input: string | URL | Request, init?: RequestInit) => {
    // Convert relative URLs to absolute
    if (typeof input === 'string' && input.startsWith('/')) {
      input = `http://localhost${input}`
    }
    return fetch(input as string, init as RequestInit)
  }
})

// Mock BroadcastChannel
class MockBroadcastChannel {
  constructor(public readonly name: string) {}
  postMessage(message: any) {}
  onmessage(event: any) {}
  close() {}
}

Object.defineProperty(globalThis, 'BroadcastChannel', {
  value: MockBroadcastChannel
})

// Mock URL.createObjectURL and revokeObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  value: jest.fn(() => 'mock-object-url'),
  configurable: true
})

Object.defineProperty(URL, 'revokeObjectURL', {
  value: jest.fn(),
  configurable: true
})

// Mock Next.js navigation
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn()
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  redirect: jest.fn((url) => {
    return new Response(null, {
      status: 302,
      headers: { Location: url }
    })
  })
}))

// Mock Next.js cache functions
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
  unstable_cache: jest.fn(),
  unstable_noStore: jest.fn()
})) 