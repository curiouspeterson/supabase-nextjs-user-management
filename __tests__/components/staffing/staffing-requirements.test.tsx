import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StaffingRequirementsTable } from '@/app/staffing/staffing-requirements-table'
import { createBrowserClient } from '@supabase/ssr'

jest.mock('@supabase/ssr')

// Mock data matching current schema
const mockStaffingRequirements = [
  {
    id: '1',
    period_name: 'Morning',
    start_time: '05:00',
    end_time: '09:00',
    minimum_employees: 6,
    shift_supervisor_required: true,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z'
  },
  {
    id: '2',
    period_name: 'Day',
    start_time: '09:00',
    end_time: '21:00',
    minimum_employees: 8,
    shift_supervisor_required: false,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z'
  }
]

describe('StaffingRequirementsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockStaffingRequirements,
            error: null
          })
        })
      }),
      auth: {
        getUser: jest.fn()
      }
    }
    ;(createBrowserClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('renders the staffing requirements table', async () => {
    render(<StaffingRequirementsTable isManager={false} />)

    await waitFor(() => {
      expect(screen.getByText('Morning')).toBeInTheDocument()
    })

    expect(screen.getByText('5:00 AM - 9:00 AM')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('shows loading state while fetching data', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue(new Promise(() => {})) // Never resolves
        })
      }),
      auth: {
        getUser: jest.fn()
      }
    }
    ;(createBrowserClient as jest.Mock).mockReturnValue(mockSupabase)

    render(<StaffingRequirementsTable isManager={false} />)
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows error state when fetch fails', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Failed to fetch')
          })
        })
      }),
      auth: {
        getUser: jest.fn()
      }
    }
    ;(createBrowserClient as jest.Mock).mockReturnValue(mockSupabase)

    render(<StaffingRequirementsTable isManager={false} />)

    await waitFor(() => {
      expect(screen.getByText('Error loading staffing requirements')).toBeInTheDocument()
    })
  })

  it('allows managers to edit requirements', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockStaffingRequirements,
            error: null
          })
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [{ ...mockStaffingRequirements[0], minimum_employees: 4 }],
            error: null
          })
        })
      }),
      auth: {
        getUser: jest.fn()
      }
    }
    ;(createBrowserClient as jest.Mock).mockReturnValue(mockSupabase)

    const user = userEvent.setup()
    render(<StaffingRequirementsTable isManager={true} />)

    await waitFor(() => {
      expect(screen.getByText('Morning')).toBeInTheDocument()
    })

    const editButton = screen.getByRole('button', { name: /edit morning requirement/i })
    await user.click(editButton)

    // Edit minimum employees
    const minInput = screen.getByLabelText(/minimum employees/i)
    await user.clear(minInput)
    await user.type(minInput, '4')

    // Save changes
    const saveButton = screen.getByRole('button', { name: /update/i })
    await user.click(saveButton)

    // Verify API call
    const mockClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    expect(mockClient.from('staffing_requirements').update).toHaveBeenCalledWith({
      minimum_employees: 4
    })
  })

  it('allows managers to delete requirements', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockStaffingRequirements,
            error: null
          })
        }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [mockStaffingRequirements[0]],
            error: null
          })
        })
      }),
      auth: {
        getUser: jest.fn()
      }
    }
    ;(createBrowserClient as jest.Mock).mockReturnValue(mockSupabase)

    const user = userEvent.setup()
    render(<StaffingRequirementsTable isManager={true} />)

    await waitFor(() => {
      expect(screen.getByText('Morning')).toBeInTheDocument()
    })

    const deleteButton = screen.getByRole('button', { name: /delete morning requirement/i })
    await user.click(deleteButton)

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete/i })
    await user.click(confirmButton)

    // Verify API call
    const mockClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    expect(mockClient.from('staffing_requirements').delete().eq).toHaveBeenCalledWith('id', '1')
  })

  it('validates minimum employees is greater than 0', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockStaffingRequirements,
            error: null
          })
        })
      }),
      auth: {
        getUser: jest.fn()
      }
    }
    ;(createBrowserClient as jest.Mock).mockReturnValue(mockSupabase)

    const user = userEvent.setup()
    render(<StaffingRequirementsTable isManager={true} />)

    await waitFor(() => {
      expect(screen.getByText('Morning')).toBeInTheDocument()
    })

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit morning requirement/i })
    await user.click(editButton)

    // Try invalid value
    const minInput = screen.getByLabelText(/minimum employees/i)
    await user.clear(minInput)
    await user.type(minInput, '0')

    // Try to save
    const saveButton = screen.getByRole('button', { name: /update/i })
    await user.click(saveButton)

    // Verify validation message
    await waitFor(() => {
      expect(screen.getByText(/minimum employees must be at least 1/i)).toBeInTheDocument()
    })
  })

  it('maintains accessibility standards', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockStaffingRequirements,
            error: null
          })
        })
      }),
      auth: {
        getUser: jest.fn()
      }
    }
    ;(createBrowserClient as jest.Mock).mockReturnValue(mockSupabase)

    render(<StaffingRequirementsTable isManager={true} />)

    await waitFor(() => {
      expect(screen.getByText('Morning')).toBeInTheDocument()
    })

    // Check table headers
    expect(screen.getByRole('columnheader', { name: /period/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /time/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /min staff/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /supervisor/i })).toBeInTheDocument()

    // Check cell labels for first row
    expect(screen.getByRole('cell', { name: /period name for morning shift/i })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: /time range for morning shift/i })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: /minimum staff required for morning shift/i })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: /supervisor requirement for morning shift/i })).toBeInTheDocument()
  })
}) 