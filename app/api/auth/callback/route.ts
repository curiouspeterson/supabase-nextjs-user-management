import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (!code) {
    // Log missing code error
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {}
        }
      }
    )

    await supabase.from('error_analytics_data').insert({
      component: 'auth_callback',
      error_type: 'missing_code',
      error_message: 'No code provided in callback',
      context: {
        url: request.url
      }
    })

    return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
  }

  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({
              name,
              value,
              ...options,
              // Ensure secure cookie settings
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/'
            })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({
              name,
              ...options,
              path: '/'
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      // Log exchange error
      await supabase.from('error_analytics_data').insert({
        component: 'auth_callback',
        error_type: 'exchange_error',
        error_message: error.message,
        context: {
          error: error.toString(),
          code: code
        }
      })

      return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
    }

    // Successful auth, redirect to next URL
    return NextResponse.redirect(new URL(next, request.url))
  } catch (error) {
    // Log unexpected error
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {}
        }
      }
    )

    await supabase.from('error_analytics_data').insert({
      component: 'auth_callback',
      error_type: 'unexpected_error',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      context: {
        error: error instanceof Error ? error.toString() : JSON.stringify(error),
        code: code
      }
    })

    return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
  }
} 