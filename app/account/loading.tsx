'use client';

import { Skeleton } from "@/components/ui/skeleton"

export default function AccountLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-2xl">
        <div className="flex flex-col space-y-1.5 p-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="p-6 pt-0">
          <div className="space-y-4">
            <div className="flex justify-center py-4">
              <Skeleton className="h-[150px] w-[150px] rounded-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex justify-end gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 