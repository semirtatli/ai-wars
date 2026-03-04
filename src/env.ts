import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * Type-safe environment variable validation.
 * Validated at build time — missing or invalid vars cause immediate build failure.
 * Server-only vars are NEVER exposed to the client bundle.
 */
export const env = createEnv({
  server: {
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1, 'Google AI API key is required'),
    GROQ_API_KEY: z.string().min(1, 'Groq API key is required'),
    GITHUB_TOKEN: z.string().min(1, 'GitHub token is required'),
    OPENROUTER_API_KEY: z.string().min(1, 'OpenRouter API key is required'),
    UPSTASH_REDIS_REST_URL: z.string().url('Invalid Upstash Redis URL'),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'Upstash Redis token is required'),
    TURNSTILE_SECRET_KEY: z.string().min(1, 'Turnstile secret key is required'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  },
  client: {
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1, 'Turnstile site key is required'),
  },
  runtimeEnv: {
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NODE_ENV: process.env.NODE_ENV,
  },
  /**
   * Skip validation in CI or when env vars aren't available (e.g., during `next lint`).
   * In production, validation is always enforced.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
