'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function login(
  email: string,
  password: string,
  redirectUrl?: string
): Promise<{ error: string | null; success: boolean }> {
  const supabase = createClient()

  try {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      return { error: signInError.message, success: false }
    }

    if (!signInData.session) {
      return { error: 'No session established', success: false }
    }

    // Get user role
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('employee_role')
      .eq('id', signInData.session.user.id)
      .single()

    if (employeeError) {
      console.error('Error fetching employee role:', employeeError)
      return { error: 'Error fetching user role', success: false }
    }

    // Update user metadata with role if found
    if (employee?.employee_role) {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { role: employee.employee_role }
      })

      if (updateError) {
        console.error('Error updating user role:', updateError)
        return { error: 'Error updating user role', success: false }
      }
    }

    revalidatePath('/', 'layout')
    return { error: null, success: true }
  } catch (error) {
    console.error('Login error:', error)
    return { 
      error: error instanceof Error ? error.message : 'Authentication failed',
      success: false 
    }
  }
}

export async function signup(
  email: string,
  password: string
): Promise<void> {
  const supabase = createClient()
  const adminClient = createAdminClient()

  try {
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: {
          username: email.split('@')[0],
          full_name: email.split('@')[0],
          role: 'Employee'
        }
      }
    })

    if (signUpError) {
      throw signUpError
    }

    if (!authData.user) {
      throw new Error('No user data returned after signup')
    }

    // Create profile record
    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert([{
        id: authData.user.id,
        username: email.split('@')[0],
        full_name: email.split('@')[0],
        updated_at: new Date().toISOString()
      }])

    if (profileError) {
      console.error('Profile creation error:', profileError)
      await adminClient.auth.admin.deleteUser(authData.user.id)
      throw profileError
    }

    // Create employee record
    const { error: employeeError } = await adminClient
      .from('employees')
      .upsert([{
        id: authData.user.id,
        employee_role: 'Dispatcher',
        user_role: 'Employee',
        weekly_hours_scheduled: 40,
        updated_at: new Date().toISOString()
      }])

    if (employeeError) {
      console.error('Employee creation error:', employeeError)
      await adminClient.auth.admin.deleteUser(authData.user.id)
      throw employeeError
    }

    revalidatePath('/', 'layout')
    redirect('/shifts')
  } catch (error) {
    console.error('Signup error:', error)
    throw error
  }
}

export async function signOut(): Promise<{ error: string | null }> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { error: error.message }
    }

    // Clear all cached data
    revalidatePath('/', 'layout')
    revalidatePath('/shifts')
    
    return { error: null }
  } catch (error) {
    console.error('Sign out error:', error)
    return { 
      error: error instanceof Error ? error.message : 'Sign out failed'
    }
  }
}
