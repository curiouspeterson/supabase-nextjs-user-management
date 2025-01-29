'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import { useState, useEffect, useMemo } from 'react'
import { type User } from '@supabase/supabase-js'

let supabaseClient: ReturnType<typeof createClientComponentClient<Database>>

/**
 * Creates a Supabase client for client-side use
 * @returns Supabase client instance
 * @throws Error if called on server
 */
export function createBrowserSupabaseClient() {
  if (typeof window === 'undefined') {
    throw new Error('Browser client cannot be used in server environment')
  }

  if (!supabaseClient) {
    supabaseClient = createClientComponentClient<Database>({
      options: {
        auth: {
          persistSession: true,
          storageKey: 'supabase.auth.token',
          detectSessionInUrl: true,
          flowType: 'pkce'
        }
      }
    })
  }

  return supabaseClient
}

// Modern security configuration
const COOKIE_CONFIG = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/'
}

// Modern error types
class ClientError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'ClientError'
  }
}

let globalClient: SupabaseClient<Database> | undefined

/**
 * Creates a Supabase client with modern security practices
 * @returns SupabaseClient instance
 * @throws ClientError if called on server or missing env vars
 */
export function createClient(): SupabaseClient<Database> {
  if (typeof window === 'undefined') {
    throw new ClientError(
      'Browser client cannot be used in server environment',
      'SERVER_CLIENT_ERROR'
    )
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new ClientError(
      'Missing NEXT_PUBLIC_SUPABASE_URL',
      'MISSING_ENV_ERROR'
    )
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new ClientError(
      'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'MISSING_ENV_ERROR'
    )
  }
  
  if (globalClient) return globalClient
  
  globalClient = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        storageKey: 'supabase.auth.token',
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      cookies: {
        name: 'sb-auth',
        lifetime: 60 * 60 * 24 * 7, // 1 week
        ...COOKIE_CONFIG
      }
    }
  )

  return globalClient
}

/**
 * Modern React hook for Supabase with TypeScript support
 * @returns Object containing supabase client and user
 */
export function useSupabase() {
  const [isClient, setIsClient] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Initialize client only after component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  const supabase = useMemo(() => {
    if (!isClient) return null

    try {
      return createBrowserSupabaseClient()
    } catch (e) {
      console.error('Failed to create Supabase client:', e)
      setError(e instanceof Error ? e : new Error('Unknown error'))
      return null
    }
  }, [isClient])

  useEffect(() => {
    if (!isClient || !supabase) return

    let mounted = true
    
    async function getInitialSession() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        
        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      } catch (e) {
        console.error('Session error:', e)
        if (mounted) {
          setError(e instanceof Error ? e : new Error('Session error'))
          setLoading(false)
        }
      }
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    getInitialSession()

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [isClient, supabase])

  // Return early if not on client
  if (!isClient) {
    return { supabase: null, user: null, loading: true, error: null }
  }

  return { supabase, user, loading, error }
}

// Export types for better type safety
export type { Database, User }

// Development-only hot reload handling
if (process.env.NODE_ENV === 'development') {
  if (module.hot) {
    module.hot.dispose(() => {
      supabaseClient = undefined
    })
  }
} 