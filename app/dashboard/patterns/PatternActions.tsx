import React from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { ShiftPattern } from '@/services/scheduler/types';
import { toast } from '@/components/ui/use-toast';
import { PatternList } from '@/components/patterns';
import { useErrorHandler } from '@/lib/hooks/use-error-handler';
import { z } from 'zod';

// Pattern validation schema
const patternSchema = z.object({
  name: z.string().min(1, 'Pattern name is required'),
  pattern: z.array(z.string()),
  is_forbidden: z.boolean(),
  length: z.number().min(1, 'Pattern length must be at least 1'),
  pattern_type: z.string(),
  shift_duration: z.number(),
  days_on: z.number(),
  days_off: z.number(),
});

// Error codes for pattern actions
const PATTERN_ERROR_CODES = {
  CREATE_FAILED: 'PATTERN_CREATE_FAILED',
  UPDATE_FAILED: 'PATTERN_UPDATE_FAILED',
  DELETE_FAILED: 'PATTERN_DELETE_FAILED',
  VALIDATION_FAILED: 'PATTERN_VALIDATION_FAILED',
} as const;

interface PatternActionsProps {
  initialPatterns: ShiftPattern[];
}

export default function PatternActions({ initialPatterns }: PatternActionsProps) {
  const [patterns, setPatterns] = React.useState<ShiftPattern[]>(initialPatterns);
  const { handleError } = useErrorHandler();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const logPatternAction = async (
    actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'ERROR',
    pattern: Partial<ShiftPattern>,
    error?: Error
  ) => {
    try {
      const clientInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
      };

      await supabase.rpc('log_pattern_action', {
        p_action_type: actionType,
        p_pattern_id: pattern.id,
        p_pattern_name: pattern.name,
        p_pattern_type: pattern.pattern_type,
        p_error_message: error?.message,
        p_error_code: error instanceof Error ? error.name : undefined,
        p_metadata: { ...pattern },
        p_client_info: clientInfo,
      });
    } catch (error) {
      console.error('Failed to log pattern action:', error);
    }
  };
  
  const handlePatternCreate = async (pattern: ShiftPattern) => {
    try {
      // Validate pattern data
      const validatedPattern = patternSchema.parse(pattern);
      
      const { data, error } = await supabase
        .from('shift_patterns')
        .insert([{
          name: validatedPattern.name,
          pattern: validatedPattern.pattern,
          is_forbidden: validatedPattern.is_forbidden,
          length: validatedPattern.length,
          pattern_type: validatedPattern.pattern_type,
          shift_duration: validatedPattern.shift_duration,
          days_on: validatedPattern.days_on,
          days_off: validatedPattern.days_off,
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      setPatterns([...patterns, data as ShiftPattern]);
      await logPatternAction('CREATE', data as ShiftPattern);
      
      toast({
        title: 'Pattern Created',
        description: `Successfully created pattern "${pattern.name}"`,
        variant: 'default',
      });
    } catch (error) {
      const errorMessage = error instanceof z.ZodError
        ? 'Invalid pattern data: ' + error.errors.map(e => e.message).join(', ')
        : 'Failed to create pattern. Please try again.';
      
      await logPatternAction('ERROR', pattern, error as Error);
      handleError(error, 'Error creating pattern');
      
      toast({
        title: 'Error Creating Pattern',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };
  
  const handlePatternUpdate = async (pattern: ShiftPattern) => {
    try {
      // Validate pattern data
      const validatedPattern = patternSchema.parse(pattern);
      
      const { error } = await supabase
        .from('shift_patterns')
        .update({
          name: validatedPattern.name,
          pattern: validatedPattern.pattern,
          is_forbidden: validatedPattern.is_forbidden,
          length: validatedPattern.length,
          pattern_type: validatedPattern.pattern_type,
          shift_duration: validatedPattern.shift_duration,
          days_on: validatedPattern.days_on,
          days_off: validatedPattern.days_off,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pattern.id);
        
      if (error) throw error;
      
      setPatterns(patterns.map(p => p.id === pattern.id ? pattern : p));
      await logPatternAction('UPDATE', pattern);
      
      toast({
        title: 'Pattern Updated',
        description: `Successfully updated pattern "${pattern.name}"`,
        variant: 'default',
      });
    } catch (error) {
      const errorMessage = error instanceof z.ZodError
        ? 'Invalid pattern data: ' + error.errors.map(e => e.message).join(', ')
        : 'Failed to update pattern. Please try again.';
      
      await logPatternAction('ERROR', pattern, error as Error);
      handleError(error, 'Error updating pattern');
      
      toast({
        title: 'Error Updating Pattern',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };
  
  const handlePatternDelete = async (patternId: string) => {
    try {
      const pattern = patterns.find(p => p.id === patternId);
      if (!pattern) throw new Error('Pattern not found');
      
      const { error } = await supabase
        .from('shift_patterns')
        .delete()
        .eq('id', patternId);
        
      if (error) throw error;
      
      setPatterns(patterns.filter(p => p.id !== patternId));
      await logPatternAction('DELETE', pattern);
      
      toast({
        title: 'Pattern Deleted',
        description: `Successfully deleted pattern "${pattern.name}"`,
        variant: 'default',
      });
    } catch (error) {
      const pattern = patterns.find(p => p.id === patternId);
      await logPatternAction('ERROR', { id: patternId, ...pattern }, error as Error);
      handleError(error, 'Error deleting pattern');
      
      toast({
        title: 'Error Deleting Pattern',
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