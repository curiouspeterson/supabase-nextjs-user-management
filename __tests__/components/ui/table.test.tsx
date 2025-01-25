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
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table'

describe('Table', () => {
  const renderTable = () => {
    return render(
      <Table>
        <TableCaption>A list of recent transactions</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>2024-01-24</TableCell>
            <TableCell>Coffee</TableCell>
            <TableCell>$5.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>2024-01-25</TableCell>
            <TableCell>Lunch</TableCell>
            <TableCell>$12.00</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell>$17.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    )
  }

  it('renders a complete table with all subcomponents', () => {
    renderTable()
    
    expect(screen.getByText('A list of recent transactions')).toBeInTheDocument()
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.getByText('Coffee')).toBeInTheDocument()
    expect(screen.getByText('Lunch')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  describe('Table (main container)', () => {
    it('renders with default styles', () => {
      render(<Table><TableBody><TableRow><TableCell>Content</TableCell></TableRow></TableBody></Table>)
      const table = screen.getByRole('table')
      
      expect(table).toHaveClass('w-full')
      expect(table).toHaveClass('caption-bottom')
      expect(table).toHaveClass('text-sm')
      expect(table.parentElement).toHaveClass('relative')
      expect(table.parentElement).toHaveClass('w-full')
      expect(table.parentElement).toHaveClass('overflow-auto')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLTableElement>()
      render(
        <Table ref={ref}>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLTableElement)
    })

    it('applies additional className', () => {
      render(
        <Table className="custom-class">
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const table = screen.getByRole('table')
      
      expect(table).toHaveClass('custom-class')
      expect(table).toHaveClass('w-full') // Still has default classes
    })
  })

  describe('TableHeader', () => {
    it('renders with default styles', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      )
      const header = screen.getByRole('rowgroup')
      
      expect(header).toHaveClass('[&_tr]:border-b')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLTableSectionElement>()
      render(
        <Table>
          <TableHeader ref={ref}>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLTableSectionElement)
    })
  })

  describe('TableBody', () => {
    it('renders with default styles', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const body = screen.getByRole('rowgroup')
      
      expect(body).toHaveClass('[&_tr:last-child]:border-0')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLTableSectionElement>()
      render(
        <Table>
          <TableBody ref={ref}>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLTableSectionElement)
    })
  })

  describe('TableFooter', () => {
    it('renders with default styles', () => {
      render(
        <Table>
          <TableFooter>
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )
      const footer = screen.getByRole('rowgroup')
      
      expect(footer).toHaveClass('border-t')
      expect(footer).toHaveClass('bg-muted/50')
      expect(footer).toHaveClass('font-medium')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLTableSectionElement>()
      render(
        <Table>
          <TableFooter ref={ref}>
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLTableSectionElement)
    })
  })

  describe('TableRow', () => {
    it('renders with default styles', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const row = screen.getByRole('row')
      
      expect(row).toHaveClass('border-b')
      expect(row).toHaveClass('transition-colors')
      expect(row).toHaveClass('hover:bg-muted/50')
      expect(row).toHaveClass('data-[state=selected]:bg-muted')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLTableRowElement>()
      render(
        <Table>
          <TableBody>
            <TableRow ref={ref}>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLTableRowElement)
    })
  })

  describe('TableHead', () => {
    it('renders with default styles', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      )
      const head = screen.getByRole('columnheader')
      
      expect(head).toHaveClass('h-12')
      expect(head).toHaveClass('px-4')
      expect(head).toHaveClass('text-left')
      expect(head).toHaveClass('align-middle')
      expect(head).toHaveClass('font-medium')
      expect(head).toHaveClass('text-muted-foreground')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLTableCellElement>()
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead ref={ref}>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLTableCellElement)
    })
  })

  describe('TableCell', () => {
    it('renders with default styles', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const cell = screen.getByRole('cell')
      
      expect(cell).toHaveClass('p-4')
      expect(cell).toHaveClass('align-middle')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLTableCellElement>()
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell ref={ref}>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLTableCellElement)
    })
  })

  describe('TableCaption', () => {
    it('renders with default styles', () => {
      render(
        <Table>
          <TableCaption>Caption</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const caption = screen.getByText('Caption')
      
      expect(caption.tagName).toBe('CAPTION')
      expect(caption).toHaveClass('mt-4')
      expect(caption).toHaveClass('text-sm')
      expect(caption).toHaveClass('text-muted-foreground')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLTableCaptionElement>()
      render(
        <Table>
          <TableCaption ref={ref}>Caption</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLTableCaptionElement)
    })
  })

  describe('Accessibility', () => {
    it('uses semantic table elements', () => {
      renderTable()
      
      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getAllByRole('rowgroup')).toHaveLength(3) // header, body, footer
      expect(screen.getAllByRole('row')).toHaveLength(4) // 1 header + 2 body + 1 footer
      expect(screen.getAllByRole('columnheader')).toHaveLength(3)
      expect(screen.getAllByRole('cell')).toHaveLength(8) // 3 rows * 3 cells
    })

    it('supports caption for table description', () => {
      renderTable()
      const caption = screen.getByText('A list of recent transactions')
      
      expect(caption.tagName).toBe('CAPTION')
    })

    it('maintains proper contrast ratio', () => {
      renderTable()
      
      const headers = screen.getAllByRole('columnheader')
      headers.forEach(header => {
        expect(header).toHaveClass('text-muted-foreground')
      })
    })
  })

  describe('Layout and Styling', () => {
    it('handles checkbox columns correctly', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="[&:has([role=checkbox])]:pr-0">
                <input type="checkbox" role="checkbox" />
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      )
      
      const head = screen.getByRole('columnheader')
      expect(head).toHaveClass('[&:has([role=checkbox])]:pr-0')
    })

    it('applies hover styles to rows', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      
      const row = screen.getByRole('row')
      expect(row).toHaveClass('hover:bg-muted/50')
    })

    it('supports selected state for rows', () => {
      render(
        <Table>
          <TableBody>
            <TableRow data-state="selected">
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      
      const row = screen.getByRole('row')
      expect(row).toHaveClass('data-[state=selected]:bg-muted')
    })
  })
}) 