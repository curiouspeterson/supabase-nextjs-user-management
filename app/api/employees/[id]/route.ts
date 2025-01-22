import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    // Check if user is a manager or admin
    const { data: currentEmployee, error: roleError } = await supabase
      .from('employees')
      .select('user_role')
      .eq('id', user.id)
      .single()

    if (roleError) throw roleError
    if (!currentEmployee || !['Manager', 'Admin'].includes(currentEmployee.user_role)) {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403 }
      )
    }

    // Delete employee record first (due to foreign key constraints)
    const { error: employeeError } = await supabase
      .from('employees')
      .delete()
      .eq('id', params.id)

    if (employeeError) throw employeeError

    // Delete profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', params.id)

    if (profileError) throw profileError

    // Delete auth user using admin API
    const { error: authError } = await supabase.auth.admin.deleteUser(
      params.id
    )

    if (authError) throw authError

    // Revalidate the employees page
    revalidatePath('/employees')

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    )
  }
} 