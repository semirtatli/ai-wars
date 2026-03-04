/**
 * AI Provider Configuration
 *
 * Server-side AI provider instances using env-stored API keys.
 * Protected by OAuth authentication — only logged-in users can call the API.
 *
 * Provider keys are optional — only models whose provider key is configured
 * will be available in the UI.
 *
 * Provider architecture:
 * - Google: @ai-sdk/google (Gemini models — direct API)
 * - Groq: @ai-sdk/groq (Llama, Mixtral, Gemma — ultra-fast inference)
 * - OpenRouter: @openrouter/ai-sdk-provider (Claude, GPT, Qwen, Mistral, DeepSeek, etc.)
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import type { LanguageModel } from 'ai';

import { MODELS } from './models';
import type { ProviderId } from '@/types';

/** Which provider keys are available (checked at request time) */
function getProviderKey(providerId: ProviderId): string | undefined {
  switch (providerId) {
    case 'google':
      return process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    case 'groq':
      return process.env.GROQ_API_KEY;
    case 'openrouter':
      return process.env.OPENROUTER_API_KEY;
    default:
      return undefined;
  }
}

/** Returns provider IDs that have a configured API key */
export function getAvailableProviders(): ProviderId[] {
  const all: ProviderId[] = ['google', 'groq', 'openrouter'];
  return all.filter((p) => !!getProviderKey(p));
}

/** Returns only models whose provider has a configured API key */
export function getAvailableModels() {
  const available = new Set(getAvailableProviders());
  return MODELS.filter((m) => available.has(m.provider));
}

/** Model ID whitelist — only models with configured providers */
export function getValidModelIds(): Set<string> {
  return new Set(getAvailableModels().map((m) => m.id));
}

/** Lookup: model ID → model metadata */
const MODEL_MAP = new Map(MODELS.map((m) => [m.id, m]));

/**
 * Returns the provider ID for a given model ID.
 */
export function getProviderForModel(modelId: string): ProviderId | null {
  return MODEL_MAP.get(modelId)?.provider ?? null;
}

/**
 * Creates a provider instance with the server-side API key.
 */
function createProviderInstance(providerId: ProviderId) {
  const apiKey = getProviderKey(providerId);
  if (!apiKey) {
    throw new Error(`No API key configured for provider: ${providerId}`);
  }

  switch (providerId) {
    case 'google':
      return createGoogleGenerativeAI({ apiKey });
    case 'groq':
      return createGroq({ apiKey });
    case 'openrouter':
      return createOpenRouter({ apiKey });
    default:
      throw new Error(`Unknown provider: ${String(providerId)}`);
  }
}

/**
 * Resolves a model ID to an AI SDK LanguageModel instance.
 * Uses server-side API keys. Protected by auth at the route level.
 *
 * @param modelId - The model identifier from the client request
 * @returns A configured LanguageModel instance
 * @throws Error if modelId is not valid or provider key is missing
 */
export function getModel(modelId: string): LanguageModel {
  const modelInfo = MODEL_MAP.get(modelId);
  if (!modelInfo) {
    throw new Error(`Invalid model ID: ${modelId}. Not in whitelist.`);
  }

  const provider = createProviderInstance(modelInfo.provider);
  return provider(modelInfo.sdkModelId) as LanguageModel;
}
