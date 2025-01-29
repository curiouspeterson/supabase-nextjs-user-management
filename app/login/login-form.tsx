'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabase } from '@/lib/supabase/client'
import { login } from './actions'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const { supabase } = useSupabase()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await login(email, password)
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Authentication failed')
      }

      router.refresh()
      router.push('/')
    } catch (err) {
      console.error('Sign in error:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
      {message === 'check-email' && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 text-center rounded-md mb-4">
          Check your email for a confirmation link.
        </div>
      )}

      <div>
        <label className="text-md" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6 w-full"
          name="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
      </div>

      <div>
        <label className="text-md" htmlFor="password">
          Password
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6 w-full"
          type="password"
          name="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <div className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
          {error}
        </div>
      )}

      <button
        className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2 hover:bg-green-800 transition-colors"
        disabled={loading}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  )
} 