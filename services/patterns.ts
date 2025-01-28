import { createClient } from '@supabase/supabase-js'
import type { Pattern } from '@/types/pattern'
import { Database } from '@/types/supabase'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getPatterns(): Promise<Pattern[]> {
  const { data, error } = await supabase
    .from('patterns')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch patterns')
  }

  return data
}

export async function getPattern(id: string): Promise<Pattern> {
  const { data, error } = await supabase
    .from('patterns')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error('Failed to fetch pattern')
  }

  return data
}

export async function createPattern(
  pattern: Omit<Pattern, 'id' | 'created_at' | 'updated_at'>
): Promise<Pattern> {
  const { data, error } = await supabase
    .from('patterns')
    .insert({
      name: pattern.name,
      description: pattern.description,
      shifts: pattern.shifts,
      status: pattern.status
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to create pattern')
  }

  return data
}

export async function updatePattern(
  id: string,
  updates: Partial<Omit<Pattern, 'id' | 'created_at' | 'updated_at'>>
): Promise<Pattern> {
  const { data, error } = await supabase
    .from('patterns')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error('Failed to update pattern')
  }

  return data
}

export async function deletePattern(id: string): Promise<void> {
  const { error } = await supabase
    .from('patterns')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error('Failed to delete pattern')
  }
} 