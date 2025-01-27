export type ToastVariant = 'default' | 'destructive' | 'success'

export interface Toast {
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

export interface ToastActionElement {
  altText: string
  onClick: () => void
  children: React.ReactNode
}

export interface ToastProps extends Toast {
  id: string
  onDismiss: () => void
  action?: ToastActionElement
}

export interface ToastContextValue {
  toast: (props: Toast) => void
  dismiss: (toastId: string) => void
  toasts: ToastProps[]
} 