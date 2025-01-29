import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import { ServerErrorCode, AuthError } from '@/utils/errors'
import { validateCookieValue } from './utils'

const COOKIE_DEFAULTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

// Helper function to validate and merge cookie options
const mergeCookieOptions = (options?: CookieOptions): CookieOptions => {
  return {
    ...COOKIE_DEFAULTS,
    ...options,
  }
}

// Helper function to handle cookie errors
const handleCookieError = (error: Error, operation: string, cookieName: string) => {
  console.error(`Cookie ${operation} error for ${cookieName}:`, error)
  // Log to error analytics
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {}
        }
      }
    )
    
    supabase.from('error_analytics_data').insert({
      component: 'auth',
      error_type: 'cookie_error',
      error_message: error.message,
      context: {
        operation,
        cookieName,
        error: error.toString()
      }
    }).then(() => {
      console.log('Error logged to analytics')
    }).catch((logError) => {
      console.error('Failed to log error:', logError)
    })
  } catch (logError) {
    console.error('Failed to create client for error logging:', logError)
  }
}

// For use with App Router
export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie errors in development
            console.error('Error setting cookie:', error)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie errors in development
            console.error('Error removing cookie:', error)
          }
        },
      },
    }
  )
}

// For use in pages directory
export const createClientForPages = (context: { req: any; res: any }) => {
  if (!context?.req || !context?.res) {
    throw new AuthError(
      'Invalid context for pages client',
      ServerErrorCode.INVALID_CONTEXT
    )
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          try {
            return context.req.cookies[name]
          } catch (error) {
            handleCookieError(error as Error, 'get', name)
            return undefined
          }
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // Validate cookie value
            const sanitizedValue = validateCookieValue(value)
            
            // Merge with default options
            const cookieOptions = mergeCookieOptions(options)
            
            // Set secure cookie headers
            const cookieString = `${name}=${sanitizedValue}; ${Object.entries(cookieOptions)
              .map(([key, value]) => `${key}=${value}`)
              .join('; ')}`
            
            context.res.setHeader('Set-Cookie', cookieString)
          } catch (error) {
            handleCookieError(error as Error, 'set', name)
            throw new AuthError(
              'Failed to set cookie',
              ServerErrorCode.SET_FAILED,
              { name, error }
            )
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            const cookieOptions = mergeCookieOptions(options)
            
            // Set cookie expiration headers
            const cookieString = `${name}=; ${Object.entries({
              ...cookieOptions,
              'Max-Age': '0',
            })
              .map(([key, value]) => `${key}=${value}`)
              .join('; ')}`
            
            context.res.setHeader('Set-Cookie', cookieString)
          } catch (error) {
            handleCookieError(error as Error, 'remove', name)
            throw new AuthError(
              'Failed to remove cookie',
              ServerErrorCode.REMOVE_FAILED,
              { name, error }
            )
          }
        },
      },
    }
  )
}

export function createServiceClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          try {
            return cookieStore.get(name)?.value
          } catch (error) {
            console.error('Failed to get cookie:', error)
            return undefined
          }
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // Validate and sanitize cookie value
            const sanitizedValue = validateCookieValue(value)
            
            // Set cookie with secure defaults
            cookieStore.set({
              name,
              value: sanitizedValue,
              ...COOKIE_DEFAULTS,
              ...options,
              // Ensure critical security options are not overridden
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/'
            })
          } catch (error) {
            handleCookieError(error as Error, 'set', name)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({
              name,
              ...COOKIE_DEFAULTS,
              ...options,
              // Ensure path is set for proper removal
              path: '/'
            })
          } catch (error) {
            handleCookieError(error as Error, 'remove', name)
          }
        }
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  )
}

export class AuthenticationError extends Error {
  code: string
  details?: Record<string, unknown>

  constructor(
    message: string = 'Authentication required',
    code: string = ServerErrorCode.AUTH_REQUIRED,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AuthenticationError'
    this.code = code
    this.details = details
  }
}
