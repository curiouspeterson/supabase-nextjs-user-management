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

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              if (!validateCookieOptions({ name, value, ...options })) {
                console.warn('Invalid cookie options, using defaults')
              }
              response.cookies.set({
                name,
                value,
                ...options,
                path: options.path ?? '/'
              })
            } catch (error) {
              console.error('Failed to set cookie:', error)
              // Continue with degraded functionality
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              response.cookies.delete({
                name,
                path: options.path ?? '/'
              })
            } catch (error) {
              console.error('Failed to remove cookie:', error)
              // Continue with degraded functionality
            }
          },
        },
      }
    )

    // Get session with retry logic
    let session = null
    let lastError: Error | null = null

    try {
      const result = await exponentialBackoff(
        async () => {
          const { data, error } = await supabase.auth.getSession()
          if (error) throw error
          return data.session
        },
        RETRY_OPTIONS
      )
      session = result
    } catch (error) {
      lastError = error as Error
      console.error('Session refresh failed:', error)
    }

    // Handle routing based on session state
    if (!session && !request.nextUrl.pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/login', request.nextUrl.origin))
    }

    if (session && request.nextUrl.pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/', request.nextUrl.origin))
    }

    return response

  } catch (error) {
    console.error('Middleware error:', error)
    
    // Return degraded response
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
