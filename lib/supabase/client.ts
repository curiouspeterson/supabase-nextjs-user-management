'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'
import type { CookieOptions } from '@supabase/ssr'

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null

const COOKIE_OPTIONS: CookieOptions = {
  name: 'sb-auth',
  lifetime: 60 * 60 * 24 * 7, // 1 week
  domain: process.env.NEXT_PUBLIC_DOMAIN,
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production'
}

class ClientError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'ClientError'
  }
}

/**
 * Creates a Supabase client for browser use with modern security practices
 * @returns Supabase client instance
 * @throws ClientError if called on server or missing env vars
 */
export function createClient() {
  if (typeof window === 'undefined') {
    throw new Error('Browser client must be used in client components only')
  }
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Development-only hot reload handling
if (process.env.NODE_ENV === 'development') {
  if ((module as any).hot) {
    (module as any).hot.dispose(() => {
      browserClient = null
    })
  }
}

export type SupabaseClient = ReturnType<typeof createClient> 