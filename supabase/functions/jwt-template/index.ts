// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { SignJWT, importPKCS8 } from 'https://deno.land/x/jose@v4.14.4/index.ts'
import { Status } from 'https://deno.land/std@0.168.0/http/http_status.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

console.log("Hello from Functions!")

// Types
interface JwtTemplate {
  id: string
  name: string
  algorithm: string
  template: {
    header: Record<string, unknown>
    payload: Record<string, unknown>
  }
  max_age_seconds: number
  required_claims: string[]
  custom_claims: Record<string, unknown>
  version: number
}

class JwtError extends Error {
  constructor(
    message: string,
    public status: number = Status.InternalServerError,
    public code: string = 'JWT_ERROR'
  ) {
    super(message)
    this.name = 'JwtError'
  }
}

// Rate limiting
const rateLimit = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT = 100 // requests per window
const RATE_WINDOW = 60 * 1000 // 1 minute in milliseconds

// Configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Request validation
const generateJwtSchema = z.object({
  template_name: z.string().min(1),
  subject: z.string().min(1),
  additional_claims: z.record(z.unknown()).optional(),
})

// Helper functions
async function checkRateLimit(clientId: string): Promise<void> {
  const now = Date.now()
  const clientRate = rateLimit.get(clientId)

  if (clientRate) {
    if (now - clientRate.timestamp > RATE_WINDOW) {
      // Reset window
      rateLimit.set(clientId, { count: 1, timestamp: now })
    } else if (clientRate.count >= RATE_LIMIT) {
      throw new JwtError('Rate limit exceeded', Status.TooManyRequests, 'RATE_LIMIT_EXCEEDED')
    } else {
      // Increment count
      rateLimit.set(clientId, { count: clientRate.count + 1, timestamp: clientRate.timestamp })
    }
  } else {
    // First request
    rateLimit.set(clientId, { count: 1, timestamp: now })
  }
}

async function logJwtOperation(
  supabase: ReturnType<typeof createClient>,
  templateId: string,
  templateVersion: number,
  userId: string | null,
  operation: 'generate' | 'verify' | 'revoke',
  jwtId: string,
  expiresAt: Date,
  error?: string
): Promise<void> {
  try {
    await supabase.from('jwt_audit_logs').insert({
      template_id: templateId,
      template_version: templateVersion,
      user_id: userId,
      operation,
      jwt_id: jwtId,
      expires_at: expiresAt.toISOString(),
      error_details: error,
      client_info: {
        user_agent: Deno.env.get('USER_AGENT'),
        ip_address: Deno.env.get('REMOTE_ADDR'),
      },
    })
  } catch (error) {
    console.error('Failed to log JWT operation:', error)
  }
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      throw new JwtError('Method not allowed', Status.MethodNotAllowed, 'METHOD_NOT_ALLOWED')
    }

    // Get request data
    const { template_name, subject, additional_claims } = generateJwtSchema.parse(
      await req.json()
    )

    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Check rate limit
    const clientId = req.headers.get('x-client-info') ?? 'anonymous'
    await checkRateLimit(clientId)

    // Get JWT template
    const { data: template, error: templateError } = await supabaseAdmin
      .rpc('get_jwt_template', { template_name })
      .single()

    if (templateError || !template) {
      throw new JwtError(
        templateError?.message ?? 'Template not found',
        Status.NotFound,
        'TEMPLATE_NOT_FOUND'
      )
    }

    // Generate JWT ID
    const jwtId = crypto.randomUUID()

    // Calculate expiration
    const issuedAt = Math.floor(Date.now() / 1000)
    const expiresAt = new Date((issuedAt + template.max_age_seconds) * 1000)

    // Prepare claims
    const claims = {
      ...template.template.payload,
      ...additional_claims,
      sub: subject,
      jti: jwtId,
      iat: issuedAt,
      exp: issuedAt + template.max_age_seconds,
    }

    // Validate required claims
    for (const claim of template.required_claims) {
      if (!(claim in claims)) {
        throw new JwtError(
          `Missing required claim: ${claim}`,
          Status.BadRequest,
          'MISSING_REQUIRED_CLAIM'
        )
      }
    }

    // Get private key
    const privateKey = Deno.env.get('JWT_PRIVATE_KEY')
    if (!privateKey) {
      throw new JwtError('Private key not configured', Status.InternalServerError, 'MISSING_PRIVATE_KEY')
    }

    // Sign JWT
    const jwt = await new SignJWT(claims)
      .setProtectedHeader({ ...template.template.header, alg: template.algorithm })
      .setIssuedAt(issuedAt)
      .setExpirationTime(expiresAt)
      .setJti(jwtId)
      .sign(await importPKCS8(privateKey, template.algorithm))

    // Log successful operation
    await logJwtOperation(
      supabaseAdmin,
      template.id,
      template.version,
      subject,
      'generate',
      jwtId,
      expiresAt
    )

    // Return JWT
    return new Response(
      JSON.stringify({
        token: jwt,
        expires_at: expiresAt.toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Error generating JWT:', error)

    const status = error instanceof JwtError ? error.status : Status.InternalServerError
    const code = error instanceof JwtError ? error.code : 'INTERNAL_SERVER_ERROR'
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'

    return new Response(
      JSON.stringify({
        error: {
          code,
          message,
        },
      }),
      {
        status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/jwt-template' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
