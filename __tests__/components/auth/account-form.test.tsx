import '@testing-library/jest-dom'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import AccountForm from '@/app/account/account-form'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import userEvent from '@testing-library/user-event'
import { useToast } from '@/components/ui/use-toast'
import { useSupabase } from '@/lib/supabase/client'

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
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  role: 'authenticated',
  updated_at: new Date().toISOString()
} as const

const mockProfile = {
  id: mockUser.id,
  full_name: 'Updated Name',
  username: 'testuser',
  website: 'https://test.com',
  avatar_url: 'https://test.com/avatar.jpg',
  updated_at: new Date().toISOString()
}

type MockQueryBuilder = {
  upsert: jest.Mock
  select: jest.Mock
  eq: jest.Mock
  single: jest.Mock
}

const mockQueryBuilder: MockQueryBuilder = {
  upsert: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: mockProfile, error: null })
}

const mockSupabaseClient = {
  from: jest.fn(() => mockQueryBuilder),
  auth: {
    signOut: jest.fn().mockResolvedValue({ error: null }),
    getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
  }
} as const

// Mock useSupabase hook
jest.mock('@/lib/supabase/client', () => ({
  useSupabase: () => ({
    supabase: mockSupabaseClient,
    user: mockUser,
    error: null
  })
}))

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => mockSupabaseClient
}))

describe('AccountForm', () => {
  const mockToast = jest.fn()
  const mockRouter = {
    refresh: jest.fn(),
    push: jest.fn()
  }
  let user: ReturnType<typeof userEvent.setup>
  
  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    role: 'authenticated',
    updated_at: new Date().toISOString()
  }

  const mockProfile = {
    id: mockUser.id,
    full_name: 'Test User',
    username: 'testuser',
    website: 'https://test.com',
    avatar_url: 'mock-url',
    updated_at: mockUser.updated_at
  }

  const mockSupabaseClient = {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      single: jest.fn().mockResolvedValue({ data: mockProfile, error: null })
    })),
    auth: {
      signOut: jest.fn().mockResolvedValue({ error: null })
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    user = userEvent.setup()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useToast as jest.Mock).mockReturnValue({ toast: mockToast })
    ;(useSupabase as jest.Mock).mockReturnValue({
      supabase: mockSupabaseClient,
      user: mockUser,
      error: null
    })

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

    const fullNameInput = screen.getByLabelText(/full name/i)
    await user.clear(fullNameInput)
    await user.type(fullNameInput, 'Updated Name')

    const updateButton = screen.getByRole('button', { name: /update profile/i })
    await user.click(updateButton)

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles')
      expect(mockSupabaseClient.from().upsert).toHaveBeenCalledWith({
        id: mockUser.id,
        full_name: 'Updated Name',
        username: mockProfile.username,
        website: mockProfile.website,
        avatar_url: mockProfile.avatar_url,
        updated_at: expect.any(String)
      })
      expect(mockRouter.refresh).toHaveBeenCalled()
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Profile updated successfully'
      })
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
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
      single: jest.fn().mockResolvedValue({ data: null, error: { message: errorMessage } })
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