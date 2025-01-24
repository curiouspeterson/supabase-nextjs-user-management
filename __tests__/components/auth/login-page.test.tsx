import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/login/page'
import * as actions from '@/app/login/actions'

// Mock the actions module
jest.mock('@/app/login/actions', () => ({
  login: jest.fn(async (formData: FormData) => {
    const email = formData.get('email')
    const password = formData.get('password')
    return { email, password }
  }),
  signup: jest.fn(async (formData: FormData) => {
    const email = formData.get('email')
    const password = formData.get('password')
    return { email, password }
  }),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form with all required fields', () => {
    render(<LoginPage />)

    // Check form elements
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    // Try to submit without filling fields
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    // Check for HTML5 validation messages
    expect(screen.getByLabelText(/email/i)).toBeInvalid()
    expect(screen.getByLabelText(/password/i)).toBeInvalid()
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    // Enter invalid email
    await user.type(screen.getByLabelText(/email/i), 'invalid-email')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    // Check for HTML5 validation
    expect(screen.getByLabelText(/email/i)).toBeInvalid()
  })

  it('calls login action on sign in', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    // Fill out form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    // Check loading state
    expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()

    // Verify login action was called with form data
    await waitFor(() => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      expect(actions.login).toHaveBeenCalledWith(formData)
    })

    // Check loading state is removed
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).not.toBeDisabled()
    })
  })

  it('calls signup action on create account', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    // Fill out form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    // Click create account
    await user.click(screen.getByRole('button', { name: /create account/i }))

    // Check loading state
    expect(screen.getByRole('button', { name: /creating account/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled()

    // Verify signup action was called with form data
    await waitFor(() => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      expect(actions.signup).toHaveBeenCalledWith(formData)
    })

    // Check loading state is removed
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).not.toBeDisabled()
    })
  })

  it('maintains accessibility standards', () => {
    render(<LoginPage />)

    // Check form landmarks
    const form = screen.getByRole('form')
    expect(form).toBeInTheDocument()
    expect(form).toHaveAttribute('aria-label', 'Login form')

    // Check input labels and required attributes
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    expect(emailInput).toHaveAttribute('aria-required', 'true')
    expect(passwordInput).toHaveAttribute('aria-required', 'true')

    // Check button roles and types
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    const createAccountButton = screen.getByRole('button', { name: /create account/i })
    
    expect(signInButton).toHaveAttribute('type', 'submit')
    expect(createAccountButton).toHaveAttribute('type', 'submit')
  })
}) 