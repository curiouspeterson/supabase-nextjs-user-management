import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userIds = url.searchParams.get('ids')?.split(',') || []

    if (!userIds.length) {
      return NextResponse.json(
        { error: 'User IDs are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Filter users by the requested IDs
    const filteredUsers = users.filter(user => userIds.includes(user.id))
    const userData = filteredUsers.map(user => ({
      id: user.id,
      email: user.email
    }))

    return NextResponse.json(userData)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 