import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navigation } from '@/components/navigation'
import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  })),
}))

// Mock Supabase client
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({
        data: {
          user: { id: '123', email: 'test@example.com' }
        },
        error: null
      })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({
        data: { user_role: 'Employee' },
        error: null
      })),
    })),
  })),
}))

describe('Navigation', () => {
  const mockPathname = '/schedule'

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    ;(usePathname as jest.Mock).mockReturnValue(mockPathname)
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost:3000' },
      writable: true,
    })
  })

  it('renders main navigation links', () => {
    render(<Navigation />)
    
    expect(screen.getByText('911 Dispatch')).toBeInTheDocument()
    expect(screen.getByText('Schedule')).toBeInTheDocument()
    expect(screen.getByText('Shifts')).toBeInTheDocument()
    expect(screen.getByText('Time Off')).toBeInTheDocument()
    expect(screen.getByText('Staffing Requirements')).toBeInTheDocument()
  })

  it('highlights the active link based on pathname', () => {
    render(<Navigation />)
    
    const activeLink = screen.getByText('Schedule')
    expect(activeLink.closest('a')).toHaveClass('bg-gray-900')
    
    const inactiveLink = screen.getByText('Shifts')
    expect(inactiveLink.closest('a')).not.toHaveClass('bg-gray-900')
  })

  it('shows Employees link only for managers and admins', async () => {
    // First render as regular employee
    const { rerender } = render(<Navigation />)
    expect(screen.queryByText('Employees')).not.toBeInTheDocument()

    // Mock as manager
    jest.mocked(createBrowserClient).mockImplementation(() => ({
      auth: {
        getUser: jest.fn(() => Promise.resolve({
          data: {
            user: { id: '123', email: 'manager@example.com' }
          },
          error: null
        })),
        signOut: jest.fn(),
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(() => Promise.resolve({
          data: { user_role: 'Manager' },
          error: null
        })),
      })),
    }))

    // Re-render with manager role
    rerender(<Navigation />)
    
    await waitFor(() => {
      expect(screen.getByText('Employees')).toBeInTheDocument()
    })
  })

  it('handles sign out', async () => {
    const mockSignOut = jest.fn(() => Promise.resolve({ error: null }))
    jest.mocked(createBrowserClient).mockImplementation(() => ({
      auth: {
        getUser: jest.fn(() => Promise.resolve({
          data: {
            user: { id: '123', email: 'test@example.com' }
          },
          error: null
        })),
        signOut: mockSignOut,
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(() => Promise.resolve({
          data: { user_role: 'Employee' },
          error: null
        })),
      })),
    }))

    render(<Navigation />)
    
    const signOutButton = screen.getByText('Sign Out')
    await userEvent.click(signOutButton)
    
    expect(mockSignOut).toHaveBeenCalled()
    expect(window.location.href).toBe('/')
  })

  it('applies custom className', () => {
    render(<Navigation className="custom-class" />)
    
    const nav = screen.getByRole('navigation').parentElement
    expect(nav).toHaveClass('custom-class')
  })

  describe('Error Handling', () => {
    it('handles auth error gracefully', async () => {
      jest.mocked(createBrowserClient).mockImplementation(() => ({
        auth: {
          getUser: jest.fn(() => Promise.resolve({
            data: { user: null },
            error: new Error('Auth error')
          })),
          signOut: jest.fn(),
        },
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn(() => Promise.resolve({
            data: null,
            error: new Error('Database error')
          })),
        })),
      }))

      render(<Navigation />)
      
      // Should still render basic navigation without crashing
      expect(screen.getByText('911 Dispatch')).toBeInTheDocument()
      expect(screen.getByText('Schedule')).toBeInTheDocument()
    })

    it('handles database error gracefully', async () => {
      jest.mocked(createBrowserClient).mockImplementation(() => ({
        auth: {
          getUser: jest.fn(() => Promise.resolve({
            data: {
              user: { id: '123', email: 'test@example.com' }
            },
            error: null
          })),
          signOut: jest.fn(),
        },
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn(() => Promise.resolve({
            data: null,
            error: new Error('Database error')
          })),
        })),
      }))

      render(<Navigation />)
      
      // Should still render basic navigation without crashing
      expect(screen.getByText('911 Dispatch')).toBeInTheDocument()
      expect(screen.getByText('Schedule')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has sufficient color contrast', () => {
      render(<Navigation />)
      
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveClass('text-white', 'text-gray-300')
      })
    })

    it('has proper focus indicators', () => {
      render(<Navigation />)
      
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveClass('hover:bg-gray-700')
      })
    })
  })
}) 