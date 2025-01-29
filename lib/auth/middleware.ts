import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'
import { AppError, ErrorSeverity, ErrorCategory } from '@/lib/types/error'

// Security Configuration
const SECURITY_CONFIG = {
  auth: {
    timeout: 5000,
    maxAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    rateLimit: {
      window: 60 * 1000, // 1 minute
      maxRequests: 100
    }
  },
  cookie: {
    sameSite: 'lax' as const,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  },
  csrf: {
    headerName: 'X-CSRF-Token',
    cookieName: 'csrf-token',
    tokenLength: 32
  }
}

const PUBLIC_PATHS = new Set([
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/callback',
  '/_next',
  '/api',
  '/static',
  '/favicon.ico'
])

// Rate limiting map
const rateLimitMap = new Map<string, { count: number, timestamp: number }>()
const loginAttemptsMap = new Map<string, { attempts: number, lockoutUntil?: number }>()

// Helper Functions
export function isPublicPath(path: string): boolean {
  if (!path) return false
  return PUBLIC_PATHS.has(path) || 
    path.startsWith('/_next/') || 
    path.startsWith('/static/') ||
    path.includes('.')
}

// Generate CSRF token
function generateCSRFToken(): string {
  const array = new Uint8Array(SECURITY_CONFIG.csrf.tokenLength)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Validate CSRF token
function validateCSRFToken(request: NextRequest): boolean {
  const token = request.headers.get(SECURITY_CONFIG.csrf.headerName)
  const cookie = request.cookies.get(SECURITY_CONFIG.csrf.cookieName)
  return token === cookie?.value
}

// Check rate limit
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record) {
    rateLimitMap.set(ip, { count: 1, timestamp: now })
    return true
  }

  if (now - record.timestamp > SECURITY_CONFIG.auth.rateLimit.window) {
    rateLimitMap.set(ip, { count: 1, timestamp: now })
    return true
  }

  if (record.count >= SECURITY_CONFIG.auth.rateLimit.maxRequests) {
    return false
  }

  record.count++
  return true
}

// Check login attempts
function checkLoginAttempts(ip: string): boolean {
  const record = loginAttemptsMap.get(ip)
  const now = Date.now()

  if (!record) {
    loginAttemptsMap.set(ip, { attempts: 0 })
    return true
  }

  if (record.lockoutUntil && now < record.lockoutUntil) {
    return false
  }

  if (record.lockoutUntil && now >= record.lockoutUntil) {
    loginAttemptsMap.set(ip, { attempts: 0 })
    return true
  }

  if (record.attempts >= SECURITY_CONFIG.auth.maxAttempts) {
    record.lockoutUntil = now + SECURITY_CONFIG.auth.lockoutDuration
    return false
  }

  record.attempts++
  return true
}

function createSupabaseClient(request: NextRequest) {
  const response = NextResponse.next()
  
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true
      },
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          try {
            response.cookies.set({
              name,
              value,
              ...SECURITY_CONFIG.cookie,
              ...options,
            })
          } catch (error) {
            console.error('Failed to set cookie:', error)
          }
        },
        remove(name: string, options) {
          try {
            response.cookies.set({
              name,
              value: '',
              ...SECURITY_CONFIG.cookie,
              ...options,
              maxAge: 0
            })
          } catch (error) {
            console.error('Failed to remove cookie:', error)
          }
        }
      }
    }
  )

  return { supabase, response }
}

export async function getAuthSession(request: NextRequest) {
  const { supabase, response } = createSupabaseClient(request)
  
  try {
    // Create an AbortController for the timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
      console.log('Auth Middleware - Session check timed out')
    }, SECURITY_CONFIG.auth.timeout)

    try {
      // Add signal to fetch requests
      const { data, error } = await supabase.auth.getSession()
      
      clearTimeout(timeoutId)
      
      if (error) {
        console.error('Auth Middleware - Session error:', error)
        throw error
      }
      
      if (!data?.session) {
        console.log('Auth Middleware - No session found')
      }
      
      return { 
        session: data?.session ?? null, 
        error: null,
        response 
      }
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (controller.signal.aborted) {
        console.error('Auth Middleware - Session check timed out')
        throw new AppError(
          'Auth check timeout',
          'AUTH_TIMEOUT',
          ErrorSeverity.ERROR,
          ErrorCategory.AUTH
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Auth Middleware - Session check failed:', error)
    return { 
      session: null, 
      response,
      error: error instanceof AppError ? error : new AppError(
        'Auth check failed',
        'AUTH_ERROR',
        ErrorSeverity.ERROR,
        ErrorCategory.AUTH,
        { cause: error }
      )
    }
  }
}

export function handleAuthRedirect(
  session: any | null,
  path: string,
  request: NextRequest,
  baseResponse: NextResponse
): NextResponse {
  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             request.ip || 
             'unknown'

  // Check rate limit
  if (!checkRateLimit(ip)) {
    const response = NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
    return response
  }

  // For login attempts, check brute force protection
  if (path === '/auth/login' && request.method === 'POST') {
    if (!checkLoginAttempts(ip)) {
      const response = NextResponse.json(
        { error: 'Account locked. Please try again later.' },
        { status: 429 }
      )
      return response
    }
  }

  // For non-GET requests, validate CSRF token
  if (request.method !== 'GET' && !isPublicPath(path)) {
    if (!validateCSRFToken(request)) {
      const response = NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
      return response
    }
  }

  // Redirect to login if no session and not on login page
  if (!session && !path.startsWith('/auth/login')) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirect_to', path)
    const redirectResponse = NextResponse.redirect(redirectUrl)
    
    // Set new CSRF token
    const csrfToken = generateCSRFToken()
    redirectResponse.cookies.set(
      SECURITY_CONFIG.csrf.cookieName,
      csrfToken,
      SECURITY_CONFIG.cookie
    )
    
    // Copy cookies if they exist
    if (baseResponse.cookies) {
      baseResponse.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set({
          name: cookie.name,
          value: cookie.value,
          ...SECURITY_CONFIG.cookie,
          ...cookie
        })
      })
    }
    
    return redirectResponse
  }

  // Redirect to dashboard if session exists and on login page
  if (session && path.startsWith('/auth/login')) {
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url))
    
    // Copy cookies if they exist
    if (baseResponse.cookies) {
      baseResponse.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set({
          name: cookie.name,
          value: cookie.value,
          ...SECURITY_CONFIG.cookie,
          ...cookie
        })
      })
    }
    
    return redirectResponse
  }

  // For regular responses, set CSRF token if needed
  if (!isPublicPath(path)) {
    const csrfToken = generateCSRFToken()
    baseResponse.cookies.set(
      SECURITY_CONFIG.csrf.cookieName,
      csrfToken,
      SECURITY_CONFIG.cookie
    )
  }

  return baseResponse
}

export async function middleware(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname
    console.log('Auth Middleware - Processing:', path)

    let response = NextResponse.next()

    // Skip auth check for public paths
    if (isPublicPath(path)) {
      console.log('Auth Middleware - Public path, skipping:', path)
      return response
    }

    // Get auth session
    const { session, error } = await getAuthSession(request)
    
    if (error) {
      console.error('Auth Middleware - Error:', error)
      // Don't allow requests on auth errors
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('error', 'auth_error')
      return NextResponse.redirect(loginUrl)
    }

    console.log('Auth Middleware - Session:', session ? 'Found' : 'Not found')
    return handleAuthRedirect(session, path, request, response)

  } catch (error) {
    console.error('Auth Middleware - Critical error:', error)
    
    // On critical error, only allow public paths
    if (isPublicPath(request.nextUrl.pathname)) {
      return NextResponse.next()
    }

    // Redirect others to login with error
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('error', 'auth_error')
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
} 