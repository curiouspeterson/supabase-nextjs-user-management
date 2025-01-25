import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { AccountForm } from '@/components/account-form'
import { useSupabase } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'

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

describe('AccountForm', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com'
  }

  const mockProfile = {
    id: mockUser.id,
    full_name: 'Test User',
    username: 'testuser',
    website: 'https://test.com',
    avatar_url: 'mock-url',
    updated_at: new Date().toISOString()
  }

  const mockRouter = {
    refresh: jest.fn()
  }

  const mockToast = jest.fn()

  const mockUpsert = jest.fn().mockResolvedValue({ error: null })
  const mockSignOut = jest.fn().mockResolvedValue({ error: null })

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

    const updateButton = screen.getByRole('button', { name: /update profile/i })
    await user.click(updateButton)

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles')
    expect(mockUpsert).toHaveBeenCalledWith({
      id: mockUser.id,
      full_name: 'Test User',
      username: 'testuser',
      website: 'https://test.com',
      avatar_url: 'mock-url',
      updated_at: expect.any(String)
    })
    expect(mockRouter.refresh).toHaveBeenCalled()
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Profile updated',
      description: 'Your profile has been updated successfully.'
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

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Failed to update profile',
      variant: 'destructive'
    })
  })

  it('handles sign out', async () => {
    const user = userEvent.setup()
    render(<AccountForm />)

    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    await user.click(signOutButton)

    expect(mockSignOut).toHaveBeenCalled()
    expect(mockRouter.refresh).toHaveBeenCalled()
  })

  it('handles sign out error', async () => {
    const user = userEvent.setup()
    const mockError = new Error('Failed to sign out')
    mockSignOut.mockResolvedValueOnce({ error: mockError })

    render(<AccountForm />)

    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    await user.click(signOutButton)

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Error signing out',
      variant: 'destructive'
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

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Full name is required',
      variant: 'destructive'
    })
  })

  it('maintains accessibility standards', async () => {
    render(<AccountForm />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
    })

    // Check form labeling
    expect(screen.getByRole('form')).toHaveAttribute('aria-labelledby', 'account-settings-title')

    // Check button states
    const updateButton = screen.getByRole('button', { name: /update profile/i })
    expect(updateButton).not.toBeDisabled()

    // Check input accessibility
    const fullNameInput = screen.getByLabelText(/full name/i)
    expect(fullNameInput).toHaveAttribute('required')
    expect(fullNameInput).toHaveAttribute('aria-invalid', 'false')
  })
}) 