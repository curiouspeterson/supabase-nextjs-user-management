import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TimeOffRequestForm } from '@/components/time-off/TimeOffRequestForm'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/components/ui/use-toast'

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
    ;(useToast as jest.Mock).mockReturnValue({ toast: mockToast })
  })

  afterEach(() => {
    jest.clearAllMocks()
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

    const startDate = screen.getByLabelText('Start Date')
    const endDate = screen.getByLabelText('End Date')

    await user.type(startDate, '2025-01-26')
    await user.type(endDate, '2025-01-25')

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'End date cannot be before start date',
        variant: 'destructive'
      })
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
    
    // Open select dropdown
    await user.click(typeSelect)
    await waitFor(() => {
      expect(typeSelect).toHaveAttribute('aria-expanded', 'true')
    })

    // Select option
    const option = screen.getByRole('option', { name: 'Vacation' })
    await user.click(option)

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
    render(<TimeOffRequestForm />)

    const startDate = screen.getByLabelText('Start Date')
    const endDate = screen.getByLabelText('End Date')
    const typeSelect = screen.getByRole('combobox')
    const submitButton = screen.getByRole('button', { name: 'Submit Request' })

    await user.type(startDate, '2025-01-25')
    await user.type(endDate, '2025-01-26')
    
    // Open select dropdown
    await user.click(typeSelect)
    await waitFor(() => {
      expect(typeSelect).toHaveAttribute('aria-expanded', 'true')
    })

    // Select option  
    const option = screen.getByRole('option', { name: 'Vacation' })
    await user.click(option)

    await user.click(submitButton)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to submit time off request',
        variant: 'destructive'
      })
    })
  })

  it('disables submit button while submitting', async () => {
    render(<TimeOffRequestForm />)

    const startDate = screen.getByLabelText('Start Date')
    const endDate = screen.getByLabelText('End Date')
    const typeSelect = screen.getByRole('combobox')
    const submitButton = screen.getByRole('button', { name: 'Submit Request' })

    await user.type(startDate, '2025-01-25')
    await user.type(endDate, '2025-01-26')
    
    // Open select dropdown
    await user.click(typeSelect)
    await waitFor(() => {
      expect(typeSelect).toHaveAttribute('aria-expanded', 'true')
    })

    // Select option
    const option = screen.getByRole('option', { name: 'Vacation' })
    await user.click(option)

    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveTextContent('Submitting...')
  })
}) 