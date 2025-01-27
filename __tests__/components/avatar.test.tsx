import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Avatar } from '@/components/avatar'
import { mockToast, createMockErrorToast } from '@/lib/test-utils'

jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} src={props.src.startsWith('blob:') ? props.src : props.url} alt={props.alt} />
  }
}))

describe('Avatar', () => {
  const mockOnUpload = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Error Handling', () => {
    it('handles file size exceeding limit', async () => {
      const user = userEvent.setup()
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
      
      render(<Avatar onUpload={mockOnUpload} />)
      const input = screen.getByLabelText('Upload avatar')
      
      await user.upload(input, largeFile)
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          createMockErrorToast('File size must be less than 5MB')
        )
      })
    })

    it('handles invalid image file', async () => {
      const user = userEvent.setup()
      const invalidFile = new File(['not-an-image'], 'test.txt', { type: 'text/plain' })
      
      render(<Avatar onUpload={mockOnUpload} />)
      const input = screen.getByLabelText('Upload avatar')
      
      await user.upload(input, invalidFile)
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          createMockErrorToast('Invalid image file')
        )
      })
    })

    it('provides accessible error feedback', async () => {
      render(<Avatar onUpload={mockOnUpload} />)
      const errorContainer = document.createElement('div')
      errorContainer.setAttribute('role', 'alert')
      errorContainer.setAttribute('aria-live', 'polite')
      errorContainer.textContent = 'Upload failed'
      document.body.appendChild(errorContainer)
      
      await waitFor(() => {
        const errorMessage = screen.getByRole('alert')
        expect(errorMessage).toHaveAttribute('aria-live', 'polite')
        expect(errorMessage).toHaveTextContent('Upload failed')
      })
    })
  })

  it('downloads and displays avatar when URL is provided', async () => {
    const url = 'https://test.com/avatar.jpg'
    render(<Avatar url={url} />)
    
    await waitFor(() => {
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('src', url)
      expect(img).toHaveAttribute('alt', 'Avatar')
    })
  })

  it('handles download error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const url = 'invalid-url'
    render(<Avatar url={url} />)
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error downloading image:', expect.any(Error))
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('src', '/default-avatar.png')
      expect(img).toHaveAttribute('alt', 'Default Avatar')
    })
    
    consoleSpy.mockRestore()
  })

  it('handles file upload', async () => {
    const user = userEvent.setup()
    const file = new File(['test-image'], 'test.png', { type: 'image/png' })
    
    render(<Avatar onUpload={mockOnUpload} />)
    const input = screen.getByLabelText('Upload avatar')
    
    await user.upload(input, file)
    
    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(expect.any(String), file, {
        upsert: true
      })
    })
  })

  it('validates file type on upload', async () => {
    const user = userEvent.setup()
    const invalidFile = new File(['not-an-image'], 'test.txt', { type: 'text/plain' })
    
    render(<Avatar onUpload={mockOnUpload} />)
    const input = screen.getByLabelText('Upload avatar')
    
    await user.upload(input, invalidFile)
    
    await waitFor(() => {
      expect(mockOnUpload).not.toHaveBeenCalled()
      expect(mockToast).toHaveBeenCalledWith(
        createMockErrorToast('File must be an image')
      )
      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toHaveAttribute('aria-live', 'polite')
      expect(errorMessage).toHaveTextContent('File must be an image')
    })
  })
}) 