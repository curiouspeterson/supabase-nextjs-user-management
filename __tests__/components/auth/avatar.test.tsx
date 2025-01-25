import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Avatar from '@/app/account/avatar'

// Mock URL constructor and methods
const mockCreateObjectURL = jest.fn()
const mockRevokeObjectURL = jest.fn()

// Setup URL mock before tests
beforeAll(() => {
  // Store original URL
  const originalURL = global.URL

  // Mock URL constructor and methods
  global.URL = class MockURL {
    static createObjectURL = mockCreateObjectURL.mockReturnValue('blob:mock-avatar-url')
    static revokeObjectURL = mockRevokeObjectURL
    
    constructor(url: string) {
      return new originalURL(url)
    }
  } as unknown as typeof global.URL
})

// Restore original URL after tests
afterAll(() => {
  jest.restoreAllMocks()
})

// Mock Supabase client
const mockDownload = jest.fn()
const mockUpload = jest.fn()

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    storage: {
      from: (bucket: string) => ({
        download: mockDownload,
        upload: mockUpload
      })
    }
  })
}))

describe('Avatar', () => {
  const user = userEvent.setup()
  const mockProps = {
    uid: 'test-user-id',
    url: 'test-avatar.jpg',
    size: 150,
    onUpload: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockDownload.mockResolvedValue({ data: new Blob(), error: null })
    mockUpload.mockResolvedValue({ data: { path: 'test-path' }, error: null })
  })

  it('renders avatar with default image when no URL is provided', () => {
    render(<Avatar {...mockProps} url={null} />)
    const avatar = screen.getByRole('img', { name: /default avatar/i })
    expect(avatar).toBeInTheDocument()
  })

  it('downloads and displays avatar image when URL is provided', async () => {
    render(<Avatar {...mockProps} />)
    
    await waitFor(() => {
      expect(mockDownload).toHaveBeenCalledWith('test-avatar.jpg')
    })

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled()
    })

    const avatar = screen.getByRole('img', { name: /user avatar/i })
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveAttribute('src', 'blob:mock-avatar-url')
  })

  it('handles file upload', async () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    render(<Avatar {...mockProps} />)

    const input = screen.getByLabelText(/upload avatar/i)
    await user.upload(input, file)

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalledWith('test.png', expect.any(File), {
        cacheControl: '3600',
        upsert: true
      })
    })

    await waitFor(() => {
      expect(mockProps.onUpload).toHaveBeenCalledWith('test-path')
    })
  })

  it('handles upload error', async () => {
    mockUpload.mockResolvedValueOnce({ data: null, error: new Error('Upload failed') })
    const alertMock = jest.spyOn(window, 'alert').mockImplementation()

    render(<Avatar {...mockProps} />)

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/upload avatar/i)
    await user.upload(input, file)

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Error uploading avatar!')
    })
  })

  it('handles download error', async () => {
    mockDownload.mockResolvedValueOnce({ data: null, error: new Error('Download failed') })
    const consoleMock = jest.spyOn(console, 'error').mockImplementation()

    render(<Avatar {...mockProps} />)

    await waitFor(() => {
      expect(consoleMock).toHaveBeenCalledWith('Error downloading image:', expect.any(Error))
    })
  })

  it('cleans up object URL on unmount', async () => {
    const { unmount } = render(<Avatar {...mockProps} />)
    
    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled()
    })

    const objectUrl = mockCreateObjectURL.mock.results[0].value
    unmount()

    await waitFor(() => {
      expect(mockRevokeObjectURL).toHaveBeenCalledWith(objectUrl)
    })
  })
}) 