import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Avatar from '@/app/account/avatar'
import { mockToast } from '@/lib/test-utils'

jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}))

describe('Avatar', () => {
  let user: ReturnType<typeof userEvent.setup>
  const mockOnUpload = jest.fn()
  const consoleSpy = jest.spyOn(console, 'error')
  const mockToastSpy = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    user = userEvent.setup()
    mockToast.mockImplementation(mockToastSpy)
    
    // Mock URL methods
    window.URL.createObjectURL = jest.fn(() => 'blob:test-url')
    window.URL.revokeObjectURL = jest.fn()
  })

  describe('Error Handling', () => {
    it('handles file size exceeding limit', async () => {
      render(<Avatar uid="test-uid" url={null} size={150} onUpload={mockOnUpload} />)

      const largeFile = new File(['x'.repeat(5 * 1024 * 1024)], 'large.png', { type: 'image/png' })
      const input = screen.getByLabelText(/upload avatar/i)
      
      await user.upload(input, largeFile)

      await waitFor(() => {
        expect(mockToastSpy).toHaveBeenCalledWith({
          title: 'Error',
          description: 'File size must be less than 2MB',
          variant: 'destructive'
        })
        expect(mockOnUpload).not.toHaveBeenCalled()
      })
    })

    it('handles network timeout during upload', async () => {
      mockOnUpload.mockRejectedValueOnce(new Error('Network timeout'))
      render(<Avatar uid="test-uid" url={null} size={150} onUpload={mockOnUpload} />)

      const file = new File(['test'], 'test.png', { type: 'image/png' })
      const input = screen.getByLabelText(/upload avatar/i)
      
      await user.upload(input, file)

      await waitFor(() => {
        expect(mockToastSpy).toHaveBeenCalledWith({
          title: 'Upload Failed',
          description: 'Network timeout. Please try again.',
          variant: 'destructive'
        })
        expect(consoleSpy).toHaveBeenCalledWith(
          'Avatar upload failed:',
          expect.any(Error)
        )
      })
    })

    it('handles corrupt image file', async () => {
      render(<Avatar uid="test-uid" url={null} size={150} onUpload={mockOnUpload} />)

      const corruptFile = new File(['not-an-image'], 'corrupt.png', { type: 'image/png' })
      const input = screen.getByLabelText(/upload avatar/i)
      
      await user.upload(input, corruptFile)

      await waitFor(() => {
        expect(mockToastSpy).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Invalid image file. Please try another.',
          variant: 'destructive'
        })
      })
    })

    it('handles storage quota exceeded error', async () => {
      mockOnUpload.mockRejectedValueOnce(new Error('Storage quota exceeded'))
      render(<Avatar uid="test-uid" url={null} size={150} onUpload={mockOnUpload} />)

      const file = new File(['test'], 'test.png', { type: 'image/png' })
      const input = screen.getByLabelText(/upload avatar/i)
      
      await user.upload(input, file)

      await waitFor(() => {
        expect(mockToastSpy).toHaveBeenCalledWith({
          title: 'Upload Failed',
          description: 'Storage quota exceeded. Please contact support.',
          variant: 'destructive'
        })
      })
    })

    it('handles multiple rapid upload attempts', async () => {
      render(<Avatar uid="test-uid" url={null} size={150} onUpload={mockOnUpload} />)

      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' })
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' })
      const input = screen.getByLabelText(/upload avatar/i)
      
      // Attempt rapid uploads
      await user.upload(input, file1)
      await user.upload(input, file2)

      await waitFor(() => {
        expect(mockToastSpy).toHaveBeenCalledWith({
          title: 'Please Wait',
          description: 'An upload is already in progress',
          variant: 'warning'
        })
        expect(mockOnUpload).toHaveBeenCalledTimes(1)
      })
    })

    it('provides accessible error feedback', async () => {
      mockOnUpload.mockRejectedValueOnce(new Error('Upload failed'))
      render(<Avatar uid="test-uid" url={null} size={150} onUpload={mockOnUpload} />)

      const file = new File(['test'], 'test.png', { type: 'image/png' })
      const input = screen.getByLabelText(/upload avatar/i)
      
      await user.upload(input, file)

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert')
        expect(errorMessage).toHaveAttribute('aria-live', 'polite')
        expect(errorMessage).toBeVisible()
        expect(document.activeElement).toBe(input)
      })
    })
  })

  it('renders avatar placeholder when no URL is provided', () => {
    render(<Avatar uid="test-uid" url={null} size={150} onUpload={mockOnUpload} />)
    const img = screen.getByRole('img', { name: /default avatar/i })
    expect(img).toHaveAttribute('src', '/default-avatar.png')
  })

  it('downloads and displays avatar when URL is provided', async () => {
    const avatarUrl = 'https://test.com/avatar.jpg'
    render(<Avatar uid="test-uid" url={avatarUrl} size={150} onUpload={mockOnUpload} />)

    await waitFor(() => {
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('src', avatarUrl)
    })
  })

  it('handles download error gracefully', async () => {
    const avatarUrl = 'https://test.com/invalid.jpg'
    render(<Avatar uid="test-uid" url={avatarUrl} size={150} onUpload={mockOnUpload} />)

    const img = screen.getByRole('img')
    img.dispatchEvent(new Event('error'))

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error loading avatar:', expect.any(Error))
      expect(screen.getByRole('img')).toHaveAttribute('src', '/default-avatar.png')
    })
  })

  it('handles file upload', async () => {
    render(<Avatar uid="test-uid" url={null} size={150} onUpload={mockOnUpload} />)

    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const input = screen.getByLabelText(/upload avatar/i)
    
    await user.upload(input, file)

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith('test.png', expect.any(File), {
        cacheControl: '3600',
        upsert: false
      })
    })
  })

  it('handles upload error gracefully', async () => {
    mockOnUpload.mockRejectedValueOnce(new Error('Upload failed'))
    render(<Avatar uid="test-uid" url={null} size={150} onUpload={mockOnUpload} />)

    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const input = screen.getByLabelText(/upload avatar/i)
    
    await user.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during upload', async () => {
    // Mock a delayed upload
    mockOnUpload.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))
    render(<Avatar uid="test-uid" url={null} size={150} onUpload={mockOnUpload} />)

    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const input = screen.getByLabelText(/upload avatar/i)
    
    await user.upload(input, file)

    expect(screen.getByText(/uploading/i)).toBeInTheDocument()
  })

  it('validates file type on upload', async () => {
    render(<Avatar uid="test-uid" url={null} size={150} onUpload={mockOnUpload} />)

    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    const input = screen.getByLabelText(/upload avatar/i)
    
    await user.upload(input, file)

    await waitFor(() => {
      expect(mockOnUpload).not.toHaveBeenCalled()
      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument()
    })
  })

  it('handles missing window.URL gracefully', async () => {
    const originalURL = window.URL
    Object.defineProperty(window, 'URL', {
      value: undefined,
      configurable: true
    })
    
    render(<Avatar uid="test-uid" url="https://test.com/avatar.jpg" size={150} onUpload={() => {}} />)
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error downloading image:', expect.any(Error))
    })
    
    Object.defineProperty(window, 'URL', {
      value: originalURL,
      configurable: true
    })
    consoleSpy.mockRestore()
  })
}) 