'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { useErrorHandler } from '@/lib/hooks/use-error-handler'
import { ValidationError, DatabaseError } from '@/lib/errors'
import { useToast } from '@/components/ui/use-toast'

interface AvatarProps {
  uid: string
  url: string | null
  size: number
  onUpload?: (url: string) => void
}

export default function Avatar({
  uid,
  url,
  size,
  onUpload,
}: AvatarProps) {
  const supabase = createClient()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const { handleError } = useErrorHandler()
  const { toast } = useToast()

  const downloadImage = useCallback(async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .download(path)

      if (error) {
        throw error
      }

      const url = URL.createObjectURL(data)
      setAvatarUrl(url)
    } catch (error) {
      console.error('Error downloading image: ', error)
    }
  }, [supabase.storage])

  useEffect(() => {
    if (url) downloadImage(url)
  }, [url, downloadImage])

  const validateFile = (file: File) => {
    if (!file) {
      throw new ValidationError('Please select an image file')
    }

    if (!file.type.startsWith('image/')) {
      throw new ValidationError('Selected file must be an image')
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new ValidationError('Image size must be less than 2MB')
    }
  }

  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new ValidationError('Please select an image file')
      }

      const file = event.target.files[0]
      validateFile(file)

      const fileExt = file.name.split('.').pop()
      const filePath = `${uid}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw new DatabaseError('Failed to upload avatar image')
      }

      if (onUpload) onUpload(filePath)

      toast({
        title: 'Avatar Updated',
        description: 'Your profile picture has been updated successfully.',
        variant: 'default'
      })

      // Download the new image
      await downloadImage(filePath)
    } catch (error) {
      handleError(error, 'Avatar.uploadAvatar')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt="Avatar"
          className="rounded-full"
          width={size}
          height={size}
        />
      ) : (
        <div
          className="bg-gray-200 rounded-full flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <svg
            className="h-half w-half text-gray-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      )}
      <div style={{ width: size }}>
        <label
          className="button primary block cursor-pointer text-center p-2 mt-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          htmlFor="single"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </label>
        <input
          style={{
            visibility: 'hidden',
            position: 'absolute',
          }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          aria-label="Upload avatar"
        />
      </div>
    </div>
  )
} 