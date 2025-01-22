import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

async function signOutUser(req: NextRequest) {
  const supabase = await createClient()

  // Sign out user from all devices
  await supabase.auth.signOut({ scope: 'global' })

  // Revalidate all pages that use user data
  revalidatePath('/', 'layout')

  // Redirect to login page
  return NextResponse.redirect(new URL('/login', req.url), {
    status: 302,
  })
}

// Handle both GET and POST requests
export const GET = signOutUser
export const POST = signOutUser
