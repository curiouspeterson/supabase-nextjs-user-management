'use client'

export function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="rounded-lg bg-red-50 p-4">
        <h2 className="mb-2 text-lg font-semibold text-red-800">Something went wrong</h2>
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    </div>
  )
} 