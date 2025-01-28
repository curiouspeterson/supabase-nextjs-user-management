import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import { AuthErrorType, AuthenticationError } from './middleware'
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
const handleCookieError = async (
  error: Error,
  operation: string,
  cookieName: string
) => {
  try {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {},
        },
      }
    )

    await supabase.rpc('log_cookie_error', {
      p_error_type: AuthErrorType.COOKIE_SET,
      p_error_code: (error as AuthenticationError).code || 'UNKNOWN',
      p_error_message: error.message,
      p_error_details: {
        operation,
        cookieName,
        error: error.toString(),
      },
    })
  } catch (logError) {
    console.error('Failed to log cookie error:', logError)
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
            const cookieOptions = mergeCookieOptions(options)
            cookieStore.set({ name, value, ...cookieOptions })
          } catch (error) {
            console.error('Failed to set cookie:', error)
            throw new AuthenticationError(
              AuthErrorType.COOKIE_SET,
              'Failed to set authentication cookie',
              'SET_FAILED',
              { name, error }
            )
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            const cookieOptions = mergeCookieOptions(options)
            cookieStore.set({ name, value: '', ...cookieOptions })
          } catch (error) {
            console.error('Failed to remove cookie:', error)
            throw new AuthenticationError(
              AuthErrorType.COOKIE_REMOVE,
              'Failed to remove authentication cookie',
              'REMOVE_FAILED',
              { name, error }
            )
          }
        },
      },
    }
  )
}

// For use in pages directory
export const createClientForPages = (context: { req: any; res: any }) => {
  if (!context?.req || !context?.res) {
    throw new AuthenticationError(
      AuthErrorType.COOKIE_SET,
      'Invalid context',
      'INVALID_CONTEXT'
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
            throw new AuthenticationError(
              AuthErrorType.COOKIE_SET,
              'Failed to set cookie',
              'SET_FAILED',
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
}

export function createServiceClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          try {
            return cookieStore.getAll().map(cookie => ({
              name: cookie.name,
              value: cookie.value,
            }))
          } catch (error) {
            handleCookieError(error as Error, 'getAll', 'all')
            return []
          }
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Validate each cookie value
              const sanitizedValue = validateCookieValue(value)
              
              // Merge with default options
              const cookieOptions = mergeCookieOptions(options)
              
              cookieStore.set({
                name,
                value: sanitizedValue,
                ...cookieOptions,
              })
            })
          } catch (error) {
            handleCookieError(error as Error, 'setAll', 'multiple')
            throw new AuthenticationError(
              AuthErrorType.COOKIE_SET,
              'Failed to set multiple cookies',
              'SET_ALL_FAILED',
              { error }
            )
          }
        },
      },
    }
  )
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}
