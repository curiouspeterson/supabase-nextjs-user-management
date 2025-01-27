'use client';

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { useSupabase } from '@/lib/supabase/client'
import { Avatar } from '@/components/avatar'

interface Profile {
  id: string
  avatar_url: string | null
  full_name: string | null
  username: string | null
  website: string | null
  updated_at: string
}

export function AccountForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { supabase, user } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const getProfile = useCallback(async () => {
    try {
      setError(null)
      if (!user) throw new Error('No user')

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      setFullName(profile.full_name || '')
      setUsername(profile.username || '')
      setWebsite(profile.website || '')
      setAvatarUrl(profile.avatar_url)
    } catch (error) {
      setError('Error loading profile')
      console.error('Error loading profile:', error)
    }
  }, [user, supabase])

  useEffect(() => {
    getProfile()
  }, [getProfile])

  async function updateProfile(updates: Partial<Profile> = {}) {
    try {
      setLoading(true)
      setError(null)

      if (!user) throw new Error('No user')
      if (!fullName.trim()) throw new Error('Full name is required')

      const { error: updateError } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName,
        username,
        website,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
        ...updates
      })

      if (updateError) throw updateError

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.'
      })
      
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error updating profile')
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error updating profile',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error signing out',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-2xl">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight" id="account-settings-title">
            Account Settings
          </h3>
          <p className="text-sm text-muted-foreground">
            Update your profile information and avatar
          </p>
        </div>
        <div className="p-6 pt-0" role="form" aria-labelledby="account-settings-title">
          {error && (
            <div role="alert" className="text-destructive text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="flex justify-center py-4">
              <Avatar
                url={avatarUrl || undefined}
                size={150}
                onUpload={async (url) => {
                  await updateProfile({ avatar_url: url })
                }}
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="text"
                value={user?.email}
                disabled
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div>
              <label htmlFor="fullName" className="text-sm font-medium">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                aria-invalid={error ? 'true' : 'false'}
              />
            </div>
            <div>
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              />
            </div>
            <div>
              <label htmlFor="website" className="text-sm font-medium">
                Website
              </label>
              <input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => updateProfile()}
                disabled={loading}
                aria-disabled={loading}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 