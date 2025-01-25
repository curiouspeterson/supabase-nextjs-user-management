import React from 'react'
import {
  render,
  screen,
  setupUser,
  hasClasses,
  cleanupAfterEach,
  userEvent,
  waitFor
} from '../../test-utils'
import { Input } from '@/components/ui/input'

// Constants for timeouts
const TEST_TIMEOUT = 1000
const ANIMATION_TIMEOUT = 100

describe('Input', () => {
  // Modern cleanup after each test
  cleanupAfterEach()

  // Modern user event setup with specific config
  const user = userEvent.setup({
    delay: null,
    pointerEventsCheck: 0
  })

  it('renders with default props', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('flex h-10 w-full rounded-md border')
  })

  it('accepts different types', () => {
    const { rerender } = render(<Input type="text" />)
    let input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'text')

    rerender(<Input type="email" />)
    input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')

    rerender(<Input type="password" />)
    input = screen.getByDisplayValue('') // Password inputs don't have a textbox role
    expect(input).toHaveAttribute('type', 'password')

    rerender(<Input type="number" />)
    input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('type', 'number')
  })

  it('handles user input', async () => {
    render(<Input aria-label="Test input" />)
    const input = screen.getByRole('textbox')
    
    await user.type(input, 'Hello, World!')
    await waitFor(() => {
      expect(input).toHaveValue('Hello, World!')
    }, { timeout: TEST_TIMEOUT })
  })

  it('can be disabled', () => {
    render(<Input disabled aria-label="Disabled input" />)
    const input = screen.getByRole('textbox')
    
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed')
    expect(input).toHaveClass('disabled:opacity-50')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input ref={ref} aria-label="Referenced input" />)
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('applies additional className', () => {
    render(<Input className="custom-class" aria-label="Custom class input" />)
    const input = screen.getByRole('textbox')
    
    expect(input).toHaveClass('custom-class')
    expect(input).toHaveClass('flex') // Still has default classes
  })

  it('handles placeholder text', () => {
    render(<Input placeholder="Enter text..." aria-label="Placeholder input" />)
    const input = screen.getByPlaceholderText('Enter text...')
    
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('placeholder', 'Enter text...')
  })

  it('supports controlled value', () => {
    const { rerender } = render(<Input value="Initial" readOnly aria-label="Controlled input" />)
    const input = screen.getByRole('textbox')
    
    expect(input).toHaveValue('Initial')
    
    rerender(<Input value="Updated" readOnly aria-label="Controlled input" />)
    expect(input).toHaveValue('Updated')
  })

  describe('Event Handling', () => {
    it('calls onChange handler', async () => {
      const handleChange = jest.fn()
      render(<Input onChange={handleChange} aria-label="Change input" />)
      const input = screen.getByRole('textbox')
      
      await user.type(input, 'a')
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledTimes(1)
      }, { timeout: TEST_TIMEOUT })
    })

    it('calls onFocus handler', async () => {
      const handleFocus = jest.fn()
      render(<Input onFocus={handleFocus} aria-label="Focus input" />)
      const input = screen.getByRole('textbox')
      
      await user.click(input)
      await waitFor(() => {
        expect(handleFocus).toHaveBeenCalledTimes(1)
      }, { timeout: TEST_TIMEOUT })
    })

    it('calls onBlur handler', async () => {
      const handleBlur = jest.fn()
      render(<Input onBlur={handleBlur} aria-label="Blur input" />)
      const input = screen.getByRole('textbox')
      
      await user.click(input)
      await user.tab()
      await waitFor(() => {
        expect(handleBlur).toHaveBeenCalledTimes(1)
      }, { timeout: TEST_TIMEOUT })
    })
  })

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<Input aria-label="Username input" />)
      const input = screen.getByLabelText('Username input')
      
      expect(input).toBeInTheDocument()
    })

    it('supports aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="hint" aria-label="Described input" />
          <div id="hint">Enter your username</div>
        </>
      )
      const input = screen.getByRole('textbox')
      
      expect(input).toHaveAttribute('aria-describedby', 'hint')
    })

    it('has visible focus indicator', async () => {
      render(<Input aria-label="Focus indicator input" />)
      const input = screen.getByRole('textbox')
      
      await user.click(input)
      await waitFor(() => {
        expect(input).toHaveClass('focus-visible:ring-2')
        expect(input).toHaveClass('focus-visible:ring-ring')
      }, { timeout: TEST_TIMEOUT })
    })
  })
}) 