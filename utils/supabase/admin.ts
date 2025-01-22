import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createAdminClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: { path: string; maxAge?: number; domain?: string; sameSite?: 'lax' | 'strict' | 'none'; secure?: boolean; }) {
          try {
            cookieStore.set(name, value, options)
          } catch (error) {
            // Handle cookies in middleware
          }
        },
        remove(name: string, options: { path: string; domain?: string; }) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          } catch (error) {
            // Handle cookies in middleware
          }
        },
      },
    }
  )
} 