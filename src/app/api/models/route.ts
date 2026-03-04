/**
 * Models API Route
 *
 * GET /api/models
 *
 * Returns only models whose provider has a configured API key.
 * No authentication required — this is public info for the setup form.
 */

import { NextResponse } from 'next/server';

import { getAvailableModels, getAvailableProviders } from '@/lib/ai/providers';
import { PROVIDERS } from '@/lib/ai/models';

export async function GET() {
  const availableProviderIds = getAvailableProviders();
  const availableModels = getAvailableModels();

  // Only include provider metadata for providers that have keys
  const providers: Record<string, (typeof PROVIDERS)[string]> = {};
  for (const id of availableProviderIds) {
    const provider = PROVIDERS[id];
    if (provider) {
      providers[id] = provider;
    }
  }

  return NextResponse.json({
    models: availableModels,
    providers,
  });
}
