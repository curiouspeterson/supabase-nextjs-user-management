import { createClient } from '@/utils/supabase/server'
import { DatabaseError } from '@/utils/errors'

export interface HealthCheckResult {
  healthy: boolean
  error?: string
  details?: any
}

export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const supabase = createClient()

  try {
    // First check if we can connect to Supabase at all
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      return {
        healthy: false,
        error: 'Auth service unavailable',
        details: authError
      }
    }

    // Only check database if we're authenticated
    if (session) {
      const { error: dbError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
        .single()

      if (dbError) {
        return {
          healthy: false,
          error: 'Database query failed',
          details: dbError
        }
      }
    }

    return {
      healthy: true
    }

  } catch (error) {
    console.error('Health check error:', error)
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error
    }
  }
} 