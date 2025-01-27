import React from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { ShiftPattern } from '@/services/scheduler/types';
import { toast } from '@/components/ui/use-toast';
import { PatternList } from '@/components/patterns';

interface PatternActionsProps {
  initialPatterns: ShiftPattern[];
}

export default function PatternActions({ initialPatterns }: PatternActionsProps) {
  const [patterns, setPatterns] = React.useState<ShiftPattern[]>(initialPatterns);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const handlePatternCreate = async (pattern: ShiftPattern) => {
    try {
      const { data, error } = await supabase
        .from('shift_patterns')
        .insert([{
          name: pattern.name,
          pattern: pattern.pattern,
          is_forbidden: pattern.is_forbidden,
          length: pattern.length,
          pattern_type: pattern.pattern_type,
          shift_duration: pattern.shift_duration,
          days_on: pattern.days_on,
          days_off: pattern.days_off,
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      setPatterns([...patterns, data as ShiftPattern]);
      toast({
        title: 'Pattern Created',
        description: `Successfully created pattern "${pattern.name}"`,
      });
    } catch (error) {
      console.error('Error creating pattern:', error);
      toast({
        title: 'Error',
        description: 'Failed to create pattern. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handlePatternUpdate = async (pattern: ShiftPattern) => {
    try {
      const { error } = await supabase
        .from('shift_patterns')
        .update({
          name: pattern.name,
          pattern: pattern.pattern,
          is_forbidden: pattern.is_forbidden,
          length: pattern.length,
          pattern_type: pattern.pattern_type,
          shift_duration: pattern.shift_duration,
          days_on: pattern.days_on,
          days_off: pattern.days_off,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pattern.id);
        
      if (error) throw error;
      
      setPatterns(patterns.map(p => p.id === pattern.id ? pattern : p));
      toast({
        title: 'Pattern Updated',
        description: `Successfully updated pattern "${pattern.name}"`,
      });
    } catch (error) {
      console.error('Error updating pattern:', error);
      toast({
        title: 'Error',
        description: 'Failed to update pattern. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handlePatternDelete = async (patternId: string) => {
    try {
      const { error } = await supabase
        .from('shift_patterns')
        .delete()
        .eq('id', patternId);
        
      if (error) throw error;
      
      setPatterns(patterns.filter(p => p.id !== patternId));
      toast({
        title: 'Pattern Deleted',
        description: 'Successfully deleted pattern',
      });
    } catch (error) {
      console.error('Error deleting pattern:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete pattern. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <PatternList
      patterns={patterns}
      onPatternCreate={handlePatternCreate}
      onPatternUpdate={handlePatternUpdate}
      onPatternDelete={handlePatternDelete}
    />
  );
} 