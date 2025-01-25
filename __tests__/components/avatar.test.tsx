import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Avatar from '@/components/avatar'
import { mockToast } from '@/lib/test-utils'

jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}))

describe('Avatar', () => {
  const mockToastSpy = jest.fn()
  const mockOnUpload = jest.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    global.URL.createObjectURL = jest.fn(() => 'blob:test-url')
    global.URL.revokeObjectURL = jest.fn()
  })

  describe('Error Handling', () => {
    it('handles file size exceeding limit', async () => {
      render(<Avatar onUpload={mockOnUpload} />)
      
      const largeFile = new File(['x'.repeat(3 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
      const input = screen.getByLabelText(/upload avatar/i)
      
      await user.upload(input, largeFile)

      await waitFor(() => {
        expect(mockToastSpy).toHaveBeenCalledWith({
          title: 'Error',
          description: 'File size must be less than 2MB',
          variant: 'destructive'
        })
      })
    })

    it('handles network timeout during upload', async () => {
      render(<Avatar onUpload={mockOnUpload} />)
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const input = screen.getByLabelText(/upload avatar/i)
      
      mockOnUpload.mockRejectedValueOnce(new Error('Network timeout'))
      await user.upload(input, file)

      await waitFor(() => {
        expect(mockToastSpy).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Network timeout',
          variant: 'destructive'
        })
      })
    })

    it('handles corrupt image file', async () => {
      render(<Avatar onUpload={mockOnUpload} />)
      
      const corruptFile = new File(['corrupt data'], 'corrupt.jpg', { type: 'image/jpeg' })
      const input = screen.getByLabelText(/upload avatar/i)
      
      mockOnUpload.mockRejectedValueOnce(new Error('Invalid image file'))
      await user.upload(input, corruptFile)

      await waitFor(() => {
        expect(mockToastSpy).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Invalid image file',
          variant: 'destructive'
        })
      })
    })

    it('handles storage quota exceeded error', async () => {
      render(<Avatar onUpload={mockOnUpload} />)
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const input = screen.getByLabelText(/upload avatar/i)
      
      mockOnUpload.mockRejectedValueOnce(new Error('Storage quota exceeded'))
      await user.upload(input, file)

      await waitFor(() => {
        expect(mockToastSpy).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Storage quota exceeded',
          variant: 'destructive'
        })
      })
    })

    it('handles multiple rapid upload attempts', async () => {
      render(<Avatar onUpload={mockOnUpload} />)
      
      const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' })
      const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
      const input = screen.getByLabelText(/upload avatar/i)
      
      // Attempt rapid uploads
      await user.upload(input, file1)
      await user.upload(input, file2)

      await waitFor(() => {
        expect(mockToastSpy).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Please wait for the current upload to complete',
          variant: 'destructive'
        })
      })
    })

    it('provides accessible error feedback', async () => {
      render(<Avatar onUpload={mockOnUpload} />)
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const input = screen.getByLabelText(/upload avatar/i)
      
      mockOnUpload.mockRejectedValueOnce(new Error('Upload failed'))
      await user.upload(input, file)

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert')
        expect(errorMessage).toHaveAttribute('aria-live', 'polite')
        expect(errorMessage).toHaveTextContent('Upload failed')
      })
    })
  })

  it('downloads and displays avatar when URL is provided', async () => {
    const avatarUrl = 'https://test.com/avatar.jpg'
    render(<Avatar url={avatarUrl} />)

    await waitFor(() => {
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('src', 'blob:test-url')
    })
  })

  it('handles download error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error')
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Download failed'))

    render(<Avatar url="https://test.com/error.jpg" />)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error downloading image:', expect.any(Error))
      expect(screen.getByRole('img')).toHaveAttribute('src', '/default-avatar.png')
    })
  })

  it('handles file upload', async () => {
    render(<Avatar onUpload={mockOnUpload} />)
    
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const input = screen.getByLabelText(/upload avatar/i)
    
    await user.upload(input, file)

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith('test.png', expect.any(File), {
        upsert: true
      })
    })
  })

  it('handles upload error gracefully', async () => {
    render(<Avatar onUpload={mockOnUpload} />)
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/upload avatar/i)
    
    mockOnUpload.mockRejectedValueOnce(new Error('Upload failed'))
    await user.upload(input, file)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Upload failed')
    })
  })

  it('shows loading state during upload', async () => {
    render(<Avatar onUpload={mockOnUpload} />)
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/upload avatar/i)
    
    await user.upload(input, file)

    expect(screen.getByText(/uploading/i)).toBeInTheDocument()
  })

  it('validates file type on upload', async () => {
    render(<Avatar onUpload={mockOnUpload} />)
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    const input = screen.getByLabelText(/upload avatar/i)
    
    await user.upload(input, file)

    await waitFor(() => {
      expect(mockOnUpload).not.toHaveBeenCalled()
      expect(screen.getByRole('alert')).toHaveTextContent('File must be an image')
    })
  })

  it('handles missing window.URL gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error')
    const originalURL = window.URL
    
    // @ts-ignore
    delete window.URL
    render(<Avatar url="https://test.com/avatar.jpg" />)
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error downloading image:', expect.any(Error))
    })
    
    window.URL = originalURL
  })
}) 