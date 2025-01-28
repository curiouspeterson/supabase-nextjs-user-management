'use client'

import * as React from 'react'
import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TimeOffRequest, TimeOffRequestStatus } from '@/services/time-off/types'

export interface BaseTimeOffDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description: string
  children: React.ReactNode
  preventOutsideClose?: boolean
  className?: string
}

export interface UseTimeOffRequestResult {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  handleError: (error: unknown) => void
  showSuccessMessage: (message: string) => void
}

export function useTimeOffRequest(): UseTimeOffRequestResult {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleError = (error: unknown) => {
    const message = error instanceof Error ? error.message : 'An error occurred'
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive'
    })
  }

  const showSuccessMessage = (message: string) => {
    toast({
      title: 'Success',
      description: message
    })
  }

  return {
    isLoading,
    setIsLoading,
    handleError,
    showSuccessMessage
  }
}

export function BaseTimeOffDialog({
  open,
  onClose,
  title,
  description,
  children,
  preventOutsideClose = false,
  className = 'sm:max-w-[425px]'
}: BaseTimeOffDialogProps) {
  return (
    <Dialog open={open} onOpenChange={preventOutsideClose ? undefined : onClose}>
      <DialogContent 
        className={className}
        onOpenAutoFocus={(e) => {
          // Prevent default focus behavior
          e.preventDefault()
          // Focus the close button using a more reliable selector
          const closeButton = document.querySelector('button[type="button"] > .sr-only') as HTMLElement
          if (closeButton?.parentElement) {
            closeButton.parentElement.focus()
          }
        }}
        onInteractOutside={(e) => {
          if (preventOutsideClose) {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

export const STATUS_VARIANTS = {
  [TimeOffRequestStatus.PENDING]: 'default',
  [TimeOffRequestStatus.APPROVED]: 'success',
  [TimeOffRequestStatus.REJECTED]: 'destructive'
} as const

export function formatTimeOffDates(request: TimeOffRequest): string {
  const start = new Date(request.start_date)
  const end = new Date(request.end_date)
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
} 