/**
 * Debug Health Check — GET /api/health
 *
 * Returns which AI providers are configured (have API keys set).
 * Does NOT expose any key values — only reports presence.
 * This endpoint helps debug deployment issues.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    GOOGLE_GENERATIVE_AI_API_KEY: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    GROQ_API_KEY: !!process.env.GROQ_API_KEY,
    GITHUB_TOKEN: !!process.env.GITHUB_TOKEN,
    OPENROUTER_API_KEY: !!process.env.OPENROUTER_API_KEY,
    UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    TURNSTILE_SECRET_KEY: !!process.env.TURNSTILE_SECRET_KEY,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NODE_ENV: process.env.NODE_ENV,
  };

  const allSet = Object.values(checks).every((v) => v === true || typeof v === 'string');

  return NextResponse.json({
    status: allSet ? 'ok' : 'missing_env_vars',
    checks,
    timestamp: new Date().toISOString(),
  });
}
