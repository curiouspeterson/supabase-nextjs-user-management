import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized', details: authError?.message },
        { status: 401 }
      )
    }

    // Check if user has admin role
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('user_role')
      .eq('id', user.id)
      .single()

    if (employeeError || !employeeData) {
      console.error('Employee lookup error:', employeeError)
      return NextResponse.json(
        { error: 'Unauthorized - Employee not found', details: employeeError?.message },
        { status: 401 }
      )
    }

    if (!['Admin', 'Manager'].includes(employeeData.user_role)) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      )
    }

    // Delete the employee directly
    const { error: deleteError } = await supabase
      .from('employees')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Error deleting employee:', deleteError)
      return NextResponse.json(
        { 
          error: 'Failed to delete employee',
          details: deleteError.message
        },
        { status: 500 }
      )
    }

    // Revalidate the employees page
    revalidatePath('/employees')
    return new NextResponse(null, { status: 204 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 