import { createMockRequest, createMockResponse, createTestUser } from '../utils/test-utils'
import { faker } from '@faker-js/faker'

interface User {
  id: string
  email: string
}

describe('Users API', () => {
  describe('GET /api/users', () => {
    it('should require user IDs', async () => {
      const response = await fetch('/api/users')
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error', 'User IDs are required')
    })

    it('should return user data for valid IDs', async () => {
      const userId1 = faker.string.uuid()
      const userId2 = faker.string.uuid()
      
      const response = await fetch(`/api/users?ids=${userId1},${userId2}`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      data.forEach((user: User) => {
        expect(user).toHaveProperty('id')
        expect(user).toHaveProperty('email')
      })
    })

    it('should handle non-existent user IDs', async () => {
      const nonExistentId = faker.string.uuid()
      
      const response = await fetch(`/api/users?ids=${nonExistentId}`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(0)
    })

    it('should filter out users without emails', async () => {
      const userId = faker.string.uuid()
      // MSW will return a mix of users with and without emails
      
      const response = await fetch(`/api/users?ids=${userId}`)
      const data = await response.json()

      expect(response.status).toBe(200)
      data.forEach((user: User) => {
        expect(user.email).toBeTruthy()
      })
    })

    it('should prefer email with number for duplicate users', async () => {
      const userId = faker.string.uuid()
      // MSW will return a user with multiple email variations
      
      const response = await fetch(`/api/users?ids=${userId}`)
      const data = await response.json()

      expect(response.status).toBe(200)
      const user = data.find((u: User) => u.id === userId)
      expect(user?.email).toMatch(/\.\d+@/)
    })
  })

  describe('Error Handling', () => {
    it('should handle Supabase API errors', async () => {
      // MSW will simulate a Supabase error for this request
      const response = await fetch('/api/users?ids=error-id')
      
      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toHaveProperty('error', 'Failed to fetch user data')
    })

    it('should handle invalid UUID format', async () => {
      const response = await fetch('/api/users?ids=invalid-uuid')
      
      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toHaveProperty('error')
    })

    it('should handle unexpected errors', async () => {
      // MSW will throw an unexpected error for this request
      const response = await fetch('/api/users?ids=unexpected-error')
      
      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toHaveProperty('error', 'Failed to fetch user data')
    })
  })
}) 