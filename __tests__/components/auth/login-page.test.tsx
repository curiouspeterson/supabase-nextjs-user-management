import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/login/page'
import * as actions from '@/app/login/actions'

// Mock the useToast hook
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn()
}))

// Mock the actions module
jest.mock('@/app/login/actions', () => ({
  login: jest.fn(),
  signup: jest.fn()
}))

describe('LoginPage', () => {
  let user: ReturnType<typeof userEvent.setup>
  const mockLogger = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    user = userEvent.setup()
    // Mock console.error to track error logging
    console.error = mockLogger
  })

  it('renders login form', () => {
    render(<LoginPage />)
    
    expect(screen.getByLabelText('Email')).toBeRequired()
    expect(screen.getByLabelText('Password')).toBeRequired()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create account instead' })).toBeInTheDocument()
  })

  it('handles login submission correctly', async () => {
    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    const form = screen.getByRole('form')

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(actions.login).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(submitButton).toHaveAttribute('aria-disabled', 'true')
      expect(submitButton).toHaveTextContent(/signing in/i)
    })
  })

  it('handles signup submission correctly', async () => {
    render(<LoginPage />)

    // Switch to signup mode
    const toggleButton = screen.getByRole('button', { name: /create account instead/i })
    await user.click(toggleButton)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    const form = screen.getByRole('form')

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(actions.signup).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(submitButton).toHaveAttribute('aria-disabled', 'true')
      expect(submitButton).toHaveTextContent(/creating account/i)
    })
  })

  it('shows error message on login failure', async () => {
    (actions.login as jest.Mock).mockRejectedValueOnce(new Error('Invalid credentials'))
    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    const form = screen.getByRole('form')

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      expect(submitButton).toHaveAttribute('aria-disabled', 'false')
    })
  })

  it('shows error message on signup failure', async () => {
    (actions.signup as jest.Mock).mockRejectedValueOnce(new Error('Email already exists'))
    render(<LoginPage />)

    // Switch to signup mode
    const toggleButton = screen.getByRole('button', { name: /create account instead/i })
    await user.click(toggleButton)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    const form = screen.getByRole('form')

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
      expect(submitButton).toHaveAttribute('aria-disabled', 'false')
    })
  })

  it('maintains accessibility standards', () => {
    render(<LoginPage />)

    const form = screen.getByRole('form')
    expect(form).toHaveAttribute('aria-label', 'Login form')

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    const createAccountButton = screen.getByRole('button', { name: /create account instead/i })

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
    expect(emailInput).toHaveAttribute('aria-required', 'true')

    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('aria-required', 'true')

    expect(signInButton).toHaveAttribute('type', 'submit')
    expect(createAccountButton).toHaveAttribute('type', 'button')
  })

  describe('Error Handling', () => {
    it('handles network errors during login', async () => {
      const networkError = new Error('Network error')
      networkError.name = 'NetworkError'
      ;(actions.login as jest.Mock).mockRejectedValueOnce(networkError)
      
      render(<LoginPage />)
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          'Unable to connect. Please check your internet connection and try again.'
        )
        expect(mockLogger).toHaveBeenCalledWith(
          'Login failed:',
          expect.objectContaining({ name: 'NetworkError' })
        )
      })
    })

    it('handles rate limiting errors', async () => {
      const rateLimitError = new Error('Too many requests')
      rateLimitError.name = 'RateLimitError'
      ;(actions.login as jest.Mock).mockRejectedValueOnce(rateLimitError)
      
      render(<LoginPage />)
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          'Too many attempts. Please wait a few minutes before trying again.'
        )
      })
    })

    it('handles invalid email format', async () => {
      render(<LoginPage />)
      
      await user.type(screen.getByLabelText(/email/i), 'invalid-email')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Please enter a valid email address'
      )
    })

    it('handles password requirements error during signup', async () => {
      const passwordError = new Error('Password too weak')
      passwordError.name = 'PasswordRequirementsError'
      ;(actions.signup as jest.Mock).mockRejectedValueOnce(passwordError)
      
      render(<LoginPage />)
      await user.click(screen.getByRole('button', { name: /create account instead/i }))
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'weak')
      await user.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          'Password must be at least 8 characters long and include a number'
        )
      })
    })

    it('provides accessible error messages', async () => {
      const error = new Error('Invalid credentials')
      ;(actions.login as jest.Mock).mockRejectedValueOnce(error)
      
      render(<LoginPage />)
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert')
        expect(errorMessage).toHaveAttribute('aria-live', 'polite')
        expect(errorMessage).toHaveAttribute('role', 'alert')
        expect(document.activeElement).toBe(screen.getByLabelText(/email/i))
      })
    })

    it('clears error messages when switching between login and signup', async () => {
      const error = new Error('Invalid credentials')
      ;(actions.login as jest.Mock).mockRejectedValueOnce(error)
      
      render(<LoginPage />)
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'wrong')
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /create account instead/i }))
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
}) 