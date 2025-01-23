import '@testing-library/jest-dom'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShiftsPage from '@/app/shifts/page'
import { createClient } from '@/utils/supabase/client'

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
    }
  }
}

// Define types for mocked data
type ShiftType = {
  id: string
  name: string
  description: string
  shifts: {
    id: string
    shift_type_id: string
    start_time: string
    end_time: string
    duration_hours: number
    duration_category: string
  }[]
}

type MockResponse<T> = {
  data: T | null
  error: Error | null
}

const mockShiftTypes: ShiftType[] = [
  {
    id: '1',
    name: 'Early Shift',
    description: 'Early morning shift',
    shifts: [
      {
        id: '1',
        shift_type_id: '1',
        start_time: '05:00',
        end_time: '09:00',
        duration_hours: 4,
        duration_category: '4_HOURS'
      },
    ],
  },
  {
    id: '2',
    name: 'Day Shift',
    description: 'Day time shift',
    shifts: [
      {
        id: '2',
        shift_type_id: '2',
        start_time: '09:00',
        end_time: '19:00',
        duration_hours: 10,
        duration_category: '10_HOURS'
      },
    ],
  },
]

// Mock the Supabase client
const mockEq = jest.fn().mockResolvedValue({ data: null, error: null })
const mockDelete = jest.fn().mockReturnValue({ eq: mockEq })
const mockOrder = jest.fn().mockResolvedValue({ data: mockShiftTypes, error: null })
const mockSelect = jest.fn().mockReturnValue({ order: mockOrder })

const mockSupabase = {
  from: jest.fn().mockReturnValue({
    select: mockSelect,
    delete: mockDelete,
  })
}

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabase),
}))

describe('ShiftsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the page title and description', async () => {
    render(<ShiftsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Shift Templates')).toBeInTheDocument()
      expect(screen.getByText('Manage your shift templates and schedules')).toBeInTheDocument()
    })
  })

  it('displays loading state initially', async () => {
    render(<ShiftsPage />)
    
    const loadingSpinner = screen.getByTestId('loading-spinner')
    expect(loadingSpinner).toBeInTheDocument()
    expect(loadingSpinner.querySelector('svg')).toHaveClass('animate-spin')
  })

  it('loads and displays shift types with their shifts', async () => {
    render(<ShiftsPage />)

    // Wait for data to load
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('shift_types')
    })

    // Verify early shift section
    const earlyShiftSection = screen.getByText('Early Shift').closest('.space-y-4') as HTMLElement
    expect(within(earlyShiftSection).getByText('4_HOURS')).toBeInTheDocument()
    expect(within(earlyShiftSection).getByText('5:00 AM - 9:00 AM')).toBeInTheDocument()

    // Verify day shift section
    const dayShiftSection = screen.getByText('Day Shift').closest('.space-y-4') as HTMLElement
    expect(within(dayShiftSection).getByText('10_HOURS')).toBeInTheDocument()
    expect(within(dayShiftSection).getByText('9:00 AM - 7:00 PM')).toBeInTheDocument()
  })

  it('handles shift deletion', async () => {
    const user = userEvent.setup()
    render(<ShiftsPage />)

    // Wait for data to load
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('shift_types')
    })

    // Find and click delete button in early shift section
    const earlyShiftSection = screen.getByText('Early Shift').closest('.space-y-4') as HTMLElement
    const deleteButton = within(earlyShiftSection).getByRole('button', { name: /delete/i })
    await user.click(deleteButton)

    // Verify delete operation
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('shifts')
      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', '1')
    })
  })

  it('opens the dialog for creating a new shift', async () => {
    const user = userEvent.setup()
    render(<ShiftsPage />)

    // Wait for data to load
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('shift_types')
    })

    // Click the new shift template button
    const newButton = screen.getByRole('button', { name: /new shift template/i })
    await user.click(newButton)

    // Verify dialog is opened
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Create Shift Template')).toBeInTheDocument()
  })

  it('opens the dialog for editing a shift', async () => {
    const user = userEvent.setup()
    render(<ShiftsPage />)

    // Wait for data to load
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('shift_types')
    })

    // Find and click edit button for the first shift
    const earlyShiftSection = screen.getByText('Early Shift').closest('.space-y-4') as HTMLElement
    const editButton = within(earlyShiftSection).getByRole('button', { name: /edit/i })
    await user.click(editButton)

    // Verify dialog is opened in edit mode
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Edit Shift Template')).toBeInTheDocument()
  })

  it('displays error state when API call fails', async () => {
    // Mock API error
    mockSupabase.from.mockImplementationOnce(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve<MockResponse<ShiftType[]>>({ data: null, error: new Error('API Error') })),
      })),
      delete: mockDelete,
    }))

    render(<ShiftsPage />)

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Error: API Error')).toBeInTheDocument()
    })
  })
}) 