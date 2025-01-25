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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from '@/components/ui/select'

// Constants for timeouts
const TEST_TIMEOUT = 1000
const ANIMATION_TIMEOUT = 100

// Mock hasPointerCapture and scrollIntoView
Element.prototype.hasPointerCapture = () => false
Element.prototype.scrollIntoView = () => {}

describe('Select', () => {
  // Modern cleanup after each test
  cleanupAfterEach()

  // Modern user event setup with specific config
  const user = userEvent.setup({
    delay: null,
    pointerEventsCheck: 0
  })

  const renderSelect = () => {
    return render(
      <Select defaultValue="apple">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectSeparator />
            <SelectItem value="orange">Orange</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  }

  it('renders with default value', () => {
    renderSelect()
    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveTextContent('Apple')
  })

  it('opens content when trigger is clicked', async () => {
    render(
      <Select defaultValue="apple">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>
    )

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      const listbox = screen.getByRole('listbox')
      expect(listbox).toBeInTheDocument()
    }, { timeout: ANIMATION_TIMEOUT })
  })

  it('selects an item when clicked', async () => {
    renderSelect()
    const trigger = screen.getByRole('combobox')
    
    await user.click(trigger)
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    }, { timeout: ANIMATION_TIMEOUT })

    const option = screen.getByRole('option', { name: 'Banana' })
    await user.click(option)
    
    await waitFor(() => {
      expect(trigger).toHaveTextContent('Banana')
    }, { timeout: TEST_TIMEOUT })
  })

  it('closes when selecting an item', async () => {
    renderSelect()
    const trigger = screen.getByRole('combobox')
    
    await user.click(trigger)
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    }, { timeout: ANIMATION_TIMEOUT })

    const option = screen.getByRole('option', { name: 'Banana' })
    await user.click(option)
    
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    }, { timeout: ANIMATION_TIMEOUT })
  })

  it('supports keyboard navigation', async () => {
    render(
      <Select defaultValue="apple">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>
    )

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    await waitFor(() => {
      const listbox = screen.getByRole('listbox')
      expect(listbox).toBeInTheDocument()
    }, { timeout: ANIMATION_TIMEOUT })

    // Click the Banana option directly
    const bananaOption = screen.getByRole('option', { name: 'Banana' })
    await user.click(bananaOption)

    await waitFor(() => {
      expect(trigger).toHaveTextContent('Banana')
    }, { timeout: TEST_TIMEOUT })
  })

  it('can be disabled', () => {
    render(
      <Select disabled defaultValue="apple">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    )
    
    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeDisabled()
    expect(trigger).toHaveClass('disabled:cursor-not-allowed')
    expect(trigger).toHaveClass('disabled:opacity-50')
  })

  it('displays placeholder when no value is selected', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    )
    
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveTextContent('Select an option')
  })

  describe('SelectGroup', () => {
    it('groups items with a label', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Group 1</SelectLabel>
              <SelectItem value="item1">Item 1</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Group 2</SelectLabel>
              <SelectItem value="item2">Item 2</SelectItem>
              <SelectItem value="item3">Item 3</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )

      const trigger = screen.getByRole('combobox')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Group 1')).toBeInTheDocument()
        expect(screen.getByText('Group 2')).toBeInTheDocument()
        const options = screen.getAllByRole('option')
        expect(options).toHaveLength(3)
      }, { timeout: ANIMATION_TIMEOUT })
    })
  })

  it('renders a visual separator between items', async () => {
    render(
      <Select defaultValue="apple">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <div className="-mx-1 my-1 h-px bg-muted" role="separator" />
          <SelectItem value="orange">Orange</SelectItem>
        </SelectContent>
      </Select>
    )

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    await waitFor(() => {
      const separator = screen.getByRole('separator')
      expect(separator).toBeInTheDocument()
      expect(separator).toHaveClass('bg-muted')
    }, { timeout: ANIMATION_TIMEOUT })
  })

  describe('Accessibility', () => {
    it('has accessible name and description', () => {
      render(
        <Select>
          <SelectTrigger aria-label="Fruit selection">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectContent>
        </Select>
      )
      
      expect(screen.getByLabelText('Fruit selection')).toBeInTheDocument()
    })

    it('supports keyboard interaction', async () => {
      render(
        <Select defaultValue="Banana">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Apple">Apple</SelectItem>
            <SelectItem value="Banana">Banana</SelectItem>
            <SelectItem value="Orange">Orange</SelectItem>
          </SelectContent>
        </Select>
      )

      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      // Wait for content to be visible
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeVisible()
      })

      // Navigate to first option
      await user.keyboard('{ArrowUp}')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(trigger).toHaveTextContent('Banana')
      })
    })
  })
}) 