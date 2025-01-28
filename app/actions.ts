'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { ErrorCategory, ErrorSeverity } from '@/lib/types/error'
import { redirect } from 'next/navigation'

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
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    // Log error clear in scheduler_metrics
    await supabase
      .from('scheduler_metrics')
      .insert({
        error_message: 'All errors cleared',
        last_run_status: 'success',
        schedule_generation_time: 0,
        coverage_deficit: 0,
        overtime_violations: 0,
        pattern_errors: 0
      })

    // Revalidate the entire app
    revalidatePath('/', 'layout')

    return { success: true, error: null }
  } catch (error) {
    console.error('Clear all errors failed:', error)
    return {
      success: false,
      error: {
        message: 'Failed to clear all error states',
        code: 'CLEAR_ALL_ERRORS_FAILED',
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.UNKNOWN,
        path: '/'
      }
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