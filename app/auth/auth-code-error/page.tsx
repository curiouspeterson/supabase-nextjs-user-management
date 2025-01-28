import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function AuthError() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-8 space-y-4">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Authentication Error
        </h1>
        <p className="text-gray-600 text-center">
          There was an error processing your sign in request. Please try again.
        </p>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/login">
              Return to Login
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
} 