import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface LoadingProps {
  message?: string
  className?: string
  size?: 'sm' | 'default' | 'lg'
  children?: React.ReactNode
}

const sizeClasses = {
  sm: 'h-4 w-4',
  default: 'h-8 w-8',
  lg: 'h-12 w-12'
} as const

export function Loading({
  message = 'Loading...',
  className,
  size = 'default',
  children
}: LoadingProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <Loader2 className={cn('animate-spin text-muted-foreground mb-4', sizeClasses[size])} />
      {message && <p className="text-muted-foreground mb-4">{message}</p>}
      {children}
    </div>
  )
} 