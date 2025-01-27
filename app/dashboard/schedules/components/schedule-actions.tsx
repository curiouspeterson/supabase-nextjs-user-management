'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Schedule } from '@/lib/types/schedule';
import { AppError } from '@/lib/types/error';

interface ScheduleActionsProps {
  schedule: Schedule;
}

export function ScheduleActions({ schedule }: ScheduleActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const supabase = createClient();

  // Optimistic update helper
  const updateScheduleCache = useCallback(
    (scheduleId: string, updates: Partial<Schedule>) => {
      queryClient.setQueryData<Schedule>(
        ['schedule', scheduleId],
        (old) => old ? { ...old, ...updates } : undefined
      );

      queryClient.setQueryData<Schedule[]>(
        ['schedules'],
        (old) => old?.map(s => s.id === scheduleId ? { ...s, ...updates } : s)
      );
    },
    [queryClient]
  );

  // Publish mutation with optimistic updates
  const publishMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      // Get current state for potential rollback
      const previousState = await supabase
        .from('schedules')
        .select('*')
        .eq('id', scheduleId)
        .single()
        .then(({ data }) => data);

      if (!previousState) {
        throw new AppError('Schedule not found', 404);
      }

      // Track operation
      const { data: operation, error: trackError } = await supabase
        .rpc('track_schedule_operation', {
          p_schedule_id: scheduleId,
          p_operation: 'PUBLISH',
          p_previous_state: previousState,
          p_new_state: { ...previousState, status: 'published' }
        });

      if (trackError) {
        throw new AppError('Failed to track operation', 500);
      }

      // Publish schedule
      const { error } = await supabase
        .from('schedules')
        .update({ status: 'published' })
        .eq('id', scheduleId);

      if (error) {
        // Mark operation as failed
        await supabase
          .rpc('complete_schedule_operation', {
            p_operation_id: operation,
            p_status: 'failed',
            p_error_details: error.message
          });
        throw new AppError('Failed to publish schedule', 500);
      }

      // Mark operation as completed
      await supabase
        .rpc('complete_schedule_operation', {
          p_operation_id: operation,
          p_status: 'completed'
        });

      return { scheduleId, operation };
    },
    onMutate: async (scheduleId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['schedule', scheduleId] });
      await queryClient.cancelQueries({ queryKey: ['schedules'] });

      // Optimistically update the schedule
      updateScheduleCache(scheduleId, { status: 'published' });

      // Return context for rollback
      return { scheduleId };
    },
    onError: (error, _, context) => {
      if (context) {
        // Rollback the optimistic update
        updateScheduleCache(context.scheduleId, { status: 'draft' });
      }
      toast.error('Failed to publish schedule', {
        description: error instanceof AppError ? error.message : 'An unexpected error occurred'
      });
    },
    onSuccess: () => {
      toast.success('Schedule published successfully');
      setIsConfirmOpen(false);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedule', schedule.id] });
    }
  });

  const handlePublish = useCallback(() => {
    publishMutation.mutate(schedule.id);
  }, [publishMutation, schedule.id]);

  return (
    <div className="flex items-center gap-4">
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="default"
            disabled={schedule.status === 'published' || publishMutation.isPending}
          >
            {publishMutation.isPending ? 'Publishing...' : 'Publish Schedule'}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Schedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to publish this schedule? This will make it visible to all employees.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish}>
              Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 