import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Avatar from '@/app/account/avatar'

// Mock URL constructor and methods
const mockCreateObjectURL = jest.fn()
const mockRevokeObjectURL = jest.fn()

// Setup URL mock before tests
beforeAll(() => {
  // Save original URL
  const originalURL = global.URL

  // Mock URL constructor and methods
  global.URL = {
    ...originalURL,
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  } as unknown as typeof global.URL

  // Mock createObjectURL to return a fake URL
  mockCreateObjectURL.mockImplementation(() => 'blob:mock-avatar-url')
})

// Restore original URL after tests
afterAll(() => {
  jest.restoreAllMocks()
})

// Mock Supabase client
const mockDownload = jest.fn()
const mockUpload = jest.fn()
const mockFrom = jest.fn()

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
      expect(mockCreateObjectURL).toHaveBeenCalled()
    })

    const avatar = screen.getByRole('img', { name: /user avatar/i })
    expect(avatar).toBeInTheDocument()
  })

  it('handles file upload', async () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    render(<Avatar {...mockProps} />)

    const input = screen.getByLabelText(/upload avatar/i)
    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalled()
      expect(mockProps.onUpload).toHaveBeenCalled()
    })
  })

  it('handles upload error', async () => {
    mockUpload.mockResolvedValueOnce({ error: new Error('Upload failed') })
    const alertMock = jest.spyOn(window, 'alert').mockImplementation()

    render(<Avatar {...mockProps} />)

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/upload avatar/i)
    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Error uploading avatar!')
    })
  })

  it('handles download error', async () => {
    mockDownload.mockResolvedValueOnce({ error: new Error('Download failed') })
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

    unmount()
    expect(mockRevokeObjectURL).toHaveBeenCalled()
  })
}) 