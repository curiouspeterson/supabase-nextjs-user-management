import '@testing-library/jest-dom'
import { server } from './mocks/server'

beforeAll(() => {
  // Enable the MSW interceptors
  server.listen()
})

afterEach(() => {
  // Reset any runtime request handlers we may add during the tests
  server.resetHandlers()
})

afterAll(() => {
  // Clean up after the tests are finished
  server.close()
}) 