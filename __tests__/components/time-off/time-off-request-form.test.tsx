import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TimeOffRequestForm } from '@/components/time-off/time-off-request-form'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import * as useToastModule from '@/components/ui/use-toast'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
    push: jest.fn()
  })
}))

// Mock useToast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}))

// Mock useErrorHandler
jest.mock('@/lib/error-handler', () => ({
  useErrorHandler: () => ({
    handleError: jest.fn()
  })
}))

// Mock hasPointerCapture for Radix UI
Element.prototype.hasPointerCapture = () => false
Element.prototype.scrollIntoView = () => {}

// Mock toast
const mockToast = jest.fn()

const mockUser: User = {
  id: '123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-03-14T00:00:00.000Z',
  role: 'authenticated',
  updated_at: '2024-03-14T00:00:00.000Z'
}

// Mock useUser hook
jest.mock('@/lib/hooks', () => ({
  useUser: () => ({
    user: mockUser,
    loading: false
  })
}))

// Mock Supabase client
const mockInsert = jest.fn(() => Promise.resolve({ data: null, error: null }))
const mockFrom = jest.fn(() => ({
  insert: mockInsert
}))

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom
  }))
}))

// Mock useToast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}))

describe('TimeOffRequestForm', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    jest.clearAllMocks()
    user = userEvent.setup()
    mockInsert.mockResolvedValue({ data: null, error: null })
  })

  describe('Error Handling', () => {
    it('validates overlapping time off requests', async () => {
      mockFrom.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: [{
            start_date: '2025-01-24',
            end_date: '2025-01-26'
          }],
          error: null
        }),
        insert: mockInsert
      }))

      render(<TimeOffRequestForm userId={mockUser.id} />)

      const startDate = screen.getByLabelText('Start date')
      const endDate = screen.getByLabelText('End date')
      const typeSelect = screen.getByLabelText('Type of time off')
      const notes = screen.getByLabelText('Notes')
      const submitButton = screen.getByRole('button', { name: 'Submit Request' })

      await user.type(startDate, '2025-01-25')
      await user.type(endDate, '2025-01-27')
      await user.selectOptions(typeSelect, 'vacation')
      await user.type(notes, 'Test vacation')

      expect(submitButton).not.toBeDisabled()
      await user.click(submitButton)

      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      }, { timeout: 1000 })

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'You already have a time off request during this period',
          variant: 'destructive'
        })
      }, { timeout: 1000 })

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert')
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage).toHaveTextContent('You already have a time off request during this period')
      }, { timeout: 1000 })
    })

    it('validates remaining vacation days', async () => {
      mockFrom.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: [{
            total_days: 20,
            used_days: 18
          }],
          error: null
        }),
        insert: mockInsert
      }))

      render(<TimeOffRequestForm userId={mockUser.id} />)

      const startDate = screen.getByLabelText('Start date')
      const endDate = screen.getByLabelText('End date')
      const typeSelect = screen.getByLabelText('Type of time off')
      const notes = screen.getByLabelText('Notes')
      const submitButton = screen.getByRole('button', { name: 'Submit Request' })

      await user.type(startDate, '2025-01-25')
      await user.type(endDate, '2025-01-28')
      await user.selectOptions(typeSelect, 'vacation')
      await user.type(notes, 'Test vacation')

      expect(submitButton).not.toBeDisabled()
      await user.click(submitButton)

      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      }, { timeout: 1000 })

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Insufficient vacation days remaining',
          variant: 'destructive'
        })
      }, { timeout: 1000 })

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert')
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage).toHaveTextContent('Insufficient vacation days remaining')
      }, { timeout: 1000 })
    })

    it('handles form reset after error', async () => {
      mockInsert.mockRejectedValueOnce(new Error('Submission failed'))
      render(<TimeOffRequestForm userId={mockUser.id} />)

      const startDate = screen.getByLabelText('Start date')
      const endDate = screen.getByLabelText('End date')
      const typeSelect = screen.getByLabelText('Type of time off')
      const notes = screen.getByLabelText('Notes')
      const resetButton = screen.getByRole('button', { name: 'Reset' })
      const submitButton = screen.getByRole('button', { name: 'Submit Request' })

      await user.type(startDate, '2025-01-25')
      await user.type(endDate, '2025-01-26')
      await user.selectOptions(typeSelect, 'vacation')
      await user.type(notes, 'Test vacation')

      expect(submitButton).not.toBeDisabled()
      await user.click(submitButton)

      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      }, { timeout: 1000 })

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert')
        expect(errorMessage).toBeInTheDocument()
      }, { timeout: 1000 })

      await user.click(resetButton)

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(startDate).toHaveValue('')
      expect(endDate).toHaveValue('')
      expect(typeSelect).toHaveValue('')
      expect(notes).toHaveValue('')
    })

    it('provides accessible validation feedback', async () => {
      render(<TimeOffRequestForm userId={mockUser.id} />)

      const submitButton = screen.getByRole('button', { name: 'Submit Request' })
      await user.click(submitButton)

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert')
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage).toHaveAttribute('aria-live', 'polite')
      }, { timeout: 1000 })
    })
  })

  it('validates end date is not before start date', async () => {
    render(<TimeOffRequestForm userId={mockUser.id} />)

    const startDate = screen.getByLabelText('Start date')
    const endDate = screen.getByLabelText('End date')
    const typeSelect = screen.getByLabelText('Type of time off')
    const notes = screen.getByLabelText('Notes')
    const submitButton = screen.getByRole('button', { name: 'Submit Request' })

    await user.type(startDate, '2025-01-25')
    await user.type(endDate, '2025-01-24')
    await user.selectOptions(typeSelect, 'vacation')
    await user.type(notes, 'Test vacation')

    expect(submitButton).not.toBeDisabled()
    await user.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    }, { timeout: 1000 })

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'End date must be after start date',
        variant: 'destructive'
      })
    }, { timeout: 1000 })

    await waitFor(() => {
      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveTextContent('End date must be after start date')
    }, { timeout: 1000 })
  })

  it('submits the form successfully', async () => {
    render(<TimeOffRequestForm userId={mockUser.id} />)

    const startDate = screen.getByLabelText('Start date')
    const endDate = screen.getByLabelText('End date')
    const typeSelect = screen.getByLabelText('Type of time off')
    const notes = screen.getByLabelText('Notes')
    const submitButton = screen.getByRole('button', { name: 'Submit Request' })

    await user.type(startDate, '2025-01-25')
    await user.type(endDate, '2025-01-26')
    await user.selectOptions(typeSelect, 'vacation')
    await user.type(notes, 'Test vacation')

    expect(submitButton).not.toBeDisabled()
    await user.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveTextContent('Submitting...')
    }, { timeout: 1000 })

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Time off request submitted successfully',
        variant: 'default'
      })
    }, { timeout: 1000 })
  })

  it('handles submission errors', async () => {
    mockInsert.mockRejectedValueOnce(new Error('Database error'))
    render(<TimeOffRequestForm userId={mockUser.id} />)

    const startDate = screen.getByLabelText('Start date')
    const endDate = screen.getByLabelText('End date')
    const typeSelect = screen.getByLabelText('Type of time off')
    const notes = screen.getByLabelText('Notes')
    const submitButton = screen.getByRole('button', { name: 'Submit Request' })

    await user.type(startDate, '2025-01-25')
    await user.type(endDate, '2025-01-26')
    await user.selectOptions(typeSelect, 'vacation')
    await user.type(notes, 'Test vacation')

    expect(submitButton).not.toBeDisabled()
    await user.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    }, { timeout: 1000 })

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to submit time off request',
        variant: 'destructive'
      })
    }, { timeout: 1000 })

    await waitFor(() => {
      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveTextContent('An unexpected error occurred')
    }, { timeout: 1000 })
  })

  it('disables submit button while submitting', async () => {
    render(<TimeOffRequestForm userId={mockUser.id} />)

    const startDate = screen.getByLabelText('Start date')
    const endDate = screen.getByLabelText('End date')
    const typeSelect = screen.getByLabelText('Type of time off')
    const notes = screen.getByLabelText('Notes')
    const submitButton = screen.getByRole('button', { name: 'Submit Request' })

    await user.type(startDate, '2025-01-25')
    await user.type(endDate, '2025-01-26')
    await user.selectOptions(typeSelect, 'vacation')
    await user.type(notes, 'Test vacation')

    expect(submitButton).not.toBeDisabled()
    await user.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveTextContent('Submitting...')
    }, { timeout: 1000 })

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
      expect(submitButton).toHaveTextContent('Submit Request')
    }, { timeout: 1000 })
  })
}) 