import { TextEncoder, TextDecoder } from 'util'
import { ReadableStream, TransformStream, WritableStream } from 'stream/web'
import { webcrypto } from 'crypto'

// Set up Web Crypto API
Object.defineProperty(globalThis, 'crypto', {
  value: webcrypto,
  writable: false,
  configurable: true,
})

// Set up Text Encoding API
if (!globalThis.TextEncoder) {
  Object.defineProperty(globalThis, 'TextEncoder', {
    value: TextEncoder,
    writable: false,
    configurable: true,
  })
}

if (!globalThis.TextDecoder) {
  Object.defineProperty(globalThis, 'TextDecoder', {
    value: TextDecoder,
    writable: false,
    configurable: true,
  })
}

// Set up Streams API
Object.defineProperty(globalThis, 'ReadableStream', {
  value: ReadableStream,
  writable: false,
  configurable: true,
})

Object.defineProperty(globalThis, 'TransformStream', {
  value: TransformStream,
  writable: false,
  configurable: true,
})

Object.defineProperty(globalThis, 'WritableStream', {
  value: WritableStream,
  writable: false,
  configurable: true,
})

// Set up BroadcastChannel
class MockBroadcastChannel {
  private listeners: { [key: string]: Function[] } = {}

  constructor(public readonly name: string) {}

  postMessage(message: any) {
    const event = { data: message }
    ;(this.listeners['message'] || []).forEach(listener => listener(event))
  }

  addEventListener(type: string, listener: Function) {
    if (!this.listeners[type]) {
      this.listeners[type] = []
    }
    this.listeners[type].push(listener)
  }

  removeEventListener(type: string, listener: Function) {
    if (!this.listeners[type]) return
    this.listeners[type] = this.listeners[type].filter(l => l !== listener)
  }

  close() {
    this.listeners = {}
  }
}

Object.defineProperty(globalThis, 'BroadcastChannel', {
  value: MockBroadcastChannel,
  writable: false,
  configurable: true,
})

// Set up Headers, Request, Response
class MockHeaders implements Headers {
  private headers: Map<string, string>

  constructor(init?: HeadersInit) {
    this.headers = new Map()
    if (init) {
      if (init instanceof Headers) {
        init.forEach((value, key) => this.headers.set(key.toLowerCase(), value))
      } else if (Array.isArray(init)) {
        init.forEach(([key, value]) => this.headers.set(key.toLowerCase(), value))
      } else {
        Object.entries(init).forEach(([key, value]) => this.headers.set(key.toLowerCase(), value))
      }
    }
  }

  append(name: string, value: string): void {
    const existingValue = this.headers.get(name.toLowerCase())
    this.headers.set(name.toLowerCase(), existingValue ? `${existingValue}, ${value}` : value)
  }

  delete(name: string): void {
    this.headers.delete(name.toLowerCase())
  }

  get(name: string): string | null {
    return this.headers.get(name.toLowerCase()) || null
  }

  has(name: string): boolean {
    return this.headers.has(name.toLowerCase())
  }

  set(name: string, value: string): void {
    this.headers.set(name.toLowerCase(), value)
  }

  forEach(callbackfn: (value: string, key: string, parent: Headers) => void): void {
    this.headers.forEach((value, key) => callbackfn(value, key, this))
  }

  entries(): IterableIterator<[string, string]> {
    return this.headers.entries()
  }

  keys(): IterableIterator<string> {
    return this.headers.keys()
  }

  values(): IterableIterator<string> {
    return this.headers.values()
  }

  getSetCookie(): string[] {
    const cookies = this.get('set-cookie')
    return cookies ? cookies.split(', ') : []
  }

  [Symbol.iterator](): IterableIterator<[string, string]> {
    return this.entries()
  }
}

class MockRequest {
  private _body: any
  private _bodyUsed: boolean = false
  private _url: string
  readonly cache: RequestCache = 'default'
  readonly credentials: RequestCredentials = 'same-origin'
  readonly destination: RequestDestination = ''
  readonly headers: Headers
  readonly integrity: string = ''
  readonly keepalive: boolean = false
  readonly method: string
  readonly mode: RequestMode = 'cors'
  readonly redirect: RequestRedirect = 'follow'
  readonly referrer: string = 'about:client'
  readonly referrerPolicy: ReferrerPolicy = ''
  readonly signal: AbortSignal
  
  constructor(input: string | URL | Request, init: RequestInit = {}) {
    this._url = input instanceof Request ? input.url : input.toString()
    this.method = init.method?.toUpperCase() || 'GET'
    this.headers = new MockHeaders(init.headers)
    this._body = init.body
    this.signal = init.signal || { aborted: false } as AbortSignal
  }

  get url(): string {
    return this._url
  }

  get body(): ReadableStream<Uint8Array> | null {
    return null
  }

  get bodyUsed(): boolean {
    return this._bodyUsed
  }

  clone(): Request {
    return Object.assign(Object.create(MockRequest.prototype), this) as unknown as Request
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    this._bodyUsed = true
    return new ArrayBuffer(0)
  }

  async blob(): Promise<Blob> {
    this._bodyUsed = true
    return new Blob([])
  }

  async formData(): Promise<FormData> {
    this._bodyUsed = true
    return new FormData()
  }

  async json(): Promise<any> {
    this._bodyUsed = true
    return this._body ? JSON.parse(this._body) : null
  }

  async text(): Promise<string> {
    this._bodyUsed = true
    return this._body ? String(this._body) : ''
  }
}

class MockResponse {
  private _body: any
  private _bodyUsed: boolean = false
  readonly headers: Headers
  readonly ok: boolean
  readonly redirected: boolean = false
  readonly status: number
  readonly statusText: string
  readonly type: ResponseType = 'default'
  readonly url: string = ''

  static error(): Response {
    return new MockResponse(null, { status: 0, statusText: '' }) as unknown as Response
  }

  static json(data: any, init?: ResponseInit): Response {
    return new MockResponse(JSON.stringify(data), {
      ...init,
      headers: {
        ...init?.headers,
        'Content-Type': 'application/json'
      }
    }) as unknown as Response
  }

  static redirect(url: string | URL, status: number = 302): Response {
    return new MockResponse(null, {
      status,
      headers: { Location: url.toString() }
    }) as unknown as Response
  }

  constructor(body?: BodyInit | null, init: ResponseInit = {}) {
    this._body = body
    this.headers = new MockHeaders(init.headers)
    this.status = init.status || 200
    this.statusText = init.statusText || ''
    this.ok = this.status >= 200 && this.status < 300
  }

  get body(): ReadableStream<Uint8Array> | null {
    return null
  }

  get bodyUsed(): boolean {
    return this._bodyUsed
  }

  clone(): Response {
    return Object.assign(Object.create(MockResponse.prototype), this) as unknown as Response
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    this._bodyUsed = true
    return new ArrayBuffer(0)
  }

  async blob(): Promise<Blob> {
    this._bodyUsed = true
    return new Blob([])
  }

  async formData(): Promise<FormData> {
    this._bodyUsed = true
    return new FormData()
  }

  async json(): Promise<any> {
    this._bodyUsed = true
    return this._body ? JSON.parse(this._body) : null
  }

  async text(): Promise<string> {
    this._bodyUsed = true
    return this._body ? String(this._body) : ''
  }
}

// Set up URL methods
const objectUrls = new Map<string, string>()
let objectUrlCounter = 0

Object.defineProperty(globalThis, 'URL', {
  value: class extends URL {
    static createObjectURL(object: Blob | MediaSource): string {
      const url = `blob:${++objectUrlCounter}`
      objectUrls.set(url, URL.createObjectURL(object))
      return url
    }

    static revokeObjectURL(url: string): void {
      objectUrls.delete(url)
    }
  },
  writable: false,
  configurable: true,
})

// Set up global objects
Object.defineProperty(globalThis, 'Headers', {
  value: MockHeaders,
  writable: false,
  configurable: true,
})

Object.defineProperty(globalThis, 'Request', {
  value: MockRequest,
  writable: false,
  configurable: true,
})

Object.defineProperty(globalThis, 'Response', {
  value: MockResponse,
  writable: false,
  configurable: true,
})

// Set up fetch
Object.defineProperty(globalThis, 'fetch', {
  value: jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const request = new MockRequest(input.toString(), init)
    return Promise.resolve(new MockResponse(null, { status: 200 }))
  }),
  writable: true,
  configurable: true,
})

// Mock Next.js cache functions
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
  unstable_cache: jest.fn(),
  unstable_noStore: jest.fn(),
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
  useSelectedLayoutSegment: () => null,
  useSelectedLayoutSegments: () => [],
  redirect: jest.fn(),
  notFound: jest.fn(),
}))

// Mock Next.js server functions
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server')
  return {
    ...originalModule,
    NextResponse: {
      ...originalModule.NextResponse,
      redirect: (url: string | URL, init?: ResponseInit) => {
        return new MockResponse(null, {
          ...init,
          status: 302,
          headers: {
            ...init?.headers,
            Location: url.toString()
          }
        })
      },
      json: (data: any, init?: ResponseInit) => {
        return new MockResponse(JSON.stringify(data), {
          ...init,
          headers: {
            ...init?.headers,
            'Content-Type': 'application/json'
          }
        })
      },
      rewrite: (url: string | URL) => {
        return new MockResponse(null, {
          headers: {
            'x-middleware-rewrite': url.toString()
          }
        })
      },
    },
    revalidatePath: jest.fn(),
    revalidateTag: jest.fn(),
  }
}) 