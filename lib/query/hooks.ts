import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

// User profile queries
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    },
  })
}

// User settings queries
export function useUserSettings(userId: string) {
  return useQuery({
    queryKey: ['settings', userId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data
    },
  })
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId)

      if (error) throw error
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
    },
  })
}

// Update settings mutation
export function useUpdateSettings() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      const { error } = await supabase
        .from('user_settings')
        .update(data)
        .eq('user_id', userId)

      if (error) throw error
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['settings', userId] })
    },
  })
} 