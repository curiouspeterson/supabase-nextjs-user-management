import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export const createClient = () => {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient<Database>(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            const cookie = document.cookie
              .split('; ')
              .find((row) => row.startsWith(`${name}=`))
            return cookie ? cookie.split('=')[1] : undefined
          },
          set(name: string, value: string, options: { path?: string; domain?: string; sameSite?: 'lax' | 'strict' | 'none'; secure?: boolean }) {
            document.cookie = `${name}=${value}; path=${options.path || '/'}${options.domain ? `; domain=${options.domain}` : ''}${options.sameSite ? `; samesite=${options.sameSite}` : ''}${options.secure ? '; secure' : ''}`
          },
          remove(name: string, options: { path?: string; domain?: string }) {
            document.cookie = `${name}=; path=${options.path || '/'}${options.domain ? `; domain=${options.domain}` : ''}; expires=Thu, 01 Jan 1970 00:00:01 GMT`
          }
        }
      }
    )
  }
  return supabaseClient
}