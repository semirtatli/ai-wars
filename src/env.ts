import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * Type-safe environment variable validation.
 *
 * AI provider keys are NO LONGER stored server-side.
 * Users provide their own API keys per-request (sent over HTTPS, never persisted).
 * Only infrastructure keys (rate limiting) are required here.
 */
export const env = createEnv({
  server: {
    UPSTASH_REDIS_REST_URL: z.string().url('Invalid Upstash Redis URL'),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'Upstash Redis token is required'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  },
  client: {},
  runtimeEnv: {
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
