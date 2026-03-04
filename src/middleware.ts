/**
 * Next.js Middleware — Global Rate Limiting
 *
 * Runs on the Edge Runtime before any API route handler.
 * Applies a general rate limit (20 req/min per IP) to all /api/* routes.
 * This is the first line of defense against abuse.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Only apply rate limiting when Upstash is configured
const isRateLimitEnabled =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

let ratelimit: Ratelimit | null = null;

if (isRateLimitEnabled) {
  ratelimit = new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    }),
    limiter: Ratelimit.slidingWindow(20, '60 s'),
    analytics: true,
    prefix: 'rl:middleware',
  });
}

export async function middleware(request: NextRequest) {
  // Skip rate limiting if Upstash is not configured (development)
  if (!ratelimit) {
    return NextResponse.next();
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1';

  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      },
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());

  return response;
}

/** Only apply middleware to API routes */
export const config = {
  matcher: '/api/:path*',
};
