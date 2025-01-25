import { SupabaseClient, User, Session } from '@supabase/supabase-js'
import { PostgrestError, PostgrestSingleResponse, PostgrestResponse } from '@supabase/postgrest-js'

// Modern response types
type MockResponse<T> = {
  data: T | null
  error: PostgrestError | null
  count: number | null
  status: number
  statusText: string
}

// Modern query builder with improved type safety
const createMockQueryBuilder = () => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  upsert: jest.fn().mockReturnThis(),
  contains: jest.fn().mockReturnThis(),
  containedBy: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  gt: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lt: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  like: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  match: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  is: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  and: jest.fn().mockReturnThis(),
  not: jest.fn().mockReturnThis(),
  filter: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  single: jest.fn().mockImplementation(() => 
    Promise.resolve<PostgrestSingleResponse<any>>({ 
      data: null, 
      error: null,
      count: null,
      status: 200,
      statusText: 'OK'
    })
  ),
  maybeSingle: jest.fn().mockImplementation(() => 
    Promise.resolve<PostgrestSingleResponse<any>>({ 
      data: null, 
      error: null,
      count: null,
      status: 200,
      statusText: 'OK'
    })
  ),
  execute: jest.fn().mockImplementation(() => 
    Promise.resolve<PostgrestResponse<any>>({ 
      data: [], 
      error: null,
      count: null,
      status: 200,
      statusText: 'OK'
    })
  ),
})

// Modern auth mock with improved type safety
const createAuthMock = () => {
  const signOut = jest.fn().mockImplementation(async (options: { scope?: 'global' | 'local' } = { scope: 'global' }) => {
    return { error: null }
  })

  const signInWithPassword = jest.fn().mockImplementation(async (credentials: { email: string; password: string }) => {
    return {
      data: { user: null, session: null },
      error: null
    }
  })

  const signUp = jest.fn().mockImplementation(async (credentials: { email: string; password: string }) => {
    return {
      data: { user: null, session: null },
      error: null
    }
  })

  const getSession = jest.fn().mockImplementation(async () => {
    return {
      data: { session: null },
      error: null
    }
  })

  const getUser = jest.fn().mockImplementation(async () => {
    return {
      data: { user: null },
      error: null
    }
  })

  const refreshSession = jest.fn().mockImplementation(async () => {
    return {
      data: { session: null },
      error: null
    }
  })

  const updateUser = jest.fn().mockImplementation(async (updates: any) => {
    return {
      data: { user: null },
      error: null
    }
  })

  const onAuthStateChange = jest.fn().mockImplementation((callback: Function) => {
    return {
      data: { subscription: { unsubscribe: jest.fn() } },
      error: null
    }
  })

  return {
    signOut,
    signInWithPassword,
    signUp,
    getSession,
    getUser,
    refreshSession,
    updateUser,
    onAuthStateChange,
  }
}

const mockSupabaseClient = {
  from: jest.fn(() => createMockQueryBuilder()),
  auth: createAuthMock(),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(() => Promise.resolve<MockResponse<{ path: string }>>({ 
        data: { path: 'test-path' }, 
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      })),
      download: jest.fn(() => Promise.resolve<MockResponse<Blob>>({ 
        data: new Blob(), 
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      })),
      remove: jest.fn(() => Promise.resolve<MockResponse<{}>>({ 
        data: {}, 
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      })),
      createSignedUrl: jest.fn(() => Promise.resolve<MockResponse<{ signedUrl: string }>>({ 
        data: { signedUrl: 'test-signed-url' }, 
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      })),
      getPublicUrl: jest.fn(() => ({ publicUrl: 'test-public-url' })),
    })),
  },
  rpc: jest.fn(() => Promise.resolve<MockResponse<any>>({ 
    data: null, 
    error: null,
    count: null,
    status: 200,
    statusText: 'OK'
  })),
}

export const createClient = jest.fn(() => mockSupabaseClient as unknown as SupabaseClient)

// Export types and utilities
export type { SupabaseClient, User, Session }
export const REALTIME_SUBSCRIBE_STATES = {
  SUBSCRIBED: 'SUBSCRIBED',
  TIMED_OUT: 'TIMED_OUT',
  CLOSED: 'CLOSED',
  CHANNEL_ERROR: 'CHANNEL_ERROR',
} 