/**
 * Calculate exponential backoff delay with jitter
 * @param attempt Current attempt number
 * @param initialDelay Initial delay in milliseconds
 * @param maxDelay Maximum delay in milliseconds
 * @returns Delay in milliseconds
 */
export function calculateExponentialDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number
): number {
  // Calculate exponential delay with jitter
  const exponentialDelay = initialDelay * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
  const delay = exponentialDelay + jitter;
  
  // Ensure delay doesn't exceed maxDelay
  return Math.min(delay, maxDelay);
}

/**
 * Validate and sanitize cookie value
 * @param value Cookie value to validate
 * @returns Sanitized cookie value
 * @throws Error if value is invalid
 */
export function validateCookieValue(value: string): string {
  // Remove any control characters and non-printable characters
  const sanitized = value.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Ensure the value doesn't contain any special characters
  if (!/^[\w\-._~]+$/.test(sanitized)) {
    throw new Error('Invalid cookie value characters');
  }
  
  // Ensure the value isn't too long (4096 bytes is common browser limit)
  const encoder = new TextEncoder();
  if (encoder.encode(sanitized).length > 4096) {
    throw new Error('Cookie value too long');
  }
  
  return sanitized;
}

/**
 * Parse and validate JWT token
 * @param token JWT token to validate
 * @returns Parsed token payload or null if invalid
 */
export function parseJwtToken(token: string): Record<string, any> | null {
  try {
    // Split the token
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) {
      return null;
    }
    
    // Decode the payload
    const decodedPayload = JSON.parse(
      Buffer.from(payload, 'base64').toString()
    );
    
    // Check expiration
    if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
      return null;
    }
    
    return decodedPayload;
  } catch {
    return null;
  }
}

/**
 * Get client IP address from request
 * @param request Next.js request object
 * @returns Client IP address
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    // Get first IP if multiple are present
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

/**
 * Sanitize and validate redirect URL
 * @param url URL to validate
 * @param allowedHosts Array of allowed hosts
 * @returns Validated URL or null if invalid
 */
export function validateRedirectUrl(
  url: string,
  allowedHosts: string[] = []
): string | null {
  try {
    const parsedUrl = new URL(url);
    
    // Check if host is allowed
    if (!allowedHosts.includes(parsedUrl.host)) {
      return null;
    }
    
    // Ensure it's a relative path or same origin
    if (parsedUrl.protocol !== 'https:' && !url.startsWith('/')) {
      return null;
    }
    
    // Remove any fragments
    parsedUrl.hash = '';
    
    return parsedUrl.toString();
  } catch {
    // Return null for invalid URLs
    return null;
  }
}

export type RetryConfig = {
  maxAttempts?: number
  initialDelay?: number
  maxDelay?: number
  factor?: number
  jitter?: boolean
}

export async function exponentialBackoff<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 5000,
    factor = 2,
    jitter = true
  } = config;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        break;
      }

      // Calculate delay using the helper function
      const delay = calculateExponentialDelay(attempt, initialDelay, maxDelay);
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Operation failed after maximum retries');
}

export function isAuthError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error
  )
}

export function getErrorMessage(error: unknown): string {
  if (isAuthError(error)) {
    return (error as { message: string }).message
  }
  return 'An unexpected error occurred'
} 