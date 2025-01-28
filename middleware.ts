import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { AuthErrorType } from '@/utils/supabase/middleware'
import { exponentialBackoff } from '@/utils/supabase/utils'
import { Database } from '@/types/supabase'

// Retry configuration
const RETRY_OPTIONS = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 5000
}

// Cookie validation
const validateCookieOptions = (options: CookieOptions): boolean => {
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

  let supabase: ReturnType<typeof createServerClient<Database>>

  try {
    supabase = createServerClient(
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
                throw new Error('Invalid cookie options')
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
    let attempt = 0
    let lastError: Error | null = null

    while (attempt < RETRY_OPTIONS.maxAttempts) {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        session = data.session
        break
      } catch (error) {
        lastError = error as Error
        attempt++
        
        if (attempt < RETRY_OPTIONS.maxAttempts) {
          const delay = exponentialBackoff(
            attempt,
            RETRY_OPTIONS.initialDelay,
            RETRY_OPTIONS.maxDelay
          )
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    if (lastError) {
      // Log authentication error
      await supabase.rpc('log_auth_error', {
        p_error_type: AuthErrorType.SESSION_REFRESH,
        p_error_code: 'SESSION_REFRESH_FAILED',
        p_error_message: lastError.message,
        p_error_details: {},
        p_request_path: request.nextUrl.pathname,
        p_request_method: request.method,
        p_ip_address: request.ip,
        p_user_agent: request.headers.get('user-agent')
      })
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
    
    // Log unexpected errors
    if (supabase) {
      await supabase.rpc('log_auth_error', {
        p_error_type: AuthErrorType.UNKNOWN,
        p_error_code: 'MIDDLEWARE_ERROR',
        p_error_message: error instanceof Error ? error.message : 'Unknown error',
        p_error_details: {},
        p_request_path: request.nextUrl.pathname,
        p_request_method: request.method,
        p_ip_address: request.ip,
        p_user_agent: request.headers.get('user-agent')
      })
    }

    // Continue with degraded functionality
    return response
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
