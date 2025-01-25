import '@testing-library/jest-dom'
import { render, screen, waitFor, within, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShiftsPage from '@/app/shifts/page'
import { createClient } from '@/utils/supabase/client'
import { ShiftTemplateDialog } from '@/components/shifts/shift-template-dialog'

// Constants for timeouts
const TEST_TIMEOUT = 5000
const MOCK_DELAY = 5
const ANIMATION_DELAY = 50

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

// Helper function to create mock promise with delay
const createMockPromise = <T,>(data: T, delay = MOCK_DELAY): Promise<MockResponse<T>> => {
  return Promise.resolve({ data, error: null })
}

// Mock the Supabase client
const mockSupabase = {
  from: jest.fn().mockImplementation((table) => {
    // For shift types table, return the complete data structure
    if (table === 'shift_types') {
      return {
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue(Promise.resolve({ data: mockShiftTypes, error: null }))
        })
      }
    }
    // For shifts table, return delete operation
    if (table === 'shifts') {
      return {
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue(Promise.resolve({ data: null, error: null }))
        }),
        insert: jest.fn().mockReturnValue(Promise.resolve({ data: null, error: null })),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue(Promise.resolve({ data: null, error: null }))
        })
      }
    }
    // For other tables, return the standard mock
    return {
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue(Promise.resolve({ data: mockShiftTypes, error: null }))
      })
    }
  })
}

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabase),
}))

// Mock Radix Dialog
jest.mock('@radix-ui/react-dialog', () => ({
  Root: ({ open, children }: { open: boolean; children: React.ReactNode }) => {
    if (!open) return null
    return children
  },
  Portal: ({ children }: { children: React.ReactNode }) => children,
  Overlay: ({ children }: { children: React.ReactNode }) => children,
  Content: ({ children }: { children: React.ReactNode }) => (
    <div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      {children}
    </div>
  ),
  Title: ({ children }: { children: React.ReactNode }) => (
    <h2 id="dialog-title">{children}</h2>
  ),
  Description: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  Close: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}))

// Mock the Dialog component
jest.mock('@/components/ui/dialog', () => {
  const RadixDialog = jest.requireMock('@radix-ui/react-dialog')
  return {
    Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) => (
      <RadixDialog.Root open={open}>{children}</RadixDialog.Root>
    ),
    DialogContent: ({ children }: { children: React.ReactNode }) => (
      <RadixDialog.Portal>
        <RadixDialog.Overlay />
        <RadixDialog.Content>{children}</RadixDialog.Content>
      </RadixDialog.Portal>
    ),
    DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogTitle: ({ children }: { children: React.ReactNode }) => (
      <RadixDialog.Title>{children}</RadixDialog.Title>
    ),
    DialogDescription: ({ children }: { children: React.ReactNode }) => (
      <RadixDialog.Description>{children}</RadixDialog.Description>
    ),
    DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  }
})

// Mock the ShiftTemplateDialog component
jest.mock('@/components/shifts/shift-template-dialog', () => ({
  ShiftTemplateDialog: ({ open, onOpenChange, shift, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; shift?: any; onSuccess?: () => void }) => {
    const Dialog = jest.requireMock('@/components/ui/dialog').Dialog
    const DialogContent = jest.requireMock('@/components/ui/dialog').DialogContent
    const DialogHeader = jest.requireMock('@/components/ui/dialog').DialogHeader
    const DialogTitle = jest.requireMock('@/components/ui/dialog').DialogTitle
    const DialogDescription = jest.requireMock('@/components/ui/dialog').DialogDescription
    const DialogFooter = jest.requireMock('@/components/ui/dialog').DialogFooter

    return (
      <Dialog open={open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{shift ? 'Edit Shift Template' : 'Create Shift Template'}</DialogTitle>
            <DialogDescription>
              {shift ? 'Update the' : 'Add a new'} shift template for scheduling.
            </DialogDescription>
          </DialogHeader>
          <form>
            <DialogFooter>
              <button type="button" onClick={() => onOpenChange(false)}>Cancel</button>
              <button type="submit" onClick={() => {
                onSuccess?.()
                onOpenChange(false)
              }}>
                {shift ? 'Update' : 'Create'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )
  }
}))

// Mock userEvent
jest.mock('@testing-library/user-event', () => ({
  __esModule: true,
  default: {
    setup: () => ({
      click: jest.fn().mockImplementation(async (element) => {
        // Simulate click event
        const event = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
        })
        element.dispatchEvent(event)
        // Return resolved promise
        return Promise.resolve()
      })
    })
  }
}))

describe('ShiftsPage', () => {
  // Remove fake timers setup
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('renders the page title and description', async () => {
    render(<ShiftsPage />)
    
    await waitFor(
      () => {
        expect(screen.getByText('Shift Templates')).toBeInTheDocument()
        expect(screen.getByText('Manage your shift templates and schedules')).toBeInTheDocument()
      },
      { timeout: TEST_TIMEOUT }
    )
  })

  it('displays loading state initially', async () => {
    render(<ShiftsPage />)
    
    await waitFor(
      () => {
        const loadingSpinner = screen.getByTestId('loading-spinner')
        expect(loadingSpinner).toBeInTheDocument()
        expect(loadingSpinner.querySelector('svg')).toHaveClass('animate-spin')
      },
      { timeout: TEST_TIMEOUT }
    )
  })

  it('loads and displays shift types with their shifts', async () => {
    render(<ShiftsPage />)

    // Wait for data to load
    await waitFor(
      () => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      },
      { timeout: TEST_TIMEOUT }
    )

    // Verify early shift section
    await waitFor(
      () => {
        const earlyShiftSection = screen.getByText('Early Shift').closest('.space-y-4') as HTMLElement
        expect(within(earlyShiftSection).getByText('4_HOURS')).toBeInTheDocument()
        expect(within(earlyShiftSection).getByText('5:00 AM - 9:00 AM')).toBeInTheDocument()
      },
      { timeout: TEST_TIMEOUT }
    )

    // Verify day shift section
    await waitFor(
      () => {
        const dayShiftSection = screen.getByText('Day Shift').closest('.space-y-4') as HTMLElement
        expect(within(dayShiftSection).getByText('10_HOURS')).toBeInTheDocument()
        expect(within(dayShiftSection).getByText('9:00 AM - 7:00 PM')).toBeInTheDocument()
      },
      { timeout: TEST_TIMEOUT }
    )
  })

  it('handles shift deletion', async () => {
    const user = userEvent.setup()
    render(<ShiftsPage />)

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    }, { timeout: 1000 })

    // Find and click delete button
    const deleteButton = screen.getAllByText('Delete')[0]
    await user.click(deleteButton)

    // Verify delete was called
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('shifts')
    }, { timeout: 1000 })
  })

  it('opens the dialog for creating a new shift', async () => {
    const user = userEvent.setup()
    render(<ShiftsPage />)

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })

    // Click new shift button and wait for state update
    const newButton = screen.getByText(/New Shift Template/)
    await user.click(newButton)

    // Wait for dialog with more specific selector
    const dialog = await waitFor(() => screen.getByRole('dialog'))
    expect(dialog).toBeInTheDocument()
    
    // Verify dialog content
    expect(within(dialog).getByText(/Create Shift Template/)).toBeInTheDocument()
  })

  it('opens the dialog for editing a shift', async () => {
    const user = userEvent.setup()
    render(<ShiftsPage />)

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })

    // Click edit button and wait for state update
    const editButton = screen.getAllByText('Edit')[0]
    await user.click(editButton)

    // Wait for dialog with more specific selector
    const dialog = await waitFor(() => screen.getByRole('dialog'))
    expect(dialog).toBeInTheDocument()
    
    // Verify dialog content
    expect(within(dialog).getByText(/Edit Shift Template/)).toBeInTheDocument()
  })

  it('displays error state when API call fails', async () => {
    // Mock API error
    mockSupabase.from.mockImplementationOnce(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => createMockPromise(null, MOCK_DELAY).then(() => ({ 
          data: null, 
          error: new Error('API Error') 
        }))),
      })),
      delete: jest.fn().mockReturnValue({ eq: jest.fn().mockImplementation(() => createMockPromise(null)) }),
    }))

    render(<ShiftsPage />)

    // Wait for error to be displayed
    await waitFor(
      () => {
        expect(screen.getByText('Error: API Error')).toBeInTheDocument()
      },
      { timeout: TEST_TIMEOUT }
    )
  })
}) 