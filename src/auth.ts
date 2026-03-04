/**
 * Auth.js v5 Configuration
 *
 * Supports Google and GitHub OAuth login.
 * Uses JWT sessions (no database required).
 * Protected routes check session server-side.
 */

import NextAuth from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';

/**
 * Build providers list dynamically — only include providers
 * whose credentials are actually configured.
 */
function getProviders(): Provider[] {
  const providers: Provider[] = [];

  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push(Google);
  }
  if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
    providers.push(GitHub);
  }

  return providers;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: getProviders(),
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    /** Add user ID to the JWT token */
    jwt({ token, account, profile }) {
      if (account && profile) {
        token.provider = account.provider;
      }
      return token;
    },
    /** Expose provider info in the session */
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
