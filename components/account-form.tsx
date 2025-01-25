import { useCallback, useEffect, useState } from 'react'
import { useSupabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Avatar from '@/components/avatar'

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  website: string | null
  updated_at: string
}

export default function AccountForm() {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [website, setWebsite] = useState<string>('')
  const [avatarUrl, setAvatarUrl] = useState<string>('')

  const getProfile = useCallback(async () => {
    try {
      setLoading(true)

      if (!user) throw new Error('No user')

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        throw error
      }

      if (profile) {
        setFullName(profile.full_name || '')
        setUsername(profile.username || '')
        setWebsite(profile.website || '')
        setAvatarUrl(profile.avatar_url || '')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error loading user profile',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [user, supabase, toast])

  useEffect(() => {
    getProfile()
  }, [getProfile])

  async function updateProfile() {
    try {
      setLoading(true)

      if (!user) throw new Error('No user')

      const updates: Partial<Profile> = {
        id: user.id,
        full_name: fullName,
        username,
        website,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error updating profile',
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
          <div className="space-y-4">
            <div className="flex justify-center py-4">
              <Avatar
                url={avatarUrl}
                size={150}
                onUpload={async (path) => {
                  setAvatarUrl(path)
                  await updateProfile()
                }}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="text"
                value={user?.email}
                disabled
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                onClick={updateProfile}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Update Profile'}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await supabase.auth.signOut()
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 