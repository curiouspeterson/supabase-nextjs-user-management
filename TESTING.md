# Testing Guide

## Overview

This document outlines the testing strategy and current state of test coverage for the application.

### Test Structure

The test suite is organized into the following categories:

1. **Component Tests** (`__tests__/components/`)
   - UI Components
     - ✅ Button
     - ✅ Card
     - ✅ Table
     - ✅ Dialog
     - ✅ Toast
     - ✅ Alert
     - ✅ Select
     - ✅ Textarea
     - ✅ Checkbox
   - Feature Components
     - ✅ Navigation
     - ✅ TimeOffRequestForm

2. **API Route Tests** (`__tests__/api/`)
   - ✅ Users API
   - ✅ Employees API
   - ✅ Schedules API

3. **Integration Tests**
   - ✅ Authentication Flow
   - ✅ Time Off Request Flow
   - ⚠️ Employee Management Flow (partial)
   - ⚠️ Schedule Management Flow (partial)

4. **E2E Tests** (`e2e/`)
   - ✅ Authentication
   - ✅ Time Off Management
   - ⚠️ Employee Management (partial)
   - ⚠️ Schedule Management (partial)

5. **Error Boundary Tests** (`__tests__/error/`)
   - ✅ Global error page rendering
   - ✅ API error handling
   - ⚠️ Employee deletion error states

6. **Role-Based Access Tests** (`__tests__/security/`)
   - ✅ Manager schedule access
   - ✅ Admin employee management
   - ⚠️ Dispatch worker restrictions

## Current Test Coverage

### Completed
- Basic UI components with comprehensive test coverage
- Core API routes with error handling and validation tests
- Authentication flows
- Time off request functionality

### In Progress
- Employee management features
- Schedule management features
- Advanced integration scenarios

### Planned
- Performance testing
- Load testing for API routes
- Cross-browser compatibility tests
- Mobile responsiveness tests

## Best Practices

1. **Component Testing**
   - Test both success and error states
   - Verify accessibility features
   - Test responsive behavior
   - Mock external dependencies

2. **API Testing**
   - Validate request/response formats
   - Test error handling
   - Check authorization rules
   - Mock database interactions

3. **Integration Testing**
   - Test complete user flows
   - Verify state management
   - Test cross-component interactions

4. **E2E Testing**
   - Cover critical user journeys
   - Test in production-like environment
   - Include mobile and desktop scenarios

5. **Supabase Mocking**
   - Always mock RPC calls:
   ```javascript
   .rpc: jest.fn(() => Promise.resolve({ data: null, error: null }))
   ```

6. **Accessibility**
   - Verify all interactive elements have ARIA labels
   - Test keyboard navigation sequences

7. **Error Testing**
   - Force error states in:
   - API response handling
   - Database function failures
   - Invalid role access attempts

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test path/to/test

# Run E2E tests
npm run test:e2e

# Run with coverage
npm test -- --coverage
```

## Next Steps

1. Complete employee management tests
2. Add schedule management test coverage
3. Implement performance testing suite
4. Add cross-browser testing configuration
5. Set up continuous integration test workflow
6. Implement schedule conflict detection tests
7. Add employee edit history tracking
8. Create load test for schedule generation
9. Verify 508 compliance for all components

Last Updated: June 15, 2024 

## Coverage Targets

| Area              | Current | Target |
|-------------------|---------|--------|
| API Routes        | 85%     | 95%    |
| UI Components     | 90%     | 98%    |
| Database Functions| 65%     | 90%    |
| Error Boundaries  | 50%     | 100%   |

## New Troubleshooting Section

**Common Issues**  
1. Timeout Errors:
   ```bash
   jest --testTimeout=30000
   ```
2. ESM Module Issues:
   ```javascript
   transformIgnorePatterns: [
     'node_modules/(?!(geist|@supabase)/)'
   ]
   ```
3. Missing Mocks:
   ```typescript
   jest.mock('@/utils/supabase/middleware')
   ```

Test Coverage Leader: @web 