import React from 'react'
import { render, screen, waitFor, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShiftTemplateDialog } from '@/components/shifts/shift-template-dialog'
import * as supabaseClient from '@/utils/supabase/client'
import { cleanupAfterEach } from '../../test-utils'

// Constants for timeouts
const TEST_TIMEOUT = 5000
const ANIMATION_TIMEOUT = 100

jest.mock('@/utils/supabase/client')

const mockShiftTypes = [
  { id: '1', name: 'Early Shift', start_time: '07:00', end_time: '15:00' },
  { id: '2', name: 'Day Shift', start_time: '09:00', end_time: '17:00' }
]

// Improved mock setup with error handling and timeouts
const createMockPromise = (data: any, delay = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data, error: null }), delay)
  })
}

const mockEq = jest.fn().mockImplementation(() => createMockPromise(null))
const mockUpdate = jest.fn().mockImplementation(() => ({ eq: mockEq }))
const mockInsert = jest.fn().mockImplementation(() => createMockPromise(null))
const mockOrder = jest.fn().mockImplementation(() => createMockPromise(mockShiftTypes))
const mockSelect = jest.fn().mockImplementation(() => ({ order: mockOrder }))
const mockFrom = jest.fn().mockImplementation((table: string) => {
  if (table === 'shift_types') {
    return { select: mockSelect }
  }
  return {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate
  }
})

const mockSupabase = { from: mockFrom }

jest.mock('@/utils/supabase/client', () => ({
  createClient: () => mockSupabase
}))

describe('ShiftTemplateDialog', () => {
  // Modern cleanup after each test
  cleanupAfterEach()

  // Modern user event setup
  const user = userEvent.setup({
    delay: null,
    pointerEventsCheck: 0
  })

  beforeAll(() => {
    HTMLElement.prototype.scrollIntoView = jest.fn()
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

  afterEach(() => {
    jest.clearAllTimers()
  })

  it('loads shift types on mount', async () => {
    const { unmount } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <ShiftTemplateDialog open onOpenChange={() => {}} />
      </React.Suspense>
    )

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('shift_types')
      expect(mockSelect).toHaveBeenCalled()
      expect(mockOrder).toHaveBeenCalledWith('name')
    }, { timeout: TEST_TIMEOUT })

    unmount()
  })

  it('handles form submission for creating a shift', async () => {
    const mockOnOpenChange = jest.fn()
    const mockOnSuccess = jest.fn()

    const { unmount } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <ShiftTemplateDialog
          open
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      </React.Suspense>
    )

    // Wait for dialog to be fully mounted
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    }, { timeout: TEST_TIMEOUT })

    // Find and click the shift type combobox with retry
    await waitFor(() => {
      const comboboxes = screen.getAllByRole('combobox')
      expect(comboboxes[0]).toBeInTheDocument()
    }, { timeout: TEST_TIMEOUT })

    const shiftTypeButton = screen.getAllByRole('combobox')[0]
    await user.click(shiftTypeButton)
    
    // Wait for options to appear and select early shift
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Early Shift' })).toBeInTheDocument()
    }, { timeout: TEST_TIMEOUT })
    
    await user.click(screen.getByRole('option', { name: 'Early Shift' }))

    // Handle duration selection
    const durationButton = screen.getAllByRole('combobox')[1]
    await user.click(durationButton)
    
    await waitFor(() => {
      expect(screen.getByRole('option', { name: '4 hours' })).toBeInTheDocument()
    }, { timeout: TEST_TIMEOUT })
    
    await user.click(screen.getByRole('option', { name: '4 hours' }))

    // Fill in time inputs with proper waiting
    const startTimeInput = screen.getByLabelText(/start time/i)
    const endTimeInput = screen.getByLabelText(/end time/i)
    
    await user.clear(startTimeInput)
    await user.type(startTimeInput, '07:00')
    await user.clear(endTimeInput)
    await user.type(endTimeInput, '11:00')

    // Submit form with waiting
    const submitButton = screen.getByRole('button', { name: /create/i })
    await user.click(submitButton)

    await waitFor(() => {
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
    }, { timeout: TEST_TIMEOUT })

    unmount()
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

    const { unmount } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <ShiftTemplateDialog
          open
          shift={existingShift}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      </React.Suspense>
    )

    // Wait for dialog to be mounted
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    }, { timeout: TEST_TIMEOUT })

    const comboboxes = await waitFor(() => screen.getAllByRole('combobox'), { timeout: TEST_TIMEOUT })
    const shiftTypeButton = comboboxes[0]
    await user.click(shiftTypeButton)
    
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Day Shift' })).toBeInTheDocument()
    }, { timeout: TEST_TIMEOUT })
    
    await user.click(screen.getByRole('option', { name: 'Day Shift' }))

    const durationButton = comboboxes[1]
    await user.click(durationButton)
    
    await waitFor(() => {
      expect(screen.getByRole('option', { name: '10 hours' })).toBeInTheDocument()
    }, { timeout: TEST_TIMEOUT })
    
    await user.click(screen.getByRole('option', { name: '10 hours' }))

    const startTimeInput = screen.getByLabelText(/start time/i)
    const endTimeInput = screen.getByLabelText(/end time/i)
    
    await user.clear(startTimeInput)
    await user.type(startTimeInput, '09:00')
    await user.clear(endTimeInput)
    await user.type(endTimeInput, '19:00')

    const submitButton = screen.getByRole('button', { name: /update/i })
    await user.click(submitButton)

    await waitFor(() => {
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
    }, { timeout: TEST_TIMEOUT })

    unmount()
  })

  it('validates required fields', async () => {
    const { unmount } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <ShiftTemplateDialog open onOpenChange={() => {}} />
      </React.Suspense>
    )

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    }, { timeout: TEST_TIMEOUT })

    const submitButton = screen.getByRole('button', { name: /create/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/shift type is required/i)).toBeInTheDocument()
      expect(screen.getByText(/duration is required/i)).toBeInTheDocument()
      expect(screen.getByText(/start time is required/i)).toBeInTheDocument()
      expect(screen.getByText(/end time is required/i)).toBeInTheDocument()
    }, { timeout: TEST_TIMEOUT })

    expect(mockFrom).not.toHaveBeenCalledWith('shifts')
    expect(mockInsert).not.toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()

    unmount()
  })
}) 