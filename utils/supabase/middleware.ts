import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { exponentialBackoff } from './utils'

// Error types
export enum AuthErrorType {
  SESSION_REFRESH = 'SESSION_REFRESH',
  COOKIE_SET = 'COOKIE_SET',
  COOKIE_REMOVE = 'COOKIE_REMOVE',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN'
}

interface AuthError extends Error {
  type: AuthErrorType
  code?: string
  details?: Record<string, any>
}

class AuthenticationError extends Error implements AuthError {
  constructor(
    public type: AuthErrorType,
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

// Cookie operations with validation
const validateCookieOptions = (options: CookieOptions): boolean => {
  if (!options.name || typeof options.name !== 'string') return false
  if (options.value && typeof options.value !== 'string') return false
  if (options.maxAge && typeof options.maxAge !== 'number') return false
  return true
}

const createCookieResponse = (
  response: NextResponse,
  options: CookieOptions
): NextResponse => {
  try {
    if (!validateCookieOptions(options)) {
      throw new AuthenticationError(
        AuthErrorType.COOKIE_SET,
        'Invalid cookie options',
        'INVALID_OPTIONS',
        { options }
      )
    }
    
    response.cookies.set(options)
    return response
  } catch (error) {
    throw new AuthenticationError(
      AuthErrorType.COOKIE_SET,
      'Failed to set cookie',
      'SET_FAILED',
      { options, error }
    )
  }
}

// Retry configuration
const RETRY_OPTIONS = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 5000
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabase
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    // Create Supabase client
    supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(options: CookieOptions) {
            response = createCookieResponse(response, options)
          },
          remove(name: string) {
            try {
              response.cookies.delete(name)
            } catch (error) {
              throw new AuthenticationError(
                AuthErrorType.COOKIE_REMOVE,
                'Failed to remove cookie',
                'REMOVE_FAILED',
                { name, error }
              )
            }
          },
        },
      }
    )

    // Retry getSession with exponential backoff
    const getSessionWithRetry = async () => {
      let attempt = 0
      let lastError: Error | null = null

      while (attempt < RETRY_OPTIONS.maxAttempts) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            throw new AuthenticationError(
              AuthErrorType.SESSION_REFRESH,
              error.message,
              error.name,
              { error }
            )
          }
          
          return session
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
      
      throw lastError || new Error('Failed to get session after retries')
    }

    // Get session with retry logic
    await getSessionWithRetry()

    return response
  } catch (error) {
    // Log error to database
    if (supabase) {
      const { error: logError } = await supabase.rpc('log_auth_error', {
        p_error_type: (error as AuthError).type || AuthErrorType.UNKNOWN,
        p_error_code: (error as AuthError).code || 'UNKNOWN',
        p_error_message: error.message,
        p_error_details: (error as AuthError).details || {},
        p_request_path: request.nextUrl.pathname,
        p_request_method: request.method,
        p_ip_address: request.ip,
        p_user_agent: request.headers.get('user-agent')
      })

      if (logError) {
        console.error('Failed to log auth error:', logError)
      }
    }

    // Handle specific error types
    switch ((error as AuthError).type) {
      case AuthErrorType.SESSION_REFRESH:
        // Redirect to login on session errors
        return NextResponse.redirect(new URL('/login', request.url))
      
      case AuthErrorType.COOKIE_SET:
      case AuthErrorType.COOKIE_REMOVE:
        // Continue with degraded functionality on cookie errors
        console.error('Cookie operation failed:', error)
        return response
      
      case AuthErrorType.NETWORK:
        // Retry on network errors (handled by retry logic)
        console.error('Network error:', error)
        return response
      
      default:
        // Log unknown errors and continue
        console.error('Unknown auth error:', error)
        return response
    }
  }
}