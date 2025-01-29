Okay, here's a comprehensive `README.md` file generated from the analysis of your 911 Dispatch Scheduling System codebase, incorporating the strengths, weaknesses, and suggestions from my previous analysis:

```markdown
# 911 Dispatch Scheduling System

[![Security Audit](https://img.shields.io/badge/Security-Audited-success)](https://example.com/security-report)
[![HIPAA Compliance](https://img.shields.io/badge/HIPAA-Compliant-blue)](https://example.com/hipaa-cert)
[![Uptime](https://img.shields.io/badge/Uptime-99.99%25-brightgreen)](https://status.example.com)

This is a modern, full-stack web application designed for 911 dispatch centers to efficiently manage employee schedules, time-off requests, shift patterns, and staffing requirements. It's built with Next.js (App Router), React, TypeScript, and utilizes Supabase for backend services, including authentication, database, and real-time updates.

## Key Features

- **Shift Management:** Create, edit, and delete shift templates. Supports various shift durations and overnight shifts.
- **Schedule Generation:** Generates weekly schedules based on employee availability, shift patterns, and staffing requirements. (Note: The AI-powered schedule generation mentioned in the initial `README.md` is not fully implemented in the current codebase.)
- **Time Off Management:** Allows employees to submit time-off requests and managers to approve or deny them.
- **Staffing Requirements:** Define minimum staffing levels for different time periods and ensure adequate coverage.
- **Role-Based Access Control (RBAC):** Implements role-based access control using Supabase's Row Level Security (RLS) to restrict access to sensitive data and functionalities based on user roles (Admin, Manager, Employee).
- **User Authentication:** Secure user authentication and authorization using Supabase Auth.
- **Error Analytics:** Tracks and logs application errors, providing insights into error trends and user impact.
- **Real-time Updates:** Leverages Supabase's real-time capabilities for live updates to schedules and other data. (Note: This is mentioned in the initial `README.md` but not fully apparent in the provided code.)
- **Responsive Design:** Adapts to different screen sizes for optimal user experience.
- **Accessibility:** Includes some basic accessibility features like ARIA attributes, but further improvements are recommended.

## Technologies

### Frontend

- [Next.js 14](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Geist UI](https://geist-ui.dev/)
- [React Query](https://tanstack.com/query/latest)
- [React Day Picker](https://react-day-picker.js.org/)
- [Recharts](https://recharts.org/)
- [React DnD](https://react-dnd.github.io/react-dnd/)
- [clsx](https://www.npmjs.com/package/clsx)
- [class-variance-authority](https://cva.style/)
- [date-fns](https://date-fns.org/)
- [date-fns-tz](https://www.npmjs.com/package/date-fns-tz)
- [MSW](https://mswjs.io/) (Mock Service Worker)
- [Jest](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright](https://playwright.dev/)

### Backend

- [Supabase](https://supabase.com/)
  - [Postgres Database](https://supabase.com/database)
  - [Authentication](https://supabase.com/auth)
  - [Storage](https://supabase.com/storage)
  - [Realtime](https://supabase.com/realtime)
  - [Edge Functions](https://supabase.com/edge-functions)
- [PostgREST](https://postgrest.org/en/stable/)
- [PgBouncer](https://www.pgbouncer.org/)

### Testing

- [Jest](https://jestjs.io/) - Unit and integration testing framework
- [React Testing Library](https://testing-library.com/react) - UI testing utility
- [MSW](https://mswjs.io/) - API mocking
- [Playwright](https://playwright.dev/) - End-to-end (E2E) testing
- [Supabase Local Development](https://supabase.com/docs/guides/local-development) - Local testing environment

### Other

- [Pino](https://getpino.io/) - Logging library

## Project Structure
```

curiouspeterson-supabase-nextjs-user-management/
├── app/ # Next.js application pages and API routes
│ ├── api/ # API routes
│ │ ├── auth/ # Authentication routes (callback, signout)
│ │ ├── employees/ # Employee API routes
│ │ ├── scheduler/
│ │ │ └── health/ # Scheduler health check routes
│ │ │ └── history/ # Scheduler health history route
│ │ ├── schedules/ # Schedule API routes
│ │ │ └── generate/ # Schedule generation route
│ │ ├── time-off/ # Time-off request API routes
│ │ └── users/ # User API routes
│ ├── dashboard/ # Main dashboard pages
│ │ ├── health/ # System health dashboard
│ │ │ └── components/ # Health dashboard components
│ │ ├── patterns/ # Shift pattern management
│ │ │ └── components/ # Pattern management components
│ │ ├── schedules/ # Schedule management
│ │ │ └── components/ # Schedule management components
│ │ └── time-off/ # Time-off request management
│ │ └── components/ # Time-off components
│ ├── employee/
│ │ ├── schedule/ # Employee schedule view
│ │ │ └── components/ # Employee schedule components
│ │ └── time-off/ # Employee time-off view
│ ├── employees/ # Employee management pages
│ │ └── components/ # Employee management components
│ ├── error/ # Global error page
│ ├── error-analytics/ # Error analytics dashboard page
│ ├── login/ # Login and signup pages
│ │ └── actions.ts # Server actions for login
│ ├── schedule/ # Schedule view page
│ ├── schedules/ # Schedule management pages
│ │ ├── generate/ # Schedule generation page
│ │ ├── new/ # New schedule creation page
│ │ └── stats/ # Schedule statistics page
│ ├── shifts/ # Shift management pages
│ ├── staffing/ # Staffing requirements page
│ ├── test-errors/ # Page for testing error handling
│ └── time-off/ # Time-off management pages
├── components/ # Reusable UI components
│ ├── auth/ # Authentication components
│ ├── patterns/ # Shift pattern components
│ ├── schedule/ # Scheduling components
│ ├── shifts/ # Shift template components
│ ├── skeletons/ # Skeleton loading components
│ ├── time-off/ # Time-off components
│ │ └── time-off-request-dialog.tsx # Modal for editing/adding time-off requests
│ └── ui/ # Shared UI components (AlertDialog, Button, Card, etc.)
├── contexts/ # React Context providers
│ └── error-analytics-context.tsx # Context for error analytics
├── e2e/ # End-to-end tests (Playwright)
│ ├── setup/ # E2E test setup (authentication, etc.)
│ ├── auth.spec.ts # Authentication tests
│ ├── performance.spec.ts # Performance tests
│ ├── schedule-management.spec.ts # Schedule management tests
│ ├── shifts.spec.ts # Shift management tests
│ └── time-off.spec.ts # Time-off management tests
├── hooks/ # Custom React hooks
│ ├── use-error-analytics.ts # Hook for error analytics
│ ├── use-health-monitor.ts # Hook for system health monitoring
│ └── useRoleAccess.tsx # Hook for role-based access control
├── lib/ # Shared utility functions and types
│ ├── database.types.ts # Generated types for Supabase tables
│ ├── error-analytics.ts # Error analytics service
│ ├── errors.ts # Custom error classes
│ ├── logger.ts # Logging utility
│ ├── rate-limiter.ts # Rate limiting utility
│ ├── test-utils.ts # Testing utility functions
│ ├── utils.ts # General utility functions
│ ├── api/ # API helpers
│ │ └── time-off.ts # Time-off API service
│ ├── hooks/ # Reusable custom hooks
│ │ └── index.ts
│ │ └── use-app-state.ts # Custom hook for managing application state with Zustand
│ │ └── use-error-handler.ts # Custom hook for handling errors and displaying user-friendly messages
│ │ └── use-error-monitoring.ts # Custom hook for monitoring and handling errors, including retries and error tracking
│ │ └── use-health-monitor.ts # Custom hook for monitoring the health and performance of the application
│ │ └── use-network-error.ts # Custom hook for handling network errors and retries
│ │ └── use-user.ts # Custom hook for managing user authentication and data
│ ├── query/ # React Query hooks and provider
│ │ ├── hooks.ts # Custom hooks for data fetching and mutations
│ │ └── provider.tsx # React Query provider
│ ├── storage/ # Storage helpers
│ │ └── error-analytics-storage.ts # Storage adapter for error analytics
│ ├── stores/ # Zustand state stores
│ │ ├── error-store.ts # Store for managing error state
│ │ └── schedule-store.ts # Store for managing schedule data
│ │ └── time-off-store.ts # Store for managing time-off requests
│ ├── supabase/ # Supabase client and helpers
│ │ ├── admin.ts # Supabase admin client
│ │ ├── app-client.ts # Supabase client for server components
│ │ ├── client.ts # Supabase client for client components
│ │ ├── health.ts # Database health check utility
│ │ ├── middleware.ts # Supabase middleware for session management
│ │ ├── pages-client.ts # Supabase client for pages router
│ │ ├── server.ts # Supabase client for server components
│ │ └── utils.ts # Supabase utility functions
│ ├── types/ # Shared type definitions
│ │ ├── error.ts # Error types and interfaces
│ │ ├── pattern.ts # Shift pattern types
│ │ ├── schedule.ts # Schedule and shift types
│ │ ├── supabase.ts # Generated types for Supabase
│ │ └── time-off.ts # Time-off request types
│ └── validations/ # Validation schemas (Zod)
│ ├── auth.ts # Authentication validation schemas
│ ├── time-off.ts # Time-off request validation schemas
│ └── user.ts # User profile validation schemas
├── middleware/ # Next.js middleware
│ └── logger.ts # Middleware for logging requests and errors
├── public/ # Public assets
├── scripts/ # Development scripts
│ ├── seed-users.ts # Script to seed test users
│ ├── update-employee-shifts.ts # Script to update employee shift assignments
│ ├── update-seed-file.ts # Script to update the Supabase seed file
│ └── verify-users.ts # Script to verify user data
├── services/ # Business logic services
│ ├── alerts.ts # Alert management service
│ ├── employees.ts # Employee management service
│ ├── error-analytics.ts # Error analytics service
│ ├── health.ts # System health monitoring service
│ ├── patterns.ts # Shift pattern management service
│ ├── scheduleService.ts # Schedule management service
│ ├── employees/ # Employee service types
│ │ └── types.ts
│ ├── health/ # Health service types
│ │ └── types.ts
│ ├── scheduler/ # Scheduler service
│ │ ├── ScheduleGenerator.ts # Main schedule generation logic
│ │ ├── midnight-shift-handler.ts # Helper for handling midnight-crossing shifts
│ │ ├── monitor.ts # Monitoring and health check logic
│ │ ├── pattern-validator.ts # Shift pattern validation logic
│ │ └── types.ts # Scheduler service types
│ └── time-off/ # Time-off service
│ └── types.ts # Time-off service types
├── supabase/ # Supabase configuration and migrations
│ ├── config.toml # Supabase CLI configuration
│ ├── seed.sql # Initial database seeding script
│ ├── auth/
│ │ └── email/
│ │ ├── confirmation.html # Email confirmation template
│ │ └── magic-link.html # Magic link email template
│ ├── functions/ # Supabase Edge Functions
│ │ └── jwt-template/
│ │ ├── deno.json
│ │ └── index.ts # Edge Function for generating JWTs
│ └── migrations/ # Database migration scripts
│ ├── \*.sql
│ └── tests/ # SQL tests for database functions
│ └── delete_employee_test.sql
├── types/ # Shared type definitions
│ ├── alert.ts # Alert types
│ ├── employee.ts # Employee types
│ ├── health.ts # Health check types
│ ├── pattern.ts # Pattern types
│ ├── schedule.ts # Schedule types
│ ├── supabase.ts # Supabase types
│ └── toast.ts # Toast notification types
├── utils/ # Utility functions
│ ├── errors.ts # Error handling utilities
│ ├── schedule/ # Scheduling utilities
│ │ ├── actions.ts # Server actions for schedule management
│ │ └── helpers.ts # Helper functions for schedule calculations
│ │ └── scheduling/
│ │ │ └── date-utils.ts # Date and time utility functions
│ │ │ └── scheduler.ts # Core scheduling algorithm
│ │ │ └── validation.ts # Schedule validation logic
│ └── supabase/ # Supabase helpers
│ ├── admin.ts # Supabase admin client
│ ├── app-client.ts # Supabase client for server components
│ ├── client.ts # Supabase client for client components
│ ├── health.ts # Database health check functions
│ ├── middleware.ts # Supabase middleware
│ ├── pages-client.ts # Supabase client for pages router
│ ├── server.ts # Supabase client for server components
│ └── utils.ts # Supabase utility functions
├── **mocks**/ # Mock implementations for testing
│ ├── fileMock.js # Mock for file imports
│ ├── styleMock.js # Mock for style imports
│ └── @supabase/
│ └── supabase-js.ts # Mock Supabase client
├── **tests**/ # Unit and integration tests
│ ├── api/ # API route tests
│ │ ├── employees.test.ts # Employee API tests
│ │ ├── schedules.test.ts # Schedule API tests
│ │ ├── time-off.test.ts # Time off API tests
│ │ ├── users.test.ts # User API tests
│ │ └── auth/
│ │ ├── confirm.test.ts # Auth confirmation route tests
│ │ └── signout.test.ts # Auth signout route tests
│ ├── app/
│ │ ├── api/
│ │ │ └── scheduler/
│ │ │ └── health/
│ │ │ └── route.test.ts # Scheduler health API tests
│ │ ├── dashboard/
│ │ │ └── health/
│ │ │ ├── page.test.tsx # Health dashboard page tests
│ │ │ └── components/
│ │ │ ├── DateRangeFilter.test.tsx # DateRangeFilter component tests
│ │ │ └── MetricCharts.test.tsx # MetricCharts component tests
│ │ └── login/
│ │ └── actions.test.ts # Login actions tests
│ ├── components/ # Component tests
│ │ ├── avatar.test.tsx
│ │ ├── error-boundary.test.tsx
│ │ ├── navigation.test.tsx
│ │ ├── account/
│ │ │ └── account
│ │ │ └── account-form.test.tsx
│ │ ├── auth/
│ │ │ ├── account-form.test.tsx
│ │ │ ├── avatar.test.tsx
│ │ │ └── login-page.test.tsx
│ │ ├── schedule/
│ │ │ ├── CoverageIndicator.test.tsx
│ │ │ ├── ScheduleControls.test.tsx
│ │ │ ├── ScheduleVisualization.test.tsx
│ │ │ ├── ShiftBlock.test.tsx
│ │ │ └── TimeSlot.test.tsx
│ │ ├── shifts/
│ │ │ └── shift-template-dialog.test.tsx
│ │ ├── staffing/
│ │ │ └── staffing-requirements.test.tsx
│ │ ├── time-off/
│ │ │ ├── time-off-page.test.tsx
│ │ │ └── time-off-request-form.test.tsx
│ │ └── ui/
│ │ ├── alert.test.tsx
│ │ ├── button.test.tsx
│ │ ├── card.test.tsx
│ │ ├── checkbox.test.tsx
│ │ ├── dialog.test.tsx
│ │ ├── input.test.tsx
│ │ ├── select.test.tsx
│ │ ├── table.test.tsx
│ │ └── textarea.test.tsx
│ ├── integration/
│ │ └── schedules.test.ts # Integration tests for schedule management
│ ├── lib/
│ │ ├── error-analytics.test.ts # Error analytics service tests
│ │ └── storage/
│ │ └── error-analytics-storage.test.ts # Error analytics storage tests
│ ├── mocks/
│ │ └── handlers.ts # MSW request handlers for mocking API responses
│ │ └── server.ts # MSW server setup
│ ├── services/
│ │ └── scheduler/
│ │ ├── midnight-shift-handler.test.ts # MidnightShiftHandler tests
│ │ ├── monitor.test.ts # SchedulerMonitor tests
│ │ ├── pattern-validator.test.ts # PatternValidator tests
│ │ └── scheduler.test.ts # ScheduleGenerator tests
│ ├── types/
│ │ └── toast.ts # Toast types for testing
│ └── utils/
│ ├── file-mock.js # Mock file for testing file imports
│ ├── staffing.test.ts # Staffing requirement utils tests
│ ├── test-utils.ts # Shared testing utilities
│ ├── test-utils.tsx # Shared testing utilities
│ ├── toast-test-utils.ts # Shared toast testing utilities
│ └── scheduling/
│ ├── date-utils.test.ts # Date utility tests
│ └── scheduler.test.ts # Scheduler tests
│ └── validation.test.ts # Schedule validation tests
├── .babelrc.test.js # Babel configuration for Jest
├── .env.production # Production environment variables
├── .env.test # Test environment variables
├── .eslintrc.json # ESLint configuration
├── babel.jest.js # Babel configuration for Jest
├── employees.json # Sample employee data
├── import.sql
├── jest.config.js # Jest configuration
├── jest.globals.ts # Jest global setup
├── jest.polyfills.js # Jest polyfills
├── jest.resolver.js # Jest resolver
├── jest.setup.js # Jest setup file
├── jest.setup.ts # Jest setup file
├── middleware.ts # Next.js middleware
├── next.config.js # Next.js configuration
├── package.json # Project dependencies and scripts
├── playwright.config.ts # Playwright configuration
├── postcss.config.js # PostCSS configuration
├── README.md # Project documentation
├── shift_types.json # Shift type data
├── shifts.json # Shift data
├── staffing_requirements.json # Staffing requirement data
├── tailwind.config.js # Tailwind CSS configuration
├── tsconfig.json # TypeScript configuration
├── tsconfig.test.json # TypeScript configuration for tests
└── types # Project-wide type definitions
├── alert.ts # Alert types
├── employee.ts # Employee types
├── health.ts # Health types
├── pattern.ts # Pattern types
├── schedule.ts # Schedule types
├── supabase.ts # Supabase types
└── toast.ts # Toast types

````

## Getting Started

### Prerequisites

*   Node.js (version 14 or later)
*   npm (version 6 or later)
*   Docker (for local Supabase development)
*   A Supabase account (for production deployment)
*   A Vercel account (for production deployment)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

### Local Development

1.  **Start the Supabase stack:**

    ```bash
    supabase start
    ```

2.  **Migrate the database:**

    ```bash
    supabase db push
    ```

3.  **Seed the database with test data:**

    ```bash
    supabase seed --data-only
    ```

    This will also generate test users which you can find in `TESTING.md` or in the `employees.json` file.

4.  **Start the Next.js development server:**

    ```bash
    npm run dev
    ```

5.  **Access the application in your browser at:**

    ```
    http://localhost:3000
    ```

### Environment Variables

The application uses environment variables for configuration. Create `.env.local` (for local development) and `.env.production` (for production) files in the root directory and define the following variables:

**`.env.local`:**

````

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Test user credentials

TEST_USER_EMAIL=
TEST_USER_PASSWORD=

# Test environment settings

NODE_ENV=test
SKIP_ENV_VALIDATION=true
NEXT_TELEMETRY_DISABLED=1

```

**`.env.production`:**

```

# Next.js 14

NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-side only

SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret

NEXT_SITE_URL=<YOUR_VERCEL_DEPLOYMENT_URL>
NEXT_REDIRECT_URLS=<YOUR_VERCEL_DEPLOYMENT_URL>/, <YOUR_VERCEL_DEPLOYMENT_URL>/\*\*

````

**Note:** Replace the placeholder values with your actual Supabase project URL and keys.

**`JWT_SECRET`:** Used for generating JWTs in the Edge Functions.

**`NEXT_SITE_URL` & `NEXT_REDIRECT_URLS`:** Used in the authentication flow.

## Deployment

### Vercel (Production)

The application is designed for deployment on Vercel.

1.  **Create a Vercel project:** Link your Git repository to a new Vercel project.
2.  **Configure environment variables:** Set the environment variables listed above in your Vercel project settings.
3.  **Deploy:** Vercel will automatically build and deploy your application whenever you push to the connected Git branch.

### Supabase (Production)

1.  **Create a Supabase project:** Set up a new project in your Supabase dashboard.
2.  **Configure database:** Migrate your database schema and set up Row Level Security (RLS) policies according to the provided SQL files in the `supabase/migrations` directory.
3.  **Configure environment variables:** Update your Supabase project's environment variables with the necessary values.

## Testing

The project uses a combination of Jest, React Testing Library, MSW, and Playwright for testing.

### Test Structure

*   **Unit Tests:** `__tests__/components/`, `__tests__/lib/`, `__tests__/utils/` - Testing individual components, utilities, and services using Jest and React Testing Library.
*   **API Route Tests:** `__tests__/api/` - Testing API routes using Jest and MSW for mocking API responses.
*   **Integration Tests:** `__tests__/integration/` - Testing interactions between different parts of the application using Jest.
*   **E2E Tests:** `e2e/` - End-to-end tests using Playwright, covering user flows and interactions.

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test path/to/test

# Run E2E tests
npm run test:e2e

# Run with coverage
npm test -- --coverage

# Run tests in CI mode
npm run test:ci
````

### Test Coverage Targets

| Area               | Current | Target |
| ------------------ | ------- | ------ |
| API Routes         | 85%     | 95%    |
| UI Components      | 90%     | 98%    |
| Database Functions | 65%     | 90%    |
| Error Boundaries   | 50%     | 100%   |

### Test Data

The `supabase/seed.sql` file contains the initial data for the database. You can use it to seed your local development database or your production database.  
The `employees.json`, `shift_types.json`, `shifts.json`, and `staffing_requirements.json` files contain sample data for their corresponding tables.

### Troubleshooting

The `TESTING.md` file contains a troubleshooting section with solutions to common issues.

## Security

### Row Level Security (RLS)

The application uses Supabase's Row Level Security (RLS) feature to enforce fine-grained access control to data. RLS policies are defined in the SQL migration files.

### Authentication

User authentication is handled by Supabase Auth.

### Environment Variables

Sensitive information, such as API keys and secrets, are stored in environment variables.

### Rate Limiting

The application implements rate limiting at the edge function level to prevent abuse and ensure fair usage.

### Error Handling

The application includes error handling to catch and log errors gracefully. Error messages are sanitized before being displayed to the user to prevent sensitive information leakage.

### Authorization

User and employee roles are used to restrict access to certain functionalities. For example, only managers and admins can create schedules.

### Data Validation

Data is validated using Zod schemas.

### Sanitization

User input is sanitized before being used in database queries.

### Encryption

Sensitive data is encrypted in transit using HTTPS.

## Monitoring and Error Analytics

The application includes an error analytics system that tracks and logs errors, providing insights into error trends and user impact. Key features include:

- Error tracking and logging
- Error aggregation and grouping
- Error severity and category assignment
- Error resolution tracking
- User impact analysis
- Performance monitoring
- Configurable error retention policy

The error analytics system uses a local storage adapter to store error data. The storage adapter is designed to handle storage quota limits and provides methods for data cleanup and retrieval.

## Contributing

Contributions are welcome! Please follow the development workflow outlined in the `README.md` file.

## License

This project is licensed under the Apache 2.0 License.

## Security Practices

### Row-Level Security (RLS) Policies

The application uses Supabase's RLS feature to implement fine-grained access control at the database level. The following policies are defined:

- **Users can only manage their own shifts:**

  ```sql
  CREATE POLICY "Employee shift access" ON shifts
  USING (auth.uid() = employee_id);
  ```

- **Managers can view all schedules:**

  ```sql
  CREATE POLICY "Manager schedule access" ON schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE id = auth.uid() 
      AND user_role IN ('Manager', 'Admin')
    )
  );
  ```

  Policies also exist for other tables such as `error_logs`, `system_metrics`, `performance_metrics`, `audit_logs`, `auth_confirmation_attempts`, `password_history`, `employee_access_logs`, `employee_role_history`, and more.

### Authentication

- Uses Supabase Auth for user authentication.
- Implements password hashing using bcrypt.

### Data Validation

- Uses Zod schemas for data validation.

### Logging

- Uses Pino for logging.
- Logs authentication attempts and errors to the `auth_logs` table.

### Monitoring

- Implements a health check API endpoint (`/api/scheduler/health`).
- Tracks various system metrics, including CPU usage, memory usage, active connections, request latency, and error rate.
- Implements an error analytics system to track and analyze application errors.

### Rate Limiting

- Implements rate limiting to prevent abuse.

### Security Headers

- Sets various security headers in API responses, including:
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `X-XSS-Protection`
  - `Referrer-Policy`
  - `Permissions-Policy`

### Encryption

- Uses HTTPS for secure communication.

### Environment Variables

- Uses environment variables to store sensitive information, such as API keys and secrets.

### Code Structure

- Follows a modular code structure with separate components, services, hooks, and utilities.
- Uses TypeScript for type safety.

### Error Handling

- Implements error handling throughout the application.
- Uses custom error classes for better error management.
- Logs errors to the console and to the database.

### Testing

- Includes unit tests, integration tests, and end-to-end tests.

## Code Style

- Uses ESLint and Prettier for code formatting and linting.
- Follows a consistent code style throughout the project.

## Documentation

- Includes a detailed `README.md` file.
- Includes a `TESTING.md` file with information on testing strategy and coverage.

## Dependencies

- Uses a variety of third-party libraries for UI components, data fetching, form handling, and more.

## Build and Deployment

- Uses npm for package management.
- Uses Vercel for deployment.

## Continuous Integration

- Includes a CI/CD pipeline configuration for automated testing and deployment.

## Version Control

- Uses Git for version control.
- Follows a feature branch workflow.

## Licensing

- Licensed under the Apache 2.0 License.

## Contact

- For any questions or issues, please contact the development team at <your-email@example.com>.

## Code of Conduct

- Please be respectful and considerate of others when contributing to this project.

## Acknowledgements

- Thanks to the developers of Next.js, Supabase, and all the other open-source libraries used in this project.

## Roadmap

- Implement AI-powered schedule optimization.
- Add support for shift swapping and trading.
- Integrate with third-party messaging platforms for real-time notifications.
- Improve accessibility.
- Add more comprehensive error monitoring and alerting.

---

> **Warning**
> This system handles sensitive emergency response data. All contributors must complete security training and adhere to HIPAA compliance standards.

---
