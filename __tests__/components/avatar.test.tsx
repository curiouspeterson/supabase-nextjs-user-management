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

// Mock URL.createObjectURL
const mockCreateObjectURL = jest.fn()
global.URL.createObjectURL = mockCreateObjectURL

describe('Avatar', () => {
  const mockOnUpload = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateObjectURL.mockReturnValue('blob:test-url')
  })

  it('renders avatar placeholder when no URL is provided', () => {
    render(<Avatar uid="test-uid" url={null} size={150} onUpload={mockOnUpload} />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('downloads and displays avatar when URL is provided', async () => {
    render(<Avatar uid="test-uid" url="test-avatar.jpg" size={150} onUpload={mockOnUpload} />)
    
    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled()
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
    
    await userEvent.upload(input, file)
    
    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalled()
    })
  })

  it('handles upload error gracefully', async () => {
    render(<Avatar uid="test-uid" url={null} size={150} onUpload={mockOnUpload} />)
    
    const file = new File(['test'], 'error.png', { type: 'image/png' })
    const input = screen.getByLabelText(/upload avatar/i)
    
    await userEvent.upload(input, file)
    
    await waitFor(() => {
      expect(screen.queryByText(/uploading/i)).not.toBeInTheDocument()
    })
  })

  it('shows loading state during upload', async () => {
    render(<Avatar uid="test-uid" url={null} size={150} onUpload={mockOnUpload} />)
    
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const input = screen.getByLabelText(/upload avatar/i)
    
    await userEvent.upload(input, file)
    
    expect(screen.getByText(/uploading/i)).toBeInTheDocument()
  })

  it('validates file type on upload', async () => {
    render(<Avatar uid="test-uid" url={null} size={150} onUpload={mockOnUpload} />)
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    const input = screen.getByLabelText(/upload avatar/i)
    
    await userEvent.upload(input, file)
    
    expect(mockOnUpload).not.toHaveBeenCalled()
  })

  it('handles missing window.URL gracefully', async () => {
    const originalURL = global.URL
    // @ts-ignore
    delete global.URL
    
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
    
    render(<Avatar uid="test-uid" url="test-avatar.jpg" size={150} onUpload={mockOnUpload} />)
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('URL.createObjectURL is not available')
    })
    
    global.URL = originalURL
    consoleSpy.mockRestore()
  })
}) 