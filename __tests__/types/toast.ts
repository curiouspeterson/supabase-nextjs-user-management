import { type VariantProps } from 'class-variance-authority'
import { type ReactNode } from 'react'

export type ToastVariant = 'default' | 'destructive'
export type ToastPosition = 'top' | 'bottom'
export type ToastDuration = number | undefined

export interface ToastAction {
  altText: string
  onClick: () => void
  children: ReactNode
}

export interface ToastProps extends VariantProps<any> {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  className?: string
  action?: ToastAction
  duration?: ToastDuration
  position?: ToastPosition
  onOpenChange?: (open: boolean) => void
}

export interface ToastContextValue {
  toasts: ToastProps[]
  dismiss: (id: string) => void
  update: (props: ToastProps) => void
}

export interface TestToast {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  duration?: ToastDuration
  position?: ToastPosition
  action?: ToastAction
  className?: string
  onOpenChange?: (open: boolean) => void
} 