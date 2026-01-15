/**
 * Simple in-memory rate limiter
 * For production, use @upstash/ratelimit with Redis
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  maxRequests: number;  // Max requests allowed
  windowMs: number;     // Time window in milliseconds
}

// Default configurations for different endpoint types
export const RATE_LIMITS = {
  // Strict limit for expensive operations
  expensive: { maxRequests: 10, windowMs: 60 * 1000 },    // 10 per minute
  // Standard limit for API calls
  standard: { maxRequests: 30, windowMs: 60 * 1000 },     // 30 per minute
  // Relaxed limit for read operations
  relaxed: { maxRequests: 60, windowMs: 60 * 1000 },      // 60 per minute
  // Auth endpoints (prevent brute force)
  auth: { maxRequests: 5, windowMs: 15 * 60 * 1000 },     // 5 per 15 minutes
} as const;

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (IP address, user ID, etc)
 * @param endpoint - Endpoint name for tracking
 * @param config - Rate limit configuration
 * @returns { allowed: boolean, remaining: number, resetIn: number }
 */
export function checkRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig = RATE_LIMITS.standard
): { allowed: boolean; remaining: number; resetIn: number } {
  const key = `${identifier}:${endpoint}`;
  const now = Date.now();
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }
  
  const entry = rateLimitStore.get(key);
  
  // No existing entry or expired
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetAt - now,
    };
  }
  
  // Increment count
  entry.count += 1;
  rateLimitStore.set(key, entry);
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetAt - now,
  };
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a hash of user-agent + some request info
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `ua:${hashString(userAgent)}`;
}

/**
 * Simple string hash for fallback identification
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Clean up expired entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const entries = Array.from(rateLimitStore.entries());
  for (const [key, entry] of entries) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Create rate limit headers for response
 */
export function rateLimitHeaders(remaining: number, resetIn: number): Record<string, string> {
  return {
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetIn / 1000).toString(),
  };
}
