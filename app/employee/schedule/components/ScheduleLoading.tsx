import { Skeleton } from '@/components/ui/skeleton'

export function ScheduleLoading() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-2">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="p-2 border rounded">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 