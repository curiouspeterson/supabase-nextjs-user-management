import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { 
  Schedule, 
  ScheduleWithRelations, 
  CreateScheduleInput, 
  UpdateScheduleInput 
} from '@/types/schedule'

// GET /api/schedules
export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    
    // Get query parameters
    const weekStart = searchParams.get('week_start')
    const employeeId = searchParams.get('employee_id')
    const status = searchParams.get('status')
    
    // Build query
    let query = supabase.from('schedules').select(`
      *,
      shifts (*),
      employees (id, full_name)
    `)
    
    // Apply filters if provided
    if (weekStart) {
      query = query.eq('week_start_date', weekStart)
    }
    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }
    if (status) {
      query = query.eq('schedule_status', status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data as ScheduleWithRelations[])
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// POST /api/schedules
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body: CreateScheduleInput = await request.json()

    // Validate required fields
    if (!body.week_start_date || !body.day_of_week || !body.shift_id || !body.employee_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('schedules')
      .insert(body)
      .select(`
        *,
        shifts (*),
        employees (id, full_name)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data as ScheduleWithRelations)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// PATCH /api/schedules
export async function PATCH(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      )
    }

    const body: UpdateScheduleInput = await request.json()

    const { data, error } = await supabase
      .from('schedules')
      .update(body)
      .eq('id', id)
      .select(`
        *,
        shifts (*),
        employees (id, full_name)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data as ScheduleWithRelations)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// DELETE /api/schedules
export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 