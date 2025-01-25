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

// Constants for timeouts
const TEST_TIMEOUT = 15000
const ANIMATION_TIMEOUT = 1000

describe('Dialog Component', () => {
  // Modern cleanup after each test
  cleanupAfterEach()

  // Modern user event setup
  const user = userEvent.setup({
    delay: null,
    pointerEventsCheck: 0
  })

  beforeAll(() => {
    // Mock animation end events since JSDOM doesn't handle them
    Element.prototype.getAnimations = function() {
      return [{
        finished: Promise.resolve(),
        cancel: () => {},
        currentTime: 0,
        effect: null,
        id: '',
        oncancel: null,
        onfinish: null,
        onremove: null,
        pending: false,
        playState: 'finished' as const,
        playbackRate: 1,
        ready: Promise.resolve(),
        replaceState: 'active' as const,
        startTime: 0,
        timeline: null,
        play: () => {},
        pause: () => {},
        finish: () => {},
        reverse: () => {},
        persist: () => {},
        commitStyles: () => {},
        updatePlaybackRate: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      } as unknown as Animation]
    }
  })

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
            <DialogClose asChild>
              <button aria-label="Close dialog footer">Close Dialog</button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const openDialog = async () => {
    const trigger = screen.getByRole('button', { name: 'Open Dialog' })
    await user.click(trigger)
    await waitFor(() => {
      expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument()
    }, { timeout: ANIMATION_TIMEOUT })
  }

  it('renders dialog with all subcomponents', async () => {
    renderDialog()
    await openDialog()
    
    await waitFor(() => {
      const dialog = screen.getByRole('dialog', { hidden: true })
      expect(dialog).toBeInTheDocument()
      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
      expect(screen.getByText('Dialog Description')).toBeInTheDocument()
      expect(screen.getByText('Dialog Content')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Close dialog footer' })).toBeInTheDocument()
    }, { timeout: TEST_TIMEOUT })
  })

  it('closes dialog on clicking close button', async () => {
    renderDialog()
    await openDialog()

    const closeButton = screen.getByRole('button', { name: 'Close dialog footer' })
    await user.click(closeButton)
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument()
    }, { timeout: ANIMATION_TIMEOUT })
  })

  it('closes dialog on pressing escape', async () => {
    renderDialog()
    await openDialog()
    
    await user.keyboard('{Escape}')
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument()
    }, { timeout: ANIMATION_TIMEOUT })
  })

  it('maintains focus trap within dialog', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent hideCloseButton>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <button>First Button</button>
            <button>Second Button</button>
            <DialogClose asChild>
              <button aria-label="Close dialog footer">Close Dialog</button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    )

    const trigger = screen.getByRole('button', { name: 'Open Dialog' })
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument()
    }, { timeout: ANIMATION_TIMEOUT })

    // Wait for initial focus
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'First Button' })).toHaveFocus()
    }, { timeout: ANIMATION_TIMEOUT })

    // Tab through all focusable elements
    await user.tab()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Second Button' })).toHaveFocus()
    }, { timeout: ANIMATION_TIMEOUT })

    await user.tab()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close dialog footer' })).toHaveFocus()
    }, { timeout: ANIMATION_TIMEOUT })

    // Should cycle back to first button
    await user.tab()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'First Button' })).toHaveFocus()
    }, { timeout: ANIMATION_TIMEOUT })
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
            <button aria-label="Close dialog footer">Close Dialog</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )

    const trigger = screen.getByRole('button', { name: 'Open Dialog' })
    await user.click(trigger)

    await waitFor(() => {
      const dialog = screen.getByRole('dialog', { hidden: true })
      expect(dialog).toHaveClass('custom-content')
      expect(trigger).toHaveClass('custom-trigger')
      expect(screen.getByText('Dialog Title')).toHaveClass('custom-title')
      expect(screen.getByText('Dialog Description')).toHaveClass('custom-description')
      expect(screen.getByRole('button', { name: 'Close dialog footer' }).parentElement).toHaveClass('custom-footer')
    }, { timeout: TEST_TIMEOUT })
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
    expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument()

    // Open dialog
    await user.click(screen.getByRole('button', { name: 'Open' }))
    
    await waitFor(() => {
      expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument()
    }, { timeout: ANIMATION_TIMEOUT })

    // Close with Escape
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument()
    }, { timeout: ANIMATION_TIMEOUT })
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
    await waitFor(() => {
      expect(screen.getByText('First Dialog')).toBeInTheDocument()
    }, { timeout: ANIMATION_TIMEOUT })

    // Open second dialog
    await user.click(screen.getByRole('button', { name: 'Open Second' }))
    await waitFor(() => {
      expect(screen.getByText('Second Dialog')).toBeInTheDocument()
    }, { timeout: ANIMATION_TIMEOUT })

    // Close second dialog
    await user.click(screen.getByRole('button', { name: 'Close Second' }))
    await waitFor(() => {
      expect(screen.queryByText('Second Dialog')).not.toBeInTheDocument()
      expect(screen.getByText('First Dialog')).toBeInTheDocument()
    }, { timeout: ANIMATION_TIMEOUT })

    // Close first dialog
    await user.click(screen.getByRole('button', { name: 'Close First' }))
    await waitFor(() => {
      expect(screen.queryByText('First Dialog')).not.toBeInTheDocument()
    }, { timeout: ANIMATION_TIMEOUT })
  })

  it('should handle dialog with form submission', async () => {
    const handleSubmit = jest.fn((e) => {
      e.preventDefault()
    })

    render(
      <Dialog>
        <DialogTrigger>Open Form</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Form Dialog</DialogTitle>
            <DialogDescription>Please fill out the form</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Enter text" />
            <button type="submit">Submit Form</button>
          </form>
        </DialogContent>
      </Dialog>
    )

    // Open dialog
    await user.click(screen.getByRole('button', { name: 'Open Form' }))
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    }, { timeout: ANIMATION_TIMEOUT })

    // Fill and submit form
    await user.type(screen.getByPlaceholderText('Enter text'), 'Test input')
    await user.click(screen.getByRole('button', { name: 'Submit Form' }))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalled()
    }, { timeout: ANIMATION_TIMEOUT })
  })

  it('should handle dialog with dynamic content', async () => {
    const TestComponent = () => {
      const [content, setContent] = React.useState('Initial content')
      return (
        <Dialog>
          <DialogTrigger>Open Dynamic</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dynamic Dialog</DialogTitle>
              <DialogDescription>Content changes dynamically</DialogDescription>
            </DialogHeader>
            <div>{content}</div>
            <button onClick={() => setContent('Updated content')}>Update Content</button>
          </DialogContent>
        </Dialog>
      )
    }

    render(<TestComponent />)

    // Open dialog
    await user.click(screen.getByRole('button', { name: 'Open Dynamic' }))
    await waitFor(() => {
      expect(screen.getByText('Initial content')).toBeInTheDocument()
    }, { timeout: ANIMATION_TIMEOUT })

    // Update content
    await user.click(screen.getByRole('button', { name: 'Update Content' }))
    await waitFor(() => {
      expect(screen.getByText('Updated content')).toBeInTheDocument()
    }, { timeout: ANIMATION_TIMEOUT })
  })
}) 