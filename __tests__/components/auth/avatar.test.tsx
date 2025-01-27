import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Avatar } from '@/components/auth/avatar'
import { useToast } from '@/components/ui/use-toast'

// Mock useToast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn()
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}))

describe('Avatar', () => {
  const mockOnUpload = jest.fn()
  const mockToast = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useToast as jest.Mock).mockReturnValue({ toast: mockToast })
  })

  it('renders default avatar when no URL is provided', () => {
    render(<Avatar onUpload={mockOnUpload} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', '/_next/image?url=%2Fdefault-avatar.png&w=384&q=75')
    expect(img).toHaveAttribute('alt', 'Avatar')
  })

  it('handles file upload', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const user = userEvent.setup()

    render(<Avatar onUpload={mockOnUpload} />)
    const input = screen.getByLabelText(/upload avatar/i)

    await user.upload(input, file)

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(file)
    })
  })

  it('validates file type on upload', async () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    const user = userEvent.setup()

    render(<Avatar onUpload={mockOnUpload} />)
    const input = screen.getByLabelText(/upload avatar/i)

    await user.upload(input, file)

    await waitFor(() => {
      expect(mockOnUpload).not.toHaveBeenCalled()
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'File must be an image',
        variant: 'destructive'
      })
    })
  })

  it('validates file size', async () => {
    const largeFile = new File(['test'.repeat(1000000)], 'large.jpg', { type: 'image/jpeg' })
    const user = userEvent.setup()

    render(<Avatar onUpload={mockOnUpload} />)
    const input = screen.getByLabelText(/upload avatar/i)

    await user.upload(input, largeFile)

    await waitFor(() => {
      expect(mockOnUpload).not.toHaveBeenCalled()
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'File size must be less than 5MB',
        variant: 'destructive'
      })
    })
  })

  it('downloads and displays avatar when URL is provided', async () => {
    const url = 'https://test.com/avatar.jpg'
    render(<Avatar url={url} onUpload={mockOnUpload} />)

    await waitFor(() => {
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('src', url)
      expect(img).toHaveAttribute('alt', 'Avatar')
    })
  })

  it('handles download error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const url = 'https://test.com/invalid.jpg'

    render(<Avatar url={url} onUpload={mockOnUpload} />)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error downloading image:', expect.any(Error))
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('src', '/_next/image?url=%2Fdefault-avatar.png&w=384&q=75')
      expect(img).toHaveAttribute('alt', 'Default Avatar')
    })

    consoleSpy.mockRestore()
  })

  it('handles upload error gracefully', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const error = new Error('Upload failed')
    mockOnUpload.mockRejectedValue(error)
    const user = userEvent.setup()

    render(<Avatar onUpload={mockOnUpload} />)
    const input = screen.getByLabelText(/upload avatar/i)

    await user.upload(input, file)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to upload avatar',
        variant: 'destructive'
      })
    })
  })
}) 