import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/utils/supabase/middleware'
import { z } from 'zod'

// Define log level schema
const LogLevelSchema = z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR'])
type LogLevel = z.infer<typeof LogLevelSchema>

// Define log entry schema
const LogEntrySchema = z.object({
  level: LogLevelSchema,
  message: z.string(),
  timestamp: z.string().datetime(),
  request: z.object({
    method: z.string(),
    url: z.string(),
    headers: z.record(z.string()).optional(),
    ip: z.string().optional(),
    userAgent: z.string().optional()
  }),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE'])
  }).optional(),
  metadata: z.record(z.unknown()).optional()
})

type LogEntry = z.infer<typeof LogEntrySchema>

// Environment configuration
const envSchema = z.object({
  LOG_LEVEL: LogLevelSchema.default('INFO'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
})

const env = envSchema.parse({
  LOG_LEVEL: process.env.LOG_LEVEL || 'INFO',
  NODE_ENV: process.env.NODE_ENV || 'development'
})

// Helper to determine if a log level should be logged
function shouldLog(level: LogLevel): boolean {
  const levels: Record<LogLevel, number> = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  }
  return levels[level] >= levels[env.LOG_LEVEL]
}

// Helper to sanitize headers
function sanitizeHeaders(headers: Headers): Record<string, string> {
  const sanitized: Record<string, string> = {}
  const sensitiveHeaders = ['authorization', 'cookie', 'set-cookie']
  
  headers.forEach((value, key) => {
    if (sensitiveHeaders.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]'
    } else {
      sanitized[key] = value
    }
  })
  
  return sanitized
}

// Helper to get client IP
function getClientIp(req: NextRequest): string {
  return req.ip || 
    req.headers.get('x-forwarded-for')?.split(',')[0] || 
    'unknown'
}

export async function middleware(req: NextRequest) {
  const start = Date.now()
  const requestId = crypto.randomUUID()
  
  try {
    // Create Supabase client
    const supabase = createClient(req)
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession()
    
    // Get user profile if authenticated
    let userProfile = null
    if (session?.user) {
      const { data } = await supabase.rpc('get_user_profile', {
        p_user_id: session.user.id
      })
      userProfile = data?.[0]
    }

    // Create log entry
    const logEntry: LogEntry = {
      level: 'INFO',
      message: `${req.method} ${req.nextUrl.pathname}`,
      timestamp: new Date().toISOString(),
      request: {
        method: req.method,
        url: req.url,
        headers: sanitizeHeaders(req.headers),
        ip: getClientIp(req),
        userAgent: req.headers.get('user-agent') || undefined
      },
      metadata: {
        requestId,
        duration: Date.now() - start,
        query: Object.fromEntries(req.nextUrl.searchParams),
        referer: req.headers.get('referer'),
      }
    }

    // Add user info if available
    if (userProfile) {
      logEntry.user = {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role
      }
    }

    // Log to database if in production
    if (env.NODE_ENV === 'production' && shouldLog(logEntry.level)) {
      try {
        await supabase.rpc('log_request', {
          p_level: logEntry.level,
          p_message: logEntry.message,
          p_request_data: logEntry.request,
          p_user_data: logEntry.user || null,
          p_metadata: logEntry.metadata
        })
      } catch (error) {
        console.error('Failed to log to database:', error)
      }
    }

    // Always log to console in development
    if (env.NODE_ENV === 'development') {
      console.log(JSON.stringify(logEntry, null, 2))
    }

    // Continue with the request
    return NextResponse.next()
  } catch (error) {
    // Log error
    const errorEntry: LogEntry = {
      level: 'ERROR',
      message: error instanceof Error ? error.message : 'Unknown error in middleware',
      timestamp: new Date().toISOString(),
      request: {
        method: req.method,
        url: req.url,
        headers: sanitizeHeaders(req.headers),
        ip: getClientIp(req),
        userAgent: req.headers.get('user-agent') || undefined
      },
      metadata: {
        requestId,
        duration: Date.now() - start,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      }
    }

    console.error(JSON.stringify(errorEntry, null, 2))
    
    // Continue with the request even if logging fails
    return NextResponse.next()
  }
}

export const config = {
  matcher: '/api/:path*',
} 