import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from '@/components/ui/form'
import * as z from 'zod'
import { Database } from '@/types/supabase'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useErrorBoundary } from '@/lib/hooks/use-error-boundary'
import { createPattern } from '@/services/patterns'
import { PatternType } from '@/services/scheduler/types'
import { Pattern, PatternStatus } from '@/types/pattern'

const patternSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().default(''),
  pattern: z.string().min(1, 'Pattern is required'),
  is_forbidden: z.boolean().default(false),
  pattern_type: z.nativeEnum(PatternType),
  shift_duration: z.number().min(1, 'Shift duration must be at least 1 hour'),
  days_on: z.number().min(1, 'Must have at least 1 day on'),
  days_off: z.number().min(0, 'Days off must be 0 or more')
})

type PatternFormValues = z.infer<typeof patternSchema>

function convertToPattern(formData: PatternFormValues): Omit<Pattern, 'id' | 'created_at' | 'updated_at'> {
  // Convert the pattern string to shifts array
  const shifts = formData.pattern.split('').map((day, index) => {
    const startHour = (index * 24) % 168 // 168 hours in a week
    const endHour = (startHour + formData.shift_duration) % 168
    
    let duration_category: Database['public']['Enums']['duration_category_enum'] | null = null
    if (formData.shift_duration <= 4) duration_category = '4 hours'
    else if (formData.shift_duration <= 10) duration_category = '10 hours'
    else if (formData.shift_duration <= 12) duration_category = '12 hours'
    
    return {
      start_time: `${startHour.toString().padStart(2, '0')}:00:00`,
      end_time: `${endHour.toString().padStart(2, '0')}:00:00`,
      shift_type_id: day === '1' ? 'work' : 'off', // You'll need to use actual shift_type_ids from your database
      duration_hours: formData.shift_duration,
      duration_category
    }
  })

  return {
    name: formData.name,
    description: formData.description,
    shifts,
    status: 'Draft'
  }
}

export function PatternForm() {
  const { toast } = useToast()
  const { handleError } = useErrorBoundary()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<PatternFormValues>({
    resolver: zodResolver(patternSchema),
    defaultValues: {
      name: '',
      description: '',
      pattern: '0000000',
      is_forbidden: false,
      pattern_type: PatternType.CUSTOM,
      shift_duration: 8,
      days_on: 0,
      days_off: 7
    }
  })

  const onSubmit = React.useCallback(async (data: PatternFormValues) => {
    try {
      setIsSubmitting(true)

      const pattern = convertToPattern(data)
      await createPattern(pattern)

      toast({
        title: 'Pattern created successfully',
        description: 'Your pattern has been saved.'
      })

      form.reset()
    } catch (error) {
      handleError(error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create pattern',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [form, handleError, toast])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pattern"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pattern (0 for off days, 1 for work days)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., 1111000" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pattern_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pattern Type</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full p-2 border rounded"
                >
                  {Object.values(PatternType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shift_duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shift Duration (hours)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={24}
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_forbidden"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Forbidden Pattern</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting || !form.formState.isDirty}
        >
          {isSubmitting ? 'Creating...' : 'Create Pattern'}
        </Button>
      </form>
    </Form>
  )
} 