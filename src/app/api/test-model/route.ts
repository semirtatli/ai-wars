/**
 * Debug Test — GET /api/test-model?model=gemini-2.0-flash&key=YOUR_API_KEY
 *
 * Non-streaming call to test if a model + API key actually works.
 * Uses generateText (not streamText) to isolate streaming issues.
 */

import { generateText } from 'ai';
import { NextResponse } from 'next/server';

import { getModel } from '@/lib/ai/providers';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const modelId = url.searchParams.get('model') ?? 'gemini-2.0-flash';
  const apiKey = url.searchParams.get('key') ?? '';

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'Missing "key" query parameter. Pass your API key.' },
      { status: 400 },
    );
  }

  try {
    const model = getModel(modelId, apiKey);

    const result = await generateText({
      model,
      messages: [
        { role: 'user', content: 'Say "Hello, AI Wars is working!" in exactly those words.' },
      ],
      maxOutputTokens: 50,
    });

    return NextResponse.json({
      success: true,
      modelId,
      text: result.text,
      usage: result.usage,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error(`[Test] Model ${modelId} failed:`, error);

    return NextResponse.json(
      {
        success: false,
        modelId,
        error: msg,
        stack: stack?.split('\n').slice(0, 5),
      },
      { status: 500 },
    );
  }
}
