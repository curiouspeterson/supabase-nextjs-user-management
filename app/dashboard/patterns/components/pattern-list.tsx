'use client'

import { memo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useErrorBoundary } from '@/lib/hooks/use-error-boundary'
import { getPatterns } from '@/services/patterns'
import { Pattern } from '@/types/pattern'

export const PatternList = memo(function PatternList() {
  const { handleError } = useErrorBoundary()
  const router = useRouter()

  const { data: patterns, error } = useQuery({
    queryKey: ['patterns'],
    queryFn: async () => {
      try {
        return await getPatterns()
      } catch (error) {
        handleError(error)
        throw error
      }
    }
  })

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-destructive">Failed to load patterns</p>
      </div>
    )
  }

  if (!patterns) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4 h-[200px] animate-pulse bg-muted" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Shift Patterns</h2>
        <Button onClick={() => router.push('/dashboard/patterns/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Pattern
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {patterns.map(pattern => (
          <PatternCard key={pattern.id} pattern={pattern} />
        ))}
      </div>
    </div>
  )
})

interface PatternCardProps {
  pattern: Pattern
}

const PatternCard = memo(function PatternCard({ pattern }: PatternCardProps) {
  const router = useRouter()

  // Calculate days on and off from shifts
  const daysOn = pattern.shifts.filter(shift => shift.type === 'work').length
  const daysOff = pattern.shifts.filter(shift => shift.type === 'off').length
  const shiftDuration = pattern.shifts[0]?.duration || 0

  return (
    <Card
      className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => router.push(`/dashboard/patterns/${pattern.id}`)}
    >
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{pattern.name}</h3>
        <p className="text-sm text-muted-foreground">
          {daysOn} days on, {daysOff} days off
        </p>
        <p className="text-sm text-muted-foreground">
          {shiftDuration}h shifts
        </p>
        <div className="flex gap-1 mt-2">
          {pattern.shifts.map((shift, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                shift.type === 'work'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {shift.type === 'work' ? shift.duration : '-'}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
})

PatternList.displayName = 'PatternList'
PatternCard.displayName = 'PatternCard' 