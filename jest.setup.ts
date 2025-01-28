import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
import { fetch, Headers, Request, Response } from 'cross-fetch'
import { ReadableStream } from 'web-streams-polyfill'
import { server } from './__tests__/mocks/server'
import React from 'react'
import type { ImageProps } from 'next/image'

// Define MockTextDecoder first
class MockTextDecoder {
  readonly encoding: string = 'utf-8';
  readonly fatal: boolean = false;
  readonly ignoreBOM: boolean = false;

  constructor(label?: string, options?: TextDecoderOptions) {
    if (label) this.encoding = label;
    if (options) {
      this.fatal = options.fatal || false;
      this.ignoreBOM = options.ignoreBOM || false;
    }
  }

  decode(input?: ArrayBuffer | ArrayBufferView | null, options?: { stream?: boolean }): string {
    return '';
  }
}

// Only define globals if they don't exist
if (!('TextEncoder' in global)) {
  (global as any).TextEncoder = TextEncoder;
}

if (!('TextDecoder' in global)) {
  (global as any).TextDecoder = MockTextDecoder;
}

if (!('ReadableStream' in global)) {
  (global as any).ReadableStream = ReadableStream;
}

// Mock URL constructor at module level
let isConstructingURL = false
class MockURL {
  href: string
  protocol: string
  host: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
  origin: string
  searchParams: URLSearchParams

  constructor(url: string, base?: string) {
    if (isConstructingURL) {
      throw new Error('Recursive URL construction detected')
    }

    try {
      isConstructingURL = true

      if (url.startsWith('blob:')) {
        this.href = url
        this.protocol = 'blob:'
        this.host = ''
        this.hostname = ''
        this.port = ''
        this.pathname = url.slice(5)
        this.search = ''
        this.hash = ''
        this.origin = 'null'
        this.searchParams = new URLSearchParams()
        return
      }

      // Handle Next.js image URLs
      if (url.startsWith('/_next/image')) {
        this.href = `http://localhost${url}`
        this.protocol = 'http:'
        this.host = 'localhost'
        this.hostname = 'localhost'
        this.port = ''
        this.pathname = url
        this.search = ''
        this.hash = ''
        this.origin = 'http://localhost'
        this.searchParams = new URLSearchParams()
        return
      }

      // Handle base URL
      let fullUrl = url
      if (base) {
        if (base.startsWith('http')) {
          fullUrl = new URL(url, base).href
        } else {
          fullUrl = `http://localhost:3000${base.startsWith('/') ? base : '/' + base}${url.startsWith('/') ? url : '/' + url}`
        }
      } else if (!url.startsWith('http')) {
        fullUrl = `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`
      }

      const urlParts = fullUrl.match(/^(https?:)\/\/([^/:]+)(?::(\d+))?(\/[^?#]*)?(\?[^#]*)?(#.*)?$/)
      
      if (!urlParts) {
        throw new Error('Invalid URL')
      }

      this.protocol = urlParts[1] || 'http:'
      this.hostname = urlParts[2] || 'localhost'
      this.port = urlParts[3] || ''
      this.pathname = urlParts[4] || '/'
      this.search = urlParts[5] || ''
      this.hash = urlParts[6] || ''
      this.host = this.port ? `${this.hostname}:${this.port}` : this.hostname
      this.origin = `${this.protocol}//${this.host}`
      this.href = `${this.origin}${this.pathname}${this.search}${this.hash}`
      this.searchParams = new URLSearchParams(this.search)
    } finally {
      isConstructingURL = false
    }
  }

  static createObjectURL() {
    return 'blob:mock-avatar-url'
  }

  static revokeObjectURL() {
    // No-op
  }

  toString() {
    return this.href
  }
}

// Define URL globally before any other code runs
global.URL = MockURL as any
// Also define on window for compatibility
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'URL', {
    value: MockURL,
    writable: true,
    configurable: true
  })
}

// Use native Blob for all blob-related operations
const createMockBlob = (data: BlobPart[] = [], options?: BlobPropertyBag): Blob => {
  return new Blob(data, options);
}

// Mock Request
class MockRequest implements Request {
  private _url: string
  method: string
  headers: Headers
  body: ReadableStream | null
  bodyUsed: boolean
  cache: RequestCache
  credentials: RequestCredentials
  destination: RequestDestination
  integrity: string
  keepalive: boolean
  mode: RequestMode
  redirect: RequestRedirect
  referrer: string
  referrerPolicy: ReferrerPolicy
  signal: AbortSignal

  constructor(input: string | URL | Request, init?: RequestInit) {
    this._url = input instanceof URL ? input.href : String(input)
    this.method = init?.method || 'GET'
    this.headers = new MockHeaders(init?.headers)
    this.body = null
    this.bodyUsed = false
    this.cache = init?.cache || 'default'
    this.credentials = init?.credentials || 'same-origin'
    this.destination = 'document'
    this.integrity = ''
    this.keepalive = false
    this.mode = init?.mode || 'cors'
    this.redirect = init?.redirect || 'follow'
    this.referrer = ''
    this.referrerPolicy = init?.referrerPolicy || ''
    this.signal = init?.signal || new AbortController().signal
  }

  async bytes(): Promise<Uint8Array> {
    if (this.body instanceof ArrayBuffer) {
      return new Uint8Array(this.body)
    } else if (this.body instanceof Blob) {
      const buffer = await this.body.arrayBuffer()
      return new Uint8Array(buffer)
    } else if (typeof this.body === 'string') {
      return new TextEncoder().encode(this.body)
    }
    return new Uint8Array(0)
  }

  get url(): string {
    return this._url
  }

  clone(): Request {
    return new MockRequest(this._url, {
      method: this.method,
      headers: this.headers,
      body: this.body,
      mode: this.mode,
      credentials: this.credentials,
      cache: this.cache,
      redirect: this.redirect,
      referrerPolicy: this.referrerPolicy,
      signal: this.signal
    })
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return Promise.resolve(new ArrayBuffer(0))
  }

  blob(): Promise<Blob> {
    return Promise.resolve(createMockBlob());
  }

  formData(): Promise<FormData> {
    return Promise.resolve(new MockFormData())
  }

  json(): Promise<any> {
    return Promise.resolve({})
  }

  text(): Promise<string> {
    return Promise.resolve('')
  }
}

// Mock Response
class MockResponse implements Response {
  private _body: any
  readonly headers: Headers
  readonly ok: boolean
  readonly redirected: boolean
  readonly status: number
  readonly statusText: string
  readonly type: ResponseType = 'default'
  readonly url: string = ''
  readonly bodyUsed: boolean = false

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this._body = body
    this.headers = new MockHeaders(init?.headers)
    this.status = init?.status || 200
    this.statusText = init?.statusText || ''
    this.ok = this.status >= 200 && this.status < 300
    this.redirected = false
    this.type = 'default'
    this.url = ''
  }

  async bytes(): Promise<Uint8Array> {
    if (this._body instanceof ArrayBuffer) {
      return new Uint8Array(this._body)
    } else if (this._body instanceof Blob) {
      const buffer = await this._body.arrayBuffer()
      return new Uint8Array(buffer)
    } else if (typeof this._body === 'string') {
      return new TextEncoder().encode(this._body)
    }
    return new Uint8Array(0)
  }

  get body(): ReadableStream<Uint8Array> | null {
    return null
  }

  clone(): Response {
    return new MockResponse(this._body, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers
    })
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return Promise.resolve(new ArrayBuffer(0))
  }

  blob(): Promise<Blob> {
    return Promise.resolve(createMockBlob());
  }

  formData(): Promise<FormData> {
    return Promise.resolve(new MockFormData())
  }

  json(): Promise<any> {
    return Promise.resolve(this._body)
  }

  text(): Promise<string> {
    return Promise.resolve(String(this._body))
  }
}

// Mock fetch
const mockFetch = jest.fn((input: string | URL | Request, init?: RequestInit) => {
  return Promise.resolve(new MockResponse())
})

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn()
  disconnect = jest.fn()
  unobserve = jest.fn()
}

global.ResizeObserver = MockResizeObserver as any;

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn()
  disconnect = jest.fn()
  unobserve = jest.fn()
}

global.IntersectionObserver = MockIntersectionObserver as any;

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
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', { src, alt, ...props });
  },
}));

// Setup console mocking in an IIFE to avoid global scope pollution
(() => {
  type ConsoleMethod = keyof Pick<Console, 'error' | 'warn' | 'info' | 'log'>;
  
  const consoleRef = { ...console } as Console;
  const ignoredMessages = [
    'Not implemented: HTMLFormElement.prototype.requestSubmit',
    'Warning: An update to',
    'Warning: Cannot update a component',
    'Warning: componentWillReceiveProps',
    'Warning: componentWillMount'
  ];

  // Override console methods
  const mockConsole = (method: ConsoleMethod) => {
    const originalMethod = consoleRef[method];
    // Preserve the original method's type signature
    (console[method] as typeof originalMethod) = (...args: any[]) => {
      const message = args.join(' ');
      if (!ignoredMessages.some(ignored => message.includes(ignored))) {
        originalMethod.apply(console, args);
      }
    };
  };

  // Apply mocks to relevant console methods
  (['error', 'warn', 'info', 'log'] as ConsoleMethod[]).forEach(mockConsole);
})();

// Mock file with native Blob
class MockFile extends Blob {
  name: string;
  lastModified: number;
  webkitRelativePath: string;

  constructor(parts: BlobPart[], name: string, options?: FilePropertyBag) {
    super(parts, options);
    this.name = name;
    this.lastModified = options?.lastModified || Date.now();
    this.webkitRelativePath = '';
  }
}

// Mock Headers
class MockHeaders {
  private headers: Map<string, string>;

  constructor(init?: HeadersInit) {
    this.headers = new Map();
    if (init) {
      if (Array.isArray(init)) {
        init.forEach(([key, value]) => this.append(key, value));
      } else if (init instanceof Headers || init instanceof MockHeaders) {
        Array.from(init.entries()).forEach(([key, value]) => this.append(key, value));
      } else {
        Object.entries(init).forEach(([key, value]) => this.append(key, value));
      }
    }
  }

  append(name: string, value: string): void {
    this.headers.set(name.toLowerCase(), value);
  }

  delete(name: string): void {
    this.headers.delete(name.toLowerCase());
  }

  get(name: string): string | null {
    return this.headers.get(name.toLowerCase()) || null;
  }

  has(name: string): boolean {
    return this.headers.has(name.toLowerCase());
  }

  set(name: string, value: string): void {
    this.headers.set(name.toLowerCase(), value);
  }

  forEach(callbackfn: (value: string, key: string, parent: Headers) => void, thisArg?: any): void {
    this.headers.forEach((value, key) => callbackfn(value, key, this as unknown as Headers), thisArg)
  }

  entries(): HeadersIterator<[string, string]> {
    return this.headers.entries() as unknown as HeadersIterator<[string, string]>
  }

  keys(): HeadersIterator<string> {
    return this.headers.keys() as unknown as HeadersIterator<string>
  }

  values(): HeadersIterator<string> {
    return this.headers.values() as unknown as HeadersIterator<string>
  }

  [Symbol.iterator](): HeadersIterator<[string, string]> {
    return this.entries()
  }

  getSetCookie(): string[] {
    return [];
  }
}

// Mock FormData
class MockFormData implements FormData {
  private data: Map<string, FormDataEntryValue[]>;

  constructor(form?: HTMLFormElement) {
    this.data = new Map();
  }

  append(name: string, value: string | Blob, fileName?: string): void {
    const values = this.data.get(name) || [];
    if (value instanceof Blob) {
      const file = new File([value], fileName || 'blob', { 
        type: value.type,
        lastModified: Date.now()
      });
      values.push(file);
    } else {
      values.push(value);
    }
    this.data.set(name, values);
  }

  delete(name: string): void {
    this.data.delete(name);
  }

  get(name: string): FormDataEntryValue | null {
    const values = this.data.get(name);
    return values?.[0] || null;
  }

  getAll(name: string): FormDataEntryValue[] {
    return this.data.get(name) || [];
  }

  has(name: string): boolean {
    return this.data.has(name);
  }

  set(name: string, value: string | Blob, fileName?: string): void {
    if (value instanceof Blob) {
      const file = new File([value], fileName || 'blob', {
        type: value.type,
        lastModified: Date.now()
      });
      this.data.set(name, [file]);
    } else {
      this.data.set(name, [value]);
    }
  }

  forEach(callbackfn: (value: FormDataEntryValue, key: string, parent: FormData) => void): void {
    this.data.forEach((values, key) => {
      values.forEach(value => callbackfn(value, key, this))
    })
  }

  *entries(): FormDataIterator<[string, FormDataEntryValue]> {
    for (const [key, values] of this.data.entries()) {
      for (const value of values) {
        yield [key, value] as [string, FormDataEntryValue]
      }
    }
  }

  *keys(): FormDataIterator<string> {
    for (const key of this.data.keys()) {
      yield key
    }
  }

  *values(): FormDataIterator<FormDataEntryValue> {
    for (const values of this.data.values()) {
      for (const value of values) {
        yield value
      }
    }
  }

  [Symbol.iterator](): FormDataIterator<[string, FormDataEntryValue]> {
    return this.entries()
  }
}

// Set up global mocks
global.FormData = MockFormData as any;
global.Headers = MockHeaders as any;
global.File = MockFile as any;

// Mock HTMLFormElement.prototype.elements to support form data extraction
Object.defineProperty(HTMLFormElement.prototype, 'elements', {
  get() {
    return Array.from(this.querySelectorAll('input, select, textarea')).reduce<Record<string, HTMLElement>>((acc, element) => {
      if (element instanceof HTMLElement && element.hasAttribute('name')) {
        acc[element.getAttribute('name')!] = element;
      }
      return acc;
    }, {});
  }
});

// Mock console methods
const originalConsole = { ...console }
beforeAll(() => {
  global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn()
  }
})

afterAll(() => {
  global.console = originalConsole
})

// Start MSW server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Mock data
const mockProfile = {
  id: '123',
  full_name: 'Test User',
  username: 'testuser',
  website: 'https://test.com',
  avatar_url: null
}

const mockUser = {
  id: '123',
  email: 'test@example.com',
  user_metadata: mockProfile,
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
  confirmed_at: '2024-01-01T00:00:00.000Z',
  email_confirmed_at: '2024-01-01T00:00:00.000Z',
  phone: '',
  confirmation_sent_at: '',
  recovery_sent_at: '',
  last_sign_in_at: '2024-01-01T00:00:00.000Z',
  factors: []
}

const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: 1234567890,
  user: mockUser
}

// Mock functions for testing
export const mockSupabaseFrom = jest.fn()
export const mockSupabaseSelect = jest.fn()
export const mockSupabaseEq = jest.fn()
export const mockSupabaseSingle = jest.fn()
export const mockSupabaseUpsert = jest.fn()
export const mockSupabaseSignOut = jest.fn()

// Global alert mock
global.alert = jest.fn()

interface MockQueryBuilder {
  data: any;
  error: any | null;
  select: jest.Mock;
  eq: jest.Mock;
  single: jest.Mock;
  upsert: jest.Mock;
}

interface SignOutOptions {
  scope: 'global' | 'local';
}

interface AuthChangeCallback {
  (event: string, session: { session: typeof mockSession }): void;
}

const createQueryBuilder = (shouldError = false): MockQueryBuilder => {
  const builder: MockQueryBuilder = {
    data: shouldError ? null : mockProfile,
    error: shouldError ? { message: 'Error loading user data!' } : null,
    select: jest.fn().mockImplementation(() => builder),
    eq: jest.fn().mockImplementation(() => builder),
    single: jest.fn().mockImplementation(() => Promise.resolve({
      data: shouldError ? null : mockProfile,
      error: shouldError ? { message: 'Error loading user data!' } : null
    })),
    upsert: jest.fn().mockImplementation(() => Promise.resolve({
      data: shouldError ? null : mockProfile,
      error: shouldError ? { message: 'Error updating profile!' } : null
    }))
  }
  return builder
}

const mockSupabaseClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: mockSession }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: mockUser, session: mockSession }, error: null }),
    signUp: () => Promise.resolve({ data: { user: mockUser, session: mockSession }, error: null }),
    signOut: (options: SignOutOptions) => {
      mockSupabaseSignOut(options)
      return Promise.resolve({ error: null })
    },
    onAuthStateChange: (callback: AuthChangeCallback) => {
      callback('SIGNED_IN', { session: mockSession })
      return { data: { subscription: { unsubscribe: () => {} } }, error: null }
    }
  },
  from: (table: string) => {
    mockSupabaseFrom(table)
    return createQueryBuilder(table === 'profiles' && Math.random() < 0.5)
  },
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: { path: 'test-path' }, error: null }),
      download: () => Promise.resolve({ data: new Uint8Array(), error: null }),
      getPublicUrl: () => ({ data: { publicUrl: 'test-url' } })
    })
  }
}

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabaseClient
}))

beforeEach(() => {
  mockSupabaseFrom.mockClear()
  mockSupabaseSelect.mockClear()
  mockSupabaseEq.mockClear()
  mockSupabaseSingle.mockClear()
  mockSupabaseUpsert.mockClear()
  mockSupabaseSignOut.mockClear()
  ;(global.alert as jest.Mock).mockClear()
}) 