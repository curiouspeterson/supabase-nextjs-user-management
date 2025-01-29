'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { type User } from '@supabase/supabase-js'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
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
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })
  const [isClient, setIsClient] = useState(false)

  // Handle client-side only rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize Supabase client
  const supabase = isClient ? createBrowserSupabaseClient() : null

  // Reset error state
  const resetError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Sign in handler
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
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Sign in error:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new AppError(
          'Failed to sign in',
          'SIGN_IN_ERROR',
          ErrorSeverity.ERROR,
          ErrorCategory.AUTH,
          { cause: error }
        )
      }))
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [supabase, router])

  // Sign out handler
  const signOut = useCallback(async () => {
    if (!supabase) {
      throw new AppError(
        'Auth client not initialized',
        'AUTH_INIT_ERROR',
        ErrorSeverity.ERROR,
        ErrorCategory.AUTH
      )
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      router.refresh()
      router.push('/auth/login')
    } catch (error) {
      console.error('Sign out error:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new AppError(
          'Failed to sign out',
          'SIGN_OUT_ERROR',
          ErrorSeverity.ERROR,
          ErrorCategory.AUTH,
          { cause: error }
        )
      }))
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [supabase, router])

  // Initialize and subscribe to auth state changes
  useEffect(() => {
    if (!isClient || !supabase) return

    let mounted = true

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        if (mounted) {
          setState(prev => ({
            ...prev,
            user: session?.user ?? null,
            loading: false
          }))
        }
      } catch (error) {
        console.error('Session error:', error)
        if (mounted) {
          setState(prev => ({
            ...prev,
            error: error instanceof Error ? error : new AppError(
              'Failed to get session',
              'SESSION_ERROR',
              ErrorSeverity.ERROR,
              ErrorCategory.AUTH,
              { cause: error }
            ),
            loading: false
          }))
        }
      }
    }

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setState(prev => ({
            ...prev,
            user: session?.user ?? null,
            loading: false
          }))
        }
      }
    )

    initializeAuth()

    // Cleanup
    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [isClient, supabase])

  return {
    ...state,
    signIn,
    signOut,
    resetError
  }
} 