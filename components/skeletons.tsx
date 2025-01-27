'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function TimeOffRequestSkeleton() {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex justify-between items-start animate-pulse">
      <div className="space-y-3 flex-1">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

export function ScheduleSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <div className="space-y-2">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 