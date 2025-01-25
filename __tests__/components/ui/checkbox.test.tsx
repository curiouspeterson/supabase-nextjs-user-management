import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from '@/components/ui/checkbox'

describe('Checkbox', () => {
  it('renders unchecked by default', () => {
    render(<Checkbox aria-label="Test checkbox" />)
    const checkbox = screen.getByRole('checkbox')
    
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()
  })

  it('can be checked and unchecked', async () => {
    render(<Checkbox aria-label="Test checkbox" />)
    const checkbox = screen.getByRole('checkbox')
    
    await userEvent.click(checkbox)
    expect(checkbox).toBeChecked()
    
    await userEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('can be controlled', async () => {
    const handleCheckedChange = jest.fn()
    render(
      <Checkbox
        checked={true}
        onCheckedChange={handleCheckedChange}
        aria-label="Test checkbox"
      />
    )
    const checkbox = screen.getByRole('checkbox')
    
    expect(checkbox).toBeChecked()
    
    await userEvent.click(checkbox)
    expect(handleCheckedChange).toHaveBeenCalledWith(false)
  })

  it('can be disabled', () => {
    render(<Checkbox disabled aria-label="Test checkbox" />)
    const checkbox = screen.getByRole('checkbox')
    
    expect(checkbox).toBeDisabled()
    expect(checkbox).toHaveClass('disabled:cursor-not-allowed')
    expect(checkbox).toHaveClass('disabled:opacity-50')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<Checkbox ref={ref} aria-label="Test checkbox" />)
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('applies additional className', () => {
    render(<Checkbox className="custom-class" aria-label="Test checkbox" />)
    const checkbox = screen.getByRole('checkbox')
    
    expect(checkbox).toHaveClass('custom-class')
    expect(checkbox).toHaveClass('h-4') // Still has default classes
  })

  describe('Visual States', () => {
    it('shows check icon when checked', async () => {
      render(<Checkbox defaultChecked aria-label="Test checkbox" />)
      const checkbox = screen.getByRole('checkbox')
      
      expect(checkbox).toHaveAttribute('data-state', 'checked')
      expect(checkbox.querySelector('svg')).toBeInTheDocument()
    })

    it('has proper focus styles', async () => {
      render(<Checkbox aria-label="Test checkbox" />)
      const checkbox = screen.getByRole('checkbox')
      
      await userEvent.tab()
      expect(checkbox).toHaveFocus()
      expect(checkbox).toHaveClass('focus-visible:ring-2')
      expect(checkbox).toHaveClass('focus-visible:ring-ring')
    })

    it('has proper hover styles', () => {
      render(<Checkbox aria-label="Test checkbox" />)
      const checkbox = screen.getByRole('checkbox')
      
      expect(checkbox).toHaveClass('border-primary')
      // Note: Can't test :hover pseudo-class directly
    })
  })

  describe('Keyboard Interaction', () => {
    it('supports Space key to toggle', async () => {
      render(<Checkbox aria-label="Test checkbox" />)
      const checkbox = screen.getByRole('checkbox')
      
      await userEvent.tab()
      expect(checkbox).toHaveFocus()
      
      await userEvent.keyboard(' ')
      expect(checkbox).toBeChecked()
      
      await userEvent.keyboard(' ')
      expect(checkbox).not.toBeChecked()
    })

    it('supports Enter key to toggle', async () => {
      render(<Checkbox aria-label="Test checkbox" />)
      const checkbox = screen.getByRole('checkbox')
      
      await userEvent.tab()
      expect(checkbox).toHaveFocus()
      
      await userEvent.keyboard('{Enter}')
      expect(checkbox).toBeChecked()
      
      await userEvent.keyboard('{Enter}')
      expect(checkbox).not.toBeChecked()
    })
  })

  describe('Accessibility', () => {
    it('has role="checkbox"', () => {
      render(<Checkbox aria-label="Test checkbox" />)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('supports aria-label', () => {
      render(<Checkbox aria-label="Accept terms" />)
      expect(screen.getByLabelText('Accept terms')).toBeInTheDocument()
    })

    it('supports aria-describedby', () => {
      render(
        <>
          <Checkbox aria-describedby="hint" aria-label="Test checkbox" />
          <div id="hint">Please check this box</div>
        </>
      )
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-describedby', 'hint')
    })

    it('supports external labels', () => {
      render(
        <label>
          <Checkbox />
          Accept terms and conditions
        </label>
      )
      expect(screen.getByLabelText('Accept terms and conditions')).toBeInTheDocument()
    })

    it('maintains proper contrast ratio', () => {
      render(<Checkbox aria-label="Test checkbox" />)
      const checkbox = screen.getByRole('checkbox')
      
      expect(checkbox).toHaveClass('border-primary')
      expect(checkbox).toHaveClass('data-[state=checked]:bg-primary')
      expect(checkbox).toHaveClass('data-[state=checked]:text-primary-foreground')
    })
  })
}) 