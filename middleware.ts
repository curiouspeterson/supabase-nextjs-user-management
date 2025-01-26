import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    // Check if accessing a protected route
    const isProtectedRoute = !request.nextUrl.pathname.startsWith('/login') && 
                          !request.nextUrl.pathname.startsWith('/signup') &&
                          !request.nextUrl.pathname.startsWith('/_next') &&
                          !request.nextUrl.pathname.startsWith('/api') &&
                          !request.nextUrl.pathname.startsWith('/public') &&
                          request.nextUrl.pathname !== '/'

    // Check if accessing auth routes while logged in
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                       request.nextUrl.pathname.startsWith('/signup')

    if (isProtectedRoute && (!session || error)) {
      // Redirect to login if accessing protected route without session
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect_url', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    if (isAuthRoute && session) {
      // Redirect to shifts if accessing auth routes while logged in
      return NextResponse.redirect(new URL('/shifts', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next|public|favicon.ico).*)',
  ]
}
