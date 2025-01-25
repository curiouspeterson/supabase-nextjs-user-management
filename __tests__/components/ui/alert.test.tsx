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
  Alert,
  AlertTitle,
  AlertDescription,
} from '../../../components/ui/alert'
import { Terminal, AlertCircle, AlertTriangle, Info } from 'lucide-react'

describe('Alert', () => {
  const user = userEvent.setup()

  it('renders alert with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Test Title</AlertTitle>
        <AlertDescription>Test Description</AlertDescription>
      </Alert>
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('renders alert with destructive variant', () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Error Title</AlertTitle>
        <AlertDescription>Error Description</AlertDescription>
      </Alert>
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('border-destructive/50')
    expect(alert).toHaveClass('text-destructive')
  })

  it('renders alert with custom class name', () => {
    render(
      <Alert className="custom-class">
        <AlertTitle>Test Title</AlertTitle>
      </Alert>
    )

    expect(screen.getByRole('alert')).toHaveClass('custom-class')
  })

  it('renders alert with only title', () => {
    render(
      <Alert>
        <AlertTitle>Only Title</AlertTitle>
      </Alert>
    )

    expect(screen.getByText('Only Title')).toBeInTheDocument()
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
  })

  it('renders alert with only description', () => {
    render(
      <Alert>
        <AlertDescription>Only Description</AlertDescription>
      </Alert>
    )

    expect(screen.getByText('Only Description')).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('renders alert with custom content', () => {
    render(
      <Alert>
        <div data-testid="custom-content">Custom Content</div>
      </Alert>
    )

    expect(screen.getByTestId('custom-content')).toBeInTheDocument()
  })

  it('renders multiple alerts stacked', () => {
    render(
      <div>
        <Alert className="mb-4">
          <AlertTitle>First Alert</AlertTitle>
        </Alert>
        <Alert>
          <AlertTitle>Second Alert</AlertTitle>
        </Alert>
      </div>
    )

    expect(screen.getByText('First Alert')).toBeInTheDocument()
    expect(screen.getByText('Second Alert')).toBeInTheDocument()
  })

  it('should render alert with all subcomponents', () => {
    render(
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Alert Title</AlertTitle>
        <AlertDescription>Alert Description</AlertDescription>
      </Alert>
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Alert Title')).toBeInTheDocument()
    expect(screen.getByText('Alert Description')).toBeInTheDocument()
  })

  it('should render different variants', () => {
    const { rerender } = render(
      <Alert variant="default">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Default Alert</AlertTitle>
      </Alert>
    )

    // Default variant
    expect(screen.getByRole('alert')).toHaveClass('bg-background')

    // Destructive variant
    rerender(
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Destructive Alert</AlertTitle>
      </Alert>
    )
    expect(screen.getByRole('alert')).toHaveClass('border-destructive/50')
  })

  it('should handle custom class names', () => {
    render(
      <Alert className="custom-alert">
        <AlertTitle className="custom-title">Title</AlertTitle>
        <AlertDescription className="custom-description">Description</AlertDescription>
      </Alert>
    )

    expect(screen.getByRole('alert')).toHaveClass('custom-alert')
    expect(screen.getByText('Title')).toHaveClass('custom-title')
    expect(screen.getByText('Description')).toHaveClass('custom-description')
  })

  it('should handle long content', () => {
    const longText = 'Very long alert text '.repeat(20)
    render(
      <Alert>
        <AlertTitle>Long Title</AlertTitle>
        <AlertDescription>{longText}</AlertDescription>
      </Alert>
    )

    const description = screen.getByText(longText.trim())
    expect(description).toBeInTheDocument()
    expect(description).toHaveClass('text-sm')
  })

  it('should handle alert without icon', () => {
    render(
      <Alert>
        <AlertTitle>No Icon Alert</AlertTitle>
        <AlertDescription>Alert without an icon</AlertDescription>
      </Alert>
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('No Icon Alert')).toBeInTheDocument()
  })

  it('should handle alert with HTML content', () => {
    render(
      <Alert>
        <AlertTitle>
          <h1>HTML Title</h1>
        </AlertTitle>
        <AlertDescription>
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
          <ul>
            <li>List item 1</li>
            <li>List item 2</li>
          </ul>
        </AlertDescription>
      </Alert>
    )

    expect(screen.getByText('HTML Title')).toBeInTheDocument()
    expect(screen.getByText('Paragraph 1')).toBeInTheDocument()
    expect(screen.getByText('Paragraph 2')).toBeInTheDocument()
    expect(screen.getByText('List item 1')).toBeInTheDocument()
    expect(screen.getByText('List item 2')).toBeInTheDocument()
  })
}) 