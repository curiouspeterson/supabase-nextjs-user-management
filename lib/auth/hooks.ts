'use client'

import { createClient } from '@/lib/supabase/client'
import { useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { AppError, ErrorSeverity, ErrorCategory } from '@/lib/types/error'

export interface AuthState {
  user: User | null
  loading: boolean
  error: Error | null
}

export interface UseAuthReturn extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetError: () => void
}

/**
 * Custom hook for managing authentication state and operations
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    async function getUser() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) throw sessionError

        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      } catch (e) {
        console.error('Auth error:', e)
        if (mounted) {
          setError(e instanceof Error ? e : new Error('Auth error'))
          setLoading(false)
        }
      }
    }

    // Get initial session
    getUser()

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (e) {
      console.error('Sign out error:', e)
      setError(e instanceof Error ? e : new Error('Sign out failed'))
    }
  }, [supabase])

  const resetError = useCallback(() => {
    setError(null)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      throw new AppError(
        'Auth client not initialized',
        'AUTH_INIT_ERROR',
        ErrorSeverity.ERROR,
        ErrorCategory.AUTH
      )
    }

    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
    } catch (error) {
      console.error('Sign in error:', error)
      setError(error instanceof Error ? error : new AppError(
        'Failed to sign in',
        'SIGN_IN_ERROR',
        ErrorSeverity.ERROR,
        ErrorCategory.AUTH,
        { cause: error }
      ))
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return {
    user,
    loading,
    error,
    signOut,
    resetError,
    signIn,
    supabase
  }
} 