import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { Database } from '@/types/supabase'

export const createPagesClient = (context: { req: any; res: any }) => {
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