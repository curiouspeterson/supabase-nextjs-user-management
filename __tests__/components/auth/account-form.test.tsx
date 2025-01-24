import '@testing-library/jest-dom'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AccountForm from '@/app/account/account-form'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

// Mock Supabase client
const mockSupabaseFrom = jest.fn()
const mockSupabaseSelect = jest.fn()
const mockSupabaseEq = jest.fn()
const mockSupabaseSingle = jest.fn()
const mockSupabaseUpsert = jest.fn()
const mockSupabaseSignOut = jest.fn()

// Default mock responses
const defaultProfileData = {
  data: {
    full_name: 'Test User',
    username: 'testuser',
    website: 'https://test.com',
    avatar_url: 'https://test.com/avatar.jpg'
  },
  error: null
}

// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  refresh: jest.fn()
}

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => mockRouter)
}))

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: (table: string) => {
      mockSupabaseFrom(table)
      return {
        select: (columns: string) => {
          mockSupabaseSelect(columns)
          return {
            eq: (field: string, value: string) => {
              mockSupabaseEq(field, value)
              return {
                single: () => mockSupabaseSingle()
              }
            }
          }
        },
        upsert: (data: any) => {
          mockSupabaseUpsert(data)
          return Promise.resolve({ error: null })
        }
      }
    },
    storage: {
      from: (bucket: string) => ({
        download: (path: string) => Promise.resolve({ data: new Blob(), error: null }),
        upload: (path: string, file: File) => Promise.resolve({ data: { path }, error: null })
      })
    },
    auth: {
      signOut: (options: any) => {
        mockSupabaseSignOut(options)
        return Promise.resolve({ error: null })
      }
    }
  }))
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
    
    // Set up default mock responses
    mockSupabaseSingle.mockResolvedValue(defaultProfileData)
    mockSupabaseUpsert.mockResolvedValue({ data: null, error: null })
    mockSupabaseSignOut.mockResolvedValue({ error: null })
    
    // Mock fetch for server-side signout
    global.fetch = jest.fn(() => Promise.resolve(new Response()))

    // Mock URL.createObjectURL
    if (typeof window !== 'undefined') {
      window.URL.createObjectURL = jest.fn(() => 'mock-url')
      window.URL.revokeObjectURL = jest.fn()
    }
  })

  it('loads and displays user profile data', async () => {
    render(<AccountForm user={mockUser} />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument()
      expect(screen.getByDisplayValue('https://test.com')).toBeInTheDocument()
    })

    // Verify Supabase client calls
    expect(mockSupabaseFrom).toHaveBeenCalledWith('profiles')
    expect(mockSupabaseSelect).toHaveBeenCalledWith('full_name, username, website, avatar_url')
    expect(mockSupabaseEq).toHaveBeenCalledWith('id', mockUser.id)
  })

  it('handles profile update', async () => {
    render(<AccountForm user={mockUser} />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('initial-loading-spinner')).not.toBeInTheDocument()
    })

    // Update form fields
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Updated Name' }
    })

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /update profile/i }))

    // Verify Supabase calls
    await waitFor(() => {
      expect(mockSupabaseFrom).toHaveBeenCalledWith('profiles')
      expect(mockSupabaseUpsert).toHaveBeenCalledWith(expect.objectContaining({
        id: mockUser.id,
        full_name: 'Updated Name'
      }))
    })
  })

  it('handles sign out', async () => {
    render(<AccountForm user={mockUser} />)
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('initial-loading-spinner')).not.toBeInTheDocument()
    })

    // Click sign out button
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }))

    // Verify sign out was called
    await waitFor(() => {
      expect(mockSupabaseSignOut).toHaveBeenCalledWith({ scope: 'global' })
    })
  })

  it('handles loading error', async () => {
    mockSupabaseSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'Error loading user data!' }
    })

    render(<AccountForm user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('Error loading user data!')).toBeInTheDocument()
    })
  })

  it('maintains accessibility standards', async () => {
    render(<AccountForm user={mockUser} />)

    await waitFor(() => {
      // Check form landmarks
      expect(screen.getByRole('form')).toBeInTheDocument()
      
      // Check form labels
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/website/i)).toBeInTheDocument()
      
      // Check button accessibility
      expect(screen.getByRole('button', { name: /update profile/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
    })
  })

  it('handles null user', () => {
    render(<AccountForm user={null} />)
    
    // Should be disabled when no user
    const updateButton = screen.getByRole('button', { name: /update profile/i })
    const fullNameInput = screen.getByLabelText(/full name/i)
    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    
    expect(updateButton).toBeDisabled()
    expect(fullNameInput).toBeDisabled()
    expect(signOutButton).toBeDisabled()
  })
}) 