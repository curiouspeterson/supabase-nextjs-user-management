import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/components/ui/use-toast'
import { X } from 'lucide-react'

describe('Toast', () => {
  const user = userEvent.setup()

  it('renders toast with all subcomponents', async () => {
    render(<Toaster />)
    
    toast({
      title: 'Test Title',
      description: 'Test Description',
      action: <button>Action</button>,
    })

    await waitFor(() => {
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '' })).toBeInTheDocument()
    })
  })

  it('closes toast when clicking close button', async () => {
    render(<Toaster />)
    
    toast({
      title: 'Test Toast',
    })

    await waitFor(() => {
      expect(screen.getByText('Test Toast')).toBeInTheDocument()
    })

    const closeButton = screen.getByRole('button', { name: '' })
    closeButton.hasPointerCapture = () => false
    await user.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByText('Test Toast')).not.toBeInTheDocument()
    })
  })

  it('handles multiple toasts', async () => {
    render(<Toaster />)
    
    toast({ title: 'First Toast' })
    toast({ title: 'Second Toast' })

    await waitFor(() => {
      const visibleToasts = screen.getAllByRole('status').filter(toast => 
        !toast.getAttribute('style')?.includes('position: absolute')
      )
      expect(visibleToasts).toHaveLength(1)
      expect(screen.getByText('Second Toast')).toBeInTheDocument()
    })
  })

  it('handles toast with custom styling', async () => {
    render(<Toaster />)
    
    toast({
      title: 'Styled Toast',
      className: 'custom-class',
    })

    await waitFor(() => {
      const visibleToasts = screen.getAllByRole('status').filter(toast => 
        !toast.getAttribute('style')?.includes('position: absolute')
      )
      expect(visibleToasts[0]).toHaveClass('custom-class')
    })
  })

  it('handles toast with action callback', async () => {
    const actionFn = jest.fn()
    render(<Toaster />)
    
    toast({
      title: 'Action Toast',
      action: <button onClick={actionFn}>Click Me</button>,
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument()
    })

    const actionButton = screen.getByRole('button', { name: 'Click Me' })
    actionButton.hasPointerCapture = () => false
    await user.click(actionButton)
    expect(actionFn).toHaveBeenCalled()
  })

  it('handles destructive toast variant', async () => {
    render(<Toaster />)
    
    toast({
      title: 'Error Toast',
      variant: 'destructive',
    })

    await waitFor(() => {
      const visibleToasts = screen.getAllByRole('status').filter(toast => 
        !toast.getAttribute('style')?.includes('position: absolute')
      )
      expect(visibleToasts[0]).toHaveClass('destructive')
    })
  })

  it('handles toast with dynamic content', async () => {
    render(<Toaster />)
    
    const { id, update } = toast({
      title: 'Initial Title',
    })

    await waitFor(() => {
      expect(screen.getByText('Initial Title')).toBeInTheDocument()
    })

    update({
      id,
      title: 'Updated Title',
    })

    await waitFor(() => {
      expect(screen.getByText('Updated Title')).toBeInTheDocument()
      expect(screen.queryByText('Initial Title')).not.toBeInTheDocument()
    })
  })

  it('handles toast with long content', async () => {
    render(<Toaster />)
    
    const longText = 'This is a very long toast message that should still be displayed properly without breaking the layout of the toast component'
    
    toast({
      title: 'Long Toast',
      description: longText,
    })

    await waitFor(() => {
      expect(screen.getByText(longText)).toBeInTheDocument()
    })
  })
}) 