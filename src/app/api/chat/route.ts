/**
 * Chat API Route — Streaming AI Responses
 *
 * POST /api/chat
 *
 * Accepts a model ID, message history, and user-provided API key.
 * Returns a streaming text response.
 *
 * Security layers (applied in order):
 * 1. Input validation (Zod schema + model whitelist)
 * 2. Route-level rate limiting (per-IP, sliding window)
 * 3. Streaming response with max_tokens limit
 *
 * The user provides their own API key per request.
 * Keys are used transiently and NEVER persisted or logged.
 */

import { streamText } from 'ai';
import { NextResponse } from 'next/server';

import { getModel } from '@/lib/ai/providers';
import { getChatLimiter, getClientIp, checkRateLimit } from '@/lib/security/rate-limiter';
import { chatRequestSchema } from '@/lib/validators/chat';

/** Allow streaming responses up to 30 seconds on Vercel */
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    // ── 1. Parse and validate request body ─────────────────────
    const body: unknown = await request.json();
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { modelId, messages, apiKey, maxTokens } = parsed.data;

    // ── 2. Rate limiting ───────────────────────────────────────
    const clientIp = getClientIp(request);
    const limiter = getChatLimiter();
    const rateLimitResult = await checkRateLimit(clientIp, limiter);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before starting another debate.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        },
      );
    }

    // ── 3. Resolve model with user-provided key and stream ─────
    let model;
    try {
      model = getModel(modelId, apiKey);
    } catch (modelError) {
      const msg = modelError instanceof Error ? modelError.message : 'Unknown model error';
      console.error(`[Chat API] getModel failed for ${modelId}:`, modelError);
      return NextResponse.json({ error: `Model error: ${msg}` }, { status: 400 });
    }

    let result;
    try {
      result = streamText({
        model,
        messages,
        maxOutputTokens: maxTokens,
        temperature: 0.8,
      });
    } catch (streamInitError) {
      const msg = streamInitError instanceof Error ? streamInitError.message : 'Stream init failed';
      console.error(`[Chat API] streamText init failed for ${modelId}:`, streamInitError);
      return NextResponse.json({ error: `Stream init error: ${msg}` }, { status: 500 });
    }

    // Manually pipe the text stream so provider errors are surfaced to the client
    // instead of silently producing an empty 200 response.
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        let hasChunks = false;
        try {
          for await (const chunk of result.textStream) {
            hasChunks = true;
            controller.enqueue(encoder.encode(chunk));
          }
          // If the provider returned zero chunks, surface that as an error
          if (!hasChunks) {
            console.error(`[Chat API] Empty stream from model ${modelId} — no chunks received`);
            controller.enqueue(
              encoder.encode(`[ERROR]: AI provider returned empty response for model ${modelId}. The API key may be invalid or the provider may be down.`),
            );
          }
          controller.close();
        } catch (streamError) {
          const errMsg =
            streamError instanceof Error ? streamError.message : 'AI provider stream failed';
          console.error(`[Chat API] Stream error for model ${modelId}:`, streamError);
          // Send the error as text so the client can display it
          controller.enqueue(encoder.encode(`[ERROR]: ${errMsg}`));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[Chat API] Unhandled error:', error);

    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    if (error instanceof Error && error.message.includes('Invalid model ID')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 },
    );
  }
}
