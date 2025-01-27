import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navigation } from '@/components/navigation'
import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { cleanupAfterEach } from '../test-utils'
import { createMockErrorToast, mockToast } from '@/lib/test-utils'
import { useRoleAccess } from '@/hooks/useRoleAccess'

// Constants for timeouts
const TEST_TIMEOUT = 15000
const MOCK_DELAY = 100

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  })),
}))

// Mock Supabase client with better error handling
const createMockPromise = (data: any, error: any = null, delay = MOCK_DELAY) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data, error }), delay)
  })
}

// Default mock implementation
const createDefaultMockClient = (role = 'Employee') => ({
  auth: {
    getUser: jest.fn(() => createMockPromise({
      user: { id: '123', email: 'test@example.com', user_metadata: { role } }
    })),
    signOut: jest.fn(() => createMockPromise(null)),
    onAuthStateChange: jest.fn((callback) => {
      callback('SIGNED_IN', {
        user: { id: '123', email: 'test@example.com', user_metadata: { role } }
      })
      return { data: { subscription: { unsubscribe: jest.fn() } }, error: null }
    })
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(() => createMockPromise({ user_role: role })),
  })),
})

// Mock Supabase client
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => createDefaultMockClient()),
}))

// Mock the useRoleAccess hook
jest.mock('@/hooks/useRoleAccess')
const mockUseRoleAccess = useRoleAccess as jest.MockedFunction<typeof useRoleAccess>

// Mock the useToast hook
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}))

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>
    }
    return this.props.children
  }
}

describe('Navigation', () => {
  // Modern cleanup after each test
  cleanupAfterEach()

  // Modern user event setup
  const user = userEvent.setup({
    delay: null,
    pointerEventsCheck: 0
  })

  const mockPathname = '/schedule'

  beforeEach(() => {
    jest.clearAllMocks()
    ;(usePathname as jest.Mock).mockReturnValue(mockPathname)
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost:3000' },
      writable: true,
    })
    jest.mocked(createBrowserClient).mockImplementation(() => createDefaultMockClient())
    // Default mock implementation for useRoleAccess
    mockUseRoleAccess.mockReturnValue({
      role: 'employee',
      isLoading: false,
      error: null
    })
  })

  const renderWithErrorBoundary = (ui: React.ReactElement) => {
    return render(
      <ErrorBoundary>
        <React.Suspense fallback={<div>Loading...</div>}>
          {ui}
        </React.Suspense>
      </ErrorBoundary>
    )
  }

  it('renders main navigation links', async () => {
    renderWithErrorBoundary(<Navigation />)
    
    await waitFor(() => {
      expect(screen.getByText('911 Dispatch')).toBeInTheDocument()
      expect(screen.getByText('Schedule')).toBeInTheDocument()
      expect(screen.getByText('Shifts')).toBeInTheDocument()
      expect(screen.getByText('Time Off')).toBeInTheDocument()
      expect(screen.getByText('Staffing Requirements')).toBeInTheDocument()
    }, { timeout: TEST_TIMEOUT })
  })

  it('highlights the active link based on pathname', async () => {
    renderWithErrorBoundary(<Navigation />)
    
    await waitFor(() => {
      const activeLink = screen.getByText('Schedule')
      expect(activeLink.closest('a')).toHaveClass('bg-gray-900')
      
      const inactiveLink = screen.getByText('Shifts')
      expect(inactiveLink.closest('a')).not.toHaveClass('bg-gray-900')
    }, { timeout: TEST_TIMEOUT })
  })

  it('shows Employees link only for managers and admins', async () => {
    mockUseRoleAccess.mockReturnValue({
      role: 'manager',
      isLoading: false,
      error: null
    })

    render(<Navigation />)

    await waitFor(() => {
      const employeesLink = screen.queryByRole('link', { name: /employees/i })
      expect(employeesLink).toBeInTheDocument()
    })
  })

  it('handles sign out', async () => {
    const mockSignOut = jest.fn(() => createMockPromise(null))
    jest.mocked(createBrowserClient).mockImplementation(() => ({
      ...createDefaultMockClient(),
      auth: {
        ...createDefaultMockClient().auth,
        signOut: mockSignOut,
      }
    }))

    renderWithErrorBoundary(<Navigation />)
    
    await waitFor(() => {
      expect(screen.getByText('Sign Out')).toBeInTheDocument()
    }, { timeout: TEST_TIMEOUT })

    await user.click(screen.getByText('Sign Out'))
    
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
      expect(window.location.href).toBe('/')
    }, { timeout: TEST_TIMEOUT })
  })

  it('applies custom className', async () => {
    renderWithErrorBoundary(<Navigation className="custom-class" />)
    
    await waitFor(() => {
      const nav = screen.getByRole('navigation').parentElement
      expect(nav).toHaveClass('custom-class')
    }, { timeout: TEST_TIMEOUT })
  })

  describe('Error Handling', () => {
    it('handles auth error gracefully', async () => {
      mockUseRoleAccess.mockReturnValue({
        role: null,
        isLoading: false,
        error: new Error('Auth error')
      })

      render(<Navigation />)
      
      await waitFor(() => {
        expect(screen.getByText('911 Dispatch')).toBeInTheDocument()
        const signInLink = screen.getByRole('link', { name: /sign in/i })
        expect(signInLink).toBeInTheDocument()
        expect(mockToast).toHaveBeenCalledWith(
          createMockErrorToast('Error loading user role')
        )
      })
    })

    it('handles database error gracefully', async () => {
      jest.mocked(createBrowserClient).mockImplementation(() => ({
        ...createDefaultMockClient(),
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn(() => createMockPromise(
            null,
            new Error('Database error')
          )),
        })),
      }))

      renderWithErrorBoundary(<Navigation />)
      
      await waitFor(() => {
        expect(screen.getByText('911 Dispatch')).toBeInTheDocument()
        expect(screen.getByText('Schedule')).toBeInTheDocument()
      }, { timeout: TEST_TIMEOUT })
    })
  })

  describe('Accessibility', () => {
    it('has sufficient color contrast', async () => {
      renderWithErrorBoundary(<Navigation />)
      
      await waitFor(() => {
        const links = screen.getAllByRole('link')
        // Filter out the logo link and get only non-active links
        const navLinks = links.filter(link => 
          !link.textContent?.includes('911 Dispatch') && 
          !link.className.includes('bg-gray-900')
        )
        navLinks.forEach(link => {
          expect(link).toHaveClass('text-gray-300')
        })
      }, { timeout: TEST_TIMEOUT })
    })

    it('has proper focus indicators', async () => {
      renderWithErrorBoundary(<Navigation />)
      
      await waitFor(() => {
        const links = screen.getAllByRole('link')
        // Filter out the logo link and get only non-active links
        const navLinks = links.filter(link => 
          !link.textContent?.includes('911 Dispatch') && 
          !link.className.includes('bg-gray-900')
        )
        navLinks.forEach(link => {
          expect(link).toHaveClass('hover:bg-gray-700')
        })
      }, { timeout: TEST_TIMEOUT })
    })
  })

  describe('Role-based Access', () => {
    it('shows Employees link for Admin role', async () => {
      mockUseRoleAccess.mockReturnValue({
        role: 'admin',
        isLoading: false,
        error: null
      })

      render(<Navigation />)
      
      await waitFor(() => {
        const employeesLink = screen.queryByRole('link', { name: /employees/i })
        expect(employeesLink).toBeInTheDocument()
      })
    })

    it('shows Employees link for Supervisor role', async () => {
      mockUseRoleAccess.mockReturnValue({
        role: 'supervisor',
        isLoading: false,
        error: null
      })

      render(<Navigation />)
      
      await waitFor(() => {
        const employeesLink = screen.queryByRole('link', { name: /employees/i })
        expect(employeesLink).toBeInTheDocument()
      })
    })

    it('handles role change from Manager to Employee', async () => {
      // Start with manager role
      mockUseRoleAccess.mockReturnValue({
        role: 'manager',
        isLoading: false,
        error: null
      })

      const { rerender } = render(<Navigation />)
      
      await waitFor(() => {
        const employeesLink = screen.queryByRole('link', { name: /employees/i })
        expect(employeesLink).toBeInTheDocument()
      })

      // Change to employee role
      mockUseRoleAccess.mockReturnValue({
        role: 'employee',
        isLoading: false,
        error: null
      })

      rerender(<Navigation />)

      await waitFor(() => {
        const employeesLink = screen.queryByRole('link', { name: /employees/i })
        expect(employeesLink).not.toBeInTheDocument()
      })
    })
  })

  describe('Navigation Behavior', () => {
    it('handles multiple rapid sign out clicks', async () => {
      const mockSignOut = jest.fn(() => createMockPromise(null))
      jest.mocked(createBrowserClient).mockImplementation(() => ({
        ...createDefaultMockClient(),
        auth: {
          ...createDefaultMockClient().auth,
          signOut: mockSignOut,
        }
      }))

      renderWithErrorBoundary(<Navigation />)
      
      await waitFor(() => {
        expect(screen.getByText('Sign Out')).toBeInTheDocument()
      }, { timeout: TEST_TIMEOUT })

      // Click sign out multiple times rapidly
      const signOutButton = screen.getByText('Sign Out')
      await user.click(signOutButton)
      await user.click(signOutButton)
      await user.click(signOutButton)
      
      await waitFor(() => {
        // Should only be called once despite multiple clicks
        expect(mockSignOut).toHaveBeenCalledTimes(1)
        expect(window.location.href).toBe('/')
      }, { timeout: TEST_TIMEOUT })
    })

    it('updates active link when pathname changes', async () => {
      renderWithErrorBoundary(<Navigation />)
      
      await waitFor(() => {
        const scheduleLink = screen.getByText('Schedule')
        expect(scheduleLink.closest('a')).toHaveClass('bg-gray-900')
      }, { timeout: TEST_TIMEOUT })

      // Change pathname
      ;(usePathname as jest.Mock).mockReturnValue('/shifts')

      await waitFor(() => {
        const shiftsLink = screen.getByText('Shifts')
        expect(shiftsLink.closest('a')).toHaveClass('bg-gray-900')
        const scheduleLink = screen.getByText('Schedule')
        expect(scheduleLink.closest('a')).not.toHaveClass('bg-gray-900')
      }, { timeout: TEST_TIMEOUT })
    })
  })

  describe('Loading States', () => {
    it('shows loading state while fetching user role', async () => {
      // Start with loading state
      mockUseRoleAccess.mockReturnValue({
        role: null,
        isLoading: true,
        error: null
      })

      render(<Navigation />)
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument()

      // Update to loaded state
      mockUseRoleAccess.mockReturnValue({
        role: 'manager',
        isLoading: false,
        error: null
      })

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
        const employeesLink = screen.queryByRole('link', { name: /employees/i })
        expect(employeesLink).toBeInTheDocument()
      })
    })
  })
}) 