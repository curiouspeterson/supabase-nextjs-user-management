import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ShiftPattern } from '@/services/scheduler/types';
import PatternActions from './PatternActions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shift Patterns | 911 Dispatch',
  description: 'Manage shift patterns for dispatch scheduling',
};

async function getPatterns() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  
  const { data: patterns, error } = await supabase
    .from('shift_patterns')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Error fetching patterns:', error);
    return [];
  }
  
  return patterns as ShiftPattern[];
}

export default async function PatternsPage() {
  const patterns = await getPatterns();
  
  return (
    <div className="container mx-auto py-8">
      <PatternActions initialPatterns={patterns} />
    </div>
  );
} 