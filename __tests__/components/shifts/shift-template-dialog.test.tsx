import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShiftTemplateDialog } from '@/components/shifts/shift-template-dialog'
import * as supabaseClient from '@/utils/supabase/client'

jest.mock('@/utils/supabase/client')

const mockShiftTypes = [
  { id: '1', name: 'Early Shift', start_time: '07:00', end_time: '15:00' },
  { id: '2', name: 'Day Shift', start_time: '09:00', end_time: '17:00' }
]

const mockEq = jest.fn().mockReturnValue({ data: null, error: null })
const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq })
const mockInsert = jest.fn().mockReturnValue({ data: null, error: null })
const mockOrder = jest.fn().mockReturnValue({ data: mockShiftTypes, error: null })
const mockSelect = jest.fn().mockReturnValue({ order: mockOrder })
const mockFrom = jest.fn((table: string) => {
  if (table === 'shift_types') {
    return { select: mockSelect }
  }
  return {
    select: mockSelect,
    insert: (data: any) => mockInsert(data),
    update: (data: any) => mockUpdate(data)
  }
})
const mockSupabase = { from: mockFrom }

jest.mock('@/utils/supabase/client', () => ({
  createClient: () => mockSupabase
}))

beforeAll(() => {
  // Mock scrollIntoView
  HTMLElement.prototype.scrollIntoView = jest.fn()
  // Mock hasPointerCapture
  HTMLElement.prototype.hasPointerCapture = jest.fn()
})

beforeEach(() => {
  jest.clearAllMocks()
  mockFrom.mockClear()
  mockSelect.mockClear()
  mockOrder.mockClear()
  mockInsert.mockClear()
  mockUpdate.mockClear()
  mockEq.mockClear()
})

describe('ShiftTemplateDialog', () => {
  it('loads shift types on mount', async () => {
    render(<ShiftTemplateDialog open onOpenChange={() => {}} />)

    expect(mockFrom).toHaveBeenCalledWith('shift_types')
    expect(mockSelect).toHaveBeenCalled()
    expect(mockOrder).toHaveBeenCalledWith('name')
  })

  it('handles form submission for creating a shift', async () => {
    const mockOnOpenChange = jest.fn()
    const mockOnSuccess = jest.fn()

    render(
      <ShiftTemplateDialog
        open
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    // Find and click the shift type combobox
    const comboboxes = screen.getAllByRole('combobox')
    const shiftTypeButton = comboboxes[0]
    expect(shiftTypeButton).toHaveTextContent('Select a shift type')
    await userEvent.click(shiftTypeButton)
    
    // Select the early shift option
    const earlyShiftOption = screen.getByRole('option', { name: 'Early Shift' })
    await userEvent.click(earlyShiftOption)

    // Find and click the duration combobox
    const durationButton = comboboxes[1]
    expect(durationButton).toHaveTextContent('Select duration')
    await userEvent.click(durationButton)
    
    // Select the 4 hours option
    const fourHoursOption = screen.getByRole('option', { name: '4 hours' })
    await userEvent.click(fourHoursOption)

    // Fill in the time inputs
    const startTimeInput = screen.getByLabelText(/start time/i)
    const endTimeInput = screen.getByLabelText(/end time/i)
    await userEvent.type(startTimeInput, '07:00')
    await userEvent.type(endTimeInput, '11:00')

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create/i })
    await userEvent.click(submitButton)

    expect(mockFrom).toHaveBeenCalledWith('shifts')
    expect(mockInsert).toHaveBeenCalledWith({
      shift_type_id: '1',
      duration_category: '4 hours',
      duration_hours: 4,
      start_time: '07:00',
      end_time: '11:00',
    })
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    expect(mockOnSuccess).toHaveBeenCalled()
  })

  it('handles form submission for updating a shift', async () => {
    const mockOnOpenChange = jest.fn()
    const mockOnSuccess = jest.fn()
    const existingShift = {
      id: '123',
      shift_type_id: '1',
      duration_category: '4 hours',
      start_time: '07:00',
      end_time: '11:00',
      duration_hours: 4
    }

    render(
      <ShiftTemplateDialog
        open
        shift={existingShift}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    // Find and click the shift type combobox
    const comboboxes = screen.getAllByRole('combobox')
    const shiftTypeButton = comboboxes[0]
    expect(shiftTypeButton).toHaveTextContent('Select a shift type')
    await userEvent.click(shiftTypeButton)
    
    // Select the day shift option
    const dayShiftOption = screen.getByRole('option', { name: 'Day Shift' })
    await userEvent.click(dayShiftOption)

    // Find and click the duration combobox
    const durationButton = comboboxes[1]
    expect(durationButton).toHaveTextContent('Select duration')
    await userEvent.click(durationButton)
    
    // Select the 10 hours option
    const tenHoursOption = screen.getByRole('option', { name: '10 hours' })
    await userEvent.click(tenHoursOption)

    // Fill in the time inputs
    const startTimeInput = screen.getByLabelText(/start time/i)
    const endTimeInput = screen.getByLabelText(/end time/i)
    await userEvent.clear(startTimeInput)
    await userEvent.clear(endTimeInput)
    await userEvent.type(startTimeInput, '09:00')
    await userEvent.type(endTimeInput, '19:00')

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /update/i })
    await userEvent.click(submitButton)

    expect(mockFrom).toHaveBeenCalledWith('shifts')
    expect(mockUpdate).toHaveBeenCalledWith({
      shift_type_id: '2',
      duration_category: '10 hours',
      duration_hours: 10,
      start_time: '09:00',
      end_time: '19:00',
    })
    expect(mockEq).toHaveBeenCalledWith('id', '123')
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    expect(mockOnSuccess).toHaveBeenCalled()
  })

  it('validates required fields', async () => {
    render(<ShiftTemplateDialog open onOpenChange={() => {}} />)

    // Submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /create/i })
    await userEvent.click(submitButton)

    // Verify error messages
    expect(screen.getByText(/shift type is required/i)).toBeInTheDocument()
    expect(screen.getByText(/duration is required/i)).toBeInTheDocument()
    expect(screen.getByText(/start time is required/i)).toBeInTheDocument()
    expect(screen.getByText(/end time is required/i)).toBeInTheDocument()

    // Verify no API calls were made
    expect(mockFrom).not.toHaveBeenCalledWith('shifts')
    expect(mockInsert).not.toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()
  })
}) 