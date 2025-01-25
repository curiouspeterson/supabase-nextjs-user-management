import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TimeOffRequestForm } from '@/components/time-off/TimeOffRequestForm'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import * as useToastModule from '@/components/ui/use-toast'
import { mockToast } from '@/lib/test-utils'

// Mock hasPointerCapture for Radix UI
Element.prototype.hasPointerCapture = () => false
Element.prototype.scrollIntoView = () => {}

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
    // Reset form state
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

      render(<TimeOffRequestForm />)

      const startDate = screen.getByLabelText('Start Date')
      const endDate = screen.getByLabelText('End Date')
      const typeSelect = screen.getByRole('combobox')
      const submitButton = screen.getByRole('button', { name: 'Submit Request' })

      await user.type(startDate, '2025-01-25')
      await user.type(endDate, '2025-01-27')
      await user.click(typeSelect)
      await user.click(screen.getByRole('option', { name: 'Vacation' }))
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'You already have time off scheduled during this period',
          variant: 'destructive'
        })
        expect(screen.getByRole('alert')).toHaveTextContent(
          'You already have time off scheduled during this period'
        )
      })
    })

    it('validates maximum consecutive days', async () => {
      render(<TimeOffRequestForm />)

      const startDate = screen.getByLabelText('Start Date')
      const endDate = screen.getByLabelText('End Date')
      const typeSelect = screen.getByRole('combobox')
      const submitButton = screen.getByRole('button', { name: 'Submit Request' })

      await user.type(startDate, '2025-01-01')
      await user.type(endDate, '2025-02-15')
      await user.click(typeSelect)
      await user.click(screen.getByRole('option', { name: 'Vacation' }))
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Time off requests cannot exceed 30 consecutive days',
          variant: 'destructive'
        })
      })
    })

    it('handles database connection errors', async () => {
      mockInsert.mockRejectedValueOnce(new Error('Database connection failed'))
      render(<TimeOffRequestForm />)

      const startDate = screen.getByLabelText('Start Date')
      const endDate = screen.getByLabelText('End Date')
      const typeSelect = screen.getByRole('combobox')
      const submitButton = screen.getByRole('button', { name: 'Submit Request' })

      await user.type(startDate, '2025-01-25')
      await user.type(endDate, '2025-01-26')
      await user.click(typeSelect)
      await user.click(screen.getByRole('option', { name: 'Vacation' }))
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Unable to submit request. Please try again later.',
          variant: 'destructive'
        })
        expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite')
      })
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

      render(<TimeOffRequestForm />)

      const startDate = screen.getByLabelText('Start Date')
      const endDate = screen.getByLabelText('End Date')
      const typeSelect = screen.getByRole('combobox')
      const submitButton = screen.getByRole('button', { name: 'Submit Request' })

      await user.type(startDate, '2025-01-25')
      await user.type(endDate, '2025-01-28')
      await user.click(typeSelect)
      await user.click(screen.getByRole('option', { name: 'Vacation' }))
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Insufficient vacation days remaining',
          variant: 'destructive'
        })
      })
    })

    it('handles form reset after error', async () => {
      mockInsert.mockRejectedValueOnce(new Error('Submission failed'))
      render(<TimeOffRequestForm />)

      const startDate = screen.getByLabelText('Start Date')
      const endDate = screen.getByLabelText('End Date')
      const typeSelect = screen.getByRole('combobox')
      const resetButton = screen.getByRole('button', { name: 'Reset' })
      const submitButton = screen.getByRole('button', { name: 'Submit Request' })

      await user.type(startDate, '2025-01-25')
      await user.type(endDate, '2025-01-26')
      await user.click(typeSelect)
      await user.click(screen.getByRole('option', { name: 'Vacation' }))
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      await user.click(resetButton)

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(startDate).toHaveValue('')
      expect(endDate).toHaveValue('')
      expect(typeSelect).toHaveTextContent('Select type')
    })

    it('provides accessible validation feedback', async () => {
      render(<TimeOffRequestForm />)

      const submitButton = screen.getByRole('button', { name: 'Submit Request' })
      await user.click(submitButton)

      await waitFor(() => {
        const errors = screen.getAllByRole('alert')
        errors.forEach(error => {
          expect(error).toHaveAttribute('aria-live', 'polite')
          expect(error).toBeVisible()
        })
      })
    })
  })

  it('renders form fields', () => {
    render(<TimeOffRequestForm />)
    
    expect(screen.getByLabelText('Start Date')).toBeRequired()
    expect(screen.getByLabelText('End Date')).toBeRequired()
    expect(screen.getByRole('combobox')).toBeRequired()
    expect(screen.getByLabelText('Notes')).toBeInTheDocument()
  })

  it('validates end date is not before start date', async () => {
    render(<TimeOffRequestForm />)

    const startDateInput = screen.getByLabelText(/start date/i)
    const endDateInput = screen.getByLabelText(/end date/i)
    const submitButton = screen.getByRole('button', { name: /submit request/i })

    await user.type(startDateInput, '2025-01-25')
    await user.type(endDateInput, '2025-01-24')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to submit time off request',
        variant: 'destructive'
      })
      expect(screen.getByText('Failed to submit time off request')).toBeInTheDocument()
    })
  })

  it('submits the form successfully', async () => {
    render(<TimeOffRequestForm />)

    const startDate = screen.getByLabelText('Start Date')
    const endDate = screen.getByLabelText('End Date')
    const typeSelect = screen.getByRole('combobox')
    const notes = screen.getByLabelText('Notes')
    const submitButton = screen.getByRole('button', { name: 'Submit Request' })

    await user.type(startDate, '2025-01-25')
    await user.type(endDate, '2025-01-26')
    
    // Open select dropdown and wait for content
    await user.click(typeSelect)
    await waitFor(() => {
      expect(typeSelect).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    // Find and click option
    const option = screen.getByRole('option', { name: 'Vacation' })
    await user.click(option)

    // Verify selection
    await waitFor(() => {
      expect(typeSelect).toHaveTextContent('Vacation')
    })

    await user.type(notes, 'Taking a vacation')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Time off request submitted successfully'
      })
    })
  })

  it('handles submission errors', async () => {
    mockInsert.mockResolvedValueOnce({ 
      data: null, 
      error: {
        message: 'Failed to submit time off request'
      } as any
    })
    
    render(<TimeOffRequestForm />)

    const startDate = screen.getByLabelText('Start Date')
    const endDate = screen.getByLabelText('End Date')
    const typeSelect = screen.getByRole('combobox')
    const submitButton = screen.getByRole('button', { name: 'Submit Request' })

    await user.type(startDate, '2025-01-25')
    await user.type(endDate, '2025-01-26')
    
    // Open select dropdown and wait for content
    await user.click(typeSelect)
    await waitFor(() => {
      expect(typeSelect).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    // Find and click option
    const option = screen.getByRole('option', { name: 'Vacation' })
    await user.click(option)

    // Verify selection
    await waitFor(() => {
      expect(typeSelect).toHaveTextContent('Vacation')
    })

    await user.click(submitButton)

    // Wait for error message and toast
    await waitFor(() => {
      expect(screen.getByText(/Failed to submit time off request/)).toBeInTheDocument()
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to submit time off request',
        variant: 'destructive'
      })
    })
  })

  it('disables submit button while submitting', async () => {
    // Mock a delayed response
    mockInsert.mockImplementationOnce(() => new Promise(resolve => {
      setTimeout(() => {
        resolve({ data: null, error: null })
      }, 100)
    }))

    render(<TimeOffRequestForm />)

    // Fill out form
    const startDateInput = screen.getByLabelText('Start Date')
    const endDateInput = screen.getByLabelText('End Date')
    await user.type(startDateInput, '2025-01-25')
    await user.type(endDateInput, '2025-01-26')

    // Select type
    const typeSelect = screen.getByRole('combobox')
    await user.click(typeSelect)
    await user.click(screen.getByRole('option', { name: 'Vacation' }))

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit request/i })
    await user.click(submitButton)

    // Immediately after submission
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveTextContent('Submitting...')

    // Wait for submission to complete
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
      expect(submitButton).toHaveTextContent('Submit Request')
    })
  })
}) 