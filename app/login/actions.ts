'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { headers } from 'next/headers'
import { z } from 'zod'
import { AuthError, DatabaseError, ServerErrorCode } from '@/utils/errors'
import { checkDatabaseHealth } from '@/utils/supabase/health'

// User role enum to match database
export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE'

// Validation schemas
const credentialsSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

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
    role?: UserRole
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const supabase = createClient()
  const headersList = headers()
  const clientIp = headersList.get('x-forwarded-for') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'

  try {
    // Validate credentials first
    const validated = credentialsSchema.parse({ email, password })

    // Attempt authentication first
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password
    })

    if (authError || !authData.user) {
      throw new AuthError('Invalid login credentials', ServerErrorCode.INVALID_CREDENTIALS)
    }

    // Check database health after successful authentication
    const health = await checkDatabaseHealth()
    if (!health.healthy) {
      console.warn('Database health check failed:', health.error)
      // Continue with basic auth data if database is unavailable
      return { 
        success: true,
        error: null,
        data: {
          userId: authData.user.id,
          email: authData.user.email,
          role: 'EMPLOYEE' // Default role if database is unavailable
        }
      }
    }

    // Get user profile if database is healthy
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.error('Failed to fetch user profile:', profileError)
      // Continue with basic auth data if profile fetch fails
      return { 
        success: true,
        error: null,
        data: {
          userId: authData.user.id,
          email: authData.user.email,
          role: 'EMPLOYEE' // Default role if profile fetch fails
        }
      }
    }

    // Log successful authentication
    try {
      await supabase.rpc('log_auth_error', {
        p_user_id: authData.user.id,
        p_action: 'login',
        p_error_code: 'SUCCESS',
        p_error_message: 'Login successful',
        p_ip_address: clientIp,
        p_user_agent: userAgent
      })
    } catch (logError) {
      // Non-blocking error - just log it
      console.error('Failed to log successful auth:', logError)
    }

    revalidatePath('/')
    return { 
      success: true,
      error: null,
      data: {
        userId: authData.user.id,
        email: authData.user.email,
        role: profileData.role as UserRole
      }
    }

  } catch (error) {
    // Enhanced error handling
    let errorCode = ServerErrorCode.SERVER_ERROR
    let errorMessage = 'An unexpected error occurred'
    let errorDetails = {}

    if (error instanceof z.ZodError) {
      errorCode = ServerErrorCode.INVALID_CREDENTIALS
      errorMessage = 'Invalid email or password format'
      errorDetails = { issues: error.issues }
    } else if (error instanceof AuthError) {
      errorCode = error.code
      errorMessage = error.message
    } else if (error instanceof DatabaseError) {
      errorCode = error.code
      errorMessage = error.message
      errorDetails = error.details || {}
    }

    // Log error to Supabase
    try {
      await supabase.rpc('log_auth_error', {
        p_user_id: null,
        p_action: 'login',
        p_error_code: errorCode,
        p_error_message: errorMessage,
        p_ip_address: clientIp,
        p_user_agent: userAgent
      })
    } catch (logError) {
      console.error('Failed to log auth error:', logError)
    }

    return {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        details: errorDetails
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
        code: ServerErrorCode.SERVER_ERROR,
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
        p_error_code: ServerErrorCode.EMAIL_IN_USE,
        p_error_message: signUpError.message,
        p_ip_address: clientIp,
        p_user_agent: userAgent
      })

      return {
        success: false,
        error: {
          code: ServerErrorCode.EMAIL_IN_USE,
          message: signUpError.message
        }
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: {
          code: ServerErrorCode.SERVER_ERROR,
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
        p_error_code: ServerErrorCode.PROFILE_CREATE_FAILED,
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
          code: ServerErrorCode.PROFILE_CREATE_FAILED,
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
        p_error_code: ServerErrorCode.EMPLOYEE_CREATE_FAILED,
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
          code: ServerErrorCode.EMPLOYEE_CREATE_FAILED,
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
          code: ServerErrorCode.INVALID_CREDENTIALS,
          message: error.errors[0]?.message || 'Invalid credentials',
          details: { errors: error.errors }
        }
      }
    }

    // Log unexpected errors
    await supabase.rpc('log_auth_error', {
      p_user_id: null,
      p_action: 'signup',
      p_error_code: ServerErrorCode.SERVER_ERROR,
      p_error_message: error instanceof Error ? error.message : 'Unknown error',
      p_ip_address: clientIp,
      p_user_agent: userAgent
    })

    return {
      success: false,
      error: {
        code: ServerErrorCode.SERVER_ERROR,
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
        p_error_code: ServerErrorCode.SERVER_ERROR,
        p_error_message: error.message,
        p_ip_address: clientIp,
        p_user_agent: userAgent
      })

      return {
        success: false,
        error: {
          code: ServerErrorCode.SERVER_ERROR,
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
      p_error_code: ServerErrorCode.SERVER_ERROR,
      p_error_message: error instanceof Error ? error.message : 'Unknown error',
      p_ip_address: clientIp,
      p_user_agent: userAgent
    })

    return {
      success: false,
      error: {
        code: ServerErrorCode.SERVER_ERROR,
        message: 'Sign out failed'
      }
    }
  }
}
