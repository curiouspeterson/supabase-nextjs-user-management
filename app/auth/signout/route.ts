import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

async function signOutUser(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createClient()

  try {
    // First try to sign out the current session only
    const { error } = await supabase.auth.signOut({
      scope: 'local'
    })

    if (error) {
      console.error('Sign out error:', error)
    }

    // Clear all Supabase-related cookies
    const cookieNames = cookieStore.getAll().map(cookie => cookie.name)
    for (const name of cookieNames) {
      if (name.includes('supabase') || name.includes('sb-')) {
        cookieStore.delete(name)
      }
    }

    // Revalidate all pages that use user data
    revalidatePath('/', 'layout')
    revalidatePath('/account')
    revalidatePath('/shifts')
    revalidatePath('/schedule')

    // Redirect to login page with cache-control headers
    return new NextResponse(null, {
      status: 302,
      headers: {
        'Location': '/login',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Sign out error:', error)
    // Still redirect to login on error, but with error param
    return new NextResponse(null, {
      status: 302,
      headers: {
        'Location': '/login?error=signout_failed',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}

// Handle both GET and POST requests
export const GET = signOutUser
export const POST = signOutUser
