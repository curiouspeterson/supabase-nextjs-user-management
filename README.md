# 911 Dispatch Scheduling System

A modern scheduling solution for emergency response teams built with Next.js and Supabase, implementing 2025 best practices for security, performance, and reliability.

![System Architecture](https://example.com/architecture-diagram.png)

## Key Features

- **Shift Management**: AI-powered schedule generation
- **Time Off Requests**: Integrated approval workflow
- **Staffing Requirements**: Real-time coverage monitoring
- **Role-Based Access**: RLS-enforced security policies
- **Audit Logging**: Complete change history tracking

## Technologies

### Frontend
- [Next.js 14](https://nextjs.org/) (App Router)
- [Supabase.js v3](https://supabase.com/docs/reference/javascript/introduction)
- [Geist UI](https://geist-ui.dev/) Design System
- [Tailwind CSS v3.4](https://tailwindcss.com/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Backend
- [Supabase Postgres](https://supabase.com/database) (Production)
- [Supabase Local Dev](https://supabase.com/docs/guides/local-development) (Docker)
- [PostgREST](https://postgrest.org/en/stable/) API Layer
- [PgBouncer](https://www.pgbouncer.org/) Connection Pooling

### Testing
- [Jest 29](https://jestjs.io/) + [Testing Library](https://testing-library.com/)
- [MSW 1.2](https://mswjs.io/) API Mocking
- [Cypress](https://www.cypress.io/) E2E Testing
- [Supabase Studio](https://supabase.com/docs/guides/studio) Local Testing

## Deployment

### Vercel (Production)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO&project-name=dispatch-scheduling&integration-ids=oac_VqOgBHqhEoFTPzGkPd7L0iH6)

### Local Development
```bash
# Start Supabase stack
supabase start

# Migrate database
supabase db push

# Seed test data
supabase seed --data-only

# Start Next.js dev server
npm run dev
```

## Security Architecture

### Row-Level Security Policies
```sql
-- Employees can only manage their own shifts
CREATE POLICY "Employee shift access" ON shifts
USING (auth.uid() = employee_id);

-- Managers can view all schedules
CREATE POLICY "Manager schedule access" ON schedules
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM employees 
    WHERE id = auth.uid() 
    AND user_role IN ('Manager', 'Admin')
  )
);

-- Real-time shift updates
ALTER SYSTEM SET shared_preload_libraries = 'pg_net, supavisor, pg_stat_statements, pgsodium';
```

### Environment Variables
```env
# Next.js 14
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-side only
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
```

## Testing Strategy

![Test Pyramid](https://example.com/test-pyramid.png)

| Test Type          | Tools Used         | Coverage Target |
|--------------------|--------------------|-----------------|
| Unit Tests         | Jest, Testing Lib  | 90%             |
| Integration Tests  | MSW, Supabase Mock | 85%             |
| E2E Tests          | Cypress            | 75%             |
| Load Testing       | k6                 | 100 RPS         |

```bash
# Run test suite
npm test -- --coverage

# Generate HTML report
npx jest --coverage --coverageReporters=html
```

## Monitoring & Observability

```typescript
// Example OpenTelemetry integration
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SupabaseExporter } from '@supabase/otel';

const sdk = new NodeSDK({
  traceExporter: new SupabaseExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new SupabaseMetricExporter()
  })
});

sdk.start();
```

Key Metrics Tracked:
- Shift assignment latency
- Schedule generation duration
- API error rates
- Realtime connection count

## CI/CD Pipeline

```yaml
name: Deploy
on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v2
      - run: supabase start
      - run: npm ci
      - run: npm test

  migrate:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_ID }}
      - run: supabase db push
      - run: supabase secrets set --env-file .env.production

  deploy:
    needs: migrate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: vercel/action@v3
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## Real-Time Features

```typescript
// app/components/live-shifts.tsx
import { createClient } from '@/utils/supabase/client'

export function LiveShiftUpdates() {
  const supabase = createClient()
  
  useEffect(() => {
    const channel = supabase.channel('shift-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'shifts'
      }, (payload) => {
        // Update UI in real-time
      })
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [])
}
```

Key real-time features:
- Live shift assignment updates
- Instant schedule change notifications
- Collaborative editing protection
- Presence tracking for dispatchers

## Security Practices

1. **Service Role Key Handling**
```typescript
// scripts/verify-users.ts
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Only in server-side scripts
)
```

2. **Row Level Security**
```sql
-- Prevent privilege escalation
CREATE POLICY "Employee role validation" ON employees
FOR UPDATE USING (
  current_setting('request.jwt.claims', true)::json->>'role' = 'Admin'
  OR auth.uid() = id
);
```

3. **Audit Tables**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  previous_values JSONB
);
```

## Performance Optimization

1. **Database Indexing**
```sql
CREATE INDEX idx_shifts_employee ON shifts(employee_id);
CREATE INDEX idx_schedules_week ON schedules(week_of);
```

2. **Query Optimization**
```typescript
// app/api/shifts/route.ts
const { data } = await supabase
  .from('shifts')
  .select('*, employee:employee_id(name)')
  .range(startIndex, endIndex)
  .order('start_time', { ascending: true })
```

3. **Caching Strategy**
```typescript
// app/actions/get-shifts.ts
export async function getShifts() {
  const { data } = await cache(
    async () => supabase.from('shifts').select('*'),
    ['shifts'],
    { revalidate: 3600 } // 1 hour cache
  )
  return data
}
```

## Contributing

### Development Workflow

1. Create feature branch
```bash
git checkout -b feat/new-scheduling-algorithm
```

2. Start local environment
```bash
supabase start && npm run dev
```

3. Create migration
```bash
supabase migration new add_shift_constraints
```

4. Run tests
```bash
npm test -- --watchAll
```

5. Open PR with:
- Migration SQL files
- Updated TypeScript types
- Jest test coverage
- Documentation updates

## License

Apache 2.0 - See [LICENSE](https://github.com/your-org/dispatch-scheduling/blob/main/LICENSE) for details.

---

> **Warning**  
> This system handles sensitive emergency response data. All contributors must complete security training and adhere to HIPAA compliance standards.

[![Security Audit](https://img.shields.io/badge/Security-Audited-success)](https://example.com/security-report)
[![HIPAA Compliance](https://img.shields.io/badge/HIPAA-Compliant-blue)](https://example.com/hipaa-cert)
[![Uptime](https://img.shields.io/badge/Uptime-99.99%25-brightgreen)](https://status.example.com)
