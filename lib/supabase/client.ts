'use client'

import { createBrowserClient } from '@supabase/supabase-js'
import { SupabaseClient, User } from '@supabase/supabase-js'
import { useState, useEffect, useMemo } from 'react'
import type { Database } from '@/types/supabase'
import { isServer } from '@/utils/env'

// Modern global type for enhanced type safety
declare global {
  var supabaseClient: SupabaseClient<Database> | undefined
}

// Cookie configuration with enhanced security
const createSecureCookieConfig = () => ({
  get(name: string) {
    if (typeof document === 'undefined') return ''
    const value = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`))
      ?.split('=')[1]
    return value ? decodeURIComponent(value) : ''
  },
  set(name: string, value: string, options: { 
    path?: string; 
    domain?: string; 
    maxAge?: number; 
    sameSite?: 'lax' | 'strict' | 'none';
    secure?: boolean;
    httpOnly?: boolean;
  }) {
    if (typeof document === 'undefined') return
    const secureOptions = {
      ...options,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      httpOnly: true
    }
    let cookie = `${name}=${encodeURIComponent(value)}`
    Object.entries(secureOptions).forEach(([key, value]) => {
      if (value) cookie += `; ${key}=${value}`
    })
    document.cookie = cookie
  },
  remove(name: string, options: { path?: string; domain?: string }) {
    if (typeof document === 'undefined') return
    this.set(name, '', { ...options, maxAge: -1 })
  }
})

/**
 * Creates a Supabase client with modern security practices
 * @returns SupabaseClient instance
 * @throws Error if called on server
 */
export function createClient(): SupabaseClient<Database> {
  if (typeof window === 'undefined') {
    throw new Error('Browser client cannot be used in server environment')
  }

  // Verify environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  
  if (globalThis.supabaseClient) return globalThis.supabaseClient
  
  const client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Store in global for singleton pattern
  globalThis.supabaseClient = client
  return client
}

/**
 * Modern React hook for Supabase with TypeScript support
 * @returns Object containing supabase client and user
 */
export function useSupabase() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = useMemo(() => {
    try {
      return createClient()
    } catch (e) {
      console.error('Failed to create Supabase client:', e)
      return null
    }
  }, [])

  useEffect(() => {
    if (!supabase) return

    // Modern auth state handling with proper cleanup
    let mounted = true
    
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null)
      }
    })

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setUser(session?.user ?? null)
      }
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [supabase])

  return { supabase, user }
}

// Export types for better type safety
export type { Database, User }

if (process.env.NODE_ENV === 'development') {
  // Reset global instance on hot reload
  if (module.hot) {
    module.hot.dispose(() => {
      globalThis.supabaseClient = undefined
    })
  }
} 