'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Assignment {
  name: string
  status?: string
  startTime: string
  endTime: string
}

interface Shift {
  name: string
  time: string
  supervisor: string
  assignments: Assignment[]
}

interface Requirement {
  period: string
  required: number
  assigned: number
  status: 'Met' | 'Not Met'
  startHour: number
  endHour: number
  color: string
}

interface DispatchScheduleProps {
  date: string
  shifts: Shift[]
  requirements: Requirement[]
}

function calculateGridPosition(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  let position = hours - 5 // Adjust to start from 5am
  if (position < 0) position += 24 // Wrap around for next day
  return position + (minutes / 60)
}

function calculateWidth(start: string, end: string): number {
  let startPos = calculateGridPosition(start)
  let endPos = calculateGridPosition(end)
  if (endPos <= startPos) endPos += 24 // Handle overnight shifts
  return endPos - startPos
}

export default function DispatchSchedule({ date, shifts, requirements }: DispatchScheduleProps) {
  const legendItems = [
    { label: 'Shift Closed', color: 'bg-blue-200' },
    { label: 'On-Call', color: 'bg-red-200' },
    { label: 'Trade', color: 'bg-purple-200' },
    { label: 'Flexed', color: 'bg-orange-200' },
    { label: 'Time off rqst pending', color: 'bg-green-200' },
    { label: 'OT Shift', color: 'bg-pink-200' },
    { label: 'Coverage if needed', color: 'bg-cyan-200' },
    { label: 'Reserve', color: 'bg-gray-100' },
    { label: 'Open', color: 'bg-yellow-200' },
  ]

  const statusColorMap: Record<string, string> = {
    'Shift Closed': 'bg-blue-200',
    'On-Call': 'bg-red-200',
    'Trade': 'bg-purple-200',
    'Flexed': 'bg-orange-200',
    'Time off rqst pending': 'bg-green-200',
    'OT Shift': 'bg-pink-200',
    'Coverage if needed': 'bg-cyan-200',
    'Reserve': 'bg-gray-100',
    'Open': 'bg-yellow-200',
    'Regular': 'bg-white',
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">{format(new Date(date), 'MMMM d, yyyy')}</h1>
        <div className="space-x-2">
          <Button variant="outline">Edit Schedule</Button>
          <Button variant="default">Publish Schedule</Button>
          <Button variant="destructive">Delete Schedule</Button>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-[200px_1fr] gap-4 mb-4">
        <div className="text-xs font-medium">Legend</div>
        <div className="flex items-center gap-2 flex-wrap">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center gap-1">
              <div className={`w-4 h-4 ${item.color} border`}></div>
              <span className="text-xs whitespace-nowrap">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-lg bg-background">
        <div className="relative">
          {/* Background columns for time periods */}
          <div className="absolute inset-0 grid grid-cols-[200px_1fr] pointer-events-none">
            <div></div>
            <div className="flex">
              {requirements.map((period, index) => (
                <div
                  key={index}
                  className={`flex-none border-r last:border-r-0 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                  style={{ 
                    width: `${((period.endHour - period.startHour) / 24) * 100}%`,
                    marginLeft: index === 0 ? '24px' : '0'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Timeline Header */}
          <div className="p-4 border-b relative">
            <div className="space-y-4">
              {/* Period Names */}
              <div className="grid grid-cols-[200px_24px_1fr] gap-4">
                <div></div>
                <div></div>
                <div className="flex relative">
                  {requirements.map((period, index) => (
                    <div
                      key={index}
                      className="flex-none flex flex-col items-center justify-center border-r last:border-r-0"
                      style={{ width: `${((period.endHour - period.startHour) / 24) * 100}%` }}
                    >
                      <span className="text-xs font-medium mb-1">{period.period}</span>
                      <Badge 
                        variant={period.status === 'Met' ? 'default' : 'destructive'}
                        className="h-5 text-[10px]"
                      >
                        {period.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="grid grid-cols-[200px_24px_1fr] gap-4">
                <div></div>
                <div></div>
                <div className="flex relative h-8">
                  {requirements.map((period, index) => (
                    <div
                      key={index}
                      className="flex-none flex items-center justify-center border-r last:border-r-0"
                      style={{ width: `${((period.endHour - period.startHour) / 24) * 100}%` }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{period.required}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hour Labels */}
              <div className="grid grid-cols-[200px_24px_1fr] gap-4">
                <div></div>
                <div></div>
                <div className="flex">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const hour = (i + 5) % 24 // Start from 5am
                    return (
                      <div 
                        key={i} 
                        className="flex-1 flex items-center justify-center text-xs text-muted-foreground py-1 border-r last:border-r-0"
                      >
                        {hour.toString().padStart(2, '0')}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Shifts and Timeline */}
          <div className="divide-y relative">
            {shifts.map((shift, index) => (
              <div key={index} className="grid grid-cols-[200px_1fr] gap-4 p-4">
                <div className="space-y-2">
                  <div>
                    <h3 className="font-medium text-sm">{shift.name}</h3>
                    <p className="text-xs text-muted-foreground">{shift.time}</p>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Supervisor: </span>
                    <span>{shift.supervisor}</span>
                  </div>
                </div>

                <div className="relative min-h-[240px]">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex" style={{ marginLeft: '24px' }}>
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className="flex-1 border-r last:border-r-0" />
                    ))}
                  </div>

                  {/* Assignment Bars */}
                  {shift.assignments.map((assignment: Assignment, i: number) => {
                    const startPos = calculateGridPosition(assignment.startTime)
                    const width = calculateWidth(assignment.startTime, assignment.endTime)
                    const status = assignment.status || 'Regular'
                    const bgColor = statusColorMap[status] || 'bg-white'
                    
                    return (
                      <div
                        key={i}
                        className={`absolute h-8 ${bgColor} rounded-sm flex items-center justify-center px-2 text-xs whitespace-nowrap overflow-hidden border border-gray-200`}
                        style={{
                          left: `calc(${(startPos * 100) / 24}% + 24px)`,
                          width: `${(width * 100) / 24}%`,
                          top: `${i * 40 + 4}px`,
                        }}
                      >
                        <span className="text-gray-900">
                          {assignment.name}
                        </span>
                        {assignment.status && (
                          <Badge 
                            variant={status === 'Regular' ? 'secondary' : 'outline'} 
                            className="ml-2 text-[10px] text-gray-900"
                          >
                            {status}
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 