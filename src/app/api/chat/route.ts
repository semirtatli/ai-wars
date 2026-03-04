/**
 * Chat API Route — Streaming AI Responses
 *
 * POST /api/chat
 *
 * Accepts a model ID and message history, returns a streaming text response.
 * Security layers (applied in order):
 * 1. Turnstile token verification (bot protection)
 * 2. Route-level rate limiting (per-IP, sliding window)
 * 3. Input validation (Zod schema + model whitelist)
 * 4. Streaming response with max_tokens limit
 *
 * The API key is resolved server-side — NEVER exposed to the client.
 */

import { streamText } from 'ai';
import { NextResponse } from 'next/server';

import { getModel } from '@/lib/ai/providers';
import { getChatLimiter, getClientIp, checkRateLimit } from '@/lib/security/rate-limiter';
import { verifyTurnstileToken } from '@/lib/security/turnstile';
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

    const { modelId, messages, turnstileToken, maxTokens } = parsed.data;

    // ── 2. Verify Turnstile token (bot protection) ─────────────
    const clientIp = getClientIp(request);
    const isHuman = await verifyTurnstileToken(turnstileToken, clientIp);

    if (!isHuman) {
      return NextResponse.json(
        { error: 'Turnstile verification failed. Please try again.' },
        { status: 403 },
      );
    }

    // ── 3. Rate limiting ───────────────────────────────────────
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

    // ── 4. Resolve model and stream response ───────────────────
    const model = getModel(modelId);

    const result = streamText({
      model,
      messages,
      maxOutputTokens: maxTokens,
      temperature: 0.8,
    });

    // Manually pipe the text stream so provider errors are surfaced to the client
    // instead of silently producing an empty 200 response.
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (streamError) {
          const errMsg =
            streamError instanceof Error ? streamError.message : 'AI provider stream failed';
          console.error(`[Chat API] Stream error for model ${modelId}:`, streamError);
          // Send the error as text so the client can display it
          controller.enqueue(encoder.encode(`\n[ERROR]: ${errMsg}`));
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
