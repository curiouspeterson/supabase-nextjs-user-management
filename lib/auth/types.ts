import { User } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export type AuthUser = User
export type AuthSession = Database['auth']['Sessions']['Row']

export interface AuthError {
  message: string
  code: string
  severity: 'WARNING' | 'ERROR' | 'CRITICAL'
  category: 'AUTH' | 'VALIDATION' | 'SERVER'
  cause?: unknown
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: AuthError | null
}

export interface AuthResponse {
  data?: {
    user: AuthUser | null
    session: AuthSession | null
  }
  error: AuthError | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials extends LoginCredentials {
  confirmPassword: string
}

export interface AuthConfig {
  redirectTo?: string
  emailRedirectTo?: string
  refreshToken?: string
  provider?: string
  scopes?: string
}

// Cookie configuration
export interface CookieOptions {
  name: string
  value: string
  maxAge?: number
  path?: string
  sameSite?: 'strict' | 'lax' | 'none'
  httpOnly?: boolean
  secure?: boolean
  domain?: string
}

// Auth client configuration
export interface AuthClientConfig {
  auth?: {
    autoRefreshToken?: boolean
    persistSession?: boolean
    detectSessionInUrl?: boolean
    flowType?: 'implicit' | 'pkce'
    storage?: {
      getItem(key: string): string | null | Promise<string | null>
      setItem(key: string, value: string): void | Promise<void>
      removeItem(key: string): void | Promise<void>
    }
  }
  cookies?: {
    get(name: string): string | undefined
    set(name: string, value: string, options?: CookieOptions): void
    remove(name: string, options?: CookieOptions): void
  }
}

// Auth event types
export type AuthChangeEvent = 
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'PASSWORD_RECOVERY'
  | 'TOKEN_REFRESHED'

// Auth provider types
export type AuthProvider =
  | 'google'
  | 'github'
  | 'gitlab'
  | 'bitbucket'
  | 'azure'
  | 'twitter'
  | 'discord'
  | 'facebook'
  | 'spotify'
  | 'slack'
  | 'twitch'
  | 'apple'
  | 'email'
  | 'phone' 