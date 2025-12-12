/**
 * Simple in-memory rate limiter.
 * Note: In a serverless environment (like Vercel), this state is not shared across
 * function instances. It provides "best effort" protection.
 */
export class RateLimiter {
  private tokens: Map<string, { count: number; lastReset: number }>;
  private windowMs: number;
  private max: number;

  constructor(windowMs: number, max: number) {
    this.tokens = new Map();
    this.windowMs = windowMs;
    this.max = max;

    // Periodic cleanup to prevent memory leaks
    setInterval(() => this.cleanup(), 60000); // Cleanup every minute
  }

  public check(key: string): boolean {
    const now = Date.now();
    const record = this.tokens.get(key);

    if (!record) {
      this.tokens.set(key, { count: 1, lastReset: now });
      return true;
    }

    if (now - record.lastReset > this.windowMs) {
      // Window expired, reset
      record.count = 1;
      record.lastReset = now;
      return true;
    }

    if (record.count < this.max) {
      record.count++;
      return true;
    }

    return false;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, record] of this.tokens.entries()) {
      if (now - record.lastReset > this.windowMs) {
        this.tokens.delete(key);
      }
    }
  }
}

// Global instance for the login route (5 requests per minute)
// Using a global variable to try and persist across hot reloads in dev,
// though in production serverless it will still be per-instance.
const globalForRateLimit = global as unknown as { loginRateLimiter: RateLimiter };

export const loginRateLimiter =
  globalForRateLimit.loginRateLimiter || new RateLimiter(60 * 1000, 5);

if (process.env.NODE_ENV !== "production")
  globalForRateLimit.loginRateLimiter = loginRateLimiter;
