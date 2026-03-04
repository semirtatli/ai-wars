/**
 * AI Provider Configuration
 *
 * Configures all AI providers using Vercel AI SDK v6.
 * Each provider uses free-tier API keys stored in server-side env vars.
 * Keys are NEVER exposed to the client.
 *
 * Provider architecture:
 * - Google: @ai-sdk/google (Gemini 2.0 Flash — free tier)
 * - Groq: @ai-sdk/groq (Llama, Mixtral, Gemma — free tier)
 * - GitHub Models: @ai-sdk/openai with custom baseURL (GPT-4o-mini, GPT-4o — free tier)
 * - OpenRouter: @openrouter/ai-sdk-provider (free :free models)
 */

import { google } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import type { LanguageModel } from 'ai';

import { env } from '@/env';
import type { ProviderId } from '@/types';

/**
 * Lazily-initialized provider instances.
 * Created on first use to avoid env validation errors during build.
 */
let _groq: ReturnType<typeof createGroq> | null = null;
let _github: ReturnType<typeof createOpenAI> | null = null;
let _openrouter: ReturnType<typeof createOpenRouter> | null = null;

function getGroq() {
  if (!_groq) {
    _groq = createGroq({ apiKey: env.GROQ_API_KEY });
  }
  return _groq;
}

function getGitHub() {
  if (!_github) {
    _github = createOpenAI({
      baseURL: 'https://models.inference.ai.azure.com',
      apiKey: env.GITHUB_TOKEN,
    });
  }
  return _github;
}

function getOpenRouter() {
  if (!_openrouter) {
    _openrouter = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY });
  }
  return _openrouter;
}

/**
 * Model ID → Provider mapping.
 * This is the ONLY place where model IDs are mapped to SDK calls.
 * Acts as a whitelist — any model ID not in this map is rejected (SSRF protection).
 */
const MODEL_FACTORY: Record<string, () => LanguageModel> = {
  // Google Gemini
  'gemini-2.0-flash': () => google('gemini-2.0-flash'),

  // Groq (ultra-fast inference)
  'llama-3.3-70b': () => getGroq()('llama-3.3-70b-versatile'),
  'mixtral-8x7b': () => getGroq()('mixtral-8x7b-32768'),
  'gemma2-9b': () => getGroq()('gemma2-9b-it'),
  'deepseek-r1-70b': () => getGroq()('deepseek-r1-distill-llama-70b'),

  // GitHub Models (OpenAI-compatible endpoint)
  'gpt-4o-mini': () => getGitHub()('gpt-4o-mini'),
  'gpt-4o': () => getGitHub()('gpt-4o'),

  // OpenRouter (free models)
  'openrouter-gpt-oss': () => getOpenRouter()('openai/gpt-4o-mini:free' as string),
  'openrouter-nemotron': () =>
    getOpenRouter()('nvidia/llama-3.1-nemotron-70b-instruct:free' as string),
};

/**
 * Returns the set of valid model IDs.
 * Used for request validation (whitelist check).
 */
export function getValidModelIds(): Set<string> {
  return new Set(Object.keys(MODEL_FACTORY));
}

/**
 * Resolves a model ID to an AI SDK LanguageModel instance.
 * Throws if the model ID is not in the whitelist.
 *
 * @param modelId - The model identifier from the client request
 * @returns A configured LanguageModelV1 instance
 * @throws Error if modelId is not valid
 */
export function getModel(modelId: string): LanguageModel {
  const factory = MODEL_FACTORY[modelId];
  if (!factory) {
    throw new Error(`Invalid model ID: ${modelId}. Not in whitelist.`);
  }
  return factory();
}

/**
 * Returns the provider ID for a given model ID.
 */
export function getProviderForModel(modelId: string): ProviderId {
  if (modelId.startsWith('gemini')) return 'google';
  if (modelId.startsWith('gpt')) return 'github';
  if (modelId.startsWith('openrouter')) return 'openrouter';
  return 'groq';
}
