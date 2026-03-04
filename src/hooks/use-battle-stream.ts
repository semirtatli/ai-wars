'use client';

/**
 * useBattleStream — Streaming hook for a single AI model response.
 *
 * Handles the low-level streaming communication with the /api/chat endpoint.
 * Returns the accumulated text and streaming status.
 *
 * Architecture:
 * - Sends a POST to /api/chat with model ID, messages, and user-provided API key
 * - Reads the streaming response chunk by chunk using ReadableStream API
 * - Exposes real-time text accumulation and status
 */

import { useState, useCallback, useRef } from 'react';

interface StreamOptions {
  modelId: string;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  apiKey: string;
  maxTokens: number;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: string) => void;
}

interface StreamState {
  text: string;
  isStreaming: boolean;
  error: string | null;
}

export function useBattleStream() {
  const [state, setState] = useState<StreamState>({
    text: '',
    isStreaming: false,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const startStream = useCallback(async (options: StreamOptions) => {
    const { modelId, messages, apiKey, maxTokens, onChunk, onComplete, onError } = options;

    // Abort any existing stream
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState({ text: '', isStreaming: true, error: null });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId, messages, apiKey, maxTokens }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMsg = (errorData as { error?: string }).error ?? `HTTP ${response.status}`;
        setState((s) => ({ ...s, isStreaming: false, error: errorMsg }));
        onError?.(errorMsg);
        return;
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        setState((s) => ({ ...s, text: accumulated }));
        onChunk?.(chunk);
      }

      setState((s) => ({ ...s, isStreaming: false }));
      onComplete?.(accumulated);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setState((s) => ({ ...s, isStreaming: false }));
        return;
      }

      const errorMsg = error instanceof Error ? error.message : 'Stream failed';
      setState((s) => ({ ...s, isStreaming: false, error: errorMsg }));
      onError?.(errorMsg);
    }
  }, []);

  const stopStream = useCallback(() => {
    abortRef.current?.abort();
    setState((s) => ({ ...s, isStreaming: false }));
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ text: '', isStreaming: false, error: null });
  }, []);

  return {
    ...state,
    startStream,
    stopStream,
    reset,
  };
}
