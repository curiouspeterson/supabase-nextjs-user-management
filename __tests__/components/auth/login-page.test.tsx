import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/login/page'

// Mock Next.js routing
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}))

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
  },
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}))

// Mock toast notifications
const mockToast = jest.fn()
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('handles successful login', async () => {
    const user = userEvent.setup()
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: '123' } },
      error: null,
    })

    render(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Logged in successfully',
    })
  })

  it('handles login error', async () => {
    const user = userEvent.setup()
    mockSupabaseClient.auth.signInWithPassword.mockRejectedValueOnce(
      new Error('Invalid credentials')
    )

    render(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
    })
  })

  it('handles password requirements error during signup', async () => {
    const user = userEvent.setup()
    mockSupabaseClient.auth.signUp.mockRejectedValueOnce(
      new Error('Password too weak')
    )

    render(<LoginPage />)
    
    await user.click(screen.getByRole('button', { name: /sign up/i }))
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'weak')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Password too weak')
    })
  })

  it('provides accessible error messages', async () => {
    const user = userEvent.setup()
    mockSupabaseClient.auth.signInWithPassword.mockRejectedValueOnce(
      new Error('Network error')
    )

    render(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    const errorMessage = await screen.findByRole('alert')
    expect(errorMessage).toHaveTextContent('Network error')
    expect(errorMessage).toHaveAttribute('aria-live', 'polite')
  })

  it('clears error messages when switching between login and signup', async () => {
    const user = userEvent.setup()
    mockSupabaseClient.auth.signInWithPassword.mockRejectedValueOnce(
      new Error('Invalid credentials')
    )

    render(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /sign up/i }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
}) 