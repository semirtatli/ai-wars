/**
 * AI Provider Configuration
 *
 * Dynamically creates AI provider instances using user-provided API keys.
 * Keys are passed per-request and NEVER stored on the server.
 *
 * Provider architecture:
 * - Google: @ai-sdk/google (Gemini models)
 * - Groq: @ai-sdk/groq (Llama, Mixtral, Gemma — ultra-fast inference)
 * - OpenAI: @ai-sdk/openai (GPT-4o, GPT-4o-mini)
 * - OpenRouter: @openrouter/ai-sdk-provider (aggregated access to many models)
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import type { LanguageModel } from 'ai';

import { MODELS } from './models';
import type { ProviderId } from '@/types';

/** Model ID whitelist — built from the models registry */
const VALID_MODEL_IDS = new Set(MODELS.map((m) => m.id));

/** Lookup: model ID → model metadata */
const MODEL_MAP = new Map(MODELS.map((m) => [m.id, m]));

/**
 * Returns the set of valid model IDs.
 * Used for request validation (whitelist check).
 */
export function getValidModelIds(): Set<string> {
  return VALID_MODEL_IDS;
}

/**
 * Returns the provider ID for a given model ID.
 */
export function getProviderForModel(modelId: string): ProviderId | null {
  return MODEL_MAP.get(modelId)?.provider ?? null;
}

/**
 * Creates a provider instance with a user-supplied API key.
 * The key is used only for this call and never persisted.
 */
function createProviderInstance(providerId: ProviderId, apiKey: string) {
  switch (providerId) {
    case 'google':
      return createGoogleGenerativeAI({ apiKey });
    case 'groq':
      return createGroq({ apiKey });
    case 'openai':
      return createOpenAI({ apiKey });
    case 'openrouter':
      return createOpenRouter({ apiKey });
    default:
      throw new Error(`Unknown provider: ${String(providerId)}`);
  }
}

/**
 * Resolves a model ID to an AI SDK LanguageModel instance using the user's API key.
 * Throws if the model ID is not in the whitelist.
 *
 * @param modelId - The model identifier from the client request
 * @param apiKey - The user-provided API key for this model's provider
 * @returns A configured LanguageModel instance
 * @throws Error if modelId is not valid
 */
export function getModel(modelId: string, apiKey: string): LanguageModel {
  const modelInfo = MODEL_MAP.get(modelId);
  if (!modelInfo) {
    throw new Error(`Invalid model ID: ${modelId}. Not in whitelist.`);
  }

  const provider = createProviderInstance(modelInfo.provider, apiKey);
  return provider(modelInfo.sdkModelId) as LanguageModel;
}
