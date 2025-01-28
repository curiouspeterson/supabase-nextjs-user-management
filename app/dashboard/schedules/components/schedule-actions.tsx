'use client';

import { useCallback, useEffect, useState } from 'react';
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
import { Schedule, ScheduleAction, ScheduleStatus } from '@/services/scheduler/types';
import { AppError } from '@/lib/types/error';
import { useToast } from '@/components/ui/use-toast';
import { useScheduleStore } from '@/lib/stores/schedule-store';
import { useAppState } from '@/lib/hooks/use-app-state';

interface ScheduleActionsProps {
  schedule: Schedule;
  onAction: (action: ScheduleAction) => Promise<void>;
}

export function ScheduleActions({ schedule, onAction }: ScheduleActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast: useToastToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentAction, setCurrentAction] = useState<ScheduleAction | null>(null);
  
  const { addSchedule, updateSchedule, removeSchedule } = useScheduleStore();
  const { appState, persistState, updateState } = useAppState();

  // Persist state on component mount and update
  useEffect(() => {
    updateState({
      schedules: {
        showConfirm,
        currentAction,
        selectedSchedule: schedule
      }
    });
  }, [showConfirm, currentAction, schedule, updateState]);

  // Restore state on mount
  useEffect(() => {
    const savedState = appState.schedules;
    if (savedState && savedState.selectedSchedule?.id === schedule.id) {
      setShowConfirm(savedState.showConfirm);
      setCurrentAction(savedState.currentAction);
    }
  }, [appState, schedule.id]);

  const handleAction = useCallback(async (action: ScheduleAction) => {
    try {
      setIsLoading(true);
      setCurrentAction(action);
      
      // For delete action, show confirmation first
      if (action === ScheduleAction.DELETE && !showConfirm) {
        setShowConfirm(true);
        setIsLoading(false);
        return;
      }

      // If we get here with DELETE action, it means confirmation was shown
      if (action === ScheduleAction.DELETE) {
        await onAction(action);
        removeSchedule(schedule.id);
        toast('Schedule deleted successfully');
        setShowConfirm(false);
        return;
      }

      await onAction(action);
      
      switch (action) {
        case ScheduleAction.PUBLISH:
          updateSchedule({ ...schedule, status: 'Published' });
          toast('Schedule published successfully');
          break;
        case ScheduleAction.CANCEL:
          updateSchedule({ ...schedule, status: 'Draft' });
          toast('Schedule unpublished successfully');
          break;
        default:
          toast('Invalid action');
      }
    } catch (error) {
      useToastToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
      if (action !== ScheduleAction.DELETE || showConfirm) {
        setShowConfirm(false);
      }
    }
  }, [schedule, onAction, updateSchedule, removeSchedule, useToastToast, showConfirm]);

  return (
    <>
      <div className="flex space-x-2">
        {schedule.status === 'Draft' && (
          <Button
            variant="default"
            onClick={() => handleAction(ScheduleAction.PUBLISH)}
            disabled={isLoading}
          >
            Publish
          </Button>
        )}
        
        {schedule.status === 'Published' && (
          <Button
            variant="outline"
            onClick={() => handleAction(ScheduleAction.CANCEL)}
            disabled={isLoading}
          >
            Unpublish
          </Button>
        )}

        <Button
          variant="destructive"
          onClick={() => handleAction(ScheduleAction.DELETE)}
          disabled={isLoading}
        >
          Delete
        </Button>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this schedule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction(ScheduleAction.DELETE)}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 