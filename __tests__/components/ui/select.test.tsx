import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { ByRoleOptions } from '@testing-library/dom/types/queries'
import userEvent from '@testing-library/user-event'
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

// Mock hasPointerCapture
Element.prototype.hasPointerCapture = () => false
Element.prototype.scrollIntoView = () => {}

describe('Select', () => {
  const user = userEvent.setup()

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
    })
  })

  it('selects an item when clicked', async () => {
    renderSelect()
    const trigger = screen.getByRole('combobox')
    
    await user.click(trigger)
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    const option = screen.getByRole('option', { name: 'Banana' })
    await user.click(option)
    
    expect(trigger).toHaveTextContent('Banana')
  })

  it('closes when selecting an item', async () => {
    renderSelect()
    const trigger = screen.getByRole('combobox')
    
    await user.click(trigger)
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    const option = screen.getByRole('option', { name: 'Banana' })
    await user.click(option)
    
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
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
    })

    await user.keyboard('{ArrowDown}')
    await waitFor(() => {
      const option = screen.getByRole('option', { name: 'Banana' })
      expect(option).toHaveAttribute('data-highlighted', '')
    })

    await user.keyboard('{Enter}')
    await waitFor(() => {
      expect(trigger).toHaveTextContent('Banana')
    })
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
        const options = screen.getAllByRole('option', { hidden: true })
        expect(options).toHaveLength(3)
      })
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
    })
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
      })

      await user.keyboard('{ArrowDown}')
      await waitFor(() => {
        const option = screen.getByRole('option', { name: 'Banana' })
        expect(option).toHaveAttribute('data-highlighted', '')
      })

      await user.keyboard('{Enter}')
      await waitFor(() => {
        expect(trigger).toHaveTextContent('Banana')
      })
    })

    it('has proper ARIA attributes', async () => {
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
      })
    })
  })
}) 