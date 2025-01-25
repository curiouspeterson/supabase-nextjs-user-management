import '@testing-library/jest-dom'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
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
const mockProfile = {
  full_name: 'Test User',
  username: 'testuser',
  website: 'https://test.com',
  avatar_url: 'https://test.com/avatar.jpg'
}

const defaultProfileData = {
  data: mockProfile,
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
    upsert: jest.Mock<Promise<SuccessResponse>>
  }>
  storage: {
    from: jest.Mock<{
      download: jest.Mock<Promise<{ data: Blob; error: null }>>
      upload: jest.Mock<Promise<{ data: { path: string }; error: null }>>
    }>
  }
  auth: {
    signOut: jest.Mock<Promise<{ error: null }>>
  }
}

// Create mock Supabase client with proper types
const mockSupabaseClient: MockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({
          data: {
            id: 'test-user-id',
            full_name: 'Test User',
            username: 'testuser',
            website: 'https://test.com',
            avatar_url: 'https://test.com/avatar.jpg',
            updated_at: new Date().toISOString()
          },
          error: null
        }))
      }))
    })),
    upsert: jest.fn(() => Promise.resolve({
      data: {
        id: 'test-user-id',
        full_name: 'Updated Name',
        username: 'testuser',
        website: 'https://test.com',
        avatar_url: 'https://test.com/avatar.jpg',
        updated_at: new Date().toISOString()
      },
      error: null
    }))
  })),
  storage: {
    from: jest.fn(() => ({
      download: jest.fn(() => Promise.resolve({ data: new Blob(), error: null })),
      upload: jest.fn(() => Promise.resolve({ data: { path: 'test-path' }, error: null }))
    }))
  },
  auth: {
    signOut: jest.fn(() => Promise.resolve({ error: null }))
  }
}

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => mockSupabaseClient
}))

describe('AccountForm', () => {
  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-03-20T00:00:00.000Z',
    confirmed_at: '2024-03-20T00:00:00.000Z',
    last_sign_in_at: '2024-03-20T00:00:00.000Z',
    role: 'authenticated',
    updated_at: '2024-03-20T00:00:00.000Z'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset mock implementations with proper types
    const mockChain = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: mockUser.id,
              full_name: mockProfile.full_name,
              username: mockProfile.username,
              website: mockProfile.website,
              avatar_url: mockProfile.avatar_url,
              updated_at: new Date().toISOString()
            },
            error: null
          })
        })
      }),
      upsert: jest.fn().mockResolvedValue({
        data: {
          id: mockUser.id,
          full_name: 'Updated Name',
          username: mockProfile.username,
          website: mockProfile.website,
          avatar_url: mockProfile.avatar_url,
          updated_at: new Date().toISOString()
        },
        error: null
      })
    }
    
    mockSupabaseClient.from.mockImplementation(() => mockChain)
    mockSupabaseClient.auth.signOut.mockImplementation(() => 
      Promise.resolve({ error: null })
    )
  })

  it('loads and displays user profile data', async () => {
    render(<AccountForm user={mockUser} />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('initial-loading-spinner')).not.toBeInTheDocument()
    })

    // Check form values
    expect(screen.getByLabelText(/full name/i)).toHaveValue(mockProfile.full_name)
    expect(screen.getByLabelText(/username/i)).toHaveValue(mockProfile.username)
    expect(screen.getByLabelText(/website/i)).toHaveValue(mockProfile.website)

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
    fireEvent.change(fullNameInput, {
      target: { value: 'Updated Name' }
    })

    // Submit form
    const updateButton = screen.getByRole('button', { name: /update profile/i })
    expect(updateButton).not.toBeDisabled()
    fireEvent.click(updateButton)

    // Verify Supabase calls
    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles')
      expect(mockSupabaseClient.from().upsert).toHaveBeenCalledWith(expect.objectContaining({
        id: mockUser.id,
        full_name: 'Updated Name',
        username: mockProfile.username,
        website: mockProfile.website,
        avatar_url: mockProfile.avatar_url,
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
    fireEvent.click(signOutButton)

    // Verify sign out was called and navigation occurred
    await waitFor(() => {
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
      expect(mockRouter.push).toHaveBeenCalledWith('/login')
    })
  })

  it('handles loading error', async () => {
    const errorMessage = 'Error loading user data'
    
    // Mock error response
    const errorResponse: ErrorResponse = {
      data: null,
      error: { message: errorMessage }
    }

    mockSupabaseClient.from.mockImplementationOnce(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve(errorResponse))
        }))
      })),
      upsert: jest.fn(() => Promise.resolve({ data: null, error: null }))
    }))

    render(<AccountForm user={mockUser} />)

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(errorMessage)
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

    // Check form landmarks
    expect(screen.getByRole('form')).toBeInTheDocument()
    
    // Check form labels
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toHaveValue(mockProfile.username)
    expect(screen.getByLabelText(/website/i)).toBeInTheDocument()
    
    // Check button accessibility
    const updateButton = screen.getByRole('button', { name: /update profile/i })
    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    
    expect(updateButton).toBeInTheDocument()
    expect(updateButton).not.toBeDisabled()
    expect(signOutButton).toBeInTheDocument()
    expect(signOutButton).not.toBeDisabled()
  })
}) 