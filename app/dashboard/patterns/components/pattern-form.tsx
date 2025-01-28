import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from '@/components/ui/form'
import * as z from 'zod'

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
import type { Pattern } from '@/types'

const patternSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  duration: z.number().min(1, 'Duration must be at least 1 day'),
  shifts: z.array(z.object({
    startTime: z.string(),
    endTime: z.string(),
    role: z.string(),
    capacity: z.number().min(1)
  })).min(1, 'At least one shift is required')
})

type PatternFormValues = z.infer<typeof patternSchema>

export function PatternForm() {
  const { toast } = useToast()
  const { handleError } = useErrorBoundary()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<PatternFormValues>({
    resolver: zodResolver(patternSchema),
    defaultValues: {
      name: '',
      description: '',
      duration: 7,
      shifts: []
    }
  })

  const onSubmit = React.useCallback(async (data: PatternFormValues) => {
    try {
      setIsSubmitting(true)

      await createPattern({
        ...data,
        status: 'DRAFT'
      })

      toast({
        title: 'Pattern created successfully',
        description: 'Your pattern has been saved as a draft.'
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
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (days)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
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