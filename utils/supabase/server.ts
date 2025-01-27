import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

// For use in app directory
export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie setting error
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie removal error
          }
        },
      },
    }
  )
}

// For use in pages directory
export const createClientForPages = (context: { req: any; res: any }) => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return context.req.cookies[name]
        },
        set(name: string, value: string, options: CookieOptions) {
          context.res.setHeader('Set-Cookie', `${name}=${value}; Path=/; HttpOnly`)
        },
        remove(name: string, options: CookieOptions) {
          context.res.setHeader('Set-Cookie', `${name}=; Path=/; HttpOnly; Max-Age=0`)
        },
      },
    }
  )
}

export function createServiceClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          try {
            return cookieStore.getAll().map(cookie => ({
              name: cookie.name,
              value: cookie.value
            }))
          } catch (e) {
            console.error('Error parsing cookies:', e)
            return []
          }
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set({
                name,
                value,
                ...options,
                path: options?.path ?? '/'
              })
            })
          } catch (e) {
            console.error('Error setting cookies:', e)
          }
        }
      }
    }
  )
}
