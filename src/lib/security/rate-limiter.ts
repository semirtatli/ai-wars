/**
 * Rate Limiter Configuration
 *
 * Uses Upstash Redis for distributed rate limiting on Vercel's serverless platform.
 * In-memory rate limiting doesn't work on serverless (each invocation = new instance).
 *
 * Three tiers of rate limiting:
 * 1. Global middleware: 20 req/min per IP (all API routes)
 * 2. Chat endpoint: 5 battles/hour, 20 battles/day per IP
 * 3. Global daily: Provider-specific limits to protect free tier quotas
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Lazily initialized Redis client.
 * Avoids env var access during module load (build time).
 */
let _redis: Redis | null = null;

function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return _redis;
}

/**
 * General API rate limiter — 20 requests per 60 seconds per IP.
 * Applied in middleware to all /api/* routes.
 */
export function getGeneralLimiter() {
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(20, '60 s'),
    analytics: true,
    prefix: 'rl:general',
  });
}

/**
 * Chat-specific rate limiter — 5 battle starts per hour per IP.
 * Applied in the /api/chat route handler.
 */
export function getChatLimiter() {
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(30, '60 s'),
    analytics: true,
    prefix: 'rl:chat',
  });
}

/**
 * Daily battle limiter — 20 battles per day per IP.
 */
export function getDailyLimiter() {
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.fixedWindow(100, '86400 s'),
    analytics: true,
    prefix: 'rl:daily',
  });
}

/**
 * Extracts the client IP from a Request object.
 * Checks standard headers set by reverse proxies (Vercel, Cloudflare).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list; take the first (client) IP
    return forwarded.split(',')[0]?.trim() ?? '127.0.0.1';
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  return '127.0.0.1';
}

/**
 * Rate limit result with metadata for response headers.
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Checks rate limit for a given IP and limiter.
 * Returns structured result with metadata for response headers.
 */
export async function checkRateLimit(
  ip: string,
  limiter: Ratelimit,
): Promise<RateLimitResult> {
  const { success, limit, remaining, reset } = await limiter.limit(ip);
  return { success, limit, remaining, reset };
}
