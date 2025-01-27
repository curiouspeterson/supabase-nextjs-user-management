import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ScheduleGenerator } from '@/utils/scheduling/scheduler'
import { 
  Employee,
  ShiftPattern,
  EmployeePattern,
  Shift,
  StaffingRequirement,
  SchedulingOptions
} from '@/utils/scheduling/types'

// POST /api/schedules/generate
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body: SchedulingOptions = await request.json()

    // Validate required fields
    if (!body.startDate || !body.endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      )
    }

    // Fetch all required data
    const [
      employeesResult,
      patternsResult,
      employeePatternsResult,
      shiftsResult,
      staffingRequirementsResult
    ] = await Promise.all([
      supabase.from('employees').select('*'),
      supabase.from('shift_patterns').select('*'),
      supabase.from('employee_patterns').select('*'),
      supabase.from('shifts').select('*'),
      supabase.from('staffing_requirements').select('*')
    ])

    // Check for errors
    const errors = [
      employeesResult.error,
      patternsResult.error,
      employeePatternsResult.error,
      shiftsResult.error,
      staffingRequirementsResult.error
    ].filter(Boolean)

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Failed to fetch required data', details: errors },
        { status: 500 }
      )
    }

    // Initialize scheduler
    const scheduler = new ScheduleGenerator(
      employeesResult.data as Employee[],
      patternsResult.data as ShiftPattern[],
      employeePatternsResult.data as EmployeePattern[],
      shiftsResult.data as Shift[],
      staffingRequirementsResult.data as StaffingRequirement[],
      body
    )

    // Generate schedule
    const result = await scheduler.generateSchedule()

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Failed to generate schedule',
          warnings: result.warnings,
          errors: result.errors
        },
        { status: 400 }
      )
    }

    // Insert generated assignments into database
    const { error: insertError } = await supabase
      .from('schedules')
      .insert(
        result.assignments.map(assignment => ({
          employee_id: assignment.employeeId,
          shift_id: assignment.shiftId,
          date: assignment.date,
          schedule_status: assignment.status,
          week_start_date: new Date(assignment.date.getTime() - (assignment.date.getDay() * 24 * 60 * 60 * 1000)),
          day_of_week: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][assignment.date.getDay()]
        }))
      )

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to save generated schedule', details: insertError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      assignments: result.assignments,
      warnings: result.warnings
    })
  } catch (error) {
    console.error('Schedule generation error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 