import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StaffingRequirementsTable } from '@/app/staffing/staffing-requirements-table'
import { createBrowserClient } from '@supabase/ssr'

// Mock Supabase client
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn((url: string, key: string) => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: mockStaffingRequirements, error: null }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  }))
}))

// Mock data matching current schema
const mockStaffingRequirements = [
  {
    id: '1',
    period_name: 'Early Morning',
    start_time: '05:00',
    end_time: '09:00',
    min_employees: 6,
    max_employees: 8,
    requires_supervisor: true,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z'
  },
  {
    id: '2',
    period_name: 'Day',
    start_time: '09:00',
    end_time: '21:00',
    min_employees: 8,
    max_employees: 10,
    requires_supervisor: true,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z'
  }
]

describe('StaffingRequirementsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the staffing requirements table', async () => {
    render(<StaffingRequirementsTable isManager={false} />)

    await waitFor(() => {
      // Check table headers
      expect(screen.getByText('Period')).toBeInTheDocument()
      expect(screen.getByText('Time')).toBeInTheDocument()
      expect(screen.getByText('Min Staff')).toBeInTheDocument()
      expect(screen.getByText('Supervisor')).toBeInTheDocument()
    })

    // Check data rows
    expect(screen.getByText('Early Morning')).toBeInTheDocument()
    expect(screen.getByText('5:00 AM - 9:00 AM')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('shows loading state while fetching data', async () => {
    // Mock loading state
    ;(createBrowserClient as jest.Mock).mockImplementationOnce((url: string, key: string) => ({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => new Promise(() => {})) // Never resolves
        }))
      }))
    }))

    render(<StaffingRequirementsTable isManager={false} />)
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows error state when fetch fails', async () => {
    // Mock error state
    ;(createBrowserClient as jest.Mock).mockImplementationOnce(() => ({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: null, error: new Error('Failed to fetch') }))
        }))
      }))
    }))

    render(<StaffingRequirementsTable isManager={false} />)

    await waitFor(() => {
      expect(screen.getByText('Error loading staffing requirements')).toBeInTheDocument()
    })
  })

  it('allows managers to edit requirements', async () => {
    const user = userEvent.setup()
    render(<StaffingRequirementsTable isManager={true} />)

    await waitFor(() => {
      expect(screen.getByText('Early Morning')).toBeInTheDocument()
    })

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit early morning requirement/i })
    await user.click(editButton)

    // Edit minimum employees
    const minInput = screen.getByLabelText(/minimum employees/i)
    await user.clear(minInput)
    await user.type(minInput, '4')

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    // Verify API call
    expect(createBrowserClient).toHaveBeenCalledWith(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const mockClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    expect(mockClient.from('staffing_requirements').update).toHaveBeenCalledWith({
      min_employees: 4
    })
  })

  it('allows managers to delete requirements', async () => {
    const user = userEvent.setup()
    render(<StaffingRequirementsTable isManager={true} />)

    await waitFor(() => {
      expect(screen.getByText('Early Morning')).toBeInTheDocument()
    })

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete early morning requirement/i })
    await user.click(deleteButton)

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete/i })
    await user.click(confirmButton)

    // Verify API call
    expect(createBrowserClient).toHaveBeenCalledWith(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const mockClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    expect(mockClient.from('staffing_requirements').delete().eq).toHaveBeenCalledWith('id', '1')
  })

  it('validates minimum employees is greater than 0', async () => {
    const user = userEvent.setup()
    render(<StaffingRequirementsTable isManager={true} />)

    await waitFor(() => {
      expect(screen.getByText('Early Morning')).toBeInTheDocument()
    })

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit early morning requirement/i })
    await user.click(editButton)

    // Try invalid value
    const minInput = screen.getByLabelText(/minimum employees/i)
    await user.clear(minInput)
    await user.type(minInput, '0')

    // Try to save
    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    // Verify validation message
    expect(screen.getByText(/minimum employees must be at least 1/i)).toBeInTheDocument()
  })

  it('maintains accessibility standards', async () => {
    render(<StaffingRequirementsTable isManager={true} />)

    await waitFor(() => {
      expect(screen.getByText('Early Morning')).toBeInTheDocument()
    })

    // Check table structure
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('rowgroup', { name: /table header/i })).toBeInTheDocument()
    expect(screen.getByRole('rowgroup', { name: /table body/i })).toBeInTheDocument()

    // Check cell labels
    expect(screen.getByRole('cell', { name: /period name/i })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: /time range/i })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: /minimum staff required/i })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: /supervisor requirement/i })).toBeInTheDocument()

    // Check button labels
    const editButton = screen.getByRole('button', { name: /edit early morning requirement/i })
    expect(editButton).toBeInTheDocument()
    expect(editButton).toHaveAttribute('aria-label')
  })
}) 