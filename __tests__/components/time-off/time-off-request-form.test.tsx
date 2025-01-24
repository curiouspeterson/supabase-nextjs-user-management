import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TimeOffRequestForm from '@/components/time-off/TimeOffRequestForm'
import { createClient } from '@/utils/supabase/client'

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
}))

describe('TimeOffRequestForm', () => {
  const mockEmployeeId = '123'
  const mockOnRequestSubmitted = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the form with all required fields', () => {
    render(<TimeOffRequestForm employeeId={mockEmployeeId} />)

    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/reason/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit request/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<TimeOffRequestForm employeeId={mockEmployeeId} />)

    // Try to submit without filling fields
    await user.click(screen.getByRole('button', { name: /submit request/i }))

    // HTML5 validation messages should prevent submission
    expect(screen.getByLabelText(/start date/i)).toBeInvalid()
    expect(screen.getByLabelText(/end date/i)).toBeInvalid()
    expect(screen.getByLabelText(/reason/i)).toBeInvalid()
  })

  it('prevents end date being before start date', async () => {
    const user = userEvent.setup()
    render(<TimeOffRequestForm employeeId={mockEmployeeId} />)

    // Set start date
    await user.type(screen.getByLabelText(/start date/i), '2024-03-15')

    // Try to set earlier end date
    const endDateInput = screen.getByLabelText(/end date/i)
    await user.type(endDateInput, '2024-03-14')

    expect(endDateInput).toBeInvalid()
  })

  it('submits the form successfully', async () => {
    const user = userEvent.setup()
    render(
      <TimeOffRequestForm
        employeeId={mockEmployeeId}
        onRequestSubmitted={mockOnRequestSubmitted}
      />
    )

    // Fill out the form
    await user.type(screen.getByLabelText(/start date/i), '2024-03-15')
    await user.type(screen.getByLabelText(/end date/i), '2024-03-20')
    await user.type(screen.getByLabelText(/reason/i), 'Vacation')

    // Submit the form
    await user.click(screen.getByRole('button', { name: /submit request/i }))

    // Verify Supabase client was called correctly
    await waitFor(() => {
      const mockSupabase = createClient()
      expect(mockSupabase.from).toHaveBeenCalledWith('time_off_requests')
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        employee_id: mockEmployeeId,
        start_date: '2024-03-15',
        end_date: '2024-03-20',
        reason: 'Vacation',
        status: 'Pending'
      })
    })

    // Verify success message and callback
    expect(screen.getByText(/submitted successfully/i)).toBeInTheDocument()
    expect(mockOnRequestSubmitted).toHaveBeenCalled()
  })

  it('handles submission errors', async () => {
    // Mock Supabase error
    const mockError = new Error('Failed to submit')
    ;(createClient as jest.Mock).mockImplementationOnce(() => ({
      from: jest.fn(() => ({
        insert: jest.fn(() => Promise.reject(mockError)),
      })),
    }))

    const user = userEvent.setup()
    render(<TimeOffRequestForm employeeId={mockEmployeeId} />)

    // Fill out and submit the form
    await user.type(screen.getByLabelText(/start date/i), '2024-03-15')
    await user.type(screen.getByLabelText(/end date/i), '2024-03-20')
    await user.type(screen.getByLabelText(/reason/i), 'Vacation')
    await user.click(screen.getByRole('button', { name: /submit request/i }))

    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/failed to submit time off request/i)).toBeInTheDocument()
    })
  })

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup()
    render(<TimeOffRequestForm employeeId={mockEmployeeId} />)

    // Fill out the form
    await user.type(screen.getByLabelText(/start date/i), '2024-03-15')
    await user.type(screen.getByLabelText(/end date/i), '2024-03-20')
    await user.type(screen.getByLabelText(/reason/i), 'Vacation')

    // Click submit
    const submitButton = screen.getByRole('button', { name: /submit request/i })
    await user.click(submitButton)

    // Button should be disabled and show loading state
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveTextContent(/submitting/i)

    // Wait for submission to complete
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
      expect(submitButton).toHaveTextContent(/submit request/i)
    })
  })
}) 