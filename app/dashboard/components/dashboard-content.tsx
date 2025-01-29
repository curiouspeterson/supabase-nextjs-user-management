'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useErrorHandler } from '@/lib/hooks/use-error-handler'

interface DashboardStats {
  totalEmployees: number
  totalShifts: number
  upcomingShifts: number
  openShifts: number
}

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { supabase } = useSupabase()
  const { handleError } = useErrorHandler()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        
        // Your existing stats fetching code...
        const { count: totalEmployees, error: employeesError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })

        if (employeesError) throw employeesError

        // Rest of your existing stats fetching...

        setStats({
          totalEmployees: totalEmployees || 0,
          totalShifts: 0, // Add your actual values
          upcomingShifts: 0,
          openShifts: 0
        })
      } catch (error) {
        handleError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase, handleError])

  // Your existing render code...
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Employees" value={stats?.totalEmployees} loading={loading} />
      {/* Other stat cards... */}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number | undefined
  loading: boolean
}

function StatCard({ title, value, loading }: StatCardProps) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      {loading ? (
        <Skeleton className="h-8 w-20 mt-2" />
      ) : (
        <p className="text-2xl font-bold">{value}</p>
      )}
    </Card>
  )
} 