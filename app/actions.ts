'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { ErrorCategory, ErrorSeverity } from '@/lib/types/error'

/**
 * Server action to reset error state and refresh the current page
 */
export async function resetError(path: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    // Log error reset attempt
    await supabase.rpc('log_error_action', {
      p_action: 'reset',
      p_path: path,
      p_timestamp: new Date().toISOString()
    })

    // Revalidate the path to refresh the data
    revalidatePath(path)

    return { success: true, error: null }
  } catch (error) {
    console.error('Error reset failed:', error)
    return {
      success: false,
      error: {
        message: 'Failed to reset error state',
        code: 'ERROR_RESET_FAILED',
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.UNKNOWN,
        path
      }
    }
  }
}

/**
 * Server action to clear all error states and refresh the app
 */
export async function clearAllErrors() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    // Log clear all errors attempt
    await supabase.rpc('log_error_action', {
      p_action: 'clear_all',
      p_path: '/',
      p_timestamp: new Date().toISOString()
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