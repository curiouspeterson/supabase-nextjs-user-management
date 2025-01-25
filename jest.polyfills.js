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
class MockHeaders extends Map {
  append(key, value) {
    this.set(key, value)
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
    this._bodyInit = body
  }

  get ok() {
    return this.status >= 200 && this.status < 300
  }

  json() {
    return Promise.resolve(JSON.parse(this._bodyInit))
  }

  text() {
    return Promise.resolve(this._bodyInit)
  }

  blob() {
    return Promise.resolve(new MockBlob([this._bodyInit]))
  }

  clone() {
    return new MockResponse(this._bodyInit, {
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