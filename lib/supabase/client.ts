'use client'

import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient, User } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'
import type { Database } from '@/types/supabase'

// Singleton instance
let supabaseInstance: SupabaseClient<Database> | null = null

/**
 * Creates a Supabase client with proper configuration
 * This is the recommended way to create a client for most use cases
 */
export const createClient = () => {
  if (typeof window === 'undefined') {
    // Server-side: Return minimal client without cookie handling
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  if (supabaseInstance) return supabaseInstance
  
  // Client-side: Full client with cookie handling
  supabaseInstance = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          try {
            const cookie = document.cookie
              .split('; ')
              .find((row) => row.startsWith(`${name}=`))
            return cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined
          } catch (error) {
            console.error('Error parsing cookie:', error)
            return undefined
          }
        },
        set(name: string, value: string, options: { expires?: number; path?: string; domain?: string }) {
          try {
            let cookie = `${name}=${encodeURIComponent(value)}`
            if (options.expires) {
              const date = new Date()
              date.setTime(date.getTime() + options.expires * 1000)
              cookie += `; expires=${date.toUTCString()}`
            }
            if (options.path) cookie += `; path=${options.path}`
            if (options.domain) cookie += `; domain=${options.domain}`
            document.cookie = cookie
          } catch (error) {
            console.error('Error setting cookie:', error)
          }
        },
        remove(name: string, options: { path?: string; domain?: string }) {
          this.set(name, '', { ...options, expires: -1 })
        }
      }
    }
  )

  return supabaseInstance
}

/**
 * React hook for accessing Supabase client and user state
 * This is the recommended way to access Supabase in React components
 */
export function useSupabase() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return { supabase, user }
}

// Export types
export type { Database }

// Export singleton instance getter
export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient()
  }
  return supabaseInstance
} 