import DispatchSchedule from '@/components/schedule/DispatchSchedule'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dispatch Schedule | 911 Dispatch Management',
  description: 'Manage and view 24/7 dispatch schedules, shifts, and staffing levels',
}

const sampleData = {
  date: new Date('2025-01-24').toISOString(),
  requirements: [
    {
      period: 'Early Morning',
      required: 6,
      assigned: 2,
      status: 'Not Met' as const,
      startHour: 5,
      endHour: 9,
      color: '#ef4444'
    },
    {
      period: 'Day',
      required: 8,
      assigned: 4,
      status: 'Not Met' as const,
      startHour: 9,
      endHour: 17,
      color: '#3b82f6'
    },
    {
      period: 'Night',
      required: 7,
      assigned: 8,
      status: 'Met' as const,
      startHour: 17,
      endHour: 23,
      color: '#22c55e'
    },
    {
      period: 'Overnight',
      required: 6,
      assigned: 2,
      status: 'Not Met' as const,
      startHour: 23,
      endHour: 28,
      color: '#f59e0b'
    },
  ],
  shifts: [
    {
      name: 'Day Shift Early',
      time: '05:00 - 15:00',
      supervisor: 'Michael Thompson',
      assignments: [
        { name: 'Sarah Johnson', status: 'Regular', startTime: '05:00', endTime: '15:00' },
        { name: 'James Wilson', status: 'On-Call', startTime: '05:00', endTime: '15:00' },
        { name: 'Emily Davis', status: 'Trade', startTime: '05:00', endTime: '15:00' },
        { name: 'Robert Martinez', status: 'Flexed', startTime: '05:00', endTime: '15:00' },
        { name: 'Lisa Anderson', status: 'Time off rqst pending', startTime: '05:00', endTime: '15:00' },
        { name: 'David Taylor', status: 'Coverage if needed', startTime: '05:00', endTime: '15:00' },
      ],
    },
    {
      name: 'Day Shift',
      time: '09:00 - 19:00',
      supervisor: 'Jennifer Williams',
      assignments: [
        { name: 'Thomas Brown', status: 'OT Shift', startTime: '09:00', endTime: '19:00' },
        { name: 'Maria Garcia', status: 'Regular', startTime: '09:00', endTime: '19:00' },
        { name: 'William Lee', status: 'Reserve', startTime: '09:00', endTime: '19:00' },
        { name: 'Patricia Moore', status: 'Open', startTime: '09:00', endTime: '19:00' },
        { name: 'Christopher White', status: 'Shift Closed', startTime: '09:00', endTime: '19:00' },
        { name: 'Jessica Rodriguez', status: 'Trade', startTime: '09:00', endTime: '19:00' },
      ],
    },
    {
      name: 'Swing Shift',
      time: '15:00 - 03:00',
      supervisor: 'Daniel Miller',
      assignments: [
        { name: 'Kevin Harris', status: 'Regular', startTime: '15:00', endTime: '03:00' },
        { name: 'Michelle Clark', status: 'OT Shift', startTime: '15:00', endTime: '03:00' },
        { name: 'Steven Wright', status: 'On-Call', startTime: '15:00', endTime: '03:00' },
        { name: 'Amanda Turner', status: 'Flexed', startTime: '15:00', endTime: '03:00' },
        { name: 'Brian Lewis', status: 'Coverage if needed', startTime: '15:00', endTime: '03:00' },
        { name: 'Rachel King', status: 'Time off rqst pending', startTime: '15:00', endTime: '03:00' },
      ],
    },
    {
      name: 'Graveyard',
      time: '17:00 - 05:00',
      supervisor: 'Elizabeth Scott',
      assignments: [
        { name: 'John Martinez', status: 'Regular', startTime: '17:00', endTime: '05:00' },
        { name: 'Sandra Adams', status: 'Reserve', startTime: '17:00', endTime: '05:00' },
        { name: 'Richard Hall', status: 'Open', startTime: '17:00', endTime: '05:00' },
        { name: 'Karen Young', status: 'Shift Closed', startTime: '17:00', endTime: '05:00' },
        { name: 'Joseph Baker', status: 'Trade', startTime: '17:00', endTime: '05:00' },
        { name: 'Laura Phillips', status: 'OT Shift', startTime: '17:00', endTime: '05:00' },
      ],
    },
  ]
}

export default function SchedulePage() {
  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <DispatchSchedule {...sampleData} />
    </div>
  )
} 