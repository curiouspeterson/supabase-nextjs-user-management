'use client'
import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'

export default function Avatar({
  uid,
  url,
  size = 150,
  onUpload,
}: {
  uid: string | null
  url: string | null
  size: number
  onUpload: (url: string) => void
}) {
  const supabase = createClientComponentClient()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    let objectUrl: string | null = null

    async function downloadImage(path: string) {
      try {
        const { data, error } = await supabase.storage.from('avatars').download(path)
        if (error) throw error
        
        objectUrl = URL.createObjectURL(data)
        setAvatarUrl(objectUrl)
      } catch (error) {
        console.error('Error downloading image:', error)
      }
    }

    if (url) {
      downloadImage(url)
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [url, supabase.storage])

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      if (!uid) {
        throw new Error('No user ID provided.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${uid}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      onUpload(filePath)
    } catch (error) {
      alert('Error uploading avatar!')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt="User avatar"
          className="rounded-full"
          width={size}
          height={size}
        />
      ) : (
        <Image
          src="/default-avatar.png"
          alt="Default avatar"
          className="rounded-full"
          width={size}
          height={size}
        />
      )}
      <div>
        <label
          className="cursor-pointer text-sm text-gray-600 hover:text-gray-900"
          htmlFor="avatar-upload"
        >
          {uploading ? 'Uploading...' : 'Upload avatar'}
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading || !uid}
          className="hidden"
          aria-label="Upload avatar"
        />
      </div>
    </div>
  )
}