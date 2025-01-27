'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { scheduleService } from '@/services/scheduleService'
import { Employee } from '@/utils/scheduling/types'
import { format } from 'date-fns'
import { toast } from '@/components/ui/use-toast'

interface FormData {
  employeeId: string
  shiftId: string
  date: string
  scheduleStatus: 'Draft' | 'Published'
}

export default function NewSchedulePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [formData, setFormData] = useState<FormData>({
    employeeId: '',
    shiftId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    scheduleStatus: 'Draft'
  })
  
  const [employees, setEmployees] = useState<Employee[]>([])
  const [shifts, setShifts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Fetch employees and shifts
  useEffect(() => {
    async function loadEmployees() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .order('full_name');

        if (error) throw error;
        setEmployees(data || []);
      } catch (error) {
        console.error('Error loading employees:', error);
        toast({
          title: 'Error',
          description: 'Failed to load employees',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    loadEmployees();
  }, [supabase]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [employeesResult, shiftsResult] = await Promise.all([
          supabase.from('employees').select('*').order('full_name'),
          supabase.from('shifts').select(`
            *,
            shift_types (*)
          `).order('start_time')
        ])

        if (employeesResult.error) throw employeesResult.error
        if (shiftsResult.error) throw shiftsResult.error

        setEmployees(employeesResult.data)
        setShifts(shiftsResult.data)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load form data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      // Calculate week start date
      const date = new Date(formData.date)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay()) // Set to Sunday
      
      await scheduleService.createSchedules({
        employee_id: formData.employeeId,
        shift_id: formData.shiftId,
        date: formData.date,
        schedule_status: formData.scheduleStatus,
        week_start_date: format(weekStart, 'yyyy-MM-dd'),
        day_of_week: format(date, 'EEEE') as any
      })

      router.push('/schedules')
    } catch (err) {
      console.error('Error creating schedule:', err)
      setError('Failed to create schedule')
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Create New Schedule</h1>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee
            </label>
            <select
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an employee</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Shift Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shift
            </label>
            <select
              name="shiftId"
              value={formData.shiftId}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a shift</option>
              {shifts.map(shift => (
                <option key={shift.id} value={shift.id}>
                  {shift.shift_types.name} ({shift.start_time} - {shift.end_time})
                </option>
              ))}
            </select>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="scheduleStatus"
              value={formData.scheduleStatus}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Create Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 