import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input', () => {
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
    input = screen.getByLabelText('') // password inputs don't have role='textbox'
    expect(input).toHaveAttribute('type', 'password')

    rerender(<Input type="number" />)
    input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('type', 'number')
  })

  it('handles user input', async () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    
    await userEvent.type(input, 'Hello, World!')
    expect(input).toHaveValue('Hello, World!')
  })

  it('can be disabled', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed')
    expect(input).toHaveClass('disabled:opacity-50')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input ref={ref} />)
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('applies additional className', () => {
    render(<Input className="custom-class" />)
    const input = screen.getByRole('textbox')
    
    expect(input).toHaveClass('custom-class')
    expect(input).toHaveClass('flex') // Still has default classes
  })

  it('handles placeholder text', () => {
    render(<Input placeholder="Enter text..." />)
    const input = screen.getByPlaceholderText('Enter text...')
    
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('placeholder', 'Enter text...')
  })

  it('supports controlled value', () => {
    const { rerender } = render(<Input value="Initial" readOnly />)
    const input = screen.getByRole('textbox')
    
    expect(input).toHaveValue('Initial')
    
    rerender(<Input value="Updated" readOnly />)
    expect(input).toHaveValue('Updated')
  })

  describe('Event Handling', () => {
    it('calls onChange handler', async () => {
      const handleChange = jest.fn()
      render(<Input onChange={handleChange} />)
      const input = screen.getByRole('textbox')
      
      await userEvent.type(input, 'a')
      expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('calls onFocus handler', async () => {
      const handleFocus = jest.fn()
      render(<Input onFocus={handleFocus} />)
      const input = screen.getByRole('textbox')
      
      await userEvent.click(input)
      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it('calls onBlur handler', async () => {
      const handleBlur = jest.fn()
      render(<Input onBlur={handleBlur} />)
      const input = screen.getByRole('textbox')
      
      await userEvent.click(input)
      await userEvent.tab()
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<Input aria-label="Username" />)
      const input = screen.getByLabelText('Username')
      
      expect(input).toBeInTheDocument()
    })

    it('supports aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="hint" />
          <div id="hint">Enter your username</div>
        </>
      )
      const input = screen.getByRole('textbox')
      
      expect(input).toHaveAttribute('aria-describedby', 'hint')
    })

    it('has visible focus indicator', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      
      expect(input).toHaveClass('focus-visible:ring-2')
      expect(input).toHaveClass('focus-visible:ring-ring')
    })
  })
}) 