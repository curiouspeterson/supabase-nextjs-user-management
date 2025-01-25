import * as React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

describe('Dialog Component', () => {
  const user = userEvent.setup()

  const renderDialog = () => {
    return render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
          <div>Dialog Content</div>
          <DialogFooter>
            <button className="close-button">Close</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  it('renders dialog with all subcomponents', async () => {
    renderDialog()
    
    await user.click(screen.getByRole('button', { name: 'Open Dialog' }))
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    expect(screen.getByText('Dialog Description')).toBeInTheDocument()
    expect(screen.getByText('Dialog Content')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('closes dialog on clicking close button', async () => {
    renderDialog()
    
    await user.click(screen.getByRole('button', { name: 'Open Dialog' }))
    await user.click(screen.getByRole('button', { name: 'Close' }))
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('closes dialog on pressing escape', async () => {
    renderDialog()
    
    await user.click(screen.getByRole('button', { name: 'Open Dialog' }))
    await user.keyboard('{Escape}')
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('maintains focus trap within dialog', async () => {
    renderDialog()
    
    await user.click(screen.getByRole('button', { name: 'Open Dialog' }))
    
    const dialog = screen.getByRole('dialog')
    const closeButton = screen.getByRole('button', { name: 'Close' })
    
    // Initial focus should be on the first focusable element
    expect(closeButton).toHaveFocus()
    
    // Tab should cycle through focusable elements
    await user.tab()
    expect(closeButton).toHaveFocus() // Should cycle back to first element
    
    // Shift+Tab should cycle backwards
    await user.keyboard('{Shift>}{Tab}{/Shift}')
    expect(closeButton).toHaveFocus() // Should cycle to last element
  })

  it('renders with custom class names', async () => {
    render(
      <Dialog>
        <DialogTrigger className="custom-trigger">Open Dialog</DialogTrigger>
        <DialogContent className="custom-content">
          <DialogHeader className="custom-header">
            <DialogTitle className="custom-title">Dialog Title</DialogTitle>
            <DialogDescription className="custom-description">Dialog Description</DialogDescription>
          </DialogHeader>
          <div>Dialog Content</div>
          <DialogFooter className="custom-footer">
            <button className="close-button" aria-label="Close dialog">Close</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
    
    await user.click(screen.getByRole('button', { name: 'Open Dialog' }))
    
    expect(screen.getByRole('dialog')).toHaveClass('custom-content')
    expect(screen.getByText('Dialog Title').parentElement).toHaveClass('custom-header')
    expect(screen.getByText('Dialog Title')).toHaveClass('custom-title')
    expect(screen.getByText('Dialog Description')).toHaveClass('custom-description')
    expect(screen.getByRole('button', { name: 'Close dialog' }).parentElement).toHaveClass('custom-footer')
  })

  it('should handle controlled open state', async () => {
    const TestComponent = () => {
      const [open, setOpen] = React.useState(false)
      return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Controlled Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      )
    }

    render(<TestComponent />)

    // Initially closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Open dialog
    await user.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Close with Escape
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('should handle nested dialogs', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open First</DialogTrigger>
        <DialogContent>
          <DialogTitle>First Dialog</DialogTitle>
          <Dialog>
            <DialogTrigger>Open Second</DialogTrigger>
            <DialogContent>
              <DialogTitle>Second Dialog</DialogTitle>
              <DialogClose>Close Second</DialogClose>
            </DialogContent>
          </Dialog>
          <DialogClose>Close First</DialogClose>
        </DialogContent>
      </Dialog>
    )

    // Open first dialog
    await user.click(screen.getByRole('button', { name: 'Open First' }))
    expect(screen.getByText('First Dialog')).toBeInTheDocument()

    // Open second dialog
    await user.click(screen.getByRole('button', { name: 'Open Second' }))
    expect(screen.getByText('Second Dialog')).toBeInTheDocument()

    // Close second dialog
    await user.click(screen.getByRole('button', { name: 'Close Second' }))
    await waitFor(() => {
      expect(screen.queryByText('Second Dialog')).not.toBeInTheDocument()
      expect(screen.getByText('First Dialog')).toBeInTheDocument()
    })

    // Close first dialog
    await user.click(screen.getByRole('button', { name: 'Close First' }))
    await waitFor(() => {
      expect(screen.queryByText('First Dialog')).not.toBeInTheDocument()
    })
  })

  it('should handle dialog with form submission', async () => {
    const handleSubmit = jest.fn()

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Enter text" />
            <button type="submit">Submit</button>
          </form>
          <DialogClose>Cancel</DialogClose>
        </DialogContent>
      </Dialog>
    )

    // Open dialog
    await user.click(screen.getByRole('button', { name: 'Open' }))

    // Fill and submit form
    await user.type(screen.getByPlaceholderText('Enter text'), 'Test input')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(handleSubmit).toHaveBeenCalled()
  })

  it('should handle dialog with dynamic content', async () => {
    const TestComponent = () => {
      const [content, setContent] = React.useState('Initial content')
      return (
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Dynamic Content</DialogTitle>
            <div>{content}</div>
            <Button onClick={() => setContent('Updated content')}>
              Update Content
            </Button>
            <DialogClose>Close</DialogClose>
          </DialogContent>
        </Dialog>
      )
    }

    render(<TestComponent />)

    // Open dialog
    await user.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.getByText('Initial content')).toBeInTheDocument()

    // Update content
    await user.click(screen.getByRole('button', { name: 'Update Content' }))
    expect(screen.getByText('Updated content')).toBeInTheDocument()
  })
}) 