'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { scheduleService } from '@/services/scheduleService'
import { Employee } from '@/services/scheduler/types'
import { format, addMonths } from 'date-fns'
import { withRoleAccess } from '@/hooks/useRoleAccess'
import { toast } from '@/components/ui/use-toast'

interface EmployeeWithProfile extends Employee {
  profiles: {
    full_name: string | null
  }
}

interface FormData {
  startDate: string
  endDate: string
  includeEmployeeIds: string[]
  excludeEmployeeIds: string[]
  minimumRestHours: number
  maximumConsecutiveDays: number
}

function GenerateSchedulePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [formData, setFormData] = useState<FormData>({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addMonths(new Date(), 4), 'yyyy-MM-dd'),
    includeEmployeeIds: [],
    excludeEmployeeIds: [],
    minimumRestHours: 10,
    maximumConsecutiveDays: 6
  })
  
  const [employees, setEmployees] = useState<EmployeeWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [stats, setStats] = useState<any>(null)

  // Fetch employees
  useEffect(() => {
    async function loadEmployees() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('employees')
          .select(`
            *,
            profiles (
              full_name
            )
          `)
          .order('profiles(full_name)')

        if (error) throw error
        setEmployees(data || [])
      } catch (error) {
        console.error('Error loading employees:', error)
        toast({
          title: 'Error',
          description: 'Failed to load employees',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    loadEmployees()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setGenerating(true)
      setError(null)
      
      // Generate schedule
      const result = await scheduleService.generateSchedule(formData)
      
      if (result.success) {
        // Fetch statistics for the generated schedule
        const stats = await scheduleService.getScheduleStats(
          formData.startDate,
          formData.endDate
        )
        setStats(stats)
      } else {
        setError('Failed to generate schedule: ' + result.errors?.join(', '))
      }
    } catch (err) {
      console.error('Error generating schedule:', err)
      setError('Failed to generate schedule')
    } finally {
      setGenerating(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    
    if (type === 'select-multiple') {
      const select = e.target as HTMLSelectElement
      const values = Array.from(select.selectedOptions).map(option => option.value)
      setFormData(prev => ({
        ...prev,
        [name]: values
      }))
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value, 10)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Generate Schedule</h1>
          <button
            onClick={() => router.push('/schedules')}
            className="text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Range */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Employee Inclusion/Exclusion */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Include Specific Employees (Optional)
                  </label>
                  <select
                    name="includeEmployeeIds"
                    multiple
                    value={formData.includeEmployeeIds}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 h-32"
                  >
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.profiles?.full_name || 'Unnamed'}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Hold Ctrl/Cmd to select multiple
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exclude Specific Employees (Optional)
                  </label>
                  <select
                    name="excludeEmployeeIds"
                    multiple
                    value={formData.excludeEmployeeIds}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 h-32"
                  >
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.profiles?.full_name || 'Unnamed'}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Hold Ctrl/Cmd to select multiple
                  </p>
                </div>
              </div>

              {/* Constraints */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rest Hours Between Shifts
                  </label>
                  <input
                    type="number"
                    name="minimumRestHours"
                    value={formData.minimumRestHours}
                    onChange={handleChange}
                    min="8"
                    max="24"
                    required
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Consecutive Working Days
                  </label>
                  <input
                    type="number"
                    name="maximumConsecutiveDays"
                    value={formData.maximumConsecutiveDays}
                    onChange={handleChange}
                    min="1"
                    max="14"
                    required
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={generating}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {generating ? 'Generating...' : 'Generate Schedule'}
                </button>
              </div>
            </form>
          </div>

          {/* Statistics Display */}
          {stats && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Generation Results</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Overview</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Total Shifts</p>
                      <p className="text-2xl font-bold">{stats.totalShifts}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Total Hours</p>
                      <p className="text-2xl font-bold">{stats.totalHours}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Employee Statistics</h3>
                  <div className="space-y-2">
                    {Object.entries(stats.employeeStats).map(([id, stat]: [string, any]) => (
                      <div key={id} className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">{stat.name}</p>
                        <div className="grid grid-cols-3 gap-2 mt-1 text-sm">
                          <div>
                            <p className="text-gray-600">Shifts</p>
                            <p className="font-medium">{stat.totalShifts}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Hours</p>
                            <p className="font-medium">{stat.totalHours}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Pattern</p>
                            <p className="font-medium">{stat.pattern}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => router.push('/schedules')}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    View Schedule
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Wrap the component with role-based access control
export default withRoleAccess(GenerateSchedulePage, ['Admin', 'Manager']) 