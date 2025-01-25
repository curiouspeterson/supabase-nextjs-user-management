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
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

describe('Card', () => {
  it('renders a complete card with all subcomponents', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    )

    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  describe('Card (main container)', () => {
    it('renders with default styles', () => {
      render(<Card>Content</Card>)
      const card = screen.getByText('Content').closest('div')
      expect(card).toHaveClass('rounded-lg border bg-card text-card-foreground')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<Card ref={ref}>Content</Card>)
      expect(ref).toHaveBeenCalled()
    })

    it('applies additional className', () => {
      render(<Card className="custom-class">Content</Card>)
      const card = screen.getByText('Content').closest('div')
      expect(card).toHaveClass('custom-class')
    })
  })

  describe('CardHeader', () => {
    it('renders with default styles', () => {
      render(
        <Card>
          <CardHeader>Header</CardHeader>
        </Card>
      )
      const header = screen.getByText('Header').closest('div')
      expect(header).toHaveClass('flex flex-col space-y-1.5 p-6')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(
        <Card>
          <CardHeader ref={ref}>Header</CardHeader>
        </Card>
      )
      expect(ref).toHaveBeenCalled()
    })
  })

  describe('CardTitle', () => {
    it('renders with default styles', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>
      )
      const title = screen.getByText('Title').closest('h3')
      expect(title).toHaveClass('text-2xl font-semibold leading-none tracking-tight')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(
        <Card>
          <CardHeader>
            <CardTitle ref={ref}>Title</CardTitle>
          </CardHeader>
        </Card>
      )
      expect(ref).toHaveBeenCalled()
    })
  })

  describe('CardDescription', () => {
    it('renders with default styles', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Description</CardDescription>
          </CardHeader>
        </Card>
      )
      const description = screen.getByText('Description').closest('p')
      expect(description).toHaveClass('text-sm text-muted-foreground')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(
        <Card>
          <CardHeader>
            <CardDescription ref={ref}>Description</CardDescription>
          </CardHeader>
        </Card>
      )
      expect(ref).toHaveBeenCalled()
    })
  })

  describe('CardContent', () => {
    it('renders with default styles', () => {
      render(
        <Card>
          <CardContent>Content</CardContent>
        </Card>
      )
      const content = screen.getByText('Content').closest('div')
      expect(content).toHaveClass('p-6 pt-0')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(
        <Card>
          <CardContent ref={ref}>Content</CardContent>
        </Card>
      )
      expect(ref).toHaveBeenCalled()
    })
  })

  describe('CardFooter', () => {
    it('renders with default styles', () => {
      render(
        <Card>
          <CardFooter>Footer</CardFooter>
        </Card>
      )
      const footer = screen.getByText('Footer').closest('div')
      expect(footer).toHaveClass('flex items-center p-6 pt-0')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(
        <Card>
          <CardFooter ref={ref}>Footer</CardFooter>
        </Card>
      )
      expect(ref).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('maintains proper heading hierarchy', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
        </Card>
      )
      const title = screen.getByText('Title')
      expect(title.tagName).toBe('H3')
    })

    it('maintains proper contrast ratio', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
        </Card>
      )
      const card = screen.getByText('Title').closest('div[class*="bg-card"]')
      expect(card).toHaveClass('bg-card text-card-foreground')
    })

    it('supports custom roles and ARIA attributes', () => {
      render(
        <Card role="region" aria-label="Test Card">
          <CardContent>Content</CardContent>
        </Card>
      )
      const card = screen.getByRole('region')
      expect(card).toHaveAttribute('aria-label', 'Test Card')
    })
  })

  describe('Layout and Spacing', () => {
    it('maintains consistent padding', () => {
      render(
        <Card>
          <CardHeader>Header</CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      )
      const header = screen.getByText('Header').closest('div')
      const content = screen.getByText('Content').closest('div')
      const footer = screen.getByText('Footer').closest('div')
      
      expect(header).toHaveClass('p-6')
      expect(content).toHaveClass('p-6')
      expect(footer).toHaveClass('p-6')
    })

    it('removes top padding for content and footer', () => {
      render(
        <Card>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      )
      const content = screen.getByText('Content').closest('div')
      const footer = screen.getByText('Footer').closest('div')
      
      expect(content).toHaveClass('pt-0')
      expect(footer).toHaveClass('pt-0')
    })
  })
}) 