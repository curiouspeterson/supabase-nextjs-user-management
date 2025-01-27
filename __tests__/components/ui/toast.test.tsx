import React from 'react'
import {
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ToastProps, TestToast } from '../../types/toast'
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
import {
  expectToastToBeVisible,
  expectToastToBeDismissed,
  expectToastToHaveVariant,
  expectToastToBeAccessible,
  expectToastToAutoDismiss,
  expectToastPosition,
  expectToastQueueOrder,
  expectToastKeyboardInteraction,
  dismissToast,
  clickToastAction
} from '../../utils/toast-test-utils'
import { createMockToast } from '../../test-utils'

// Mock useToast hook
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(),
  toast: jest.fn()
}))

describe('Toast Component', () => {
  const mockDismiss = jest.fn()
  const mockUpdate = jest.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderToast = (mockToast) => {
    const mockDismiss = jest.fn()
    const mockActionClick = jest.fn()

    const toastProps = {
      id: mockToast.id,
      title: mockToast.title,
      description: mockToast.description,
      variant: mockToast.variant,
      onDismiss: mockDismiss,
      duration: mockToast.duration,
      className: mockToast.className,
    }

    const result = render(
      <ToastProvider>
        <Toaster />
        <Toast {...toastProps}>
          {mockToast.description}
          {mockToast.action && (
            <ToastAction altText={mockToast.action.altText} onClick={mockActionClick}>
              {mockToast.action.children}
            </ToastAction>
          )}
        </Toast>
      </ToastProvider>
    )

    return {
      ...result,
      mockDismiss,
      mockActionClick,
    }
  }

  describe('Basic Rendering', () => {
    it('renders toast with title and description', () => {
      const mockToast = {
        id: '1',
        title: 'Test Toast',
        description: 'This is a test toast',
        variant: 'default',
      }

      renderToast(mockToast)

      expect(screen.getByText('Test Toast')).toBeInTheDocument()
      expect(screen.getByText('This is a test toast')).toBeInTheDocument()
    })

    it('renders toast without description', () => {
      const mockToast = {
        id: '1',
        title: 'Test Toast',
        variant: 'default',
      }

      renderToast(mockToast)

      expect(screen.getByText('Test Toast')).toBeInTheDocument()
      expect(screen.queryByRole('status')).toBeInTheDocument()
    })
  })

  describe('Interaction Handling', () => {
    it('dismisses toast when clicking close button', async () => {
      const mockToast = {
        id: '1',
        title: 'Test Toast',
        variant: 'default',
      }

      const { mockDismiss } = renderToast(mockToast)
      const closeButton = screen.getByRole('button', { hidden: true })
      await userEvent.click(closeButton)
      expect(mockDismiss).toHaveBeenCalledWith('1')
    })

    it('handles action callback', async () => {
      const mockToast = {
        id: '1',
        title: 'Test Toast',
        variant: 'default',
        action: {
          altText: 'Test Action',
          children: 'Action',
        },
      }

      const { mockActionClick } = renderToast(mockToast)
      const actionButton = screen.getByRole('button', { name: 'Action' })
      await userEvent.click(actionButton)
      expect(mockActionClick).toHaveBeenCalled()
    })
  })

  describe('Variants and Styling', () => {
    it('applies correct styling for destructive variant', () => {
      const mockToast = {
        id: '1',
        title: 'Error Toast',
        variant: 'destructive',
      }

      renderToast(mockToast)
      const toastElement = screen.getByRole('status')
      expect(toastElement).toHaveClass('destructive')
    })

    it('applies custom class name', () => {
      const mockToast = {
        id: '1',
        title: 'Test Toast',
        variant: 'default',
        className: 'custom-toast',
      }

      renderToast(mockToast)
      const toastElement = screen.getByRole('status')
      expect(toastElement).toHaveClass('custom-toast')
    })
  })

  describe('Auto-dismiss Behavior', () => {
    it('auto-dismisses after duration', async () => {
      const duration = 2000
      const mockToast = createMockToast({ duration })
      renderToast(mockToast)
      await expectToastToBeVisible(mockToast)
      await waitFor(() => expectToastToBeDismissed(mockToast.title), {
        timeout: duration + 1000
      })
    })
  })

  describe('Position Handling', () => {
    it('renders in correct position', async () => {
      const mockToast = createMockToast({ position: 'top' })
      renderToast(mockToast)
      await expectToastPosition(mockToast)
    })
  })

  describe('Multiple Toasts', () => {
    it('handles multiple toasts in sequence', async () => {
      const toasts = [
        createMockToast({ title: 'First Toast' }),
        createMockToast({ title: 'Second Toast' }),
        createMockToast({ title: 'Third Toast' })
      ]

      toasts.forEach(toast => renderToast(toast))
      await expectToastQueueOrder(toasts)
    })
  })

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      const mockToast = {
        id: '1',
        title: 'Test Toast',
        description: 'This is a test toast',
        variant: 'default',
      }

      renderToast(mockToast)
      const toastElement = screen.getByRole('status')
      expect(toastElement).toHaveAttribute('aria-live', 'polite')
    })

    it('supports keyboard navigation', async () => {
      const mockToast = {
        id: '1',
        title: 'Test Toast',
        variant: 'default',
        action: {
          altText: 'Test Action',
          children: 'Action',
        },
      }

      renderToast(mockToast)
      const closeButton = screen.getByRole('button', { hidden: true })
      const actionButton = screen.getByRole('button', { name: 'Action' })

      await userEvent.tab()
      expect(actionButton).toHaveFocus()

      await userEvent.tab()
      expect(closeButton).toHaveFocus()
    })
  })
}) 