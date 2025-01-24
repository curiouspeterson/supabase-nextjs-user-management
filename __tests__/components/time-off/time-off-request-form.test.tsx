import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TimeOffRequestForm } from '@/components/time-off/TimeOffRequestForm'
import * as hooks from '@/lib/hooks'
import { User } from '@supabase/supabase-js'

// Mock useUser hook
jest.mock('@/lib/hooks', () => ({
  useUser: jest.fn()
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

describe('TimeOffRequestForm', () => {
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

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock useUser hook
    jest.spyOn(hooks, 'useUser').mockReturnValue({
      user: mockUser,
      loading: false
    })
  })

  it('renders the form with all required fields', () => {
    render(<TimeOffRequestForm />)

    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/reason/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit request/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<TimeOffRequestForm />)

    // Try to submit without filling fields
    await user.click(screen.getByRole('button', { name: /submit request/i }))

    // HTML5 validation messages should prevent submission
    expect(screen.getByLabelText(/start date/i)).toBeInvalid()
    expect(screen.getByLabelText(/end date/i)).toBeInvalid()
    expect(screen.getByLabelText(/reason/i)).toBeInvalid()
  })

  it('prevents end date being before start date', async () => {
    const user = userEvent.setup()
    render(<TimeOffRequestForm />)

    // Set start date
    await user.type(screen.getByLabelText(/start date/i), '2024-03-15')

    // Try to set earlier end date
    const endDateInput = screen.getByLabelText(/end date/i)
    await user.type(endDateInput, '2024-03-14')

    expect(endDateInput).toBeInvalid()
  })

  it('submits the form successfully', async () => {
    const user = userEvent.setup()
    render(<TimeOffRequestForm />)

    // Fill out the form
    await user.type(screen.getByLabelText(/start date/i), '2024-03-15')
    await user.type(screen.getByLabelText(/end date/i), '2024-03-20')
    await user.type(screen.getByLabelText(/reason/i), 'Vacation')

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit request/i })
    await user.click(submitButton)

    // Verify Supabase client was called correctly
    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('time_off_requests')
      expect(mockInsert).toHaveBeenCalledWith({
        employee_id: mockUser.id,
        start_date: '2024-03-15',
        end_date: '2024-03-20',
        reason: 'Vacation',
        status: 'Pending'
      })
    })

    // Verify success message
    expect(screen.getByText(/submitted successfully/i)).toBeInTheDocument()
  })

  it('handles submission errors', async () => {
    // Mock Supabase error
    mockInsert.mockImplementationOnce(() => Promise.reject(new Error('Failed to submit')))

    const user = userEvent.setup()
    render(<TimeOffRequestForm />)

    // Fill out and submit the form
    await user.type(screen.getByLabelText(/start date/i), '2024-03-15')
    await user.type(screen.getByLabelText(/end date/i), '2024-03-20')
    await user.type(screen.getByLabelText(/reason/i), 'Vacation')

    const submitButton = screen.getByRole('button', { name: /submit request/i })
    await user.click(submitButton)

    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/failed to submit time off request/i)).toBeInTheDocument()
    })
  })

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup()
    render(<TimeOffRequestForm />)

    // Fill out the form
    await user.type(screen.getByLabelText(/start date/i), '2024-03-15')
    await user.type(screen.getByLabelText(/end date/i), '2024-03-20')
    await user.type(screen.getByLabelText(/reason/i), 'Vacation')

    // Click submit
    const submitButton = screen.getByRole('button', { name: /submit request/i })
    await user.click(submitButton)

    // Button should be disabled and show loading state
    await waitFor(() => {
      expect(submitButton).toHaveAttribute('aria-disabled', 'true')
      expect(submitButton).toHaveTextContent(/submitting/i)
    })

    // Wait for submission to complete
    await waitFor(() => {
      expect(submitButton).toHaveAttribute('aria-disabled', 'false')
      expect(submitButton).toHaveTextContent(/submit request/i)
    })
  })
}) 