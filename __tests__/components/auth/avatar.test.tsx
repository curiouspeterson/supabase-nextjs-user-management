import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Avatar } from '@/components/avatar'

// Mock toast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

const mockOnUpload = jest.fn()

// Mock URL methods
const mockCreateObjectURL = jest.fn()
const mockRevokeObjectURL = jest.fn()

global.URL.createObjectURL = mockCreateObjectURL
global.URL.revokeObjectURL = mockRevokeObjectURL

describe('Avatar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateObjectURL.mockReturnValue('blob:mock-avatar-url')
  })

  it('downloads and displays avatar when URL is provided', async () => {
    const mockUrl = 'https://example.com/avatar.jpg'
    const mockBlob = new Blob([''], { type: 'image/jpeg' })
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob)
    })

    render(<Avatar size={150} url={mockUrl} onUpload={mockOnUpload} />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(mockUrl)
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob)
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('src', 'blob:mock-avatar-url')
    })
  })

  it('handles file upload', async () => {
    const user = userEvent.setup()
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    render(<Avatar size={150} url={null} onUpload={mockOnUpload} />)

    const input = screen.getByLabelText(/upload avatar/i)
    await user.upload(input, file)

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(file)
    })
  })

  it('handles upload error', async () => {
    const user = userEvent.setup()
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    mockOnUpload.mockRejectedValueOnce(new Error('Upload failed'))

    render(<Avatar size={150} url={null} onUpload={mockOnUpload} />)

    const input = screen.getByLabelText(/upload avatar/i)
    await user.upload(input, file)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Upload failed')
    })
  })

  it('cleans up object URL on unmount', async () => {
    const mockUrl = 'https://example.com/avatar.jpg'
    const mockBlob = new Blob([''], { type: 'image/jpeg' })
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob)
    })

    const { unmount } = render(
      <Avatar size={150} url={mockUrl} onUpload={mockOnUpload} />
    )

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob)
    })

    unmount()

    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-avatar-url')
  })

  it('validates file type', async () => {
    const user = userEvent.setup()
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })

    render(<Avatar size={150} url={null} onUpload={mockOnUpload} />)

    const input = screen.getByLabelText(/upload avatar/i)
    await user.upload(input, file)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Please upload an image file'
      )
    })
  })

  it('validates file size', async () => {
    const user = userEvent.setup()
    const largeFile = new File(['test'.repeat(1000000)], 'large.jpg', {
      type: 'image/jpeg'
    })

    render(<Avatar size={150} url={null} onUpload={mockOnUpload} />)

    const input = screen.getByLabelText(/upload avatar/i)
    await user.upload(input, largeFile)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'File size must be less than 5MB'
      )
    })
  })
}) 