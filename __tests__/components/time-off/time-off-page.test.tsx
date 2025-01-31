import '@testing-library/jest-dom'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TimeOffPage from '@/app/time-off/page'
import { useUser } from '@/lib/hooks'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { mockSupabaseClient } from '@/__tests__/utils/test-utils'

// Mock useUser hook
jest.mock('@/lib/hooks', () => ({
  useUser: jest.fn()
}))

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn()
}))

const mockTimeOffRequests = [
  {
    id: '1',
    employee_id: 'test-user-id',
    start_date: '2024-03-15',
    end_date: '2024-03-20',
    reason: 'Vacation',
    status: 'Pending',
    employee: {
      id: 'test-user-id',
      first_name: 'Employee',
      last_name: 'One',
      email: 'test@example.com'
    }
  }
]

describe('TimeOffPage', () => {
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

  const user = userEvent.setup()

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Mock useUser to return a user and not loading
    ;(useUser as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false
    })

    // Mock Supabase client
    const mockClient = {
      ...mockSupabaseClient,
      rpc: jest.fn().mockResolvedValue({ data: mockTimeOffRequests, error: null })
    }
    ;(createClient as jest.Mock).mockReturnValue(mockClient)
  })

  it('renders the page title and request time off button', async () => {
    render(<TimeOffPage />)

    // Wait for loading state to resolve
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { name: /time off/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /request time off/i })).toBeInTheDocument()
  })

  it('displays time off requests with correct status tabs', async () => {
    render(<TimeOffPage />)

    // Wait for loading state to resolve
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })

    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /pending/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /approved/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /declined/i })).toBeInTheDocument()
  })

  it('filters requests by status when changing tabs', async () => {
    render(<TimeOffPage />)

    // Wait for loading state to resolve
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })

    await user.click(screen.getByRole('tab', { name: /approved/i }))
    expect(screen.getByText(/no approved requests found/i)).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /declined/i }))
    expect(screen.getByText(/no declined requests found/i)).toBeInTheDocument()
  })

  it('handles loading state', () => {
    ;(useUser as jest.Mock).mockReturnValue({
      user: null,
      loading: true
    })
    render(<TimeOffPage />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('handles error state when fetching requests fails', async () => {
    const errorClient = {
      ...mockSupabaseClient,
      rpc: jest.fn().mockResolvedValue({ data: null, error: new Error('Failed to fetch') })
    }
    ;(createClient as jest.Mock).mockReturnValue(errorClient)

    render(<TimeOffPage />)

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch time off requests/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has correct ARIA labels and roles', async () => {
      render(<TimeOffPage />)
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      expect(screen.getByRole('tablist', { name: /filter time off requests/i })).toBeInTheDocument()
    })

    it('maintains focus management when opening dialog', async () => {
      render(<TimeOffPage />)
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      const requestButton = screen.getByRole('button', { name: /request time off/i })
      await act(async () => {
        await userEvent.click(requestButton)
      })

      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog).toBeInTheDocument()
        const closeButton = screen.getByRole('button', { name: /close/i })
        expect(closeButton).toBeInTheDocument()
        const focusedElement = document.activeElement
        expect(focusedElement).toBe(closeButton)
      }, { timeout: 1000 })
    })
  })
}) 