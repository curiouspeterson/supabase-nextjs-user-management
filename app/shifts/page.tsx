import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Shift Templates | 911 Dispatch Management',
  description: 'Manage shift templates and scheduling patterns',
}

interface ShiftTemplate {
  id: string
  name: string
  startTime: string
  endTime: string
  type: 'Regular' | 'Overtime' | 'Training' | 'Relief'
  staffingRequirements: {
    dispatchers: number
    supervisors: number
  }
  daysOfWeek: string[]
  color: string
}

const shiftTemplates: ShiftTemplate[] = [
  {
    id: '1',
    name: 'Day Shift Early',
    startTime: '05:00',
    endTime: '15:00',
    type: 'Regular',
    staffingRequirements: {
      dispatchers: 4,
      supervisors: 1,
    },
    daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    color: '#22c55e',
  },
  {
    id: '2',
    name: 'Day Shift',
    startTime: '09:00',
    endTime: '19:00',
    type: 'Regular',
    staffingRequirements: {
      dispatchers: 6,
      supervisors: 1,
    },
    daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    color: '#3b82f6',
  },
  {
    id: '3',
    name: 'Swing Shift',
    startTime: '15:00',
    endTime: '03:00',
    type: 'Regular',
    staffingRequirements: {
      dispatchers: 5,
      supervisors: 1,
    },
    daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    color: '#f59e0b',
  },
  {
    id: '4',
    name: 'Graveyard',
    startTime: '17:00',
    endTime: '05:00',
    type: 'Regular',
    staffingRequirements: {
      dispatchers: 4,
      supervisors: 1,
    },
    daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    color: '#6366f1',
  },
  {
    id: '5',
    name: 'Weekend Day',
    startTime: '07:00',
    endTime: '19:00',
    type: 'Regular',
    staffingRequirements: {
      dispatchers: 5,
      supervisors: 1,
    },
    daysOfWeek: ['Saturday', 'Sunday'],
    color: '#ec4899',
  },
]

export default function ShiftTemplatesPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Shift Templates</h1>
          <p className="text-sm text-muted-foreground">
            Manage shift patterns and staffing requirements
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Shift Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shiftTemplates.map((template) => (
          <div
            key={template.id}
            className="border rounded-lg p-4 space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{template.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {template.startTime} - {template.endTime}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Badge variant="secondary" className="mb-2">
                {template.type}
              </Badge>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dispatchers:</span>
                  <span className="font-medium">{template.staffingRequirements.dispatchers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Supervisors:</span>
                  <span className="font-medium">{template.staffingRequirements.supervisors}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-2">Days of Week</div>
              <div className="flex flex-wrap gap-1">
                {template.daysOfWeek.map((day) => (
                  <Badge key={day} variant="outline" className="text-[10px]">
                    {day.slice(0, 3)}
                  </Badge>
                ))}
              </div>
            </div>

            <div
              className="h-1 rounded-full mt-2"
              style={{ backgroundColor: template.color }}
            />
          </div>
        ))}
      </div>
    </div>
  )
} 