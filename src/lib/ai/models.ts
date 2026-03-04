/**
 * Model Registry
 *
 * Central registry of all available AI models with their metadata.
 * Used by the UI for model selection cards and by the API for validation.
 *
 * All models listed here are 100% FREE tier — no payment methods attached.
 */

import type { ModelInfo, ProviderInfo } from '@/types';

/** Provider metadata for UI display */
export const PROVIDERS: Record<string, ProviderInfo> = {
  google: {
    id: 'google',
    name: 'Google',
    url: 'https://aistudio.google.com',
    color: '#4285F4',
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    url: 'https://groq.com',
    color: '#F55036',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    url: 'https://platform.openai.com',
    color: '#10A37F',
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    url: 'https://openrouter.ai',
    color: '#6366F1',
  },
};

/** All available models with metadata */
export const MODELS: ModelInfo[] = [
  // ── Google Gemini ─────────────────────────────────────────
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    description: 'Google\'s most capable model. Fast, multimodal, excellent reasoning.',
    capability: 5,
    speed: 'fast',
    sdkModelId: 'gemini-2.0-flash',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    description: 'Fast and efficient. Great for quick debates with solid quality.',
    capability: 4,
    speed: 'fast',
    sdkModelId: 'gemini-1.5-flash',
  },
  // ── OpenAI ────────────────────────────────────────────────
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'OpenAI\'s efficient model. Great balance of speed and quality.',
    capability: 4,
    speed: 'fast',
    sdkModelId: 'gpt-4o-mini',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'OpenAI\'s flagship model. Top-tier reasoning and creativity.',
    capability: 5,
    speed: 'medium',
    sdkModelId: 'gpt-4o',
  },
  // ── Groq ──────────────────────────────────────────────────
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    provider: 'groq',
    description: 'Meta\'s powerful open model on Groq\'s ultra-fast LPU hardware.',
    capability: 4,
    speed: 'fast',
    sdkModelId: 'llama-3.3-70b-versatile',
  },
  {
    id: 'mixtral-8x7b',
    name: 'Mixtral 8x7B',
    provider: 'groq',
    description: 'Mistral\'s mixture-of-experts model. Multilingual, good at debates.',
    capability: 3,
    speed: 'fast',
    sdkModelId: 'mixtral-8x7b-32768',
  },
  {
    id: 'gemma2-9b',
    name: 'Gemma 2 9B',
    provider: 'groq',
    description: 'Google\'s lightweight open model. Fast responses, good for quick rounds.',
    capability: 3,
    speed: 'fast',
    sdkModelId: 'gemma2-9b-it',
  },
  // ── OpenRouter ────────────────────────────────────────────
  {
    id: 'openrouter-llama-3.3-70b',
    name: 'Llama 3.3 70B (Free)',
    provider: 'openrouter',
    description: 'Meta Llama 3.3 via OpenRouter. Free access with generous limits.',
    capability: 4,
    speed: 'medium',
    sdkModelId: 'meta-llama/llama-3.3-70b-instruct:free',
  },
  {
    id: 'openrouter-gemini-flash',
    name: 'Gemini 2.0 Flash (Free)',
    provider: 'openrouter',
    description: 'Google Gemini via OpenRouter. Free access.',
    capability: 5,
    speed: 'fast',
    sdkModelId: 'google/gemini-2.0-flash-exp:free',
  },
];

/**
 * Find a model by its ID.
 * Returns undefined if not found (used for validation).
 */
export function getModelInfo(modelId: string): ModelInfo | undefined {
  return MODELS.find((m) => m.id === modelId);
}

/**
 * Get all models for a specific provider.
 */
export function getModelsByProvider(providerId: string): ModelInfo[] {
  return MODELS.filter((m) => m.provider === providerId);
}

/**
 * Example debate topics for the UI.
 */
export const EXAMPLE_TOPICS = [
  'Tabs vs Spaces: Which is the superior code formatting choice?',
  'Is AI-generated code a threat or a gift to software engineering?',
  'Vim vs VS Code: The ultimate developer productivity debate',
  'Monolith vs Microservices: Which architecture wins for startups?',
  'TypeScript vs JavaScript: Is the type safety worth the overhead?',
  'Remote work vs Office work: What\'s better for team productivity?',
  'Is social media doing more harm than good to society?',
  'Should university education be free for everyone?',
  'Electric cars vs Hydrogen fuel cells: The future of transportation',
  'Is Mars colonization a realistic goal or a billionaire fantasy?',
  'Dark mode vs Light mode: Which is actually better for your eyes?',
  'Should AI systems have legal personhood?',
];
