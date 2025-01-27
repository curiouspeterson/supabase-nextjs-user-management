import { createBrowserClient } from '@supabase/ssr'
import { type Database } from '@/app/database.types'
import { CookieOptions } from '@supabase/ssr'

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
          get(key: string) {
            const cookie = document.cookie
              .split('; ')
              .find((row) => row.startsWith(`${key}=`))
            return cookie ? decodeURIComponent(cookie.split('=')[1]) : ''
          },
          set(key: string, value: string, options: CookieOptions) {
            document.cookie = `${key}=${encodeURIComponent(value)}; path=${options.path || '/'}${options.domain ? `; domain=${options.domain}` : ''}${options.sameSite ? `; samesite=${options.sameSite}` : ''}${options.secure ? '; secure' : ''}`
          },
          remove(key: string, options: CookieOptions) {
            document.cookie = `${key}=; path=${options.path || '/'}${options.domain ? `; domain=${options.domain}` : ''}; expires=Thu, 01 Jan 1970 00:00:01 GMT`
          }
        }
      }
    )
  }
  return supabaseClient
}