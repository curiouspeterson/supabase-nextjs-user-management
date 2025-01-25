'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'

interface AvatarProps {
  url?: string
  size?: number
  onUpload?: (path: string, file: File, options?: { upsert?: boolean }) => Promise<void>
}

export default function Avatar({ url, size = 150, onUpload }: AvatarProps) {
  const { toast } = useToast()
  const [avatarUrl, setAvatarUrl] = useState<string>('/default-avatar.png')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (url) downloadImage(url)
    return () => {
      if (avatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(avatarUrl)
      }
    }
  }, [url])

  async function downloadImage(path: string) {
    try {
      const response = await fetch(path)
      if (!response.ok) throw new Error('Failed to download image')
      
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      setAvatarUrl(objectUrl)
    } catch (error) {
      console.error('Error downloading image:', error)
      setAvatarUrl('/default-avatar.png')
      setError('Failed to load avatar')
    }
  }

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileSize = file.size / 1024 / 1024 // size in MB
      if (fileSize > 2) {
        throw new Error('File size must be less than 2MB')
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }

      setUploading(true)
      setError(null)

      if (onUpload) {
        await onUpload(file.name, file, { upsert: true })
      }

      // Create a local preview
      const objectUrl = URL.createObjectURL(file)
      setAvatarUrl(objectUrl)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error uploading avatar'
      setError(message)
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
      if (event.target) {
        event.target.value = '' // Reset input
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <img
        src={avatarUrl}
        alt={error ? 'Default Avatar' : 'Avatar'}
        className="rounded-full"
        width={size}
        height={size}
      />
      <div className="flex flex-col items-center gap-2">
        <label
          htmlFor="avatar"
          className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
        >
          {uploading ? 'Uploading...' : 'Upload Avatar'}
        </label>
        <input
          type="file"
          id="avatar"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="hidden"
          aria-label="Upload avatar"
        />
        {error && (
          <div role="alert" aria-live="polite" className="text-destructive text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  )
} 