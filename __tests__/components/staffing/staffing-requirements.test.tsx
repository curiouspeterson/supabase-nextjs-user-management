import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StaffingRequirementsTable } from '@/app/staffing/staffing-requirements-table'
import { createBrowserClient } from '@supabase/ssr'
import { useToast } from '@/components/ui/use-toast'

// Mock the useToast hook
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}))

// Mock the createBrowserClient
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(),
}))

const mockRequirements = [{
  id: 'test-req-1',
  shift: 'morning',
  day_of_week: 'monday',
  num_staff_required: 2,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}]

const mockSupabaseClient = {
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockResolvedValue({ data: mockRequirements, error: null }),
    delete: jest.fn().mockResolvedValue({ data: null, error: null })
  })
}

jest.mock('@/utils/supabase/client', () => ({
  createClient: () => mockSupabaseClient
}))

describe('StaffingRequirementsTable', () => {
  const user = userEvent.setup()
  const mockToast = jest.fn()
  let mockClient: any

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useToast as jest.Mock).mockReturnValue({ toast: mockToast })

    // Set up mock Supabase client with proper chaining
    mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    }

    // Set up default successful responses
    mockClient.order.mockImplementation(() => ({
      data: mockRequirements,
      error: null,
    }))

    mockClient.single.mockImplementation(() => ({
      data: mockRequirements[0],
      error: null,
    }))

    mockClient.delete.mockImplementation(() => ({
      data: [mockRequirements[0]],
      error: null,
    }))

    ;(createBrowserClient as jest.Mock).mockReturnValue(mockClient)
  })

  it('renders loading state initially', () => {
    render(<StaffingRequirementsTable isManager={true} />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders staffing requirements after loading', async () => {
    render(<StaffingRequirementsTable isManager={true} />)
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Morning')).toBeInTheDocument()
    expect(screen.getByText('9:00 AM - 5:00 PM')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('shows error state when loading fails', async () => {
    mockClient.order.mockImplementationOnce(() => ({
      data: null,
      error: new Error('Failed to load'),
    }))

    render(<StaffingRequirementsTable isManager={true} />)
    
    await waitFor(() => {
      expect(screen.getByText('Error loading staffing requirements')).toBeInTheDocument()
    })

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Failed to fetch staffing requirements',
      variant: 'destructive',
    })
  })

  it('allows managers to delete requirements', async () => {
    render(<StaffingRequirementsTable isManager={true} />)
    
    // Wait for requirements to load
    await waitFor(() => {
      expect(screen.getByText('monday')).toBeInTheDocument()
    })
    
    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await user.click(deleteButton)
    
    // Verify delete call
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('staffing_requirements')
    expect(mockSupabaseClient.from().delete).toHaveBeenCalledWith({ id: 'test-req-1' })
    
    // Verify success toast
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Requirement deleted successfully',
      variant: 'default'
    })
  })

  it('shows edit dialog when edit button is clicked', async () => {
    render(<StaffingRequirementsTable isManager={true} />)
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })

    const editButton = screen.getByRole('button', { name: /edit morning requirement/i })
    await user.click(editButton)

    expect(screen.getByText('Edit Staffing Requirement')).toBeInTheDocument()
    expect(screen.getByLabelText('Period Name')).toHaveValue('Morning')
    expect(screen.getByLabelText('Start Time')).toHaveValue('09:00')
    expect(screen.getByLabelText('End Time')).toHaveValue('17:00')
    expect(screen.getByLabelText('Minimum Employees')).toHaveValue(3)
  })

  it('hides action buttons for non-managers', () => {
    render(<StaffingRequirementsTable isManager={false} />)
    
    expect(screen.queryByRole('button', { name: /add requirement/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /edit morning requirement/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete morning requirement/i })).not.toBeInTheDocument()
  })
}) 