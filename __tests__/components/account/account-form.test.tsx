import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import AccountForm from '@/app/account/account-form'
import { User } from '@supabase/supabase-js'

// Add Response polyfill for Node environment
if (typeof Response === 'undefined') {
  global.Response = class MockResponse {
    status: number
    ok: boolean
    headers: Headers
    body: any
    statusText: string
    type: ResponseType
    url: string
    redirected: boolean

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this.status = init?.status || 200
      this.ok = this.status >= 200 && this.status < 300
      this.headers = new Headers(init?.headers)
      this.body = body
      this.statusText = init?.statusText || ''
      this.type = 'default'
      this.url = ''
      this.redirected = false
    }

    static error() {
      return new MockResponse(null, { status: 500 })
    }

    static json(data: any, init?: ResponseInit) {
      return new MockResponse(JSON.stringify(data), {
        ...init,
        headers: { 'content-type': 'application/json' }
      })
    }

    static redirect(url: string | URL, status?: number) {
      return new MockResponse(null, {
        status: status || 302,
        headers: { Location: url.toString() }
      })
    }
  } as any
}

jest.mock('@/utils/supabase/client')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

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

const mockProfile = {
  id: 'test-user-id',
  full_name: 'Test User',
  username: 'testuser',
  website: 'https://example.com',
  avatar_url: 'https://example.com/avatar.jpg'
}

describe('AccountForm', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(createClient as jest.Mock).mockReturnValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockProfile, error: null }))
          }))
        })),
        upsert: jest.fn(() => Promise.resolve({ error: null }))
      })),
      auth: {
        signOut: jest.fn(() => Promise.resolve({ error: null }))
      }
    })
  })

  it('renders the form with user data', async () => {
    render(<AccountForm user={mockUser} />)

    // Check loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument()

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })

    // Check form fields
    expect(screen.getByLabelText(/email/i)).toHaveValue(mockUser.email)
    expect(screen.getByLabelText(/full name/i)).toHaveValue(mockProfile.full_name)
    expect(screen.getByLabelText(/username/i)).toHaveValue(mockProfile.username)
    expect(screen.getByLabelText(/website/i)).toHaveValue(mockProfile.website)
  })

  it('handles profile update', async () => {
    render(<AccountForm user={mockUser} />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })

    // Update form fields
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Updated Name' }
    })

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /update profile/i }))

    // Check loading state during update
    expect(screen.getByRole('progressbar')).toBeInTheDocument()

    // Verify Supabase call
    await waitFor(() => {
      const supabase = createClient()
      expect(supabase.from).toHaveBeenCalledWith('profiles')
      expect(supabase.from('profiles').upsert).toHaveBeenCalledWith(expect.objectContaining({
        id: mockUser.id,
        full_name: 'Updated Name'
      }))
    })
  })

  it('handles sign out', async () => {
    const mockSignOut = jest.fn().mockResolvedValue({ error: null })
    ;(createClient as jest.Mock).mockReturnValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockProfile, error: null }))
          }))
        })),
        upsert: jest.fn(() => Promise.resolve({ error: null }))
      })),
      auth: {
        signOut: mockSignOut
      }
    })

    render(<AccountForm user={mockUser} />)
    
    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    fireEvent.click(signOutButton)
    
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({ scope: 'global' })
    })
  })

  it('handles loading error', async () => {
    const mockError = new Error('Failed to load')
    ;(createClient as jest.Mock).mockReturnValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.reject(mockError))
          }))
        }))
      }))
    })

    const alertMock = jest.spyOn(window, 'alert').mockImplementation()
    render(<AccountForm user={mockUser} />)

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Error loading user data!')
    })
  })

  it('meets accessibility standards', async () => {
    render(<AccountForm user={mockUser} />)

    // Check form role and labels
    await waitFor(() => {
      expect(screen.getByRole('form')).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/website/i)).toBeInTheDocument()
    })

    // Check button accessibility
    expect(screen.getByRole('button', { name: /update profile/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })
}) 