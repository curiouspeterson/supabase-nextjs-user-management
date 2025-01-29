'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/supabase'
import { AppError, ErrorSeverity, ErrorCategory } from '@/lib/types/error'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/'
}

/**
 * Creates a Supabase server client for auth actions
 */
function createAuthClient() {
  try {
    const cookieStore = cookies()
    
    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
          set(name: string, value: string, options) {
            try {
              cookieStore.set({ name, value, ...COOKIE_OPTIONS, ...options })
            } catch (error) {
              console.error('Failed to set cookie:', error)
            }
          },
          remove(name: string, options) {
            try {
              cookieStore.set({ 
                name, 
                value: '', 
                ...COOKIE_OPTIONS, 
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
  } catch (error) {
    console.error('Failed to create auth client:', error)
    throw new AppError(
      'Failed to initialize auth',
      'AUTH_INIT_ERROR',
      ErrorSeverity.ERROR,
      ErrorCategory.AUTH,
      { cause: error }
    )
  }
}

/**
 * Server action for user login
 */
export async function login(formData: FormData) {
  try {
    const email = formData.get('email')
    const password = formData.get('password')
    
    if (!email || !password) {
      return {
        error: new AppError(
          'Email and password are required',
          'VALIDATION_ERROR',
          ErrorSeverity.WARNING,
          ErrorCategory.AUTH
        )
      }
    }

    const supabase = createAuthClient()
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString()
    })

    if (error) {
      return {
        error: new AppError(
          error.message,
          'AUTH_ERROR',
          ErrorSeverity.ERROR,
          ErrorCategory.AUTH,
          { cause: error }
        )
      }
    }

    revalidatePath('/')
    redirect('/dashboard')
  } catch (error) {
    console.error('Login error:', error)
    return {
      error: error instanceof AppError ? error : new AppError(
        'Failed to login',
        'LOGIN_ERROR',
        ErrorSeverity.ERROR,
        ErrorCategory.AUTH,
        { cause: error }
      )
    }
  }
}

/**
 * Server action for user logout
 */
export async function logout() {
  try {
    const supabase = createAuthClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return {
        error: new AppError(
          error.message,
          'AUTH_ERROR',
          ErrorSeverity.ERROR,
          ErrorCategory.AUTH,
          { cause: error }
        )
      }
    }

    revalidatePath('/')
    redirect('/auth/login')
  } catch (error) {
    console.error('Logout error:', error)
    return {
      error: error instanceof AppError ? error : new AppError(
        'Failed to logout',
        'LOGOUT_ERROR',
        ErrorSeverity.ERROR,
        ErrorCategory.AUTH,
        { cause: error }
      )
    }
  }
}

/**
 * Server action for user signup
 */
export async function signup(formData: FormData) {
  try {
    const email = formData.get('email')
    const password = formData.get('password')
    
    if (!email || !password) {
      return {
        error: new AppError(
          'Email and password are required',
          'VALIDATION_ERROR',
          ErrorSeverity.WARNING,
          ErrorCategory.AUTH
        )
      }
    }

    const supabase = createAuthClient()
    
    const { error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      }
    })

    if (error) {
      return {
        error: new AppError(
          error.message,
          'AUTH_ERROR',
          ErrorSeverity.ERROR,
          ErrorCategory.AUTH,
          { cause: error }
        )
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Signup error:', error)
    return {
      error: error instanceof AppError ? error : new AppError(
        'Failed to signup',
        'SIGNUP_ERROR',
        ErrorSeverity.ERROR,
        ErrorCategory.AUTH,
        { cause: error }
      )
    }
  }
} 