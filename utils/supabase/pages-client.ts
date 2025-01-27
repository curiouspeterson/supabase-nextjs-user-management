import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { Database } from '@/types/supabase'
import { AuthErrorType, AuthenticationError } from './middleware'
import { validateCookieValue } from './utils'

interface CookieContext {
  req: any
  res: any
}

const COOKIE_DEFAULTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

const validateCookieContext = (context: CookieContext): void => {
  if (!context?.req || !context?.res) {
    throw new AuthenticationError(
      AuthErrorType.COOKIE_SET,
      'Invalid cookie context',
      'INVALID_CONTEXT'
    )
  }
}

const setCookieWithRetry = async (
  context: CookieContext,
  name: string,
  value: string,
  options: CookieOptions
): Promise<void> => {
  try {
    // Validate cookie value
    const sanitizedValue = validateCookieValue(value)
    
    // Merge with default options
    const cookieOptions = {
      ...COOKIE_DEFAULTS,
      ...options,
    }
    
    // Set secure cookie headers
    const cookieString = `${name}=${sanitizedValue}; ${Object.entries(cookieOptions)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ')}`
    
    context.res.setHeader('Set-Cookie', cookieString)
  } catch (error) {
    // Log error and throw
    await logCookieError(context, error as Error, 'set', name)
    throw new AuthenticationError(
      AuthErrorType.COOKIE_SET,
      'Failed to set cookie',
      'SET_FAILED',
      { name, error }
    )
  }
}

const removeCookieWithRetry = async (
  context: CookieContext,
  name: string,
  options: CookieOptions
): Promise<void> => {
  try {
    // Merge with default options and set Max-Age to 0
    const cookieOptions = {
      ...COOKIE_DEFAULTS,
      ...options,
      'Max-Age': '0',
    }
    
    // Set cookie expiration headers
    const cookieString = `${name}=; ${Object.entries(cookieOptions)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ')}`
    
    context.res.setHeader('Set-Cookie', cookieString)
  } catch (error) {
    // Log error and throw
    await logCookieError(context, error as Error, 'remove', name)
    throw new AuthenticationError(
      AuthErrorType.COOKIE_REMOVE,
      'Failed to remove cookie',
      'REMOVE_FAILED',
      { name, error }
    )
  }
}

const logCookieError = async (
  context: CookieContext,
  error: Error,
  operation: string,
  cookieName: string
): Promise<void> => {
  try {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => context.req.cookies[name],
          set: () => {},
          remove: () => {},
        },
      }
    )

    await supabase.rpc('log_auth_error', {
      p_error_type: AuthErrorType.COOKIE_SET,
      p_error_code: (error as AuthenticationError).code || 'UNKNOWN',
      p_error_message: error.message,
      p_error_details: {
        operation,
        cookieName,
        error: error.toString(),
      },
      p_request_path: context.req.url,
      p_request_method: context.req.method,
      p_user_agent: context.req.headers['user-agent'],
    })
  } catch (logError) {
    console.error('Failed to log cookie error:', logError)
  }
}

export const createPagesClient = (context: CookieContext) => {
  // Validate context
  validateCookieContext(context)

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          try {
            return context.req.cookies[name]
          } catch (error) {
            console.error('Failed to get cookie:', error)
            return undefined
          }
        },
        async set(name: string, value: string, options: CookieOptions) {
          await setCookieWithRetry(context, name, value, options)
        },
        async remove(name: string, options: CookieOptions) {
          await removeCookieWithRetry(context, name, options)
        },
      },
    }
  )
} 