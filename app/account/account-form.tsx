'use client'

import { useCallback, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Avatar from './avatar'

export default function AccountForm({ user }: { user: User | null }) {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const getProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!user) {
        setLoading(false)
        throw new Error('No user found')
      }

      const { data: profile, error: supabaseError } = await supabase
        .from('profiles')
        .select('full_name, username, website, avatar_url')
        .eq('id', user.id)
        .single()

      if (supabaseError) {
        throw supabaseError
      }

      if (!profile) {
        throw new Error('No profile found')
      }

      setFullName(profile.full_name || '')
      setUsername(profile.username || '')
      setWebsite(profile.website || '')
      setAvatarUrl(profile.avatar_url)
      setLoading(false)
    } catch (error: any) {
      setError(error.message || 'Error loading user data')
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    getProfile()
  }, [getProfile])

  async function updateProfile({
    username,
    website,
    avatarUrl,
  }: {
    username: string
    website: string
    avatarUrl: string | null
  }) {
    try {
      setLoading(true)
      setError(null)

      if (!user) {
        throw new Error('No user found')
      }

      const updates = {
        id: user.id,
        username,
        website,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }

      const { error: supabaseError } = await supabase.from('profiles').upsert(updates)

      if (supabaseError) {
        throw supabaseError
      }

      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    try {
      setLoading(true)
      setError(null)
      
      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError) {
        throw signOutError
      }

      router.push('/login')
    } catch (error: any) {
      setError(error.message || 'Error signing out')
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
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4" role="alert">
              {error}
            </div>
          )}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-4">
                <svg
                  className="lucide lucide-loader-circle h-6 w-6 animate-spin"
                  data-testid="initial-loading-spinner"
                  fill="none"
                  height="24"
                  role="progressbar"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </div>
            ) : (
              <>
                <div className="flex justify-center py-4">
                  <Avatar
                    uid={user?.id ?? null}
                    url={avatarUrl}
                    size={150}
                    onUpload={(url) => {
                      setAvatarUrl(url)
                      updateProfile({ username, website, avatarUrl: url })
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
                    disabled={!user}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
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
                    disabled={!user}
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
                    disabled={!user}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => updateProfile({ username, website, avatarUrl })}
                    disabled={loading || !user}
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                  <button
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                    onClick={handleSignOut}
                    disabled={loading || !user}
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}