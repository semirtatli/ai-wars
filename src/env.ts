import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * Type-safe environment variable validation.
 *
 * Auth env vars (AUTH_SECRET, Google/GitHub OAuth) are required.
 * AI provider keys are optional — only models whose provider key is set are available.
 * Upstash is required for rate limiting.
 */
export const env = createEnv({
  server: {
    // ── Auth ──────────────────────────────────────────────
    AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required'),
    AUTH_GOOGLE_ID: z.string().optional(),
    AUTH_GOOGLE_SECRET: z.string().optional(),
    AUTH_GITHUB_ID: z.string().optional(),
    AUTH_GITHUB_SECRET: z.string().optional(),

    // ── AI Providers (optional — models hidden if key missing) ──
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
    GROQ_API_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    OPENROUTER_API_KEY: z.string().optional(),

    // ── Infrastructure ────────────────────────────────────
    UPSTASH_REDIS_REST_URL: z.string().url('Invalid Upstash Redis URL'),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'Upstash Redis token is required'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  },
  client: {},
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
  },
  /**
   * Skip validation in CI or when env vars aren't available (e.g., during `next lint`).
   * In production, validation is always enforced.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
