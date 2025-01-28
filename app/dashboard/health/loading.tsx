import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function HealthLoading() {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
      </Card>

      <Card className="p-4">
        <Skeleton className="h-[300px]" />
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-16 w-full" />
          </Card>
        ))}
      </div>
    </div>
  )
} 