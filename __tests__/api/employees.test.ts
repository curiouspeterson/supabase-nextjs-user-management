import { createMockRequest, createMockResponse, createTestEmployee } from '../utils/test-utils'
import { faker } from '@faker-js/faker'

interface CreateEmployeeInput {
  email: string
  full_name: string
  employee_role: 'Dispatcher' | 'Shift Supervisor' | 'Management'
  user_role: 'Employee' | 'Manager' | 'Admin'
  weekly_hours_scheduled: number
  default_shift_type_id: string
}

describe('Employees API', () => {
  const validEmployee: CreateEmployeeInput = {
    email: faker.internet.email(),
    full_name: faker.person.fullName(),
    employee_role: 'Dispatcher',
    user_role: 'Employee',
    weekly_hours_scheduled: 40,
    default_shift_type_id: faker.string.uuid()
  }

  describe('GET /api/employees', () => {
    it('should return a list of employees', async () => {
      const req = createMockRequest('GET')
      const res = createMockResponse()

      const response = await fetch('/api/employees')
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.employees).toHaveLength(3)
      expect(data.employees[0]).toHaveProperty('id')
      expect(data.employees[0]).toHaveProperty('first_name')
      expect(data.employees[0]).toHaveProperty('last_name')
      expect(data.employees[0]).toHaveProperty('email')
    })
  })

  describe('POST /api/employees', () => {
    it('should create a new employee with valid data', async () => {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validEmployee),
      })
      
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('message', 'Employee created successfully')
      expect(data).toHaveProperty('userId')
      expect(data).toHaveProperty('employee')
      expect(data.employee).toHaveProperty('email', validEmployee.email)
      expect(data.employee).toHaveProperty('full_name', validEmployee.full_name)
    })

    describe('Validation', () => {
      it('should require all fields', async () => {
        const invalidEmployee = {
          email: validEmployee.email,
          // Missing other required fields
        }

        const response = await fetch('/api/employees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invalidEmployee),
        })

        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data).toHaveProperty('error', 'Missing required fields')
      })

      it('should validate weekly hours is a positive number', async () => {
        const invalidEmployee = {
          ...validEmployee,
          weekly_hours_scheduled: -1
        }

        const response = await fetch('/api/employees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invalidEmployee),
        })

        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data).toHaveProperty('error', 'Invalid weekly_hours_scheduled')
      })

      it('should validate shift type ID is a valid UUID', async () => {
        const invalidEmployee = {
          ...validEmployee,
          default_shift_type_id: 'not-a-uuid'
        }

        const response = await fetch('/api/employees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invalidEmployee),
        })

        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data).toHaveProperty('error', 'Invalid default_shift_type_id')
      })

      it('should validate employee role', async () => {
        const invalidEmployee = {
          ...validEmployee,
          employee_role: 'InvalidRole'
        }

        const response = await fetch('/api/employees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invalidEmployee),
        })

        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data).toHaveProperty('error', 'Invalid employee_role')
      })

      it('should validate user role', async () => {
        const invalidEmployee = {
          ...validEmployee,
          user_role: 'InvalidRole'
        }

        const response = await fetch('/api/employees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invalidEmployee),
        })

        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data).toHaveProperty('error', 'Invalid user_role')
      })

      it('should prevent duplicate emails', async () => {
        // First create an employee
        await fetch('/api/employees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(validEmployee),
        })

        // Try to create another with the same email
        const response = await fetch('/api/employees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(validEmployee),
        })

        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data).toHaveProperty('error', 'User already exists')
      })
    })
  })

  describe('DELETE /api/employees/:id', () => {
    it('should delete an employee when authorized', async () => {
      const employeeId = faker.string.uuid()
      
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'DELETE',
      })

      expect(response.status).toBe(204)
    })

    it('should require authentication', async () => {
      // MSW will simulate an unauthenticated request
      const response = await fetch(`/api/employees/${faker.string.uuid()}`, {
        method: 'DELETE',
      })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data).toHaveProperty('error', 'Unauthorized')
    })

    it('should require admin/manager role', async () => {
      // MSW will simulate a non-admin user
      const response = await fetch(`/api/employees/${faker.string.uuid()}`, {
        method: 'DELETE',
      })

      expect(response.status).toBe(403)
      const data = await response.json()
      expect(data).toHaveProperty('error', 'Forbidden - Insufficient permissions')
    })
  })

  describe('Error Handling', () => {
    it('should handle Supabase auth errors', async () => {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...validEmployee,
          email: 'error@test.com' // MSW will simulate an auth error for this email
        }),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data).toHaveProperty('error', 'Error creating user')
    })

    it('should handle metadata update errors', async () => {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...validEmployee,
          email: 'metadata-error@test.com' // MSW will simulate a metadata error
        }),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data).toHaveProperty('error', 'Error updating user metadata')
    })

    it('should handle employee verification errors', async () => {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...validEmployee,
          email: 'verify-error@test.com' // MSW will simulate a verification error
        }),
      })

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toHaveProperty('error', 'Failed to verify employee record')
    })
  })
}) 