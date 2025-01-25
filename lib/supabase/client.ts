import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient, User } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function useSupabase() {
  const [supabase] = useState(() => createClient())
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return { supabase, user }
} 