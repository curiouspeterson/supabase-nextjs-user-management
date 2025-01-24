'use client'

import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { buttonVariants } from '@/components/ui/button'

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      if (isSignup) {
        await signup(email, password)
      } else {
        await login(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Enter your email and password to sign in</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} role="form" aria-label="Login form">
          <CardContent className="pt-0 space-y-4">
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                aria-required="true"
              />
            </div>
          </CardContent>
          <CardFooter className="pt-0 flex flex-col space-y-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              aria-disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
                  {isSignup ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                isSignup ? 'Create account' : 'Sign in'
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={isSubmitting}
              aria-disabled={isSubmitting}
              onClick={() => {
                setIsSignup(!isSignup)
                setError(null)
              }}
            >
              {isSignup ? 'Sign in instead' : 'Create account instead'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}