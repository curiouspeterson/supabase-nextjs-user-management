'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { headers } from 'next/headers'
import { z } from 'zod'

// Validation schemas
const credentialsSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

// Error codes
export const AuthErrorCode = {
  INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  INVALID_EMAIL: 'AUTH_INVALID_EMAIL',
  INVALID_PASSWORD: 'AUTH_INVALID_PASSWORD',
  USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  EMAIL_IN_USE: 'AUTH_EMAIL_IN_USE',
  SERVER_ERROR: 'AUTH_SERVER_ERROR',
  ROLE_UPDATE_FAILED: 'AUTH_ROLE_UPDATE_FAILED',
  PROFILE_CREATE_FAILED: 'AUTH_PROFILE_CREATE_FAILED',
  EMPLOYEE_CREATE_FAILED: 'AUTH_EMPLOYEE_CREATE_FAILED'
} as const

// Response type
export interface AuthResponse {
  success: boolean
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  } | null
  data?: {
    userId?: string
    email?: string
    role?: string
  }
}

export async function login(
  email: string,
  password: string,
  redirectUrl?: string
): Promise<AuthResponse> {
  const supabase = createClient()
  const headersList = headers()
  const clientIp = headersList.get('x-forwarded-for') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'

  try {
    // Validate input
    const validated = credentialsSchema.parse({ email, password })

    // Clear any existing session
    await supabase.auth.signOut()

    // Attempt sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    })

    if (signInError) {
      // Log auth error
      await supabase.rpc('log_auth_error', {
        p_user_id: null,
        p_action: 'login',
        p_error_code: AuthErrorCode.INVALID_CREDENTIALS,
        p_error_message: signInError.message,
        p_ip_address: clientIp,
        p_user_agent: userAgent
      })

      return {
        success: false,
        error: {
          code: AuthErrorCode.INVALID_CREDENTIALS,
          message: 'Invalid email or password'
        }
      }
    }

    if (!signInData.session) {
      return {
        success: false,
        error: {
          code: AuthErrorCode.SERVER_ERROR,
          message: 'No session established'
        }
      }
    }

    // Get user role
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('employee_role')
      .eq('id', signInData.session.user.id)
      .single()

    if (employeeError) {
      // Log role fetch error
      await supabase.rpc('log_auth_error', {
        p_user_id: signInData.session.user.id,
        p_action: 'login_get_role',
        p_error_code: AuthErrorCode.ROLE_UPDATE_FAILED,
        p_error_message: employeeError.message,
        p_ip_address: clientIp,
        p_user_agent: userAgent
      })

      return {
        success: false,
        error: {
          code: AuthErrorCode.ROLE_UPDATE_FAILED,
          message: 'Error fetching user role'
        }
      }
    }

    // Update user metadata with role if found
    if (employee?.employee_role) {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { role: employee.employee_role }
      })

      if (updateError) {
        // Log role update error
        await supabase.rpc('log_auth_error', {
          p_user_id: signInData.session.user.id,
          p_action: 'login_update_role',
          p_error_code: AuthErrorCode.ROLE_UPDATE_FAILED,
          p_error_message: updateError.message,
          p_ip_address: clientIp,
          p_user_agent: userAgent
        })

        return {
          success: false,
          error: {
            code: AuthErrorCode.ROLE_UPDATE_FAILED,
            message: 'Error updating user role'
          }
        }
      }
    }

    // Ensure session is properly set
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return {
        success: false,
        error: {
          code: AuthErrorCode.SERVER_ERROR,
          message: 'Error establishing session'
        }
      }
    }

    revalidatePath('/', 'layout')
    
    return {
      success: true,
      error: null,
      data: {
        userId: session.user.id,
        email: session.user.email,
        role: employee?.employee_role
      }
    }

  } catch (error) {
    console.error('Login error:', error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          code: AuthErrorCode.INVALID_CREDENTIALS,
          message: error.errors[0]?.message || 'Invalid credentials',
          details: { errors: error.errors }
        }
      }
    }

    // Log unexpected errors
    await supabase.rpc('log_auth_error', {
      p_user_id: null,
      p_action: 'login',
      p_error_code: AuthErrorCode.SERVER_ERROR,
      p_error_message: error instanceof Error ? error.message : 'Unknown error',
      p_ip_address: clientIp,
      p_user_agent: userAgent
    })

    return {
      success: false,
      error: {
        code: AuthErrorCode.SERVER_ERROR,
        message: 'An unexpected error occurred'
      }
    }
  }
}

export async function signup(
  email: string,
  password: string
): Promise<AuthResponse> {
  const supabase = createClient()
  const adminClient = createAdminClient()
  const headersList = headers()
  const clientIp = headersList.get('x-forwarded-for') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'

  // Verify adminClient is properly initialized
  if (!adminClient) {
    return {
      success: false,
      error: {
        code: AuthErrorCode.SERVER_ERROR,
        message: 'Server configuration error'
      }
    }
  }

  try {
    // Validate input
    const validated = credentialsSchema.parse({ email, password })

    // Step 1: Create auth user with admin client to bypass email confirmation
    const { data: authData, error: signUpError } = await adminClient.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: true,
      user_metadata: {
        username: validated.email.split('@')[0],
        full_name: validated.email.split('@')[0],
        user_role: 'Employee'
      }
    })

    if (signUpError) {
      // Log signup error
      await supabase.rpc('log_auth_error', {
        p_user_id: null,
        p_action: 'signup',
        p_error_code: AuthErrorCode.EMAIL_IN_USE,
        p_error_message: signUpError.message,
        p_ip_address: clientIp,
        p_user_agent: userAgent
      })

      return {
        success: false,
        error: {
          code: AuthErrorCode.EMAIL_IN_USE,
          message: signUpError.message
        }
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: {
          code: AuthErrorCode.SERVER_ERROR,
          message: 'Failed to create user account'
        }
      }
    }

    // Step 2: Create profile record
    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .upsert([{
        id: authData.user.id,
        username: validated.email.split('@')[0],
        full_name: validated.email.split('@')[0],
        updated_at: new Date().toISOString()
      }], { 
        onConflict: 'id'
      })
      .select()
      .single()

    if (profileError) {
      // Log profile creation error
      await supabase.rpc('log_auth_error', {
        p_user_id: authData.user.id,
        p_action: 'signup_create_profile',
        p_error_code: AuthErrorCode.PROFILE_CREATE_FAILED,
        p_error_message: profileError.message,
        p_ip_address: clientIp,
        p_user_agent: userAgent
      })

      // Cleanup: Delete auth user if profile creation fails
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(authData.user.id)
      if (deleteError) {
        console.error('Failed to cleanup auth user after profile creation error:', deleteError)
      }

      return {
        success: false,
        error: {
          code: AuthErrorCode.PROFILE_CREATE_FAILED,
          message: 'Failed to create user profile'
        }
      }
    }

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
      // Log employee creation error
      await supabase.rpc('log_auth_error', {
        p_user_id: authData.user.id,
        p_action: 'signup_create_employee',
        p_error_code: AuthErrorCode.EMPLOYEE_CREATE_FAILED,
        p_error_message: employeeError.message,
        p_ip_address: clientIp,
        p_user_agent: userAgent
      })

      // Cleanup: Delete auth user and profile if employee creation fails
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(authData.user.id)
      if (deleteError) {
        console.error('Failed to cleanup auth user after employee creation error:', deleteError)
      }

      return {
        success: false,
        error: {
          code: AuthErrorCode.EMPLOYEE_CREATE_FAILED,
          message: 'Failed to create employee record'
        }
      }
    }

    revalidatePath('/', 'layout')
    
    return {
      success: true,
      error: null,
      data: {
        userId: authData.user.id,
        email: authData.user.email,
        role: employeeData.employee_role
      }
    }

  } catch (error) {
    console.error('Signup process error:', error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          code: AuthErrorCode.INVALID_CREDENTIALS,
          message: error.errors[0]?.message || 'Invalid credentials',
          details: { errors: error.errors }
        }
      }
    }

    // Log unexpected errors
    await supabase.rpc('log_auth_error', {
      p_user_id: null,
      p_action: 'signup',
      p_error_code: AuthErrorCode.SERVER_ERROR,
      p_error_message: error instanceof Error ? error.message : 'Unknown error',
      p_ip_address: clientIp,
      p_user_agent: userAgent
    })

    return {
      success: false,
      error: {
        code: AuthErrorCode.SERVER_ERROR,
        message: 'Failed to complete signup process'
      }
    }
  }
}

export async function signOut(): Promise<AuthResponse> {
  const supabase = createClient()
  const headersList = headers()
  const clientIp = headersList.get('x-forwarded-for') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'
  
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      // Log signout error
      await supabase.rpc('log_auth_error', {
        p_user_id: null,
        p_action: 'signout',
        p_error_code: AuthErrorCode.SERVER_ERROR,
        p_error_message: error.message,
        p_ip_address: clientIp,
        p_user_agent: userAgent
      })

      return {
        success: false,
        error: {
          code: AuthErrorCode.SERVER_ERROR,
          message: error.message
        }
      }
    }

    // Clear all cached data
    revalidatePath('/', 'layout')
    revalidatePath('/shifts')
    
    return {
      success: true,
      error: null
    }

  } catch (error) {
    console.error('Sign out error:', error)

    // Log unexpected errors
    await supabase.rpc('log_auth_error', {
      p_user_id: null,
      p_action: 'signout',
      p_error_code: AuthErrorCode.SERVER_ERROR,
      p_error_message: error instanceof Error ? error.message : 'Unknown error',
      p_ip_address: clientIp,
      p_user_agent: userAgent
    })

    return {
      success: false,
      error: {
        code: AuthErrorCode.SERVER_ERROR,
        message: 'Sign out failed'
      }
    }
  }
}
