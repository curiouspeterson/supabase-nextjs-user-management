import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/login/page'
import * as actions from '@/app/login/actions'

// Mock login and signup actions
jest.mock('@/app/login/actions', () => ({
  login: jest.fn(() => Promise.resolve()),
  signup: jest.fn(() => Promise.resolve())
}))

describe('LoginPage', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form with all required fields', () => {
    render(<LoginPage />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account instead/i })).toBeInTheDocument()
  })

  it('calls login action on sign in', async () => {
    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const signInButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    
    // Click the button and wait for the loading state
    await user.click(signInButton)
    
    // Use a more specific waitFor to ensure the state has updated
    await waitFor(
      () => {
        const button = screen.getByRole('button', { name: /signing in\.\.\./i })
        expect(button).toBeInTheDocument()
        expect(button).toBeDisabled()
      },
      { timeout: 1000 }
    )

    // Check that login was called with correct args
    expect(actions.login).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('calls signup action on create account', async () => {
    render(<LoginPage />)

    // Switch to signup mode
    await user.click(screen.getByRole('button', { name: /create account instead/i }))

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    
    // Click the button and wait for the loading state
    await user.click(submitButton)
    
    // Use a more specific waitFor to ensure the state has updated
    await waitFor(
      () => {
        const button = screen.getByRole('button', { name: /creating account\.\.\./i })
        expect(button).toBeInTheDocument()
        expect(button).toBeDisabled()
      },
      { timeout: 1000 }
    )

    // Check that signup was called with correct args
    expect(actions.signup).toHaveBeenCalledWith('test@example.com', 'password123')
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
}) 