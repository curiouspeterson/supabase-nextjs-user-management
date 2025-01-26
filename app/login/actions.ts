'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function login(
  email: string,
  password: string,
  redirectUrl?: string
): Promise<void> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    if (!data?.session) {
      throw new Error('No session data returned after sign in')
    }

    // Verify session is active
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      throw new Error('Failed to verify session')
    }

    // Get user role
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('employee_role')
      .eq('id', session.user.id)
      .single()

    if (employeeError) {
      console.error('Error fetching employee role:', employeeError)
    }

    // Update user metadata with role
    if (employee?.employee_role) {
      await supabase.auth.updateUser({
        data: { role: employee.employee_role }
      })
    }

    revalidatePath('/', 'layout')
    redirect(redirectUrl || '/shifts')
  } catch (error) {
    console.error('Login error:', error)
    throw error
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
