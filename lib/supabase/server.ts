import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { AppError, ErrorSeverity, ErrorCategory } from '@/lib/types/error'
import type { Database } from '@/types/supabase'

// Modern security defaults
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7 // 1 week
}

// Database configuration
const DB_CONFIG = {
  schema: 'public'
}

declare global {
  var supabaseServerClient: ReturnType<typeof createSupabaseServerClient> | undefined
}

/**
 * Creates a Supabase server client with modern security practices
 */
export function createSupabaseServerClient() {
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
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        }
      },
      db: DB_CONFIG,
      global: {
        fetch: fetch.bind(globalThis)
      }
    }
  )
}

/**
 * Creates an admin client with service role
 * Use with caution - only in trusted server contexts
 */
export async function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing service role key')
    throw new AppError(
      'Service role key is required for admin client',
      'MISSING_SERVICE_ROLE_KEY',
      ErrorSeverity.CRITICAL,
      ErrorCategory.SECURITY
    )
  }

  try {
    console.log('Initializing admin client...')
    const cookieStore = cookies()
    
    const client = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          }
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: DB_CONFIG,
        global: {
          fetch: fetch.bind(globalThis)
        }
      }
    )
    console.log('Admin client initialized successfully')
    return client
  } catch (error) {
    console.error('Failed to create admin client:', error)
    throw new AppError(
      'Failed to create admin client',
      'ADMIN_CLIENT_ERROR',
      ErrorSeverity.CRITICAL,
      ErrorCategory.SECURITY,
      { cause: error }
    )
  }
}

export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({
              name,
              value,
              ...COOKIE_OPTIONS,
              ...options,
            })
          } catch (error) {
            console.error('Cookie set error:', error)
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({
              name,
              value: '',
              ...COOKIE_OPTIONS,
              ...options,
              maxAge: 0,
            })
          } catch (error) {
            console.error('Cookie remove error:', error)
          }
        },
      },
    }
  )
} 