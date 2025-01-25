import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Avatar from '@/components/avatar'

// Mock toast notifications
const mockToast = jest.fn()
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}))

describe('Avatar', () => {
  const mockOnUpload = jest.fn()
  const mockDownloadImage = jest.fn()
  const mockCreateObjectURL = jest.fn()
  const mockRevokeObjectURL = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL
    mockCreateObjectURL.mockReturnValue('blob:mock-url')
  })

  it('downloads and displays avatar when URL is provided', async () => {
    const avatarUrl = 'https://example.com/avatar.jpg'
    const blobUrl = 'blob:mock-avatar-url'
    mockDownloadImage.mockResolvedValueOnce(new Blob())
    mockCreateObjectURL.mockReturnValueOnce(blobUrl)

    render(<Avatar url={avatarUrl} onUpload={mockOnUpload} />)

    await waitFor(() => {
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('src', blobUrl)
    })
  })

  it('handles file upload', async () => {
    const user = userEvent.setup()
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    render(<Avatar onUpload={mockOnUpload} />)
    const input = screen.getByLabelText(/upload avatar/i)

    await user.upload(input, file)

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(File),
        expect.any(Object)
      )
    })
  })

  it('handles upload error', async () => {
    const user = userEvent.setup()
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    mockOnUpload.mockRejectedValueOnce(new Error('Upload failed'))

    render(<Avatar onUpload={mockOnUpload} />)
    const input = screen.getByLabelText(/upload avatar/i)

    await user.upload(input, file)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Upload failed')
    })
  })

  it('handles download error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    mockDownloadImage.mockRejectedValueOnce(new Error('Download failed'))

    render(<Avatar url="https://example.com/avatar.jpg" onUpload={mockOnUpload} />)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error downloading image:',
        expect.any(Error)
      )
    })

    consoleSpy.mockRestore()
  })

  it('cleans up object URL on unmount', async () => {
    const blobUrl = 'blob:mock-avatar-url'
    mockCreateObjectURL.mockReturnValueOnce(blobUrl)

    const { unmount } = render(
      <Avatar url="https://example.com/avatar.jpg" onUpload={mockOnUpload} />
    )

    unmount()

    expect(mockRevokeObjectURL).toHaveBeenCalledWith(blobUrl)
  })

  it('validates file type', async () => {
    const user = userEvent.setup()
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })

    render(<Avatar onUpload={mockOnUpload} />)
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
    const largeFile = new File(['x'.repeat(5 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    })

    render(<Avatar onUpload={mockOnUpload} />)
    const input = screen.getByLabelText(/upload avatar/i)

    await user.upload(input, largeFile)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'File size must be less than 5MB'
      )
    })
  })
}) 