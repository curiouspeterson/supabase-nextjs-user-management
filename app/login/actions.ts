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
    // Clear any existing session
    await supabase.auth.signOut()

    // Attempt sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error('Sign in error:', signInError)
      return { error: signInError.message, success: false }
    }

    if (!signInData.session) {
      console.error('No session established after sign in')
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

    // Ensure session is properly set
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      console.error('Error verifying session:', sessionError)
      return { error: 'Error establishing session', success: false }
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
): Promise<{ error: string | null; success: boolean }> {
  const supabase = createClient()
  const adminClient = createAdminClient()

  // Verify adminClient is properly initialized
  if (!adminClient) {
    console.error('Admin client not properly initialized')
    return { error: 'Server configuration error', success: false }
  }

  try {
    // Step 1: Create auth user with admin client to bypass email confirmation
    const { data: authData, error: signUpError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username: email.split('@')[0],
        full_name: email.split('@')[0],
        user_role: 'Employee'
      }
    })

    if (signUpError) {
      console.error('Signup error:', signUpError)
      return { error: signUpError.message, success: false }
    }

    if (!authData.user) {
      console.error('No user data returned after signup')
      return { error: 'Failed to create user account', success: false }
    }

    console.log('Auth user created successfully:', authData.user.id)

    // Step 2: Create profile record
    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .upsert([{
        id: authData.user.id,
        username: email.split('@')[0],
        full_name: email.split('@')[0],
        updated_at: new Date().toISOString()
      }], { 
        onConflict: 'id'
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Cleanup: Delete auth user if profile creation fails
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(authData.user.id)
      if (deleteError) {
        console.error('Failed to cleanup auth user after profile creation error:', deleteError)
      }
      return { error: 'Failed to create user profile', success: false }
    }

    console.log('Profile created successfully:', profileData)

    // Step 3: Create employee record
    const { data: employeeData, error: employeeError } = await adminClient
      .from('employees')
      .upsert([{
        id: authData.user.id,
        employee_role: 'Dispatcher',
        user_role: 'Employee',
        weekly_hours_scheduled: 40,
        updated_at: new Date().toISOString()
      }], {
        onConflict: 'id'
      })
      .select()
      .single()

    if (employeeError) {
      console.error('Employee creation error:', employeeError)
      // Cleanup: Delete auth user and profile if employee creation fails
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(authData.user.id)
      if (deleteError) {
        console.error('Failed to cleanup auth user after employee creation error:', deleteError)
      }
      return { error: 'Failed to create employee record', success: false }
    }

    console.log('Employee record created successfully:', employeeData)

    // Since we created the user with email_confirm: true, they can now sign in normally
    revalidatePath('/', 'layout')
    return { error: null, success: true }
  } catch (error) {
    console.error('Signup process error:', error)
    return { 
      error: error instanceof Error ? error.message : 'Failed to complete signup process',
      success: false 
    }
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
