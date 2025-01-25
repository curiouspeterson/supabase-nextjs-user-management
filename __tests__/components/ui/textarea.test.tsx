import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from '@/components/ui/textarea'

describe('Textarea', () => {
  it('renders with default props', () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveClass('min-h-[80px]')
    expect(textarea).toHaveClass('w-full')
    expect(textarea).toHaveClass('rounded-md')
  })

  it('handles user input', async () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    
    await userEvent.type(textarea, 'Hello\nWorld!')
    expect(textarea).toHaveValue('Hello\nWorld!')
  })

  it('can be disabled', () => {
    render(<Textarea disabled />)
    const textarea = screen.getByRole('textbox')
    
    expect(textarea).toBeDisabled()
    expect(textarea).toHaveClass('disabled:cursor-not-allowed')
    expect(textarea).toHaveClass('disabled:opacity-50')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLTextAreaElement>()
    render(<Textarea ref={ref} />)
    
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('applies additional className', () => {
    render(<Textarea className="custom-class" />)
    const textarea = screen.getByRole('textbox')
    
    expect(textarea).toHaveClass('custom-class')
    expect(textarea).toHaveClass('min-h-[80px]') // Still has default classes
  })

  it('handles placeholder text', () => {
    render(<Textarea placeholder="Enter text..." />)
    const textarea = screen.getByPlaceholderText('Enter text...')
    
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('placeholder', 'Enter text...')
  })

  it('supports controlled value', () => {
    const { rerender } = render(<Textarea value="Initial" readOnly />)
    const textarea = screen.getByRole('textbox')
    
    expect(textarea).toHaveValue('Initial')
    
    rerender(<Textarea value="Updated" readOnly />)
    expect(textarea).toHaveValue('Updated')
  })

  describe('Event Handling', () => {
    it('calls onChange handler', async () => {
      const handleChange = jest.fn()
      render(<Textarea onChange={handleChange} />)
      const textarea = screen.getByRole('textbox')
      
      await userEvent.type(textarea, 'a')
      expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('calls onFocus handler', async () => {
      const handleFocus = jest.fn()
      render(<Textarea onFocus={handleFocus} />)
      const textarea = screen.getByRole('textbox')
      
      await userEvent.click(textarea)
      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it('calls onBlur handler', async () => {
      const handleBlur = jest.fn()
      render(<Textarea onBlur={handleBlur} />)
      const textarea = screen.getByRole('textbox')
      
      await userEvent.click(textarea)
      await userEvent.tab()
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<Textarea aria-label="Comment box" />)
      const textarea = screen.getByLabelText('Comment box')
      
      expect(textarea).toBeInTheDocument()
    })

    it('supports aria-describedby', () => {
      render(
        <>
          <Textarea aria-describedby="hint" />
          <div id="hint">Enter your comment</div>
        </>
      )
      const textarea = screen.getByRole('textbox')
      
      expect(textarea).toHaveAttribute('aria-describedby', 'hint')
    })

    it('has visible focus indicator', () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      
      expect(textarea).toHaveClass('focus-visible:ring-2')
      expect(textarea).toHaveClass('focus-visible:ring-ring')
    })

    it('maintains proper contrast ratio', () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      
      expect(textarea).toHaveClass('bg-background')
      expect(textarea).toHaveClass('text-sm')
    })
  })

  describe('Resizing', () => {
    it('has minimum height', () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      
      expect(textarea).toHaveClass('min-h-[80px]')
    })

    it('supports custom rows', () => {
      render(<Textarea rows={10} />)
      const textarea = screen.getByRole('textbox')
      
      expect(textarea).toHaveAttribute('rows', '10')
    })
  })
}) 