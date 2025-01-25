import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StaffingRequirementsTable } from '@/app/staffing/staffing-requirements-table'
import { useToast } from '@/components/ui/use-toast'

// Mock useToast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn()
}))

// Mock createClient
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    delete: jest.fn().mockResolvedValue({ error: null }),
    upsert: jest.fn().mockResolvedValue({ error: null }),
    single: jest.fn().mockResolvedValue({ data: mockRequirements[0], error: null })
  })),
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user', role: 'manager' } }, error: null })
  }
}

const mockCreateClient = jest.fn(() => mockSupabaseClient)

jest.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient
}))

const mockRequirements = [
  {
    id: 'test-req-1',
    period_name: 'Morning',
    start_time: '09:00',
    end_time: '17:00',
    min_staff: 3,
    requires_supervisor: true,
    created_at: '2025-01-25T12:00:00Z',
    updated_at: '2025-01-25T12:00:00Z'
  }
]

describe('StaffingRequirementsTable', () => {
  let user: ReturnType<typeof userEvent.setup>
  const mockToast = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    user = userEvent.setup()
    ;(useToast as jest.Mock).mockReturnValue({ toast: mockToast })
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
    mockSupabaseClient.from.mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValue({ data: null, error: new Error('Failed to load') }),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      delete: jest.fn().mockResolvedValue({ error: null }),
      upsert: jest.fn().mockResolvedValue({ error: null }),
      single: jest.fn().mockResolvedValue({ data: null, error: null })
    }))

    render(<StaffingRequirementsTable isManager={true} />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load')).toBeInTheDocument()
    })
  })

  it('allows managers to delete requirements', async () => {
    render(<StaffingRequirementsTable isManager={true} />)
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })
    
    const deleteButton = screen.getByRole('button', { name: /delete morning requirement/i })
    await user.click(deleteButton)
    
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('staffing_requirements')
    expect(mockSupabaseClient.from().delete).toHaveBeenCalledWith({ id: 'test-req-1' })
    
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

  describe('Edit Functionality', () => {
    beforeEach(async () => {
      render(<StaffingRequirementsTable isManager={true} />)
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
      const editButton = screen.getByRole('button', { name: /edit morning requirement/i })
      await user.click(editButton)
    })

    it('validates form inputs', async () => {
      // Clear required fields
      const periodNameInput = screen.getByLabelText('Period Name')
      const startTimeInput = screen.getByLabelText('Start Time')
      const endTimeInput = screen.getByLabelText('End Time')
      const minEmployeesInput = screen.getByLabelText('Minimum Employees')

      await user.clear(periodNameInput)
      await user.clear(startTimeInput)
      await user.clear(endTimeInput)
      await user.clear(minEmployeesInput)

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      // Check validation messages
      expect(screen.getByText('Period name is required')).toBeInTheDocument()
      expect(screen.getByText('Start time is required')).toBeInTheDocument()
      expect(screen.getByText('End time is required')).toBeInTheDocument()
      expect(screen.getByText('Minimum employees is required')).toBeInTheDocument()
    })

    it('validates time period overlap', async () => {
      const startTimeInput = screen.getByLabelText('Start Time')
      const endTimeInput = screen.getByLabelText('End Time')

      await user.clear(startTimeInput)
      await user.clear(endTimeInput)
      await user.type(startTimeInput, '17:00')
      await user.type(endTimeInput, '09:00')

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      expect(screen.getByText('End time must be after start time')).toBeInTheDocument()
    })

    it('successfully updates requirement', async () => {
      const periodNameInput = screen.getByLabelText('Period Name')
      const minEmployeesInput = screen.getByLabelText('Minimum Employees')
      const supervisorCheckbox = screen.getByRole('checkbox', { name: /requires supervisor/i })

      await user.clear(periodNameInput)
      await user.type(periodNameInput, 'Afternoon')
      await user.clear(minEmployeesInput)
      await user.type(minEmployeesInput, '5')
      await user.click(supervisorCheckbox)

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('staffing_requirements')
      expect(mockSupabaseClient.from().upsert).toHaveBeenCalledWith({
        id: 'test-req-1',
        period_name: 'Afternoon',
        min_staff: 5,
        requires_supervisor: false,
        start_time: '09:00',
        end_time: '17:00'
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Requirement updated successfully',
        variant: 'default'
      })

      // Dialog should be closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('handles update errors', async () => {
      // Mock error response
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({ data: mockRequirements, error: null }),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        delete: jest.fn().mockResolvedValue({ error: null }),
        upsert: jest.fn().mockResolvedValue({ 
          error: new Error('Failed to update requirement')
        }),
        single: jest.fn().mockResolvedValue({ data: null, error: null })
      }))

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to update requirement',
        variant: 'destructive'
      })

      // Dialog should remain open
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('maintains accessibility standards', async () => {
      // Check dialog accessibility
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-labelledby')
      expect(dialog).toHaveAttribute('aria-describedby')

      // Check form controls
      expect(screen.getByLabelText('Period Name')).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText('Start Time')).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText('End Time')).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText('Minimum Employees')).toHaveAttribute('aria-required', 'true')

      // Check button accessibility
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(saveButton).toHaveAttribute('type', 'submit')
      expect(cancelButton).toHaveAttribute('type', 'button')

      // Test keyboard navigation
      await user.tab()
      expect(screen.getByLabelText('Period Name')).toHaveFocus()
      await user.tab()
      expect(screen.getByLabelText('Start Time')).toHaveFocus()
      await user.tab()
      expect(screen.getByLabelText('End Time')).toHaveFocus()
    })
  })

  describe('Delete Functionality', () => {
    it('shows confirmation dialog before deleting', async () => {
      render(<StaffingRequirementsTable isManager={true} />)
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
      
      const deleteButton = screen.getByRole('button', { name: /delete morning requirement/i })
      await user.click(deleteButton)

      expect(screen.getByRole('alertdialog')).toBeInTheDocument()
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('handles delete errors', async () => {
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({ data: mockRequirements, error: null }),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        delete: jest.fn().mockResolvedValue({ 
          error: new Error('Failed to delete requirement')
        }),
        upsert: jest.fn().mockResolvedValue({ error: null }),
        single: jest.fn().mockResolvedValue({ data: null, error: null })
      }))

      render(<StaffingRequirementsTable isManager={true} />)
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
      
      const deleteButton = screen.getByRole('button', { name: /delete morning requirement/i })
      await user.click(deleteButton)
      
      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      await user.click(confirmButton)

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to delete requirement',
        variant: 'destructive'
      })
    })

    it('cancels deletion when cancel is clicked', async () => {
      render(<StaffingRequirementsTable isManager={true} />)
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
      
      const deleteButton = screen.getByRole('button', { name: /delete morning requirement/i })
      await user.click(deleteButton)
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      expect(mockSupabaseClient.from().delete).not.toHaveBeenCalled()
    })
  })

  describe('Add New Requirement', () => {
    it('shows add dialog when add button is clicked', async () => {
      render(<StaffingRequirementsTable isManager={true} />)
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
      
      const addButton = screen.getByRole('button', { name: /add requirement/i })
      await user.click(addButton)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Add Staffing Requirement')).toBeInTheDocument()
      expect(screen.getByLabelText('Period Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Start Time')).toBeInTheDocument()
      expect(screen.getByLabelText('End Time')).toBeInTheDocument()
      expect(screen.getByLabelText('Minimum Employees')).toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: /requires supervisor/i })).toBeInTheDocument()
    })

    it('validates required fields', async () => {
      render(<StaffingRequirementsTable isManager={true} />)
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
      
      const addButton = screen.getByRole('button', { name: /add requirement/i })
      await user.click(addButton)

      // Try to submit empty form
      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      expect(screen.getByText('Period name is required')).toBeInTheDocument()
      expect(screen.getByText('Start time is required')).toBeInTheDocument()
      expect(screen.getByText('End time is required')).toBeInTheDocument()
      expect(screen.getByText('Minimum employees is required')).toBeInTheDocument()
    })

    it('validates time period overlap with existing requirements', async () => {
      render(<StaffingRequirementsTable isManager={true} />)
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
      
      const addButton = screen.getByRole('button', { name: /add requirement/i })
      await user.click(addButton)

      // Fill form with overlapping time period
      await user.type(screen.getByLabelText('Period Name'), 'Overlap Period')
      await user.type(screen.getByLabelText('Start Time'), '08:00')
      await user.type(screen.getByLabelText('End Time'), '10:00')
      await user.type(screen.getByLabelText('Minimum Employees'), '4')

      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      expect(screen.getByText('Time period overlaps with existing requirement')).toBeInTheDocument()
    })

    it('successfully adds new requirement', async () => {
      render(<StaffingRequirementsTable isManager={true} />)
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
      
      const addButton = screen.getByRole('button', { name: /add requirement/i })
      await user.click(addButton)

      // Fill form with valid data
      await user.type(screen.getByLabelText('Period Name'), 'Evening')
      await user.type(screen.getByLabelText('Start Time'), '17:00')
      await user.type(screen.getByLabelText('End Time'), '23:00')
      await user.type(screen.getByLabelText('Minimum Employees'), '4')
      await user.click(screen.getByRole('checkbox', { name: /requires supervisor/i }))

      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('staffing_requirements')
      expect(mockSupabaseClient.from().upsert).toHaveBeenCalledWith({
        period_name: 'Evening',
        start_time: '17:00',
        end_time: '23:00',
        min_staff: 4,
        requires_supervisor: true
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Requirement added successfully',
        variant: 'default'
      })

      // Dialog should be closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('handles add errors', async () => {
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({ data: mockRequirements, error: null }),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        delete: jest.fn().mockResolvedValue({ error: null }),
        upsert: jest.fn().mockResolvedValue({ 
          error: new Error('Failed to add requirement')
        }),
        single: jest.fn().mockResolvedValue({ data: null, error: null })
      }))

      render(<StaffingRequirementsTable isManager={true} />)
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
      
      const addButton = screen.getByRole('button', { name: /add requirement/i })
      await user.click(addButton)

      // Fill form with valid data
      await user.type(screen.getByLabelText('Period Name'), 'Evening')
      await user.type(screen.getByLabelText('Start Time'), '17:00')
      await user.type(screen.getByLabelText('End Time'), '23:00')
      await user.type(screen.getByLabelText('Minimum Employees'), '4')

      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to add requirement',
        variant: 'destructive'
      })

      // Dialog should remain open
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('maintains accessibility standards', async () => {
      render(<StaffingRequirementsTable isManager={true} />)
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
      
      const addButton = screen.getByRole('button', { name: /add requirement/i })
      await user.click(addButton)

      // Check dialog accessibility
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-labelledby')
      expect(dialog).toHaveAttribute('aria-describedby')

      // Check form controls
      expect(screen.getByLabelText('Period Name')).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText('Start Time')).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText('End Time')).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText('Minimum Employees')).toHaveAttribute('aria-required', 'true')

      // Check button accessibility
      const saveButton = screen.getByRole('button', { name: /save/i })
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(saveButton).toHaveAttribute('type', 'submit')
      expect(cancelButton).toHaveAttribute('type', 'button')

      // Test keyboard navigation
      await user.tab()
      expect(screen.getByLabelText('Period Name')).toHaveFocus()
      await user.tab()
      expect(screen.getByLabelText('Start Time')).toHaveFocus()
      await user.tab()
      expect(screen.getByLabelText('End Time')).toHaveFocus()
      await user.tab()
      expect(screen.getByLabelText('Minimum Employees')).toHaveFocus()
      await user.tab()
      expect(screen.getByRole('checkbox', { name: /requires supervisor/i })).toHaveFocus()
    })
  })

  describe('Table Functionality', () => {
    it('shows empty state when no requirements exist', async () => {
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        delete: jest.fn().mockResolvedValue({ error: null }),
        upsert: jest.fn().mockResolvedValue({ error: null }),
        single: jest.fn().mockResolvedValue({ data: null, error: null })
      }))

      render(<StaffingRequirementsTable isManager={true} />)
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      expect(screen.getByText('No staffing requirements found')).toBeInTheDocument()
    })

    it('formats time correctly', async () => {
      const mockData = [{
        id: 'test-req-1',
        period_name: 'Test Period',
        start_time: '13:30',
        end_time: '22:45',
        min_staff: 2,
        requires_supervisor: false,
        created_at: '2025-01-25T12:00:00Z',
        updated_at: '2025-01-25T12:00:00Z'
      }]

      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({ data: mockData, error: null }),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        delete: jest.fn().mockResolvedValue({ error: null }),
        upsert: jest.fn().mockResolvedValue({ error: null }),
        single: jest.fn().mockResolvedValue({ data: null, error: null })
      }))

      render(<StaffingRequirementsTable isManager={true} />)
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      expect(screen.getByText('1:30 PM - 10:45 PM')).toBeInTheDocument()
    })

    it('fetches requirements sorted by start time', async () => {
      render(<StaffingRequirementsTable isManager={true} />)
      
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('staffing_requirements')
        expect(mockSupabaseClient.from().select).toHaveBeenCalled()
        const selectCall = mockSupabaseClient.from().select as jest.Mock
        expect(selectCall.mock.calls[0][0]).toBe('*')
        expect(selectCall.mock.results[0].value.order).toBeDefined()
      })
    })
  })

  describe('Dialog Behavior', () => {
    it('resets form when dialog is closed', async () => {
      render(<StaffingRequirementsTable isManager={true} />)
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      // Open edit dialog
      const editButton = screen.getByRole('button', { name: /edit morning requirement/i })
      await user.click(editButton)

      // Modify a field
      const periodNameInput = screen.getByLabelText('Period Name')
      await user.clear(periodNameInput)
      await user.type(periodNameInput, 'New Period')

      // Close dialog
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      // Reopen dialog
      await user.click(editButton)

      // Check field is reset
      expect(screen.getByLabelText('Period Name')).toHaveValue('Morning')
    })

    it('closes dialog on successful submission', async () => {
      render(<StaffingRequirementsTable isManager={true} />)
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      // Open edit dialog
      const editButton = screen.getByRole('button', { name: /edit morning requirement/i })
      await user.click(editButton)

      // Submit form
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      // Check dialog is closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('keeps dialog open on submission error', async () => {
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({ data: mockRequirements, error: null }),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        delete: jest.fn().mockResolvedValue({ error: null }),
        upsert: jest.fn().mockResolvedValue({ 
          error: new Error('Failed to update')
        }),
        single: jest.fn().mockResolvedValue({ data: null, error: null })
      }))

      render(<StaffingRequirementsTable isManager={true} />)
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      // Open edit dialog
      const editButton = screen.getByRole('button', { name: /edit morning requirement/i })
      await user.click(editButton)

      // Submit form
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      // Check dialog remains open
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })
}) 