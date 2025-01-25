interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  errorMessage?: string
}

interface RateLimitState {
  count: number
  resetTime: number
}

class RateLimiter {
  private limits: Map<string, RateLimitConfig> = new Map()
  private state: Map<string, RateLimitState> = new Map()

  addLimit(key: string, config: RateLimitConfig) {
    this.limits.set(key, {
      maxRequests: config.maxRequests,
      windowMs: config.windowMs,
      errorMessage: config.errorMessage || 'Too many requests. Please try again later.'
    })
  }

  private getState(key: string): RateLimitState {
    const now = Date.now()
    let state = this.state.get(key)

    if (!state || now >= state.resetTime) {
      state = {
        count: 0,
        resetTime: now + this.limits.get(key)!.windowMs
      }
      this.state.set(key, state)
    }

    return state
  }

  async checkLimit(key: string): Promise<void> {
    const limit = this.limits.get(key)
    if (!limit) {
      throw new Error(`Rate limit not configured for key: ${key}`)
    }

    const state = this.getState(key)
    state.count++

    if (state.count > limit.maxRequests) {
      const waitTime = Math.ceil((state.resetTime - Date.now()) / 1000)
      throw new Error(
        `${limit.errorMessage} Please wait ${waitTime} seconds.`
      )
    }
  }

  getRemainingRequests(key: string): number {
    const limit = this.limits.get(key)
    if (!limit) {
      throw new Error(`Rate limit not configured for key: ${key}`)
    }

    const state = this.getState(key)
    return Math.max(0, limit.maxRequests - state.count)
  }

  getResetTime(key: string): Date {
    const state = this.getState(key)
    return new Date(state.resetTime)
  }

  clearLimit(key: string): void {
    this.state.delete(key)
  }

  clearAllLimits(): void {
    this.state.clear()
  }
}

// Create a singleton instance
const rateLimiter = new RateLimiter()

// Configure default limits
rateLimiter.addLimit('auth', {
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
  errorMessage: 'Too many authentication attempts'
})

rateLimiter.addLimit('api', {
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
  errorMessage: 'Too many API requests'
})

export { rateLimiter, RateLimiter, type RateLimitConfig } 