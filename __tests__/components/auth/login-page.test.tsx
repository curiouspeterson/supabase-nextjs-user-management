import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import LoginPage from '@/app/login/page'

// Mock Next.js routing
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
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
  useToast: jest.fn()
}))

const mockRouter = { push: jest.fn(), refresh: jest.fn() }

beforeEach(() => {
  jest.clearAllMocks()
  ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  ;(useToast as jest.Mock).mockReturnValue({ toast: mockToast })
})

describe('LoginPage', () => {
  it('validates password strength', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'weak')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Password too weak')
    })
  })

  it('handles sign up success', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'StrongP@ssw0rd')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Check your email to confirm your account',
        variant: 'default'
      })
    })
  })

  it('handles sign in success', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.click(screen.getByRole('button', { name: /already have an account\? sign in/i }))
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'StrongP@ssw0rd')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
  })

  it('handles sign in error', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.click(screen.getByRole('button', { name: /already have an account\? sign in/i }))
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'WrongP@ssw0rd')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password')
    })
  })

  it('toggles between sign up and sign in modes', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    expect(screen.getByRole('heading')).toHaveTextContent('Create an account')
    await user.click(screen.getByRole('button', { name: /already have an account\? sign in/i }))
    expect(screen.getByRole('heading')).toHaveTextContent('Welcome back')
  })
}) 