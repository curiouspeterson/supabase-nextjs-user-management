import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Avatar } from '@/components/auth/avatar'
import { mockToast, createMockErrorToast } from '../utils/test-utils'

// Mock file
const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
const mockInvalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })

describe('Avatar', () => {
  const mockOnUpload = jest.fn()
  const url = 'https://test.com/avatar.jpg'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders default avatar when no URL is provided', () => {
    render(<Avatar onUpload={mockOnUpload} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', '/default-avatar.png')
    expect(img).toHaveAttribute('alt', 'Avatar')
  })

  it('downloads and displays avatar when URL is provided', async () => {
    render(<Avatar url={url} onUpload={mockOnUpload} />)
    await waitFor(() => {
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('src', url)
      expect(img).toHaveAttribute('alt', 'Avatar')
    })
  })

  it('handles download error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const errorUrl = 'https://test.com/error.jpg'
    
    render(<Avatar url={errorUrl} onUpload={mockOnUpload} />)
    
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
    render(<Avatar onUpload={mockOnUpload} />)
    
    const input = screen.getByLabelText(/upload avatar/i)
    await user.upload(input, mockFile)
    
    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(expect.any(String), mockFile, {
        upsert: true
      })
    })
  })

  it('validates file type on upload', async () => {
    const user = userEvent.setup()
    render(<Avatar onUpload={mockOnUpload} />)
    
    const input = screen.getByLabelText(/upload avatar/i)
    await user.upload(input, mockInvalidFile)
    
    await waitFor(() => {
      expect(mockOnUpload).not.toHaveBeenCalled()
      expect(mockToast.error).toHaveBeenCalledWith(
        createMockErrorToast('File must be an image')
      )
      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toHaveTextContent(/file must be an image/i)
    })
  })

  describe('Error Handling', () => {
    it('handles invalid image file', async () => {
      const user = userEvent.setup()
      render(<Avatar onUpload={mockOnUpload} />)
      
      const input = screen.getByLabelText(/upload avatar/i)
      const invalidImageFile = new File(['invalid'], 'test.jpg', { type: 'image/jpeg' })
      await user.upload(input, invalidImageFile)
      
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          createMockErrorToast('Invalid image file')
        )
      })
    })
  })
}) 