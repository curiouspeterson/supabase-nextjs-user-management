'use client'

import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive:
          'destructive group border-destructive bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
    VariantProps<typeof toastVariants> {
  className?: string
  title?: string
  description?: string
  action?: React.ReactNode
}

const Toast = React.memo(function Toast({
  className,
  variant,
  title,
  description,
  action,
  ...props
}: ToastProps) {
  const timerRef = React.useRef<number | undefined>()

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  const onOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      timerRef.current = window.setTimeout(() => {
        props.onOpenChange?.(false)
      }, 100)
    }
  }, [props.onOpenChange])

  return (
    <ToastPrimitives.Root
      className={cn(toastVariants({ variant }), className)}
      {...props}
      onOpenChange={onOpenChange}
    >
      <div className="grid gap-1">
        {title && (
          <ToastPrimitives.Title className="text-sm font-semibold">
            {title}
          </ToastPrimitives.Title>
        )}
        {description && (
          <ToastPrimitives.Description className="text-sm opacity-90">
            {description}
          </ToastPrimitives.Description>
        )}
      </div>
      {action}
      <ToastPrimitives.Close
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </ToastPrimitives.Close>
    </ToastPrimitives.Root>
  )
})

const ToastProvider = React.memo(function ToastProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <ToastPrimitives.Provider>{children}</ToastPrimitives.Provider>
})

const ToastViewport = React.memo(function ToastViewport({
  className,
  ...props
}: ToastPrimitives.ToastViewportProps) {
  return (
    <ToastPrimitives.Viewport
      className={cn(
        'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
        className
      )}
      {...props}
    />
  )
})

// Assign display names
Toast.displayName = 'Toast'
ToastProvider.displayName = 'ToastProvider'
ToastViewport.displayName = 'ToastViewport'

// Re-export primitive components
const ToastTitle = ToastPrimitives.Title
const ToastDescription = ToastPrimitives.Description
const ToastAction = ToastPrimitives.Action
const ToastClose = ToastPrimitives.Close

export type { ToastProps }

export {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
} 