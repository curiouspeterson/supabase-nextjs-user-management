'use server'

import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

function createAuthClient() {
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
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            console.error('Failed to set cookie:', error)
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 })
          } catch (error) {
            console.error('Failed to remove cookie:', error)
          }
        }
      }
    }
  )
}

export async function login(prevState: any, formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const redirectTo = (formData.get('redirect_to') as string) || '/dashboard'

    if (!email || !password) {
      return { 
        error: 'Email and password are required'
      }
    }

    const supabase = createAuthClient()
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Auth error:', error)
      return { 
        error: 'Invalid email or password'
      }
    }

    revalidatePath('/', 'layout')
    redirect(redirectTo)
  } catch (error) {
    console.error('Login error:', error)
    return { 
      error: 'An unexpected error occurred'
    }
  }
}

export async function logout() {
  try {
    const supabase = createAuthClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Signout error:', error)
      return { 
        error: 'Failed to sign out'
      }
    }

    revalidatePath('/', 'layout')
    redirect('/auth/login')
  } catch (error) {
    console.error('Logout error:', error)
    return { 
      error: 'An unexpected error occurred'
    }
  }
}

export async function signup(prevState: any, formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return { 
        error: 'Email and password are required'
      }
    }

    if (password.length < 8) {
      return {
        error: 'Password must be at least 8 characters'
      }
    }

    const supabase = createAuthClient()
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      }
    })

    if (error) {
      console.error('Signup error:', error)
      return { 
        error: error.message 
      }
    }

    return { 
      success: true,
      message: 'Check your email to confirm your account'
    }
  } catch (error) {
    console.error('Signup error:', error)
    return { 
      error: 'An unexpected error occurred'
    }
  }
} 