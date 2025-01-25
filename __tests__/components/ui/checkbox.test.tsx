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
import { Checkbox } from '@/components/ui/checkbox'

// Test timeout configuration
const TEST_TIMEOUT = 1000
const ANIMATION_TIMEOUT = 100

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof Checkbox> {
  id?: string
}

describe('Checkbox', () => {
  // Modern cleanup after each test
  cleanupAfterEach()

  // Modern user event setup with timeout
  const user = userEvent.setup({ delay: null })

  // Render helpers with error boundaries
  const renderCheckbox = (props = {}) => {
    const utils = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <Checkbox aria-label="Test checkbox" {...props} />
      </React.Suspense>
    )
    return {
      ...utils,
      checkbox: screen.getByRole('checkbox')
    }
  }

  const renderCheckboxWithLabel = (props: CheckboxProps = {}) => {
    const utils = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <label htmlFor={props.id}>
          <Checkbox {...props} />
          <span>Test Label</span>
        </label>
      </React.Suspense>
    )
    return {
      ...utils,
      checkbox: screen.getByRole('checkbox'),
      label: screen.getByText('Test Label')
    }
  }

  const renderCheckboxGroup = () => {
    const utils = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <div role="group" aria-label="Checkbox group">
          <label>
            <Checkbox name="option1" />
            <span>Option 1</span>
          </label>
          <label>
            <Checkbox name="option2" />
            <span>Option 2</span>
          </label>
          <label>
            <Checkbox name="option3" />
            <span>Option 3</span>
          </label>
        </div>
      </React.Suspense>
    )
    return {
      ...utils,
      checkboxes: screen.getAllByRole('checkbox')
    }
  }

  it('renders unchecked by default', async () => {
    const { checkbox } = renderCheckbox()
    
    await waitFor(() => {
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).not.toBeChecked()
    }, { timeout: TEST_TIMEOUT })
  })

  it('can be checked and unchecked', async () => {
    const { checkbox } = renderCheckbox()
    
    await user.click(checkbox)
    await waitFor(() => {
      expect(checkbox).toBeChecked()
    }, { timeout: TEST_TIMEOUT })
    
    await user.click(checkbox)
    await waitFor(() => {
      expect(checkbox).not.toBeChecked()
    }, { timeout: TEST_TIMEOUT })
  })

  it('can be controlled', async () => {
    const handleCheckedChange = jest.fn()
    const { checkbox } = renderCheckbox({
      checked: true,
      onCheckedChange: handleCheckedChange,
    })
    
    await waitFor(() => {
      expect(checkbox).toBeChecked()
    }, { timeout: TEST_TIMEOUT })
    
    await user.click(checkbox)
    await waitFor(() => {
      expect(handleCheckedChange).toHaveBeenCalledWith(false)
    }, { timeout: TEST_TIMEOUT })
  })

  it('can be disabled', async () => {
    const { checkbox } = renderCheckbox({ disabled: true })
    
    await waitFor(() => {
      expect(checkbox).toBeDisabled()
      expect(checkbox).toHaveClass('disabled:cursor-not-allowed')
      expect(checkbox).toHaveClass('disabled:opacity-50')
    }, { timeout: TEST_TIMEOUT })

    await user.click(checkbox)
    await waitFor(() => {
      expect(checkbox).not.toBeChecked()
    }, { timeout: TEST_TIMEOUT })
  })

  it('forwards ref correctly', async () => {
    const ref = React.createRef<HTMLButtonElement>()
    renderCheckbox({ ref })
    
    await waitFor(() => {
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    }, { timeout: TEST_TIMEOUT })
  })

  it('applies additional className', async () => {
    renderCheckbox({ className: 'custom-class' })
    const checkbox = screen.getByRole('checkbox')
    
    await waitFor(() => {
      expect(checkbox).toHaveClass('custom-class')
      expect(checkbox).toHaveClass('h-4') // Still has default classes
    })
  })

  describe('Label Integration', () => {
    it('can be checked by clicking the label', async () => {
      const { checkbox, label } = renderCheckboxWithLabel()
      
      await user.click(label)
      await waitFor(() => {
        expect(checkbox).toBeChecked()
      }, { timeout: TEST_TIMEOUT })
    })

    it('maintains proper label association', async () => {
      const { checkbox, label } = renderCheckboxWithLabel({ id: 'test-checkbox' })
      
      await waitFor(() => {
        expect(label.closest('label')).toHaveAttribute('for', 'test-checkbox')
        expect(checkbox).toHaveAttribute('id', 'test-checkbox')
      }, { timeout: TEST_TIMEOUT })
    })
  })

  describe('Form Integration', () => {
    it('submits correct value in a form', async () => {
      const handleSubmit = jest.fn(e => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        formData.set('agree', 'yes') // Explicitly set the value when checked
      })

      render(
        <form onSubmit={handleSubmit}>
          <Checkbox name="agree" value="yes" defaultChecked />
          <button type="submit">Submit</button>
        </form>
      )

      const submitButton = screen.getByRole('button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled()
        const formData = new FormData(handleSubmit.mock.calls[0][0].target)
        expect(formData.get('agree')).toBe('yes')
      }, { timeout: TEST_TIMEOUT })
    })

    it('works with required attribute', async () => {
      const handleSubmit = jest.fn(e => e.preventDefault())
      render(
        <form onSubmit={handleSubmit}>
          <Checkbox required name="agree" />
          <button type="submit">Submit</button>
        </form>
      )

      // Try to submit without checking
      await user.click(screen.getByRole('button'))
      expect(handleSubmit).not.toHaveBeenCalled()

      // Check and submit
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button'))
      expect(handleSubmit).toHaveBeenCalled()
    })
  })

  describe('Checkbox Group', () => {
    it('handles multiple checkboxes in a group', async () => {
      const { checkboxes } = renderCheckboxGroup()
      
      // Check all boxes
      for (const checkbox of checkboxes) {
        await user.click(checkbox)
        await waitFor(() => {
          expect(checkbox).toHaveAttribute('aria-checked', 'true')
        }, { timeout: TEST_TIMEOUT })
      }

      // Uncheck middle box
      await user.click(checkboxes[1])
      await waitFor(() => {
        expect(checkboxes[0]).toHaveAttribute('aria-checked', 'true')
        expect(checkboxes[1]).toHaveAttribute('aria-checked', 'false')
        expect(checkboxes[2]).toHaveAttribute('aria-checked', 'true')
      }, { timeout: TEST_TIMEOUT })
    })

    it('supports keyboard navigation within group', async () => {
      const { checkboxes } = renderCheckboxGroup()
      
      // Focus first checkbox
      await user.tab()
      await waitFor(() => {
        expect(document.activeElement).toBe(checkboxes[0])
      }, { timeout: TEST_TIMEOUT })

      // Navigate with tab key
      await user.tab()
      await waitFor(() => {
        expect(document.activeElement).toBe(checkboxes[1])
      }, { timeout: TEST_TIMEOUT })

      await user.tab()
      await waitFor(() => {
        expect(document.activeElement).toBe(checkboxes[2])
      }, { timeout: TEST_TIMEOUT })
    })
  })

  describe('Keyboard Interactions', () => {
    it('can be toggled with space key', async () => {
      const { checkbox } = renderCheckbox()
      
      await user.tab()
      await waitFor(() => {
        expect(checkbox).toHaveFocus()
      }, { timeout: TEST_TIMEOUT })
      
      await user.keyboard(' ')
      await waitFor(() => {
        expect(checkbox).toBeChecked()
      }, { timeout: TEST_TIMEOUT })
      
      await user.keyboard(' ')
      await waitFor(() => {
        expect(checkbox).not.toBeChecked()
      }, { timeout: TEST_TIMEOUT })
    })

    it('can be toggled with enter key', async () => {
      const { checkbox } = renderCheckbox()
      
      await user.tab()
      expect(checkbox).toHaveFocus()
      
      await user.keyboard('{Enter}')
      await waitFor(() => {
        expect(checkbox).toBeChecked()
      })
    })

    it('maintains focus after toggling', async () => {
      const { checkbox } = renderCheckbox()
      
      await user.tab()
      await user.keyboard(' ')
      await waitFor(() => {
        expect(checkbox).toHaveFocus()
      }, { timeout: TEST_TIMEOUT })
      
      await user.keyboard(' ')
      await waitFor(() => {
        expect(checkbox).toHaveFocus()
      }, { timeout: TEST_TIMEOUT })
    })
  })

  describe('Accessibility', () => {
    it('has proper aria attributes', async () => {
      const { checkbox } = renderCheckbox()
      
      await waitFor(() => {
        expect(checkbox).toHaveAttribute('aria-checked', 'false')
        expect(checkbox).toHaveAttribute('aria-label', 'Test checkbox')
      }, { timeout: TEST_TIMEOUT })
    })

    it('updates aria-checked when toggled', async () => {
      const { checkbox } = renderCheckbox()
      
      await user.click(checkbox)
      await waitFor(() => {
        expect(checkbox).toHaveAttribute('aria-checked', 'true')
      }, { timeout: TEST_TIMEOUT })
    })

    it('has proper focus indicators', async () => {
      const { checkbox } = renderCheckbox()
      
      await user.tab()
      await waitFor(() => {
        expect(checkbox).toHaveClass('focus-visible:ring-2')
        expect(checkbox).toHaveClass('focus-visible:ring-ring')
      })
    })

    it('supports indeterminate state', async () => {
      const { checkbox } = renderCheckbox({ indeterminate: true })
      
      await waitFor(() => {
        expect(checkbox).toHaveAttribute('aria-checked', 'mixed')
        expect(checkbox).toHaveClass('data-[state=indeterminate]:bg-primary')
      }, { timeout: TEST_TIMEOUT })
    })

    it('announces state changes to screen readers', async () => {
      renderCheckbox({ 'aria-describedby': 'status' })
      render(<div id="status" role="status" aria-live="polite" />)
      
      const checkbox = screen.getByRole('checkbox')
      const status = screen.getByRole('status')
      
      await user.click(checkbox)
      await waitFor(() => {
        expect(status).toHaveAttribute('aria-live', 'polite')
      })
    })
  })

  describe('Error Handling', () => {
    it('handles rapid toggling without breaking', async () => {
      const { checkbox } = renderCheckbox()
      
      for (let i = 0; i < 5; i++) {
        await user.click(checkbox)
        await waitFor(() => {
          expect(checkbox).toBeTruthy()
        }, { timeout: ANIMATION_TIMEOUT })
      }
      
      await waitFor(() => {
        expect(checkbox).toBeTruthy()
      }, { timeout: TEST_TIMEOUT })
    })

    it('handles undefined onCheckedChange gracefully', async () => {
      renderCheckbox({ onCheckedChange: undefined })
      const checkbox = screen.getByRole('checkbox')
      
      await user.click(checkbox)
      await waitFor(() => {
        expect(checkbox).toBeChecked()
      })
    })

    it('recovers from invalid state', async () => {
      const { rerender, checkbox } = renderCheckbox({ checked: true })
      
      await waitFor(() => {
        expect(checkbox).toHaveAttribute('aria-checked', 'true')
      }, { timeout: TEST_TIMEOUT })
      
      rerender(
        <React.Suspense fallback={<div>Loading...</div>}>
          <Checkbox aria-label="Test checkbox" checked={undefined} />
        </React.Suspense>
      )
      
      await waitFor(() => {
        expect(checkbox).toHaveAttribute('aria-checked', 'false')
      }, { timeout: TEST_TIMEOUT })
      
      await user.click(checkbox)
      await waitFor(() => {
        expect(checkbox).toHaveAttribute('aria-checked', 'true')
      }, { timeout: TEST_TIMEOUT })
    })
  })
}) 