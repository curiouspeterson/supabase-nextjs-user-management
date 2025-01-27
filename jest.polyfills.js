/* eslint-disable @typescript-eslint/no-empty-function */
import { TextEncoder, TextDecoder } from 'util'
import { ReadableStream } from 'web-streams-polyfill'

Object.defineProperties(globalThis, {
  TextEncoder: { value: TextEncoder },
  TextDecoder: { value: TextDecoder },
  ReadableStream: { value: ReadableStream }
})

// Mock fetch
import fetch from 'cross-fetch'
global.fetch = fetch

// Mock Blob
class MockBlob {
  constructor(content) {
    this.content = content
  }

  text() {
    return Promise.resolve(this.content.join(''))
  }

  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(0))
  }
}

// Mock File
class MockFile extends MockBlob {
  constructor(content, name) {
    super(content)
    this.name = name
  }
}

// Mock Headers
class MockHeaders {
  constructor(init) {
    this._headers = new Map()
    if (init) {
      if (typeof init === 'object') {
        Object.entries(init).forEach(([key, value]) => {
          this.append(key, value)
        })
      }
    }
  }

  append(key, value) {
    const normalizedKey = key.toLowerCase()
    const current = this._headers.get(normalizedKey)
    if (current) {
      this._headers.set(normalizedKey, `${current}, ${value}`)
    } else {
      this._headers.set(normalizedKey, value)
    }
  }

  delete(key) {
    this._headers.delete(key.toLowerCase())
  }

  get(key) {
    return this._headers.get(key.toLowerCase()) || null
  }

  has(key) {
    return this._headers.has(key.toLowerCase())
  }

  set(key, value) {
    this._headers.set(key.toLowerCase(), value)
  }

  forEach(callback, thisArg) {
    this._headers.forEach((value, key) => {
      callback.call(thisArg, value, key, this)
    })
  }

  *entries() {
    yield* this._headers.entries()
  }

  *keys() {
    yield* this._headers.keys()
  }

  *values() {
    yield* this._headers.values()
  }

  [Symbol.iterator]() {
    return this.entries()
  }
}

// Mock FormData
class MockFormData {
  constructor() {
    this.data = new Map()
  }

  append(key, value) {
    this.data.set(key, value)
  }

  get(key) {
    return this.data.get(key)
  }
}

// Mock Request
class MockRequest {
  #url;
  constructor(input, init = {}) {
    this.#url = input;
    this.method = init.method || 'GET';
    this.headers = new MockHeaders(init.headers);
    this.body = init.body;
  }

  get url() {
    return this.#url;
  }

  clone() {
    return new MockRequest(this.url, {
      method: this.method,
      headers: this.headers,
      body: this.body
    })
  }
}

// Mock Response
class MockResponse {
  constructor(body, init = {}) {
    this.body = body
    this.status = init.status || 200
    this.statusText = init.statusText || ''
    this.headers = new MockHeaders(init.headers)
    this.ok = this.status >= 200 && this.status < 300
    this.type = 'basic'
    this.url = ''
  }

  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
  }

  async text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body)
  }

  clone() {
    return new MockResponse(this.body, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers
    })
  }
}

// Add to global scope
Object.defineProperties(global, {
  Blob: { value: MockBlob },
  File: { value: MockFile },
  Headers: { value: MockHeaders },
  FormData: { value: MockFormData },
  Request: { value: MockRequest },
  Response: { value: MockResponse },
  URL: {
    value: class MockURL {
      constructor(url, base) {
        // Handle blob URLs
        if (url.startsWith('blob:')) {
          this.href = url
          this.pathname = url.slice(5)
          this.searchParams = new URLSearchParams()
          this.origin = 'blob:'
          this.protocol = 'blob:'
          this.host = ''
          this.hostname = ''
          this.port = ''
          this.search = ''
          this.hash = ''
          return
        }

        // Handle relative URLs with base
        let fullUrl = url
        if (base) {
          // Remove trailing slash from base if present
          const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
          // Add leading slash to url if not present
          const cleanUrl = url.startsWith('/') ? url : `/${url}`
          fullUrl = cleanBase + cleanUrl
        }

        // Handle URLs without protocol
        if (!fullUrl.startsWith('http')) {
          fullUrl = `http://localhost:3000${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`
        }

        // Parse URL components
        const [withoutHash, hash = ''] = fullUrl.split('#')
        const [withoutSearch, search = ''] = withoutHash.split('?')
        const [protocol, rest] = withoutSearch.split('://')
        const [host, ...pathParts] = rest.split('/')
        const [hostname, port = ''] = host.split(':')
        const pathname = `/${pathParts.join('/')}`

        // Assign properties
        this.href = fullUrl
        this.protocol = protocol + ':'
        this.host = host
        this.hostname = hostname
        this.port = port
        this.pathname = pathname
        this.search = search ? `?${search}` : ''
        this.hash = hash ? `#${hash}` : ''
        this.origin = `${protocol}://${host}`
        this.searchParams = new URLSearchParams(search)
      }

      toString() {
        return this.href
      }

      static createObjectURL() {
        return 'blob:mock-url'
      }

      static revokeObjectURL() {
        // No-op
      }
    }
  }
})

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

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })),
})

window.requestAnimationFrame = jest.fn().mockImplementation(cb => setTimeout(cb, 0))
window.cancelAnimationFrame = jest.fn().mockImplementation(id => clearTimeout(id))

// Mock URL.createObjectURL
Object.defineProperty(window.URL, 'createObjectURL', {
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