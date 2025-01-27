import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { AccountForm } from '@/components/account-form'
import { useSupabase } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock useToast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn()
}))

// Mock useSupabase
jest.mock('@/lib/supabase/client', () => ({
  useSupabase: jest.fn()
}))

jest.mock('@supabase/auth-helpers-nextjs')

describe('AccountForm', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    user_metadata: {
      full_name: 'Test User',
      username: 'testuser',
      website: 'https://test.com',
      avatar_url: 'https://test.com/avatar.jpg',
    },
  }

  const mockProfile = {
    id: mockUser.id,
    full_name: 'Test User',
    username: 'testuser',
    website: 'https://test.com',
    avatar_url: 'https://test.com/avatar.jpg',
    updated_at: new Date().toISOString()
  }

  const mockRouter = {
    refresh: jest.fn()
  }

  const mockToast = jest.fn()

  const mockUpsert = jest.fn()
  const mockSignOut = jest.fn()
  const mockGetUser = jest.fn()

  const mockSupabaseClient = {
    from: jest.fn((table: string) => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: mockProfile, error: null })
        }))
      })),
      upsert: mockUpsert
    })),
    auth: {
      signOut: mockSignOut
    }
  } as unknown as SupabaseClient

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useToast as jest.Mock).mockReturnValue({ toast: mockToast })
    ;(useSupabase as jest.Mock).mockReturnValue({
      supabase: mockSupabaseClient,
      user: mockUser
    })
    ;(createClientComponentClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null }),
        signOut: mockSignOut.mockResolvedValue({ error: null }),
      },
      from: jest.fn().mockReturnValue({
        upsert: mockUpsert.mockResolvedValue({ data: {}, error: null }),
      }),
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
          getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://test.com/avatar.jpg' } }),
        }),
      },
    })
  })

  it('loads and displays user profile', async () => {
    render(<AccountForm />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument()
      expect(screen.getByDisplayValue('https://test.com')).toBeInTheDocument()
    })
  })

  it('handles profile update', async () => {
    const user = userEvent.setup()
    render(<AccountForm />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
    })

    const fullNameInput = screen.getByLabelText(/full name/i)
    await user.clear(fullNameInput)
    await user.type(fullNameInput, 'Updated Name')

    const updateButton = screen.getByRole('button', { name: /update profile/i })
    await user.click(updateButton)

    expect(mockUpsert).toHaveBeenCalledWith({
      id: mockUser.id,
      full_name: 'Updated Name',
      username: 'testuser',
      website: 'https://test.com',
      avatar_url: 'https://test.com/avatar.jpg',
    })
  })

  it('handles profile update error', async () => {
    const user = userEvent.setup()
    const mockError = new Error('Failed to update profile')
    mockUpsert.mockResolvedValueOnce({ error: mockError })

    render(<AccountForm />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
    })

    const updateButton = screen.getByRole('button', { name: /update profile/i })
    await user.click(updateButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to update profile/i)).toBeInTheDocument()
    })
  })

  it('handles sign out', async () => {
    const user = userEvent.setup()
    render(<AccountForm />)

    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    await user.click(signOutButton)

    expect(mockSignOut).toHaveBeenCalled()
  })

  it('handles sign out error', async () => {
    const user = userEvent.setup()
    const mockError = new Error('Failed to sign out')
    mockSignOut.mockResolvedValueOnce({ error: mockError })

    render(<AccountForm />)

    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    await user.click(signOutButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to sign out/i)).toBeInTheDocument()
    })
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<AccountForm />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
    })

    const fullNameInput = screen.getByLabelText(/full name/i)
    await user.clear(fullNameInput)

    const updateButton = screen.getByRole('button', { name: /update profile/i })
    await user.click(updateButton)

    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument()
    })
  })

  it('maintains accessibility standards', async () => {
    render(<AccountForm />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
    })

    // Check for proper ARIA labels
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/website/i)).toBeInTheDocument()

    // Check for proper button roles
    expect(screen.getByRole('button', { name: /update profile/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()

    // Check for proper form role
    expect(screen.getByRole('form')).toBeInTheDocument()
  })
}) 