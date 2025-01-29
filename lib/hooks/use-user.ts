'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, AuthError } from '@supabase/supabase-js'
import { AppError, AuthError as CustomAuthError, NetworkError } from '@/lib/types/error'
import { z } from 'zod'

// Define schemas for type safety
const UserRoleSchema = z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE'])
const ProfileStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'])

const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: UserRoleSchema,
  status: ProfileStatusSchema,
  full_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  metadata: z.record(z.unknown()).default({}),
  preferences: z.record(z.unknown()).default({}),
  last_active: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

type UserProfile = z.infer<typeof UserProfileSchema>

interface UserState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: AppError | null
  lastSync: Date | null
  retryCount: number
  lastRetry: Date | null
}

const initialState: UserState = {
  user: null,
  profile: null,
  loading: true,
  error: null,
  lastSync: null,
  retryCount: 0,
  lastRetry: null,
}

interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  resetAfter: number
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  resetAfter: 60000, // 1 minute
}

export function useUser(retryConfig: Partial<RetryConfig> = {}) {
  const [state, setState] = useState<UserState>(initialState)
  const supabase = useMemo(() => {
    try {
      return createClient()
    } catch (e) {
      // Return null during SSR
      return null
    }
  }, [])
  
  // Merge retry config with defaults
  const config = { ...defaultRetryConfig, ...retryConfig }

  // Helper to update state
  const updateState = useCallback((updates: Partial<UserState>) => {
    setState(current => ({
      ...current,
      ...updates,
      lastSync: updates.user !== undefined ? new Date() : current.lastSync,
    }))
  }, [])

  // Helper to calculate retry delay with exponential backoff
  const getRetryDelay = useCallback((retryCount: number): number => {
    const delay = Math.min(
      config.baseDelay * Math.pow(2, retryCount),
      config.maxDelay
    )
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000
  }, [config.baseDelay, config.maxDelay])

  // Helper to check if we should retry
  const shouldRetry = useCallback((error: AppError): boolean => {
    // Don't retry certain error types
    if (error instanceof CustomAuthError && error.code === 'INVALID_CREDENTIALS') {
      return false
    }
    
    // Check if we've exceeded max retries
    if (state.retryCount >= config.maxRetries) {
      // Check if enough time has passed to reset retry count
      const timeSinceLastRetry = state.lastRetry 
        ? Date.now() - state.lastRetry.getTime()
        : config.resetAfter + 1

      if (timeSinceLastRetry > config.resetAfter) {
        return true
      }
      return false
    }

    return true
  }, [state.retryCount, state.lastRetry, config.maxRetries, config.resetAfter])

  // Helper to handle errors
  const handleError = useCallback(async (error: Error | AuthError) => {
    console.error('Auth error:', error)
    
    let appError: AppError

    // Convert error to appropriate type
    if (error instanceof AuthError) {
      appError = new CustomAuthError(error.message, {
        supabaseError: error,
        code: error.status ? String(error.status) : 'UNKNOWN',
      })
    } else if (error.name === 'NetworkError' || error.name === 'TypeError') {
      appError = new NetworkError(error.message, {
        originalError: error,
      })
    } else {
      appError = new AppError(error.message)
    }
    
    try {
      // Get session info
      const { data: { session } } = await supabase.auth.getSession()

      // Log error to database
      const errorId = await supabase.rpc('log_auth_error', {
        p_user_id: session?.user?.id || null,
        p_action: 'USER_HOOK',
        p_error_code: appError.code,
        p_error_message: appError.message,
        p_ip_address: typeof window !== 'undefined' ? window.location.hostname : 'server',
        p_user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
      })

      // Update error with ID for tracking
      appError.metadata.errorId = errorId
    } catch (logError) {
      console.error('Failed to log auth error:', logError)
    }

    // Check if we should retry
    if (shouldRetry(appError)) {
      const retryDelay = getRetryDelay(state.retryCount)
      
      updateState({ 
        error: appError,
        retryCount: state.retryCount + 1,
        lastRetry: new Date(),
      })

      // Schedule retry
      setTimeout(() => {
        getInitialUser()
      }, retryDelay)
    } else {
      updateState({ 
        error: appError,
        loading: false,
      })
    }
  }, [supabase, state.retryCount, shouldRetry, getRetryDelay, updateState])

  // Function to get user profile
  const getUserProfile = useCallback(async (userId: string) => {
    if (!supabase) return null
    
    try {
      const { data, error } = await supabase.rpc('get_user_profile', {
        p_user_id: userId
      })

      if (error) throw error

      // Validate profile data
      const profile = UserProfileSchema.parse(data[0])
      return profile
    } catch (error) {
      console.error('Failed to get user profile:', error)
      return null
    }
  }, [supabase])

  // Function to get initial user
  const getInitialUser = useCallback(async () => {
    if (!supabase) {
      updateState({ loading: false })
      return
    }
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) throw error

      // Get user profile if we have a user
      const profile = user ? await getUserProfile(user.id) : null
      
      updateState({ 
        user,
        profile,
        loading: false,
        error: null,
        retryCount: 0,
        lastRetry: null,
      })

      // Log successful sync
      await supabase.rpc('log_auth_event', {
        p_event_type: 'USER_SYNC',
        p_user_id: user?.id || null,
        p_metadata: { 
          timestamp: new Date().toISOString(),
          hasProfile: !!profile
        }
      })
    } catch (error) {
      handleError(error as Error | AuthError)
    }
  }, [supabase, updateState, handleError, getUserProfile])

  useEffect(() => {
    let mounted = true

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      try {
        let success = true
        let errorId: string | null = null

        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
          case 'USER_UPDATED':
            if (session?.user?.id !== state.user?.id) {
              const profile = await getUserProfile(session!.user.id)
              updateState({
                user: session?.user ?? null,
                profile,
                loading: false,
                error: null,
                retryCount: 0,
                lastRetry: null,
              })
            }
            break

          case 'SIGNED_OUT':
          case 'USER_UPDATED':
            updateState({
              user: null,
              profile: null,
              loading: false,
              error: null,
              retryCount: 0,
              lastRetry: null,
            })
            break

          default:
            // For unknown events, log them but don't update state
            console.warn('Unhandled auth event:', event)
            success = false
            break
        }

        // Log auth event
        await supabase.rpc('log_auth_event', {
          p_event_type: event,
          p_user_id: session?.user?.id || null,
          p_metadata: { 
            timestamp: new Date().toISOString(),
            previousUserId: state.user?.id,
            hasProfile: !!state.profile
          }
        })
      } catch (error) {
        handleError(error as Error | AuthError)
      }
    })

    // Get initial user
    getInitialUser()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, state.user?.id, state.profile, updateState, handleError, getInitialUser, getUserProfile])

  return state
} 