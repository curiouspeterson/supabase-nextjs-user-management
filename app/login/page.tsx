'use client'

import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      if (isSignup) {
        await signup(formData)
      } else {
        await login(formData)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Enter your email and password to sign in
          </CardDescription>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-4">
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
          <CardFooter className="flex flex-col space-y-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              onClick={() => setIsSignup(false)}
            >
              {isSubmitting && !isSignup ? 'Signing in...' : 'Sign in'}
            </Button>
            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={isSubmitting}
              onClick={() => setIsSignup(true)}
            >
              {isSubmitting && isSignup ? 'Creating account...' : 'Create account'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}