import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navigation } from '@/components/navigation'
import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { cleanupAfterEach } from '../test-utils'

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
    // Start with employee role
    const mockClient = createDefaultMockClient('Employee')
    jest.mocked(createBrowserClient).mockImplementation(() => mockClient)
    
    const { rerender } = renderWithErrorBoundary(<Navigation />)
    
    // Wait for initial render and role check
    await waitFor(() => {
      expect(screen.queryByText('Employees')).not.toBeInTheDocument()
    }, { timeout: TEST_TIMEOUT })

    // Mock as manager and trigger auth state change
    const newMockClient = createDefaultMockClient('Manager')
    jest.mocked(createBrowserClient).mockImplementation(() => newMockClient)

    // Re-render with new client
    rerender(
      <ErrorBoundary>
        <React.Suspense fallback={<div>Loading...</div>}>
          <Navigation />
        </React.Suspense>
      </ErrorBoundary>
    )

    // Wait for loading state to finish and role to be set
    await waitFor(() => {
      expect(screen.getByText('Employees')).toBeInTheDocument()
    }, { timeout: TEST_TIMEOUT })
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
      jest.mocked(createBrowserClient).mockImplementation(() => ({
        auth: {
          getUser: jest.fn(() => createMockPromise(
            { user: null },
            new Error('Auth error')
          )),
          signOut: jest.fn(),
          onAuthStateChange: jest.fn((callback) => {
            callback('SIGNED_OUT', { user: null })
            return { data: { subscription: { unsubscribe: jest.fn() } }, error: null }
          })
        },
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
      const mockClient = createDefaultMockClient('Admin')
      jest.mocked(createBrowserClient).mockImplementation(() => mockClient)
      
      renderWithErrorBoundary(<Navigation />)
      
      await waitFor(() => {
        expect(screen.getByText('Employees')).toBeInTheDocument()
      }, { timeout: TEST_TIMEOUT })
    })

    it('shows Employees link for Supervisor role', async () => {
      const mockClient = createDefaultMockClient('Supervisor')
      jest.mocked(createBrowserClient).mockImplementation(() => mockClient)
      
      renderWithErrorBoundary(<Navigation />)
      
      await waitFor(() => {
        expect(screen.getByText('Employees')).toBeInTheDocument()
      }, { timeout: TEST_TIMEOUT })
    })

    it('handles role change from Manager to Employee', async () => {
      // Start with manager role
      const mockClient = createDefaultMockClient('Manager')
      jest.mocked(createBrowserClient).mockImplementation(() => mockClient)
      
      const { rerender } = renderWithErrorBoundary(<Navigation />)
      
      await waitFor(() => {
        expect(screen.getByText('Employees')).toBeInTheDocument()
      }, { timeout: TEST_TIMEOUT })

      // Change to employee role
      const newMockClient = createDefaultMockClient('Employee')
      jest.mocked(createBrowserClient).mockImplementation(() => newMockClient)

      rerender(
        <ErrorBoundary>
          <React.Suspense fallback={<div>Loading...</div>}>
            <Navigation />
          </React.Suspense>
        </ErrorBoundary>
      )

      await waitFor(() => {
        expect(screen.queryByText('Employees')).not.toBeInTheDocument()
      }, { timeout: TEST_TIMEOUT })
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
      // Add delay to role fetch
      const mockClient = createDefaultMockClient('Manager')
      mockClient.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(() => createMockPromise({ user_role: 'Manager' }, null, 500)), // Longer delay
      }))
      jest.mocked(createBrowserClient).mockImplementation(() => mockClient)

      renderWithErrorBoundary(<Navigation />)
      
      // Initially, Employees link should not be visible while loading
      expect(screen.queryByText('Employees')).not.toBeInTheDocument()

      // After loading, Employees link should appear
      await waitFor(() => {
        expect(screen.getByText('Employees')).toBeInTheDocument()
      }, { timeout: TEST_TIMEOUT })
    })
  })
}) 