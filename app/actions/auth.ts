'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(prevState: any, formData: FormData) {
  try {
    console.log('Auth Action - Login attempt')
    
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const redirectTo = formData.get('redirect_to') as string

    if (!email) return { error: 'Email is required' }
    if (!password) return { error: 'Password is required' }

    const supabase = createServerSupabaseClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Auth Action - Login error:', error.message)
      return { error: error.message }
    }

    console.log('Auth Action - Login successful')
    revalidatePath('/', 'layout')
    redirect(redirectTo || '/dashboard')
  } catch (error) {
    console.error('Auth Action - Unexpected error:', error)
    return { 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}

export async function logout() {
  try {
    console.log('Auth Action - Logout attempt')
    const supabase = createServerSupabaseClient()
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Auth Action - Logout error:', error.message)
      throw error
    }

    console.log('Auth Action - Logout successful')
    revalidatePath('/', 'layout')
    redirect('/auth/login')
  } catch (error) {
    console.error('Auth Action - Logout error:', error)
    throw error
  }
}

export async function signup(formData: FormData) {
  try {
    console.log('Auth Action - Signup attempt')
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email) return { error: 'Email is required' }
    if (!password) return { error: 'Password is required' }

    const supabase = createServerSupabaseClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error('Auth Action - Signup error:', error.message)
      return { error: error.message }
    }

    console.log('Auth Action - Signup successful')
    return { success: true }
  } catch (error) {
    console.error('Auth Action - Signup error:', error)
    return { 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
} 