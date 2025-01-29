import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { exponentialBackoff } from '@/utils/supabase/utils'
import { Database } from '@/types/supabase'
import { checkDatabaseHealth } from '@/utils/supabase/health'

// Retry configuration
const RETRY_OPTIONS = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 5000
}

// Cookie validation
const validateCookieOptions = (options: CookieOptions & { name?: string, value?: string }): boolean => {
  if (!options.name || typeof options.name !== 'string') return false
  if (options.value && typeof options.value !== 'string') return false
  if (options.maxAge && typeof options.maxAge !== 'number') return false
  return true
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    // Check database health first
    const health = await checkDatabaseHealth()
    if (!health.healthy) {
      console.error('Database health check failed:', health.error)
      // Continue with degraded functionality
    }

    // Create Supabase client with improved cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // Only set cookies in response, not request
            response.cookies.set({
              name,
              value,
              ...options,
              path: '/',
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax'
            })
          },
          remove(name: string, options: CookieOptions) {
            // Only remove cookies from response, not request
            response.cookies.set({
              name,
              value: '',
              ...options,
              path: '/',
              maxAge: 0
            })
          },
        },
      }
    )

    // Get session with improved error handling
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session error:', sessionError)
      // Don't throw, just redirect to login if needed
    }

    // Handle auth routes specially
    if (request.nextUrl.pathname.startsWith('/auth/')) {
      return response
    }

    // Handle routing based on session state
    if (!session) {
      if (!request.nextUrl.pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/login', request.nextUrl.origin))
      }
    } else if (request.nextUrl.pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/', request.nextUrl.origin))
    }

    return response

  } catch (error) {
    console.error('Middleware error:', error)
    
    // Return degraded response but ensure cookies are preserved
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
