'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { useErrorHandler } from '@/lib/hooks/use-error-handler'
import { ValidationError, NetworkError, DatabaseError } from '@/lib/errors'

export default function Avatar({
  uid,
  url,
  size = 150,
  onUpload,
}: {
  uid: string | null
  url: string | null
  size: number
  onUpload: (url: string, file: File, options: { cacheControl: string, upsert: boolean }) => Promise<void>
}) {
  const supabase = createClient()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const { handleError } = useErrorHandler()

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
    if (url) {
      downloadImage(url)
    }
  }, [url, downloadImage])

  const validateFile = (file: File) => {
    if (!file) {
      throw new ValidationError('Please select a file to upload')
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new ValidationError('Please upload an image file')
    }

    // Check file size (2MB limit)
    const TWO_MB = 2 * 1024 * 1024
    if (file.size > TWO_MB) {
      throw new ValidationError('File size must be less than 2MB')
    }
  }

  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      validateFile(file)

      if (!uid) {
        throw new ValidationError('User ID is required')
      }

      const fileExt = file.name.split('.').pop()
      const filePath = `${uid}-${Math.random()}.${fileExt}`

      const options = {
        cacheControl: '3600',
        upsert: true
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, options)

      if (uploadError) {
        throw uploadError
      }

      await onUpload(filePath, file, options)
    } catch (error) {
      handleError(error, 'Avatar.uploadAvatar')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt="Avatar"
          className="rounded-full"
          width={size}
          height={size}
        />
      ) : (
        <Image
          src="/default-avatar.png"
          alt="Default Avatar"
          className="rounded-full"
          width={size}
          height={size}
        />
      )}
      <div className="flex flex-col items-center gap-2">
        <label
          className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
          htmlFor="avatar"
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
      </div>
    </div>
  )
}