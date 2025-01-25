import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TimeOffRequestForm } from '@/components/time-off/TimeOffRequestForm'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import * as useToastModule from '@/components/ui/use-toast'

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
const mockToast = jest.fn()
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn()
}))

describe('TimeOffRequestForm', () => {
  const user = userEvent.setup()
  
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useToastModule.useToast as jest.Mock).mockReturnValue({ toast: mockToast })
    // Reset form state
    mockInsert.mockResolvedValue({ data: null, error: null })
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
    
    // Fill out form with invalid dates
    await user.type(screen.getByLabelText(/start date/i), '2025-02-01')
    await user.type(screen.getByLabelText(/end date/i), '2025-01-01')
    
    // Select type
    const typeSelect = screen.getByRole('combobox')
    await user.click(typeSelect)
    await user.click(screen.getByRole('option', { name: 'Vacation' }))
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /submit request/i }))
    
    // Wait for error message and toast
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to submit time off request')
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to submit time off request',
        variant: 'destructive'
      })
    })
    
    // Button should not be disabled after validation error
    expect(screen.getByRole('button', { name: /submit request/i })).not.toBeDisabled()
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