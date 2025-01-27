'use client'

import { useState, FormEvent, useRef, useEffect } from 'react'
import { flushSync } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/utils/supabase/client'
import { useUser } from '@/lib/hooks'
import { useErrorHandler } from '@/lib/hooks/use-error-handler'
import { ValidationError, DatabaseError } from '@/lib/errors'
import { useToast } from '@/components/ui/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface TimeOffRequestFormProps {
  userId?: string
}

interface TimeOffRequest {
  id: string
  employee_id: string
  start_date: string
  end_date: string
  type: 'Vacation' | 'Sick' | 'Personal' | 'Training'
  notes?: string
  status: 'Pending' | 'Approved' | 'Declined'
  reviewed_by?: string
  reviewed_at?: string
  submitted_at: string
  created_at: string
  updated_at: string
}

interface FormErrors {
  start_date?: string
  end_date?: string
  type?: string
  general?: string
}

const TIME_OFF_TYPES = [
  { value: 'Vacation', label: 'Vacation' },
  { value: 'Sick', label: 'Sick Leave' },
  { value: 'Personal', label: 'Personal Leave' },
  { value: 'Training', label: 'Training' }
] as const;

type TimeOffType = typeof TIME_OFF_TYPES[number]['value'];

export default function TimeOffRequestForm({ userId }: TimeOffRequestFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState<Partial<TimeOffRequest>>({
    notes: ''
  })
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const [employeeId, setEmployeeId] = useState<string>()
  const { user } = useUser()
  const { handleError } = useErrorHandler()
  const supabase = createClient()
  const formRef = useRef<HTMLFormElement>(null)

  const MAX_VACATION_DAYS = 20; // Maximum vacation days per year

  useEffect(() => {
    const fetchEmployeeId = async () => {
      const currentUserId = userId || user?.id;
      if (!currentUserId) {
        console.error('No user ID available');
        toast({
          title: 'Error',
          description: 'User not found. Please sign in again.',
          variant: 'destructive'
        });
        return;
      }
      
      const { data: employee, error } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', currentUserId)
        .single();

      if (error) {
        console.error('Error fetching employee:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch employee record. Please try again later.',
          variant: 'destructive'
        });
        return;
      }

      if (employee) {
        setEmployeeId(employee.id);
      } else {
        console.error('No employee record found');
        toast({
          title: 'Error',
          description: 'Employee record not found. Please contact your administrator.',
          variant: 'destructive'
        });
      }
    };

    fetchEmployeeId();
  }, [userId, user?.id, supabase, toast]);

  const validateRequest = (request: Partial<TimeOffRequest>): FormErrors => {
    const errors: FormErrors = {}

    if (!request.start_date) {
      errors.start_date = 'Start date is required'
    }
    if (!request.end_date) {
      errors.end_date = 'End date is required'
    }
    if (!request.type) {
      errors.type = 'Type of time off is required'
    }

    if (request.start_date && request.end_date) {
      const start = new Date(request.start_date)
      const end = new Date(request.end_date)

      if (end < start) {
        errors.end_date = 'End date cannot be before start date'
      }

      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays > 30) {
        errors.general = 'Time off requests cannot exceed 30 consecutive days'
      }
    }

    return errors
  }

  const checkVacationDays = async (start_date: string, end_date: string, type: TimeOffType) => {
    if (type !== 'Vacation') return;
    if (!employeeId) {
      throw new ValidationError('Employee record not found');
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const requestedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const yearStart = new Date(start.getFullYear(), 0, 1);
    const yearEnd = new Date(start.getFullYear(), 11, 31);

    const { data: vacationData, error } = await supabase
      .from('time_off_requests')
      .select('start_date, end_date')
      .eq('employee_id', employeeId)
      .eq('type', 'Vacation')
      .eq('status', 'Approved')
      .gte('start_date', yearStart.toISOString())
      .lte('end_date', yearEnd.toISOString());

    if (error) {
      throw new DatabaseError('Failed to check vacation days');
    }

    let usedDays = 0;
    if (vacationData) {
      for (const request of vacationData) {
        const reqStart = new Date(request.start_date);
        const reqEnd = new Date(request.end_date);
        const reqDiffTime = Math.abs(reqEnd.getTime() - reqStart.getTime());
        usedDays += Math.ceil(reqDiffTime / (1000 * 60 * 60 * 24)) + 1;
      }
    }

    if (usedDays + requestedDays > MAX_VACATION_DAYS) {
      throw new ValidationError(`Insufficient vacation days remaining. You have used ${usedDays} days out of ${MAX_VACATION_DAYS} annual days.`);
    }
  };

  const checkOverlappingRequests = async (start_date: string, end_date: string) => {
    if (!employeeId) {
      throw new ValidationError('Employee record not found');
    }

    const { data: existingRequests, error } = await supabase
      .from('time_off_requests')
      .select('start_date, end_date')
      .eq('employee_id', employeeId)
      .or(`start_date.gte.${start_date},end_date.lte.${end_date}`);

    if (error) {
      throw new DatabaseError('Failed to check existing time off requests');
    }

    if (existingRequests && existingRequests.length > 0) {
      throw new ValidationError('You already have time off scheduled during this period');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!employeeId) {
      toast({
        title: 'Error',
        description: 'Employee record not found',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const validationErrors = validateRequest(formData);
      if (Object.keys(validationErrors).length > 0) {
        const firstError = Object.values(validationErrors)[0];
        setErrors(validationErrors);
        setIsSubmitting(false);
        toast({
          title: 'Error',
          description: firstError,
          variant: 'destructive'
        });
        return;
      }

      // Check that all required fields are present
      if (!formData.start_date || !formData.end_date || !formData.type) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }

      // Validate vacation days if applicable
      await checkVacationDays(formData.start_date, formData.end_date, formData.type as TimeOffType);

      // Check for overlapping requests
      await checkOverlappingRequests(formData.start_date, formData.end_date);

      // Prepare the request data with all required fields
      const requestData = {
        employee_id: employeeId,
        start_date: formData.start_date,
        end_date: formData.end_date,
        type: formData.type as TimeOffType,
        status: 'Pending' as const,
        notes: formData.notes || null
      };

      const { error: submitError } = await supabase
        .from('time_off_requests')
        .insert(requestData);

      if (submitError) {
        throw new DatabaseError('Unable to submit request. Please try again later.');
      }

      toast({
        title: 'Success',
        description: 'Time off request submitted successfully'
      });
      handleReset();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit time off request';
      setErrors(prev => ({ ...prev, general: message }));
      setIsSubmitting(false);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
      handleError(err, 'TimeOffRequestForm.handleSubmit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      notes: ''
    })
    setErrors({})
    setIsSelectOpen(false)
    if (formRef.current) {
      formRef.current.reset()
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} onReset={handleReset} className="space-y-4" role="form">
      {Object.entries(errors).map(([key, message]) => (
        message && (
          <Alert key={key} variant="destructive" role="alert" aria-live="polite">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )
      ))}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            type="date"
            id="start_date"
            name="start_date"
            required
            aria-label="Start date"
            aria-invalid={!!errors.start_date}
            aria-describedby={errors.start_date ? "start-date-error" : undefined}
            className="mt-1"
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => {
              setFormData({ ...formData, start_date: e.target.value })
              if (errors.start_date) {
                setErrors(prev => ({ ...prev, start_date: undefined }))
              }
            }}
          />
          {errors.start_date && (
            <div id="start-date-error" role="alert" aria-live="polite" className="text-sm text-red-500">
              {errors.start_date}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">End Date</Label>
          <Input
            type="date"
            id="end_date"
            name="end_date"
            required
            aria-label="End date"
            aria-invalid={!!errors.end_date}
            aria-describedby={errors.end_date ? "end-date-error" : undefined}
            className="mt-1"
            min={formData.start_date || new Date().toISOString().split('T')[0]}
            onChange={(e) => {
              setFormData({ ...formData, end_date: e.target.value })
              if (errors.end_date) {
                setErrors(prev => ({ ...prev, end_date: undefined }))
              }
            }}
          />
          {errors.end_date && (
            <div id="end-date-error" role="alert" aria-live="polite" className="text-sm text-red-500">
              {errors.end_date}
            </div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <div className="relative">
          <select
            id="type"
            name="type"
            required
            aria-label="Type of time off"
            aria-invalid={!!errors.type}
            aria-expanded={isSelectOpen}
            role="combobox"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={formData.type || ''}
            onChange={(e) => {
              const value = e.target.value as TimeOffType;
              setFormData(prev => ({ ...prev, type: value }));
              if (errors.type) {
                setErrors(prev => ({ ...prev, type: undefined }));
              }
            }}
          >
            <option value="" disabled>Select type</option>
            {TIME_OFF_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.type && (
            <div id="type-error" role="alert" aria-live="polite" className="text-sm text-red-500">
              {errors.type}
            </div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Please provide notes for your time off request"
          required
          aria-label="Notes"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>
      <div className="flex justify-end space-x-3">
        <Button type="reset" disabled={isSubmitting}>
          Reset
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          aria-disabled={isSubmitting}
          data-state={isSubmitting ? 'submitting' : 'idle'}
          className={cn(
            "inline-flex justify-center",
            isSubmitting && "pointer-events-none opacity-50"
          )}
          variant="default"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </form>
  )
} 