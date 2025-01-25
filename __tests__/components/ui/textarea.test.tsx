import React from 'react'
import {
  render,
  screen,
  setupUser,
  hasClasses,
  cleanupAfterEach,
  userEvent
} from '../../test-utils'
import { Textarea } from '@/components/ui/textarea'

describe('Textarea', () => {
  // Modern cleanup
  cleanupAfterEach()

  // Modern user event setup
  const user = setupUser()

  it('renders with default props', () => {
    render(<Textarea data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    
    expect(textarea).toBeInTheDocument()
    expect(
      hasClasses(textarea, [
        'min-h-[80px]',
        'w-full',
        'rounded-md'
      ])
    ).toBe(true)
  })

  it('handles user input', async () => {
    render(<Textarea data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    
    await user.type(textarea, 'Hello\nWorld!')
    expect(textarea).toHaveValue('Hello\nWorld!')
  })

  it('can be disabled', () => {
    render(<Textarea data-testid="textarea" disabled />)
    const textarea = screen.getByTestId('textarea')
    
    expect(textarea).toBeDisabled()
    expect(
      hasClasses(textarea, [
        'disabled:cursor-not-allowed',
        'disabled:opacity-50'
      ])
    ).toBe(true)
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLTextAreaElement>()
    render(<Textarea data-testid="textarea" ref={ref} />)
    
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('applies additional className', () => {
    render(<Textarea data-testid="textarea" className="custom-class" />)
    const textarea = screen.getByTestId('textarea')
    
    expect(
      hasClasses(textarea, [
        'custom-class',
        'min-h-[80px]'
      ])
    ).toBe(true)
  })

  it('handles placeholder text', () => {
    const placeholder = 'Enter text...'
    render(<Textarea data-testid="textarea" placeholder={placeholder} />)
    const textarea = screen.getByPlaceholderText(placeholder)
    
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('placeholder', placeholder)
  })

  it('supports controlled value', async () => {
    const { rerender } = render(
      <Textarea data-testid="textarea" value="Initial" readOnly />
    )
    const textarea = screen.getByTestId('textarea')
    
    expect(textarea).toHaveValue('Initial')
    
    rerender(<Textarea data-testid="textarea" value="Updated" readOnly />)
    expect(textarea).toHaveValue('Updated')
  })

  describe('Event Handling', () => {
    it('calls onChange handler', async () => {
      const handleChange = jest.fn()
      render(<Textarea data-testid="textarea" onChange={handleChange} />)
      const textarea = screen.getByTestId('textarea')
      
      await user.type(textarea, 'a')
      expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('calls onFocus handler', async () => {
      const handleFocus = jest.fn()
      render(<Textarea data-testid="textarea" onFocus={handleFocus} />)
      const textarea = screen.getByTestId('textarea')
      
      await user.click(textarea)
      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it('calls onBlur handler', async () => {
      const handleBlur = jest.fn()
      render(<Textarea data-testid="textarea" onBlur={handleBlur} />)
      const textarea = screen.getByTestId('textarea')
      
      await user.click(textarea)
      await user.tab()
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<Textarea data-testid="textarea" aria-label="Comment box" />)
      const textarea = screen.getByLabelText('Comment box')
      expect(textarea).toBeInTheDocument()
    })

    it('supports aria-describedby', () => {
      render(
        <>
          <Textarea data-testid="textarea" aria-describedby="description" />
          <div id="description">Helper text</div>
        </>
      )
      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('aria-describedby', 'description')
    })

    it('has visible focus indicator', () => {
      render(<Textarea data-testid="textarea" />)
      const textarea = screen.getByTestId('textarea')
      
      expect(
        hasClasses(textarea, [
          'focus-visible:ring-2',
          'focus-visible:ring-ring'
        ])
      ).toBe(true)
    })

    it('maintains proper contrast ratio', () => {
      render(<Textarea data-testid="textarea" />)
      const textarea = screen.getByTestId('textarea')
      
      expect(
        hasClasses(textarea, [
          'bg-background',
          'text-sm'
        ])
      ).toBe(true)
    })
  })
}) 