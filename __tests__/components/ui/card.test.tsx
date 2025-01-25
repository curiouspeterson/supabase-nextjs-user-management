import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

describe('Card', () => {
  const renderCard = () => {
    return render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
    )
  }

  it('renders a complete card with all subcomponents', () => {
    renderCard()
    
    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card Description')).toBeInTheDocument()
    expect(screen.getByText('Card Content')).toBeInTheDocument()
    expect(screen.getByText('Card Footer')).toBeInTheDocument()
  })

  describe('Card (main container)', () => {
    it('renders with default styles', () => {
      render(<Card>Content</Card>)
      const card = screen.getByText('Content').parentElement
      
      expect(card).toHaveClass('rounded-lg')
      expect(card).toHaveClass('border')
      expect(card).toHaveClass('bg-card')
      expect(card).toHaveClass('text-card-foreground')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Card ref={ref}>Content</Card>)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('applies additional className', () => {
      render(<Card className="custom-class">Content</Card>)
      const card = screen.getByText('Content').parentElement
      
      expect(card).toHaveClass('custom-class')
      expect(card).toHaveClass('rounded-lg') // Still has default classes
    })
  })

  describe('CardHeader', () => {
    it('renders with default styles', () => {
      render(<CardHeader>Header Content</CardHeader>)
      const header = screen.getByText('Header Content').parentElement
      
      expect(header).toHaveClass('flex')
      expect(header).toHaveClass('flex-col')
      expect(header).toHaveClass('space-y-1.5')
      expect(header).toHaveClass('p-6')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CardHeader ref={ref}>Header Content</CardHeader>)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('CardTitle', () => {
    it('renders with default styles', () => {
      render(<CardTitle>Card Title</CardTitle>)
      const title = screen.getByText('Card Title')
      
      expect(title.tagName).toBe('H3')
      expect(title).toHaveClass('text-2xl')
      expect(title).toHaveClass('font-semibold')
      expect(title).toHaveClass('leading-none')
      expect(title).toHaveClass('tracking-tight')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLHeadingElement>()
      render(<CardTitle ref={ref}>Card Title</CardTitle>)
      
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement)
    })
  })

  describe('CardDescription', () => {
    it('renders with default styles', () => {
      render(<CardDescription>Card Description</CardDescription>)
      const description = screen.getByText('Card Description')
      
      expect(description.tagName).toBe('P')
      expect(description).toHaveClass('text-sm')
      expect(description).toHaveClass('text-muted-foreground')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLParagraphElement>()
      render(<CardDescription ref={ref}>Card Description</CardDescription>)
      
      expect(ref.current).toBeInstanceOf(HTMLParagraphElement)
    })
  })

  describe('CardContent', () => {
    it('renders with default styles', () => {
      render(<CardContent>Content</CardContent>)
      const content = screen.getByText('Content').parentElement
      
      expect(content).toHaveClass('p-6')
      expect(content).toHaveClass('pt-0')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CardContent ref={ref}>Content</CardContent>)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('CardFooter', () => {
    it('renders with default styles', () => {
      render(<CardFooter>Footer Content</CardFooter>)
      const footer = screen.getByText('Footer Content').parentElement
      
      expect(footer).toHaveClass('flex')
      expect(footer).toHaveClass('items-center')
      expect(footer).toHaveClass('p-6')
      expect(footer).toHaveClass('pt-0')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CardFooter ref={ref}>Footer Content</CardFooter>)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('Accessibility', () => {
    it('maintains proper heading hierarchy', () => {
      renderCard()
      const title = screen.getByText('Card Title')
      
      expect(title.tagName).toBe('H3')
    })

    it('maintains proper contrast ratio', () => {
      renderCard()
      const description = screen.getByText('Card Description')
      
      expect(description).toHaveClass('text-muted-foreground')
    })

    it('supports custom roles and ARIA attributes', () => {
      render(
        <Card role="region" aria-label="Example card">
          <CardContent>Content</CardContent>
        </Card>
      )
      
      const card = screen.getByRole('region')
      expect(card).toHaveAttribute('aria-label', 'Example card')
    })
  })

  describe('Layout and Spacing', () => {
    it('maintains consistent padding', () => {
      renderCard()
      
      const header = screen.getByText('Card Title').closest('div')
      const content = screen.getByText('Card Content').parentElement
      const footer = screen.getByText('Card Footer').parentElement
      
      expect(header).toHaveClass('p-6')
      expect(content).toHaveClass('p-6')
      expect(footer).toHaveClass('p-6')
    })

    it('removes top padding for content and footer', () => {
      renderCard()
      
      const content = screen.getByText('Card Content').parentElement
      const footer = screen.getByText('Card Footer').parentElement
      
      expect(content).toHaveClass('pt-0')
      expect(footer).toHaveClass('pt-0')
    })
  })
}) 