import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Types for rate limit configuration
export interface RateLimitConfig {
  requests: number;      // Number of requests allowed
  window: string;        // Time window (e.g., '1m', '1h', '1d')
  identifier?: string;   // Custom identifier (default: IP)
}

// In-memory fallback for development (when Redis is not configured)
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

// Parse window string to milliseconds
function parseWindow(window: string): number {
  const match = window.match(/^(\d+)([smhd])$/);
  if (!match) return 60000; // Default 1 minute

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 60000;
  }
}

// In-memory rate limiter for development
function inMemoryRateLimit(
  identifier: string,
  requests: number,
  windowMs: number
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const key = identifier;
  const record = inMemoryStore.get(key);

  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance on each request
    const cutoff = now - windowMs * 2;
    for (const [k, v] of inMemoryStore.entries()) {
      if (v.resetAt < cutoff) {
        inMemoryStore.delete(k);
      }
    }
  }

  if (!record || record.resetAt < now) {
    // New window
    inMemoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: requests - 1, reset: now + windowMs };
  }

  if (record.count >= requests) {
    // Rate limited
    return { success: false, remaining: 0, reset: record.resetAt };
  }

  // Increment counter
  record.count++;
  return { success: true, remaining: requests - record.count, reset: record.resetAt };
}

// Create Upstash Redis client if configured
let redis: Redis | null = null;
let upstashConfigured = false;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    upstashConfigured = true;
  }
} catch (error) {
  console.warn('Upstash Redis not configured, using in-memory rate limiting');
}

// Pre-configured rate limiters for different use cases
export const rateLimiters = {
  // Strict: For authentication endpoints (login, register, password reset)
  auth: upstashConfigured && redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1m'), // 5 requests per minute
        analytics: true,
        prefix: 'ratelimit:auth',
      })
    : null,

  // Moderate: For upload endpoints
  upload: upstashConfigured && redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1m'), // 10 requests per minute
        analytics: true,
        prefix: 'ratelimit:upload',
      })
    : null,

  // Relaxed: For general API endpoints
  api: upstashConfigured && redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, '1m'), // 60 requests per minute
        analytics: true,
        prefix: 'ratelimit:api',
      })
    : null,

  // Very strict: For sensitive operations (password verification, code verification)
  sensitive: upstashConfigured && redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, '1m'), // 3 requests per minute
        analytics: true,
        prefix: 'ratelimit:sensitive',
      })
    : null,

  // Download: For download URL generation
  download: upstashConfigured && redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, '1m'), // 30 requests per minute
        analytics: true,
        prefix: 'ratelimit:download',
      })
    : null,

  // Anonymous: Stricter limits for unauthenticated requests
  anonymous: upstashConfigured && redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, '1m'), // 20 requests per minute (stricter than authenticated)
        analytics: true,
        prefix: 'ratelimit:anonymous',
      })
    : null,

  // Password verification: Very strict to prevent brute force attacks
  password: upstashConfigured && redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '5m'), // 5 attempts per 5 minutes
        analytics: true,
        prefix: 'ratelimit:password',
      })
    : null,

  // 2FA verification: Strict to prevent brute force on TOTP codes
  twoFactor: upstashConfigured && redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '5m'), // 5 attempts per 5 minutes
        analytics: true,
        prefix: 'ratelimit:2fa',
      })
    : null,
};

// Get client IP from request
export function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Vercel specific
  const vercelForwardedFor = request.headers.get('x-vercel-forwarded-for');
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(',')[0].trim();
  }

  // Fallback
  return '127.0.0.1';
}

// Rate limit check result
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// Rate limit types
export type RateLimitType = 'auth' | 'upload' | 'api' | 'sensitive' | 'download' | 'anonymous' | 'password' | 'twoFactor';

// Main rate limit function
export async function rateLimit(
  request: NextRequest,
  type: RateLimitType = 'api',
  customIdentifier?: string
): Promise<RateLimitResult> {
  const ip = customIdentifier || getClientIP(request);
  const identifier = `${type}:${ip}`;

  // Rate limit configurations for fallback
  const configs: Record<RateLimitType, { requests: number; window: string }> = {
    auth: { requests: 5, window: '1m' },
    upload: { requests: 10, window: '1m' },
    api: { requests: 60, window: '1m' },
    sensitive: { requests: 3, window: '1m' },
    download: { requests: 30, window: '1m' },
    anonymous: { requests: 20, window: '1m' },
    password: { requests: 5, window: '5m' },
    twoFactor: { requests: 5, window: '5m' },
  };

  const config = configs[type];
  const limiter = rateLimiters[type];

  // Use Upstash if configured
  if (limiter) {
    try {
      const result = await limiter.limit(identifier);
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch (error) {
      console.error('Upstash rate limit error, falling back to in-memory:', error);
    }
  }

  // Fallback to in-memory
  const windowMs = parseWindow(config.window);
  const result = inMemoryRateLimit(identifier, config.requests, windowMs);

  return {
    success: result.success,
    limit: config.requests,
    remaining: result.remaining,
    reset: result.reset,
  };
}

// Helper to create rate-limited response
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

  return NextResponse.json(
    {
      success: false,
      error: 'Troppe richieste. Riprova tra poco.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
        'Retry-After': retryAfter.toString(),
      },
    }
  );
}

// Middleware-style rate limit check
export async function checkRateLimit(
  request: NextRequest,
  type: RateLimitType = 'api',
  customIdentifier?: string
): Promise<NextResponse | null> {
  const result = await rateLimit(request, type, customIdentifier);

  if (!result.success) {
    return rateLimitResponse(result);
  }

  return null; // No rate limit hit, continue processing
}

// Check rate limit for password verification attempts
export async function checkPasswordRateLimit(
  request: NextRequest,
  transferId: string
): Promise<NextResponse | null> {
  // Use both IP and transferId to prevent distributed attacks on a single transfer
  const ip = getClientIP(request);
  const identifier = `password:${transferId}:${ip}`;
  return checkRateLimit(request, 'password', identifier);
}

// Check rate limit for 2FA verification attempts
export async function check2FARateLimit(
  request: NextRequest,
  userId: string
): Promise<NextResponse | null> {
  // Use both IP and userId to prevent distributed attacks
  const ip = getClientIP(request);
  const identifier = `2fa:${userId}:${ip}`;
  return checkRateLimit(request, 'twoFactor', identifier);
}

// Add rate limit headers to successful response
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.reset.toString());
  return response;
}
