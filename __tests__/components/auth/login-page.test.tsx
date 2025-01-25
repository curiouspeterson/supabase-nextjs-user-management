import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/login/page'
import { useToast } from '@/components/ui/use-toast'
import * as actions from '@/app/login/actions'

// Mock login and signup actions
jest.mock('@/app/login/actions', () => ({
  login: jest.fn(() => Promise.resolve()),
  signup: jest.fn(() => Promise.resolve())
}))

// Mock the useToast hook
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn()
}))

describe('LoginPage', () => {
  const user = userEvent.setup()
  const mockToast = jest.fn()
  
  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form', () => {
    render(<LoginPage />)
    
    expect(screen.getByLabelText('Email')).toBeRequired()
    expect(screen.getByLabelText('Password')).toBeRequired()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create account instead' })).toBeInTheDocument()
  })

  it('calls login action on sign in', async () => {
    const mockLoginAction = jest.fn().mockResolvedValue({ error: null });
    render(<LoginPage loginAction={mockLoginAction} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(signInButton);

    await waitFor(() => {
      expect(mockLoginAction).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(signInButton).toHaveAttribute('aria-disabled', 'true');
      expect(signInButton).toHaveTextContent('Signing in...');
    });
  });

  it('calls signup action on create account', async () => {
    const mockSignupAction = jest.fn().mockResolvedValue({ error: null });
    render(<LoginPage signupAction={mockSignupAction} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const createAccountButton = screen.getByRole('button', { name: /create account/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(createAccountButton);

    await waitFor(() => {
      expect(mockSignupAction).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(createAccountButton).toHaveAttribute('aria-disabled', 'true');
      expect(createAccountButton).toHaveTextContent('Creating account...');
    });
  });

  it('shows error toast on login failure', async () => {
    const mockLoginAction = jest.fn().mockResolvedValue({ error: 'Failed to sign in' });
    render(<LoginPage loginAction={mockLoginAction} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(signInButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to sign in',
        variant: 'destructive'
      });
    });
  });

  it('shows error toast on signup failure', async () => {
    const mockSignupAction = jest.fn().mockResolvedValue({ error: 'Failed to create account' });
    render(<LoginPage signupAction={mockSignupAction} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const createAccountButton = screen.getByRole('button', { name: /create account/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(createAccountButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to create account',
        variant: 'destructive'
      });
    });
  });

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