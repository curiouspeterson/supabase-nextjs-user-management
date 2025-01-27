'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShiftPattern, PatternType } from '@/services/scheduler/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import PatternVisualizer from './PatternVisualizer';

const patternSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  pattern_type: z.enum(['4x10', '3x12_1x4', 'Custom'] as const),
  shift_duration: z.number().min(4).max(12),
  is_forbidden: z.boolean(),
  pattern: z.string().regex(/^[01]+$/, 'Pattern must only contain 0s and 1s'),
});

type PatternFormValues = z.infer<typeof patternSchema>;

interface PatternEditorProps {
  initialPattern?: ShiftPattern;
  onSave: (pattern: ShiftPattern) => void;
  onCancel: () => void;
}

const PRESET_PATTERNS = {
  '4x10': { pattern: '1111000', shift_duration: 10, days_on: 4, days_off: 3 },
  '3x12_1x4': { pattern: '1110000', shift_duration: 12, days_on: 3, days_off: 4 },
  Custom: { pattern: '0000000', shift_duration: 8, days_on: 0, days_off: 7 },
};

const PatternEditor: React.FC<PatternEditorProps> = ({
  initialPattern,
  onSave,
  onCancel,
}) => {
  const [previewPattern, setPreviewPattern] = useState<ShiftPattern | null>(null);
  
  const form = useForm<PatternFormValues>({
    resolver: zodResolver(patternSchema),
    defaultValues: initialPattern || {
      name: '',
      pattern_type: 'Custom',
      shift_duration: 8,
      is_forbidden: false,
      pattern: '0000000',
    },
  });
  
  const onSubmit = (values: PatternFormValues) => {
    const pattern: ShiftPattern = {
      id: initialPattern?.id || '',
      ...values,
      length: values.pattern.length,
      days_on: values.pattern.split('1').length - 1,
      days_off: values.pattern.split('0').length - 1,
      created_at: initialPattern?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onSave(pattern);
  };
  
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.name && value.pattern) {
        setPreviewPattern({
          id: initialPattern?.id || '',
          name: value.name,
          pattern: value.pattern,
          pattern_type: value.pattern_type as PatternType,
          shift_duration: value.shift_duration || 8,
          is_forbidden: value.is_forbidden || false,
          length: value.pattern.length,
          days_on: (value.pattern.match(/1/g) || []).length,
          days_off: (value.pattern.match(/0/g) || []).length,
          created_at: initialPattern?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, initialPattern]);
  
  const handlePatternTypeChange = (type: PatternType) => {
    const preset = PRESET_PATTERNS[type];
    form.setValue('pattern_type', type);
    form.setValue('pattern', preset.pattern);
    form.setValue('shift_duration', preset.shift_duration);
  };
  
  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pattern Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter pattern name" />
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
                <Select
                  onValueChange={(value: PatternType) => handlePatternTypeChange(value)}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pattern type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="4x10">4x10</SelectItem>
                    <SelectItem value="3x12_1x4">3x12 + 1x4</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
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
                    min={4}
                    max={12}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
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
                <FormLabel>Pattern (0 = off, 1 = on)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., 1111000" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="is_forbidden"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Forbidden Pattern</FormLabel>
                </div>
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {initialPattern ? 'Update' : 'Create'} Pattern
            </Button>
          </div>
        </form>
      </Form>
      
      {previewPattern && (
        <div className="pt-6">
          <h4 className="text-sm font-medium mb-2">Preview</h4>
          <PatternVisualizer pattern={previewPattern} />
        </div>
      )}
    </div>
  );
};

export default PatternEditor; 