import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TimeOffPage from '@/app/time-off/page'
import { createBrowserClient } from '@supabase/ssr'
import { useUser } from '@/lib/hooks'
import { createClient } from '@supabase/supabase-js'

// Mock hooks
jest.mock('@/lib/hooks', () => ({
  useUser: jest.fn(),
}))

// Mock toast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Mock Supabase client
const mockRequests = [
  {
    id: '1',
    type: 'Vacation',
    status: 'Pending',
    start_date: '2024-03-01',
    end_date: '2024-03-05',
    notes: 'Taking a break',
    employee_id: 'emp1',
    reviewed_by: null,
    reviewed_at: null,
    submitted_at: '2024-02-20',
    created_at: '2024-02-20',
    updated_at: '2024-02-20'
  }
]

const mockProfiles = [
  {
    id: 'emp1',
    full_name: 'Employee One'
  }
]

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: mockRequests, error: null })),
        in: jest.fn(() => Promise.resolve({ data: mockProfiles, error: null }))
      }))
    }))
  }))
}))

// Mock fetch for user data
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { id: 'emp1', email: 'employee1@example.com' }
    ])
  })
) as jest.Mock

describe('TimeOffPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock authenticated user
    ;(useUser as jest.Mock).mockReturnValue({
      user: { id: 'mgr1', email: 'manager1@test.com' },
      isLoading: false,
    })
  })

  it('renders the page title and request time off button', async () => {
    render(<TimeOffPage />)

    await waitFor(() => {
      expect(screen.getByText('Time Off')).toBeInTheDocument()
      expect(screen.getByText(/view and manage time off requests/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /request time off/i })).toBeInTheDocument()
    })
  })

  it('displays time off requests with correct status tabs', async () => {
    render(<TimeOffPage />)

    await waitFor(() => {
      // Check tabs
      expect(screen.getByRole('tab', { name: /pending/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /approved/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /declined/i })).toBeInTheDocument()

      // Check request details
      expect(screen.getByText('Employee One')).toBeInTheDocument()
      expect(screen.getByText('Taking a break')).toBeInTheDocument()
    })
  })

  it('filters requests by status when changing tabs', async () => {
    const user = userEvent.setup()
    render(<TimeOffPage />)

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Employee One')).toBeInTheDocument()
    })

    // Click Approved tab
    await user.click(screen.getByRole('tab', { name: /approved/i }))

    // Should only show approved requests
    expect(screen.queryByText('Taking a break')).not.toBeInTheDocument() // Pending request
  })

  it('opens time off request dialog when clicking request button', async () => {
    const user = userEvent.setup()
    render(<TimeOffPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /request time off/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /request time off/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/submit a request for time off/i)).toBeInTheDocument()
  })

  it('handles loading state', () => {
    // Mock loading state
    ;(useUser as jest.Mock).mockReturnValue({
      user: null,
      isLoading: true,
    })

    render(<TimeOffPage />)

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('handles error state when fetching requests fails', async () => {
    // Mock error response
    jest.mocked(createClient).mockImplementationOnce(() => ({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.reject(new Error('Failed to fetch')))
        }))
      }))
    }))

    render(<TimeOffPage />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load time off requests. Please try again.')).toBeInTheDocument()
    })
  })

  it('handles unauthorized access', async () => {
    // Mock no user being present
    jest.mocked(useUser).mockReturnValue({ user: null, loading: false })
    
    render(<TimeOffPage />)
    
    expect(screen.getByText('Please sign in to view time off requests')).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    it('has correct ARIA labels and roles', async () => {
      render(<TimeOffPage />)

      await waitFor(() => {
        // Check tab list accessibility
        expect(screen.getByRole('tablist')).toHaveAttribute('aria-label', 'Filter time off requests')
        
        // Check individual tabs
        const pendingTab = screen.getByRole('tab', { name: /pending/i })
        expect(pendingTab).toHaveAttribute('aria-selected', 'true')
        
        // Check request cards
        const requests = screen.getAllByRole('article')
        requests.forEach(request => {
          expect(request).toHaveAttribute('aria-labelledby')
        })
      })
    })

    it('maintains focus management when opening dialog', async () => {
      const user = userEvent.setup()
      render(<TimeOffPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /request time off/i })).toBeInTheDocument()
      })

      // Open dialog
      await user.click(screen.getByRole('button', { name: /request time off/i }))

      // First focusable element should be the start date input
      await waitFor(() => {
        expect(screen.getByLabelText(/start date/i)).toHaveFocus()
      })

      // Tab should move to end date input
      await user.tab()
      expect(screen.getByLabelText(/end date/i)).toHaveFocus()
    })
  })
}) 