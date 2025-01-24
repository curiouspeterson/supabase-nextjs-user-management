import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    // Check if user is authenticated and has admin role
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - User not authenticated' },
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
      return NextResponse.json(
        { error: 'Unauthorized - Employee not found' },
        { status: 401 }
      )
    }

    if (!['Admin', 'Manager'].includes(employeeData.user_role)) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      )
    }

    // Call the transaction function to delete the employee
    const { error: deleteError } = await supabase.rpc('delete_employee_transaction', {
      p_employee_id: params.id
    })

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