/**
 * Cloudflare Turnstile Server-Side Verification
 *
 * Verifies Turnstile tokens server-side to prevent bot abuse.
 * The token is generated client-side by the Turnstile widget and sent with each request.
 * Server-side verification is MANDATORY — client-side-only verification is useless.
 *
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * In-memory cache of verified tokens.
 * Turnstile tokens are single-use, but a battle needs to make
 * multiple API calls with the same token. Once verified, we cache
 * the token so subsequent calls within the TTL succeed without
 * re-hitting Cloudflare's API.
 */
const verifiedTokens = new Map<string, number>();
const TOKEN_TTL = 10 * 60 * 1000; // 10 minutes

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes': string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Verifies a Turnstile token with Cloudflare's API.
 *
 * @param token - The Turnstile response token from the client
 * @param ip - The client's IP address (optional, for additional validation)
 * @returns true if the token is valid, false otherwise
 */
export async function verifyTurnstileToken(token: string, ip?: string): Promise<boolean> {
  // In development, skip Turnstile verification if no secret key is set
  if (process.env.NODE_ENV === 'development' && !process.env.TURNSTILE_SECRET_KEY) {
    console.warn('[Turnstile] Skipping verification in development (no secret key)');
    return true;
  }

  // Check cache — allow token reuse within a battle session
  const cachedAt = verifiedTokens.get(token);
  if (cachedAt && Date.now() - cachedAt < TOKEN_TTL) {
    return true;
  }

  try {
    const body: Record<string, string> = {
      secret: process.env.TURNSTILE_SECRET_KEY!,
      response: token,
    };

    if (ip) {
      body.remoteip = ip;
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`[Turnstile] Verification request failed: ${response.status}`);
      return false;
    }

    const data = (await response.json()) as TurnstileVerifyResponse;

    if (!data.success) {
      console.warn(`[Turnstile] Token rejected: ${data['error-codes'].join(', ')}`);
    } else {
      // Cache successful verification for reuse during the battle
      verifiedTokens.set(token, Date.now());

      // Purge expired entries to prevent memory leak
      for (const [key, ts] of verifiedTokens) {
        if (Date.now() - ts > TOKEN_TTL) verifiedTokens.delete(key);
      }
    }

    return data.success;
  } catch (error) {
    console.error('[Turnstile] Verification error:', error);
    // Fail open in development, fail closed in production
    return process.env.NODE_ENV === 'development';
  }
}
