import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

// Route configuration
const PUBLIC_PATHS = new Set([
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/callback',
  '/_next',
  '/api',
  '/static',
  '/favicon.ico'
])

function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.has(path) || 
    path.startsWith('/_next/') || 
    path.startsWith('/static/') ||
    path.includes('.')
}

export async function middleware(request: NextRequest) {
  try {
    // Create response to modify
    const response = NextResponse.next()

    // Create Supabase client
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options) {
            // Set cookie on the response
            response.cookies.set({
              name,
              value,
              ...options,
              sameSite: 'lax',
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
            })
          },
          remove(name: string, options) {
            // Remove cookie from the response
            response.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
              sameSite: 'lax',
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
            })
          }
        }
      }
    )

    // Get current path
    const path = request.nextUrl.pathname
    
    // Skip middleware for public paths
    if (isPublicPath(path)) {
      return response
    }

    // Verify auth
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Auth error:', error.message)
      throw error
    }

    // If no session and not on login page, redirect to login
    if (!session && !path.startsWith('/auth/login')) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirect_to', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If session exists and on login page, redirect to dashboard
    if (session && path.startsWith('/auth/login')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Add user context to request
    if (session) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', session.user.id)
      requestHeaders.set('x-user-email', session.user.email ?? '')
      requestHeaders.set('x-user-role', session.user.role ?? 'user')

      // Return response with modified headers
      return NextResponse.next({
        request: {
          headers: requestHeaders
        }
      })
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
