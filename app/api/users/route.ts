import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const userIds = request.nextUrl.searchParams.get('ids')?.split(',') || []

    if (!userIds.length) {
      return NextResponse.json(
        { error: 'User IDs are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    
    // Use the admin API to fetch users
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.error('Error fetching users:', error.message)
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }
    
    // Filter users by the requested IDs and map to the required format
    const filteredUsers = users
      .filter(user => {
        const included = userIds.includes(user.id)
        const hasEmail = Boolean(user.email)
        return included && hasEmail
      })
      .map(user => ({
        id: user.id,
        email: user.email as string
      }))

    // Group users by ID and select the email with a number if available
    const userMap = new Map<string, { id: string; email: string }>()
    
    filteredUsers.forEach((user: { id: string; email: string }) => {
      if (!user.id || !user.email) return

      const existingUser = userMap.get(user.id)
      if (!existingUser) {
        userMap.set(user.id, { id: user.id, email: user.email })
      } else {
        // If we have multiple emails for the same user, prefer the one with a number
        const currentHasNumber = /\.\d+@/.test(existingUser.email)
        const newHasNumber = /\.\d+@/.test(user.email)
        
        if (newHasNumber && !currentHasNumber) {
          userMap.set(user.id, { id: user.id, email: user.email })
        }
      }
    })

    const userData = Array.from(userMap.values())
    return NextResponse.json(userData)

  } catch (error) {
    console.error('Unexpected error in users route:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
} 