'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { scheduleService } from '@/services/scheduleService'
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns'
import { withRoleAccess } from '@/hooks/useRoleAccess'

interface Stats {
  totalShifts: number
  totalHours: number
  employeeStats: Record<string, {
    name: string
    totalShifts: number
    totalHours: number
    pattern: string
    scheduledHours: number
  }>
}

function ScheduleStatsPage() {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch statistics for current month
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
        const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
        
        const data = await scheduleService.getScheduleStats(monthStart, monthEnd)
        setStats(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching stats:', err)
        setError('Failed to fetch statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [currentMonth])

  // Navigation handlers
  const previousMonth = () => setCurrentMonth(prev => subMonths(prev, 1))
  const nextMonth = () => setCurrentMonth(prev => addMonths(prev, 1))
  const currentMonthName = format(currentMonth, 'MMMM yyyy')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Schedule Statistics</h1>
          <button
            onClick={() => router.push('/schedules')}
            className="text-gray-600 hover:text-gray-900"
          >
            Back to Schedule
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={previousMonth}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Previous Month
          </button>
          <h2 className="text-xl font-semibold">{currentMonthName}</h2>
          <button
            onClick={nextMonth}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Next Month
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {stats && (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Total Shifts</h3>
                <div className="flex items-baseline">
                  <p className="text-4xl font-bold">{stats.totalShifts}</p>
                  <p className="ml-2 text-sm text-gray-500">shifts</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Total Hours</h3>
                <div className="flex items-baseline">
                  <p className="text-4xl font-bold">{stats.totalHours}</p>
                  <p className="ml-2 text-sm text-gray-500">hours</p>
                </div>
              </div>
            </div>

            {/* Employee Statistics */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">Employee Statistics</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pattern
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Shifts
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Target Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Variance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(stats.employeeStats).map(([id, stat]) => {
                      const variance = stat.totalHours - stat.scheduledHours
                      const varianceClass = variance < 0 
                        ? 'text-red-600' 
                        : variance > 0 
                          ? 'text-green-600' 
                          : 'text-gray-900'

                      return (
                        <tr key={id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {stat.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {stat.pattern}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {stat.totalShifts}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {stat.totalHours}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {stat.scheduledHours}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${varianceClass}`}>
                              {variance > 0 ? '+' : ''}{variance}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pattern Distribution</h3>
                <div className="space-y-2">
                  {Object.entries(
                    Object.values(stats.employeeStats).reduce((acc, stat) => {
                      acc[stat.pattern] = (acc[stat.pattern] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  ).map(([pattern, count]) => (
                    <div key={pattern} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{pattern}</span>
                      <span className="text-sm font-medium">{count} employees</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hours Analysis</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Hours per Employee</span>
                    <span className="text-sm font-medium">
                      {(stats.totalHours / Object.keys(stats.employeeStats).length).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Employees Over Target</span>
                    <span className="text-sm font-medium">
                      {Object.values(stats.employeeStats).filter(stat => 
                        stat.totalHours > stat.scheduledHours
                      ).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Employees Under Target</span>
                    <span className="text-sm font-medium">
                      {Object.values(stats.employeeStats).filter(stat => 
                        stat.totalHours < stat.scheduledHours
                      ).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Wrap the component with role-based access control
export default withRoleAccess(ScheduleStatsPage, ['Admin', 'Manager']) 