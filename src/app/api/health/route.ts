/**
 * Debug Health Check — GET /api/health
 *
 * Returns infrastructure status.
 * AI provider keys are now user-provided (not server-side).
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
  };

  const allSet = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

  return NextResponse.json({
    status: allSet ? 'ok' : 'missing_env_vars',
    checks,
    note: 'AI provider keys are now user-provided per-request',
    timestamp: new Date().toISOString(),
  });
}
