'use client';

/**
 * NextAuth SessionProvider wrapper.
 * Wraps the app to provide session context to all client components.
 */

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

export function SessionProvider({ children }: { children: ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
