import { Skeleton } from '@/components/ui/skeleton';

export default function PatternsLoading() {
  return (
    <div className="container mx-auto py-8 space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Search and filter skeleton */}
      <div className="flex space-x-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-[180px]" />
      </div>
      
      {/* Table skeleton */}
      <div className="border rounded-lg">
        <div className="border-b">
          <div className="grid grid-cols-6 gap-4 p-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
        </div>
        
        {/* Pattern rows skeleton */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b">
            <div className="grid grid-cols-6 gap-4 p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-16 w-full" />
              <div className="flex justify-end space-x-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 