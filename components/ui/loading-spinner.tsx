'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
}

export const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = 24, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center', className)}
        {...props}
        role="status"
        aria-label="Loading"
      >
        <Loader2
          className="animate-spin"
          size={size}
          aria-hidden="true"
        />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }
)

LoadingSpinner.displayName = 'LoadingSpinner' 