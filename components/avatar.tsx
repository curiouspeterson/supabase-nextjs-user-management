'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import Image from 'next/image'

export interface AvatarProps {
  url?: string
  size?: number
  onUpload?: (url: string) => Promise<void>
}

export function Avatar({ url, size = 150, onUpload }: AvatarProps) {
  const { toast } = useToast()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(url || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (url) downloadImage(url)
  }, [url])

  async function downloadImage(path: string) {
    try {
      const response = await fetch(path)
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      setAvatarUrl(objectUrl)
    } catch (error) {
      console.error('Error downloading image:', error)
      setError('Failed to load avatar')
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileSize = file.size / 1024 / 1024 // size in MB
      if (fileSize > 5) {
        throw new Error('File size must be less than 5MB')
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }

      setUploading(true)
      setError(null)

      if (onUpload) {
        const objectUrl = URL.createObjectURL(file)
        await onUpload(objectUrl)
        setAvatarUrl(objectUrl)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error uploading avatar')
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error uploading avatar',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl)
      }
    }
  }, [avatarUrl])

  return (
    <div className="flex flex-col items-center gap-4">
      <Image
        src={avatarUrl || '/default-avatar.png'}
        alt="Avatar"
        width={size}
        height={size}
        className="rounded-full"
      />
      {onUpload && (
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
            <div role="alert" className="text-red-500 text-sm">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 