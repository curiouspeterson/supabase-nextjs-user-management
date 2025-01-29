'use client'

import React, { useMemo, useState } from 'react'
import { addDays, format, startOfWeek } from 'date-fns'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import type { 
  Schedule, 
  Employee, 
  Shift,
  CoverageReport 
} from '@/services/scheduler/types'
import TimeSlot from './TimeSlot'
import CoverageIndicator from './CoverageIndicator'
import ScheduleControls from './ScheduleControls'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useScheduleStore } from '@/lib/stores/schedule-store'

interface WeeklyScheduleProps {
  schedules: Schedule[]
  employees: Employee[]
  shifts: Shift[]
  coverage: CoverageReport[]
  onAssignShift?: (employeeId: string, shiftId: string, date: Date) => Promise<void>
  onRemoveShift?: (scheduleId: string) => Promise<void>
  startDate: Date
  isEditable?: boolean
  isLoading?: boolean
  error?: Error | null
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const DAYS = Array.from({ length: 7 }, (_, i) => i)

export default function WeeklySchedule({
  schedules,
  employees,
  shifts,
  coverage,
  onAssignShift,
  onRemoveShift,
  startDate,
  isEditable = false,
  isLoading = false,
  error = null
}: WeeklyScheduleProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const weekStart = useMemo(() => startOfWeek(startDate), [startDate])
  
  // Generate array of dates for the week
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error.message || 'An error occurred while loading the schedule'}
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-8 gap-4">
          <div className="col-span-1" /> {/* Empty cell for time column */}
          {DAYS.map(day => (
            <Skeleton 
              key={day} 
              className="h-8 w-full"
              role="presentation"
              aria-label="Loading day header"
            />
          ))}
        </div>
        {HOURS.map(hour => (
          <div key={hour} className="grid grid-cols-8 gap-4">
            <Skeleton 
              className="h-16 w-full"
              role="presentation" 
              aria-label={`Loading time slot for ${hour}:00`}
            />
            {DAYS.map(day => (
              <Skeleton 
                key={`${hour}-${day}`} 
                className="h-16 w-full"
                role="presentation"
                aria-label={`Loading schedule slot for day ${day + 1} at ${hour}:00`}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col w-full">
        <ScheduleControls
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />
        
        <div className="grid grid-cols-8 gap-1 mt-4">
          {/* Time column */}
          <div className="col-span-1">
            <div className="h-12"></div> {/* Header spacer */}
            {HOURS.map(hour => (
              <div key={hour} className="h-16 flex items-center justify-end pr-2 text-sm text-gray-600">
                {format(new Date().setHours(hour), 'ha')}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDates.map(date => (
            <div key={date.toISOString()} className="col-span-1">
              {/* Day header */}
              <div className="h-12 flex flex-col items-center justify-center border-b">
                <div className="text-sm font-medium">
                  {format(date, 'EEE')}
                </div>
                <div className="text-xs text-gray-600">
                  {format(date, 'MMM d')}
                </div>
              </div>

              {/* Time slots */}
              {HOURS.map(hour => (
                <TimeSlot
                  key={`${date.toISOString()}-${hour}`}
                  date={date}
                  hour={hour}
                  schedules={schedules.filter(s => s.date === format(date, 'yyyy-MM-dd'))}
                  shifts={shifts}
                  employees={employees}
                  isEditable={!!onAssignShift}
                  onAssignShift={onAssignShift}
                />
              ))}

              {/* Coverage indicators */}
              <div className="mt-2">
                {coverage
                  .find(c => c.date === format(date, 'yyyy-MM-dd'))
                  ?.periods && Object.entries(coverage
                    .find(c => c.date === format(date, 'yyyy-MM-dd'))!
                    .periods
                  ).map(([periodId, data]) => (
                    <CoverageIndicator
                      key={`${date.toISOString()}-${periodId}`}
                      date={date}
                      period={periodId}
                      required={data.required}
                      actual={data.actual}
                      supervisors={data.supervisors}
                    />
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </DndProvider>
  )
} 