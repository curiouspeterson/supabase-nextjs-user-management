'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSupabase } from '@/lib/supabase/client'
import { Avatar } from '@/components/avatar'

interface AccountFormProps {
  initialProfile?: {
    full_name: string | null
    username: string | null
    website: string | null
    avatar_url: string | null
  }
}

export default function AccountForm({ initialProfile }: AccountFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fullName, setFullName] = useState(initialProfile?.full_name ?? '')
  const [username, setUsername] = useState(initialProfile?.username ?? '')
  const [website, setWebsite] = useState(initialProfile?.website ?? '')
  const router = useRouter()
  const { supabase, user } = useSupabase()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!user?.id) {
        throw new Error('No user found')
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          username,
          website,
          updated_at: new Date().toISOString(),
        })

      if (updateError) {
        throw updateError
      }

      router.refresh()
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setError(null)
      
      // Call the sign-out API endpoint
      await fetch('/auth/signout', {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache'
        },
        credentials: 'include' // Important for cookie handling
      })

      // Force reload to ensure clean state
      window.location.href = '/login'
      
    } catch (err) {
      console.error('Error signing out:', err)
      setError('Failed to sign out. Please try again.')
    }
  }

  return (
    <div className="form-widget">
      <form onSubmit={handleSubmit} className="animate-in flex-1 flex flex-col w-full justify-center gap-2">
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="text"
            value={user?.email}
            disabled
            className="rounded-md px-4 py-2 bg-inherit border mb-6"
          />
        </div>

        <div>
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-md px-4 py-2 bg-inherit border mb-6"
          />
        </div>

        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded-md px-4 py-2 bg-inherit border mb-6"
          />
        </div>

        <div>
          <label htmlFor="website">Website</label>
          <input
            id="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="rounded-md px-4 py-2 bg-inherit border mb-6"
          />
        </div>

        {error && (
          <div className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2 flex-1"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Update Profile'}
          </button>

          <button
            className="border rounded-md px-4 py-2 text-foreground mb-2 flex-1"
            type="button"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      </form>
    </div>
  )
}