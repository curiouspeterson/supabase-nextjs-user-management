import * as React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

export interface ErrorProps {
  title?: string
  message?: string
  retry?: () => void
  className?: string
  children?: React.ReactNode
}

export function Error({
  title = 'Something went wrong',
  message = 'An error occurred while loading the content.',
  retry,
  className,
  children
}: ErrorProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-4">{message}</p>
      {retry && (
        <Button onClick={retry} variant="secondary" className="mb-4">
          Try Again
        </Button>
      )}
      {children}
    </div>
  )
} 