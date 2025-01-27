'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

interface ScheduleActionsProps {
  weekStart: Date;
}

export function ScheduleActions({ weekStart }: ScheduleActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const publishSchedule = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('schedules')
        .update({ status: 'Published' })
        .eq('week_start_date', weekStart.toISOString().split('T')[0])
        .eq('status', 'Draft');

      if (error) throw error;

      toast({
        title: 'Schedule Published',
        description: 'The schedule has been published successfully.',
      });
      
      router.refresh();
    } catch (error) {
      console.error('Error publishing schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish schedule',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4">
      <Button
        variant="default"
        onClick={publishSchedule}
        disabled={loading}
      >
        {loading ? 'Publishing...' : 'Publish Schedule'}
      </Button>
    </div>
  );
} 