/**
 * Auth.js API Route Handlers
 *
 * Exposes GET and POST handlers for all /api/auth/* routes:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback/google
 * - /api/auth/callback/github
 * - /api/auth/session
 */

import { handlers } from '@/auth';

export const { GET, POST } = handlers;
