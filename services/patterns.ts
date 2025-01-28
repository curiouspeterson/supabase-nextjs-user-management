import { createClient } from '@supabase/supabase-js'
import type { Pattern, PatternStatus } from '@/types/pattern'

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

  return data.map(pattern => ({
    id: pattern.id,
    name: pattern.name,
    description: pattern.description,
    duration: pattern.duration,
    shifts: pattern.shifts,
    status: pattern.status as PatternStatus,
    createdAt: new Date(pattern.created_at),
    updatedAt: new Date(pattern.updated_at)
  }))
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

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    duration: data.duration,
    shifts: data.shifts,
    status: data.status as PatternStatus,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  }
}

export async function createPattern(pattern: Omit<Pattern, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pattern> {
  const { data, error } = await supabase
    .from('patterns')
    .insert({
      name: pattern.name,
      description: pattern.description,
      duration: pattern.duration,
      shifts: pattern.shifts,
      status: pattern.status
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to create pattern')
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    duration: data.duration,
    shifts: data.shifts,
    status: data.status as PatternStatus,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  }
}

export async function updatePattern(
  id: string,
  updates: Partial<Omit<Pattern, 'id' | 'createdAt' | 'updatedAt'>>
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

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    duration: data.duration,
    shifts: data.shifts,
    status: data.status as PatternStatus,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  }
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