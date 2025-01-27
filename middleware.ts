import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Check auth state
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Handle authentication
  if (!session) {
    // Redirect unauthenticated requests to login page
    if (req.nextUrl.pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return res
  }

  // Get user's role from the database
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (error || !profile) {
    console.error('Error fetching user role:', error)
    return res
  }

  const role = profile.role

  // Define route permissions
  const routePermissions = {
    '/schedules/generate': ['admin', 'manager'],
    '/schedules/stats': ['admin', 'manager'],
    '/schedules/new': ['admin', 'manager'],
    '/api/schedules/generate': ['admin', 'manager'],
    '/api/schedules': {
      GET: ['admin', 'manager', 'employee'],
      POST: ['admin', 'manager'],
      PATCH: ['admin', 'manager'],
      DELETE: ['admin', 'manager']
    }
  } as const

  // Check route permissions
  const path = req.nextUrl.pathname
  const method = req.method as keyof typeof routePermissions['/api/schedules']

  // API routes
  if (path.startsWith('/api/')) {
    const permissions = routePermissions[path as keyof typeof routePermissions]
    
    if (permissions) {
      if (typeof permissions === 'object') {
        // Method-specific permissions
        const allowedRoles = permissions[method]
        if (allowedRoles && !allowedRoles.includes(role)) {
          return new NextResponse(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          )
        }
      } else {
        // Route-level permissions
        if (!permissions.includes(role)) {
          return new NextResponse(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          )
        }
      }
    }
  }
  // Page routes
  else {
    const permissions = routePermissions[path as keyof typeof routePermissions]
    if (permissions && !permissions.includes(role)) {
      // Redirect unauthorized page access to main schedule view
      return NextResponse.redirect(new URL('/schedules', req.url))
    }
  }

  // Add role to request headers for use in API routes
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-user-role', role)

  // Return response with modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

// Specify which routes to run the middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
