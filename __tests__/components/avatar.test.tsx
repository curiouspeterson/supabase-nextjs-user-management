import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Avatar from '@/app/account/avatar'

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    storage: {
      from: jest.fn().mockReturnValue({
        download: jest.fn().mockImplementation(async (path) => {
          if (path === 'error-path') {
            return { data: null, error: new Error('Download failed') }
          }
          return { data: new Blob(['test']), error: null }
        }),
        upload: jest.fn().mockImplementation(async (path, file) => {
          if (path.includes('error')) {
            return { data: null, error: new Error('Upload failed') }
          }
          return { data: { path: 'new-avatar.jpg' }, error: null }
        })
      })
    }
  })
}))

const mockCreateObjectURL = jest.fn().mockReturnValue('blob:mock-avatar-url')
const mockRevokeObjectURL = jest.fn()

beforeAll(() => {
  window.URL.createObjectURL = mockCreateObjectURL
  window.URL.revokeObjectURL = mockRevokeObjectURL
})

afterAll(() => {
  delete window.URL.createObjectURL
  delete window.URL.revokeObjectURL
})

beforeEach(() => {
  mockCreateObjectURL.mockClear()
  mockRevokeObjectURL.mockClear()
  mockOnUpload.mockClear()
})

describe('Avatar', () => {
  const mockOnUpload = jest.fn()
  const user = userEvent.setup()

  it('renders avatar placeholder when no URL is provided', () => {
    render(<Avatar uid="test-uid" url={null} size={150} onUpload={mockOnUpload} />)
    const img = screen.getByRole('img', { name: /default avatar/i })
    expect(img).toHaveAttribute('src', '/default-avatar.png')
  })

  it('downloads and displays avatar when URL is provided', async () => {
    render(<Avatar uid="test-uid" url="https://test.com/avatar.jpg" size={150} onUpload={mockOnUpload} />)
    
    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(screen.getByRole('img')).toHaveAttribute('src', 'blob:mock-avatar-url')
    })
  })

  it('handles download error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    render(<Avatar uid="test-uid" url="error-path" size={150} onUpload={mockOnUpload} />)
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })
    
    consoleSpy.mockRestore()
  })

  it('handles file upload', async () => {
    render(<Avatar uid="test-uid" url={null} size={150} onUpload={mockOnUpload} />)
    
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const input = screen.getByLabelText(/upload avatar/i)
    
    fireEvent.change(input, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalled()
    })
  })

  it('handles upload error gracefully', async () => {
    mockOnUpload.mockRejectedValueOnce(new Error('Upload failed'))
    render(<Avatar uid="test-uid" url={null} size={150} onUpload={mockOnUpload} />)
    
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const input = screen.getByLabelText(/upload avatar/i)
    
    fireEvent.change(input, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.queryByText(/uploading/i)).not.toBeInTheDocument()
      expect(screen.getByText(/Upload failed/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during upload', async () => {
    mockOnUpload.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))
    render(<Avatar uid="test-uid" url={null} size={150} onUpload={mockOnUpload} />)
    
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const input = screen.getByLabelText(/upload avatar/i)
    
    fireEvent.change(input, { target: { files: [file] } })
    
    expect(screen.getByText(/uploading/i)).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.queryByText(/uploading/i)).not.toBeInTheDocument()
    })
  })

  it('validates file type on upload', async () => {
    render(<Avatar uid="test-uid" url={null} size={150} onUpload={mockOnUpload} />)
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    const input = screen.getByLabelText(/upload avatar/i)
    
    fireEvent.change(input, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(mockOnUpload).not.toHaveBeenCalled()
      expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument()
    })
  })

  it('handles missing window.URL gracefully', async () => {
    const originalURL = window.URL
    delete window.URL
    const consoleSpy = jest.spyOn(console, 'error')
    
    render(<Avatar uid="test-uid" url="https://test.com/avatar.jpg" size={150} onUpload={mockOnUpload} />)
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error downloading image:', expect.any(Error))
    })
    
    window.URL = originalURL
    consoleSpy.mockRestore()
  })
}) 