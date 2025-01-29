import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

// Modern security configuration
const SECURE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/'
}

// Protected routes configuration
const PROTECTED_ROUTES = [
  '/dashboard',
  '/account',
  '/settings',
  '/employees'
]

const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify'
]

export async function middleware(request: NextRequest) {
  console.log('🔒 Middleware starting:', request.url)
  const response = NextResponse.next()
  
  // Modern initialization pattern
  const supabase = createMiddlewareClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    req: request,
    res: response,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production'
    }
  })

  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session && !request.nextUrl.pathname.startsWith('/auth')) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    console.log('✅ Authentication successful')
    response.headers.set('x-middleware-cache', 'no-cache')
  } catch (error) {
    console.error('Middleware auth error:', error)
    return NextResponse.redirect(new URL('/error', request.url))
  }

  return response
}

// Configure middleware matching
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/account/:path*',
    '/settings/:path*',
    '/((?!auth|_next/static|_next/image|favicon.ico).*)',
  ]
}
