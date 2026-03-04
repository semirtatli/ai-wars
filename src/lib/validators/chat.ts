/**
 * Request Validators
 *
 * Zod schemas for validating API request bodies.
 * Provides type-safe validation with descriptive error messages.
 */

import { z } from 'zod';
import { getValidModelIds } from '@/lib/ai/providers';

/**
 * Schema for the /api/chat POST request body.
 * Validates model ID against the whitelist, message format, and metadata.
 * Authentication is handled at the route level (session check).
 */
export const chatRequestSchema = z.object({
  /** Model ID — must be in the whitelist */
  modelId: z.string().min(1, 'Model ID is required').refine(
    (id) => getValidModelIds().has(id),
    { message: 'Invalid model ID. Not in allowed model list.' },
  ),

  /** Conversation messages for the model */
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string().min(1).max(10000, 'Message too long (max 10,000 chars)'),
    }),
  ).min(1, 'At least one message is required').max(50, 'Too many messages (max 50)'),

  /** Max tokens for the response */
  maxTokens: z.number().int().min(100).max(1000).optional().default(400),
});

/** Inferred type from the schema */
export type ChatRequest = z.infer<typeof chatRequestSchema>;
