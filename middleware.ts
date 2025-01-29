import { NextResponse, type NextRequest } from 'next/server'
import { isPublicPath, getAuthSession, handleAuthRedirect } from '@/lib/auth/middleware'

export async function middleware(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname
    console.log('Auth Middleware - Processing:', path)

    // Skip auth check for public paths
    if (isPublicPath(path)) {
      console.log('Auth Middleware - Public path, skipping:', path)
      return NextResponse.next()
    }

    // Get auth session with timeout
    const { session, error, response } = await getAuthSession(request)
    
    if (error) {
      console.error('Auth Middleware - Session error:', error)
      // On session error, allow access to public paths
      if (isPublicPath(path)) {
        return response
      }
      // Redirect to login with error for protected paths
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('error', 'auth_error')
      return NextResponse.redirect(loginUrl)
    }

    console.log('Auth Middleware - Session:', session ? 'Found' : 'Not found')
    return handleAuthRedirect(session, path, request, response)

  } catch (error) {
    console.error('Auth Middleware - Critical error:', error)
    
    // On critical error, allow public paths
    if (isPublicPath(request.nextUrl.pathname)) {
      return NextResponse.next()
    }
    
    // Redirect others to login with error
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('error', 'auth_error')
    return NextResponse.redirect(loginUrl)
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
