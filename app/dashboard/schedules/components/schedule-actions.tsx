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
import { Schedule } from '@/lib/types/schedule';
import { AppError } from '@/lib/types/error';
import { useToast } from '@/components/ui/use-toast';
import { useScheduleStore } from '@/lib/stores/schedule-store';
import { useAppState } from '@/lib/hooks/use-app-state';
import type { ScheduleAction } from '@/types';

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
  const { appState, persistState } = useAppState();

  // Persist state on app state changes
  useEffect(() => {
    const handleAppStateChange = () => {
      if (appState === 'active') {
        persistState('scheduleActions', {
          showConfirm,
          currentAction,
          scheduleId: schedule.id
        });
      }
    };
    
    return () => {
      handleAppStateChange();
    };
  }, [appState, showConfirm, currentAction, schedule.id, persistState]);

  // Restore state on mount
  useEffect(() => {
    const restored = persistState.get('scheduleActions');
    if (restored && restored.scheduleId === schedule.id) {
      setShowConfirm(restored.showConfirm);
      setCurrentAction(restored.currentAction);
    }
  }, [schedule.id, persistState]);

  const handleAction = useCallback(async (action: ScheduleAction) => {
    try {
      setIsLoading(true);
      setCurrentAction(action);
      
      if (action === 'delete') {
        setShowConfirm(true);
        return;
      }

      await onAction(action);
      
      switch (action) {
        case 'publish':
          updateSchedule({ ...schedule, status: 'published' });
          useToastToast({ title: 'Schedule published successfully' });
          break;
        case 'unpublish':
          updateSchedule({ ...schedule, status: 'draft' });
          useToastToast({ title: 'Schedule unpublished successfully' });
          break;
        case 'delete':
          removeSchedule(schedule.id);
          useToastToast({ title: 'Schedule deleted successfully' });
          break;
        default:
          throw new Error(`Invalid action: ${action}`);
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
      setShowConfirm(false);
    }
  }, [schedule, onAction, updateSchedule, removeSchedule, useToastToast]);

  return (
    <>
      <div className="flex space-x-2">
        {schedule.status === 'draft' && (
          <Button
            variant="default"
            onClick={() => handleAction('publish')}
            disabled={isLoading}
          >
            Publish
          </Button>
        )}
        
        {schedule.status === 'published' && (
          <Button
            variant="outline"
            onClick={() => handleAction('unpublish')}
            disabled={isLoading}
          >
            Unpublish
          </Button>
        )}

        <Button
          variant="destructive"
          onClick={() => handleAction('delete')}
          disabled={isLoading}
        >
          Delete
        </Button>
      </div>

      <AlertDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Delete Schedule"
        description="Are you sure you want to delete this schedule? This action cannot be undone."
        action={
          <Button
            variant="destructive"
            onClick={() => handleAction('delete')}
            disabled={isLoading}
          >
            Delete
          </Button>
        }
      />
    </>
  );
} 