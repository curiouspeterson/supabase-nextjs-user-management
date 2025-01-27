'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User, AuthError } from '@supabase/supabase-js'

interface UserState {
  user: User | null
  loading: boolean
  error: AuthError | Error | null
  lastSync: Date | null
}

const initialState: UserState = {
  user: null,
  loading: true,
  error: null,
  lastSync: null,
}

export function useUser() {
  const [state, setState] = useState<UserState>(initialState)
  const supabase = createClient()

  // Helper to update state
  const updateState = (updates: Partial<UserState>) => {
    setState(current => ({
      ...current,
      ...updates,
      lastSync: updates.user !== undefined ? new Date() : current.lastSync,
    }))
  }

  // Helper to handle errors
  const handleError = async (error: AuthError | Error) => {
    console.error('Auth error:', error)
    
    try {
      // Log error to database
      await supabase.rpc('log_auth_error', {
        p_error_type: 'USER_HOOK',
        p_error_code: (error as AuthError)?.status || 'UNKNOWN',
        p_error_message: error.message,
        p_error_details: {
          name: error.name,
          stack: error.stack,
        },
      })
    } catch (logError) {
      console.error('Failed to log auth error:', logError)
    }

    updateState({ error, loading: false })
  }

  useEffect(() => {
    let mounted = true
    let retryCount = 0
    const MAX_RETRIES = 3
    const RETRY_DELAY = 1000 // 1 second

    // Function to get initial user with retry logic
    const getInitialUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) throw error
        
        if (mounted) {
          updateState({ 
            user,
            loading: false,
            error: null,
          })
        }
      } catch (error) {
        if (!mounted) return

        if (retryCount < MAX_RETRIES) {
          retryCount++
          console.warn(`Retrying getUser attempt ${retryCount}...`)
          setTimeout(getInitialUser, RETRY_DELAY * Math.pow(2, retryCount - 1))
        } else {
          handleError(error as AuthError)
        }
      }
    }

    // Get initial user
    getInitialUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      try {
        switch (event) {
          case 'SIGNED_IN':
            updateState({
              user: session?.user ?? null,
              loading: false,
              error: null,
            })
            break

          case 'SIGNED_OUT':
            updateState({
              user: null,
              loading: false,
              error: null,
            })
            break

          case 'USER_UPDATED':
            if (session?.user?.id !== state.user?.id) {
              updateState({
                user: session?.user ?? null,
                loading: false,
                error: null,
              })
            }
            break

          case 'USER_DELETED':
            updateState({
              user: null,
              loading: false,
              error: null,
            })
            break

          case 'TOKEN_REFRESHED':
            // Only update if the user has changed
            if (session?.user?.id !== state.user?.id) {
              updateState({
                user: session?.user ?? null,
                loading: false,
                error: null,
              })
            }
            break

          default:
            // For unknown events, log them but don't update state
            console.warn('Unhandled auth event:', event)
            break
        }

        // Log successful auth state change
        await supabase.rpc('log_auth_event', {
          p_event_type: event,
          p_user_id: session?.user?.id,
          p_metadata: { timestamp: new Date().toISOString() }
        })
      } catch (error) {
        handleError(error as AuthError)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // Empty dependency array since supabase client is stable

  return state
} 