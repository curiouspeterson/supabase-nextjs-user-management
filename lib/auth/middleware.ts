import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'
import { AppError, ErrorSeverity, ErrorCategory } from '@/lib/types/error'

// Configuration
const AUTH_CONFIG = {
  timeout: 5000,
  cookie: {
    sameSite: 'lax' as const,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/'
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

// Helper Functions
export function isPublicPath(path: string): boolean {
  if (!path) return false
  return PUBLIC_PATHS.has(path) || 
    path.startsWith('/_next/') || 
    path.startsWith('/static/') ||
    path.includes('.')
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
              ...AUTH_CONFIG.cookie,
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
              ...AUTH_CONFIG.cookie,
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
    }, AUTH_CONFIG.timeout)

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
  // Redirect to login if no session and not on login page
  if (!session && !path.startsWith('/auth/login')) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirect_to', path)
    const redirectResponse = NextResponse.redirect(redirectUrl)
    
    // Copy cookies if they exist
    if (baseResponse.cookies) {
      baseResponse.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set({
          name: cookie.name,
          value: cookie.value,
          ...AUTH_CONFIG.cookie,
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
          ...AUTH_CONFIG.cookie,
          ...cookie
        })
      })
    }
    
    return redirectResponse
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
      // Allow request on timeout/auth error to prevent complete lockout
      return response
    }

    console.log('Auth Middleware - Session:', session ? 'Found' : 'Not found')
    return handleAuthRedirect(session, path, request, response)

  } catch (error) {
    console.error('Auth Middleware - Critical error:', error)
    
    // On critical error, allow public paths
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)',]
} 