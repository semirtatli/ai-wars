/**
 * Debug Health Check — GET /api/health
 *
 * Returns which AI providers are configured and auth status.
 * Does NOT expose any key values — only reports presence.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    // Auth
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID: !!process.env.AUTH_GOOGLE_ID,
    AUTH_GITHUB_ID: !!process.env.AUTH_GITHUB_ID,
    // AI Providers
    GOOGLE_GENERATIVE_AI_API_KEY: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    GROQ_API_KEY: !!process.env.GROQ_API_KEY,
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    OPENROUTER_API_KEY: !!process.env.OPENROUTER_API_KEY,
    // Infrastructure
    UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json({
    status: 'ok',
    checks,
    timestamp: new Date().toISOString(),
  });
}
