'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { ErrorCategory, ErrorSeverity } from '@/lib/types/error'
import { redirect } from 'next/navigation'
import { logger } from '@/lib/logger'
import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Server action to reset error state and refresh the current page
 */
export async function resetError(path: string) {
  const supabase = createClient()

  try {
    // Log error in scheduler_metrics table
    await supabase
      .from('scheduler_metrics')
      .insert({
        error_message: `Error reset at path: ${path}`,
        last_run_status: 'success',
        schedule_generation_time: 0,
        coverage_deficit: 0,
        overtime_violations: 0,
        pattern_errors: 0
      })

    // Revalidate the path to refresh the data
    revalidatePath(path)

    return { success: true }
  } catch (error) {
    console.error('Error reset failed:', error)
    return { error: 'Failed to reset error' }
  }
}

/**
 * Server action to clear all error states and refresh the app
 */
export async function clearAllErrors() {
  const supabase = createClient()

  try {
    // Reset all scheduler metrics error states
    const { error: updateError } = await supabase
      .from('scheduler_metrics')
      .update({
        error_message: null,
        last_run_status: 'success',
        coverage_deficit: 0,
        overtime_violations: 0,
        pattern_errors: 0,
        schedule_generation_time: 0,
      })
      .neq('id', '')

    if (updateError) {
      logger.error('Failed to clear error states', {
        error: updateError.message,
      })
      return {
        success: false,
        error: 'Failed to clear error states',
      }
    }

    // Revalidate the dashboard page
    revalidatePath('/dashboard')

    return {
      success: true,
    }
  } catch (error) {
    logger.error('Failed to clear error states', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return {
      success: false,
      error: 'Failed to clear error states',
    }
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  return redirect('/login')
}

export async function resetGlobalError() {
  const supabase = createClient()

  try {
    // Log global error reset
    await supabase
      .from('scheduler_metrics')
      .insert({
        error_message: 'Global error reset',
        last_run_status: 'success',
        schedule_generation_time: 0,
        coverage_deficit: 0,
        overtime_violations: 0,
        pattern_errors: 0
      })

    return { success: true }
  } catch (error) {
    return { error: 'Failed to reset global error' }
  }
}

export async function clearError(id: string) {
  const supabase = createClient()

  try {
    // Update the scheduler metrics to clear error state
    const { error: updateError } = await supabase
      .from('scheduler_metrics')
      .update({
        error_message: null,
        last_run_status: 'success',
      })
      .eq('id', id)

    if (updateError) {
      logger.error('Failed to clear error', {
        errorId: id,
        error: updateError.message,
      })
      return {
        success: false,
        error: 'Failed to clear error',
      }
    }

    // Revalidate the dashboard page
    revalidatePath('/dashboard')

    return {
      success: true,
    }
  } catch (error) {
    logger.error('Failed to clear error', {
      errorId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return {
      success: false,
      error: 'Failed to clear error',
    }
  }
}

export async function login(formData: FormData) {
  const supabase = createServerSupabaseClient()
  
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })

    if (error) {
      return redirect('/auth/login?error=' + encodeURIComponent(error.message))
    }

    // Get the intended destination
    const redirectTo = formData.get('redirect_to')?.toString() || '/dashboard'
    
    // Use relative redirect
    return redirect(redirectTo)
  } catch (error) {
    console.error('Login error:', error)
    return redirect('/auth/login?error=Invalid+credentials')
  }
}