import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Configure request listener with proper error handling
export const server = setupServer(...handlers)

// Configure server to error on unhandled requests
server.listen({
  onUnhandledRequest: 'error'
})

// Reset handlers after each test
afterEach(() => server.resetHandlers())

// Clean up after all tests
afterAll(() => server.close()) 