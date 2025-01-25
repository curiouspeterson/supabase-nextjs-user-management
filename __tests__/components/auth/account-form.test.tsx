import '@testing-library/jest-dom'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import AccountForm from '@/app/account/account-form'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  refresh: jest.fn()
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter
}))

// Default mock responses
const defaultProfileData = {
  data: {
    id: 'test-user-id',
    full_name: 'Test User',
    username: 'testuser',
    website: 'https://test.com',
    avatar_url: 'https://test.com/avatar.jpg'
  },
  error: null
}

interface SuccessResponse {
  data: {
    id: string
    full_name: string
    username: string
    website: string
    avatar_url: string
    updated_at: string
  }
  error: null
}

interface ErrorResponse {
  data: null
  error: { message: string }
}

type ProfileResponse = SuccessResponse | ErrorResponse

// Type for the mock Supabase client
interface MockSupabaseClient {
  from: jest.Mock<{
    select: jest.Mock<{
      eq: jest.Mock<{
        single: jest.Mock<Promise<ProfileResponse>>
      }>
    }>
    upsert: jest.Mock<Promise<{
      data: {
        id: string
        full_name: string
        username: string
        website: string
        avatar_url: string
        updated_at: string
      } | null
      error: null
    }>>
  }>
  storage: {
    from: jest.Mock<{
      download: jest.Mock<Promise<{ data: Blob; error: null }>>
      upload: jest.Mock<Promise<{ data: { path: string }; error: null }>>
      getPublicUrl: jest.Mock<Promise<{ data: { publicUrl: string } }>>
    }>
  }
  auth: {
    signOut: jest.Mock<Promise<{ error: null }>>
    getUser: jest.Mock<Promise<{ data: { user: User }; error: null }>>
  }
}

// Create mock Supabase client with proper types
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com'
}

const mockProfile = {
  id: mockUser.id,
  full_name: 'Updated Name',
  username: 'testuser',
  website: 'https://test.com',
  avatar_url: 'https://test.com/avatar.jpg',
  updated_at: new Date().toISOString()
}

const mockSupabaseClient = {
  from: jest.fn().mockReturnValue({
    upsert: jest.fn().mockResolvedValue({
      data: mockProfile,
      error: null
    }),
    select: jest.fn().mockResolvedValue({
      data: [mockProfile],
      error: null
    })
  }),
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: { path: 'avatars/test.jpg' }, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://test.com/avatar.jpg' } })
    })
  },
  auth: {
    signOut: jest.fn(() => Promise.resolve({ error: null })),
    getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
  }
}

// Mock useSupabase hook
jest.mock('@/lib/supabase/client', () => ({
  useSupabase: () => ({
    supabase: mockSupabaseClient,
    user: mockUser
  })
}))

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => mockSupabaseClient
}))

describe('AccountForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset mock implementations with proper types
    const single = jest.fn().mockResolvedValue(defaultProfileData)
    const eq = jest.fn().mockReturnValue({ single })
    const select = jest.fn().mockReturnValue({ eq })
    const upsert = jest.fn().mockResolvedValue({ 
      data: {
        id: mockUser.id,
        full_name: 'Updated Name',
        username: 'testuser',
        website: 'https://test.com',
        avatar_url: 'https://test.com/avatar.jpg',
        updated_at: expect.any(String)
      },
      error: null 
    })
    
    mockSupabaseClient.from.mockImplementation(() => ({
      select,
      upsert
    }))

    mockSupabaseClient.auth.signOut.mockImplementation(() => 
      Promise.resolve({ error: null })
    )

    // Mock URL.createObjectURL
    if (typeof window !== 'undefined') {
      window.URL.createObjectURL = jest.fn(() => 'mock-url')
      window.URL.revokeObjectURL = jest.fn()
    }
  })

  it('loads and displays user profile data', async () => {
    render(<AccountForm user={mockUser} />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('initial-loading-spinner')).not.toBeInTheDocument()
    })

    // Check form values
    expect(screen.getByLabelText(/full name/i)).toHaveValue('Test User')
    expect(screen.getByLabelText(/username/i)).toHaveValue('testuser')
    expect(screen.getByLabelText(/website/i)).toHaveValue('https://test.com')

    // Verify Supabase client calls
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles')
    const selectCall = mockSupabaseClient.from().select
    expect(selectCall).toHaveBeenCalledWith('full_name, username, website, avatar_url')
    const eqCall = selectCall().eq
    expect(eqCall).toHaveBeenCalledWith('id', mockUser.id)
  })

  it('handles profile update', async () => {
    render(<AccountForm user={mockUser} />)

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('initial-loading-spinner')).not.toBeInTheDocument()
    })

    // Update form fields
    const fullNameInput = screen.getByLabelText(/full name/i)
    await act(async () => {
      fireEvent.change(fullNameInput, {
        target: { value: 'Updated Name' }
      })
    })

    // Submit form
    const updateButton = screen.getByRole('button', { name: /update profile/i })
    expect(updateButton).not.toBeDisabled()
    
    await act(async () => {
      fireEvent.click(updateButton)
    })

    // Verify Supabase calls
    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles')
      expect(mockSupabaseClient.from().upsert).toHaveBeenCalledWith(expect.objectContaining({
        id: mockUser.id,
        full_name: 'Updated Name',
        username: 'testuser',
        website: 'https://test.com',
        avatar_url: 'https://test.com/avatar.jpg',
        updated_at: expect.any(String)
      }))
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })

  it('handles sign out', async () => {
    render(<AccountForm user={mockUser} />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('initial-loading-spinner')).not.toBeInTheDocument()
    })

    // Find and click sign out button
    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    expect(signOutButton).not.toBeDisabled()
    
    await act(async () => {
      fireEvent.click(signOutButton)
    })

    // Verify sign out was called and navigation occurred
    await waitFor(() => {
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
      expect(mockRouter.push).toHaveBeenCalledWith('/login')
    })
  })

  it('handles loading error', async () => {
    const errorMessage = 'Error loading user data'
    
    // Mock error response with proper types
    const errorResponse: ErrorResponse = {
      data: null,
      error: { message: errorMessage }
    }

    const errorMockChain = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve(errorResponse))
        }))
      })),
      upsert: jest.fn(() => Promise.resolve({ data: null, error: null }))
    }

    mockSupabaseClient.from.mockImplementationOnce(() => errorMockChain)

    render(<AccountForm user={mockUser} />)

    // Initially should show loading spinner
    expect(screen.getByTestId('initial-loading-spinner')).toBeInTheDocument()

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    // Loading spinner should be gone
    expect(screen.queryByTestId('initial-loading-spinner')).not.toBeInTheDocument()
  })

  it('maintains accessibility standards', async () => {
    render(<AccountForm user={mockUser} />)

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('initial-loading-spinner')).not.toBeInTheDocument()
    })

    // Check form fields are present and labeled
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toHaveValue('testuser')
    expect(screen.getByLabelText(/website/i)).toBeInTheDocument()
    
    // Check button accessibility
    const updateButton = screen.getByRole('button', { name: /update profile/i })
    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    
    expect(updateButton).toBeInTheDocument()
    expect(signOutButton).toBeInTheDocument()
    expect(updateButton).not.toBeDisabled()
    expect(signOutButton).not.toBeDisabled()
  })
}) 