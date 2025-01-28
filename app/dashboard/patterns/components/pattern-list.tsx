import { memo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useErrorBoundary } from '@/lib/hooks/use-error-boundary'
import { getPatterns } from '@/services/patterns'
import type { Pattern } from '@/types'

export const PatternList = memo(function PatternList() {
  const { handleError } = useErrorBoundary()
  const { data: patterns, isLoading } = useQuery({
    queryKey: ['patterns'],
    queryFn: getPatterns,
    onError: handleError
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!patterns?.length) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No patterns found</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {patterns.map((pattern) => (
        <PatternCard key={pattern.id} pattern={pattern} />
      ))}
    </div>
  )
})

const PatternCard = memo(function PatternCard({
  pattern
}: {
  pattern: Pattern
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{pattern.name}</h3>
          <p className="text-sm text-muted-foreground">
            {pattern.description}
          </p>
        </div>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Duration</p>
          <p>{pattern.duration} days</p>
        </div>
        <div>
          <p className="text-muted-foreground">Shifts</p>
          <p>{pattern.shifts.length}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Status</p>
          <p className="capitalize">{pattern.status.toLowerCase()}</p>
        </div>
      </div>
    </Card>
  )
})

PatternList.displayName = 'PatternList'
PatternCard.displayName = 'PatternCard' 