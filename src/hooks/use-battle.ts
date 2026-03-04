'use client';

/**
 * useBattle — Battle State Machine Hook
 *
 * Manages the entire debate flow between two AI models.
 *
 * State machine:
 * IDLE → STARTING → MODEL_A_STREAMING → MODEL_B_STREAMING → PAUSED → ... → FINISHED
 *
 * Each turn:
 * 1. Build system prompt with dynamic context (turn number, action, anti-repetition)
 * 2. Stream Model A's response
 * 3. Stream Model B's response (with Model A's response as context)
 * 4. Pause — show action panel for user decision
 * 5. User selects action → next turn begins
 *
 * The hook also manages:
 * - Argument extraction for anti-repetition
 * - Sliding context window (last 2 turns full, older turns summarized)
 * - Error recovery
 */

import { useState, useCallback, useRef } from 'react';
import type {
  BattleConfig,
  BattleMessage,
  BattleState,
  BattleAction,
  ActionType,
} from '@/types';
import { buildSystemPrompt, MAX_TOKENS_MAP } from '@/lib/ai/prompts';
import { generateId, extractArguments } from '@/lib/utils';
import { MODELS } from '@/lib/ai/models';

const INITIAL_STATE: BattleState = {
  status: 'idle',
  config: null,
  messages: [],
  currentTurn: 0,
  modelAArguments: [],
  modelBArguments: [],
};

export function useBattle() {
  const [state, setState] = useState<BattleState>(INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);

  /**
   * Builds the message array for an AI API call.
   * Implements sliding context window:
   * - System prompt (dynamic, turn-aware)
   * - Last 2 turns' full messages
   * - Older turns' summaries (if any)
   */
  const buildMessagesForModel = useCallback(
    (
      side: 'a' | 'b',
      turnNumber: number,
      action: ActionType,
      currentMessages: BattleMessage[],
      config: BattleConfig,
      previousArgs: string[],
      customPrompt?: string,
    ) => {
      const systemPrompt = buildSystemPrompt({
        topic: config.topic,
        side,
        turnNumber,
        maxTurns: config.maxTurns,
        action,
        previousArguments: previousArgs,
        responseLength: config.responseLength,
        customPrompt,
      });

      // Build conversation history (sliding window: last 4 messages full, older summarized)
      const conversationMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        { role: 'system', content: systemPrompt },
      ];

      // Include relevant previous messages as conversation context
      const relevantMessages = currentMessages.filter((m) => m.role !== 'system');
      const recentMessages = relevantMessages.slice(-4); // Last 4 messages (2 turns)

      for (const msg of recentMessages) {
        // From this model's perspective: its own messages are 'assistant', opponent's are 'user'
        const isOwnMessage =
          (side === 'a' && msg.role === 'model_a') || (side === 'b' && msg.role === 'model_b');

        conversationMessages.push({
          role: isOwnMessage ? 'assistant' : 'user',
          content: msg.content,
        });
      }

      // If this is the first turn or no recent messages, add the topic as the user message
      if (recentMessages.length === 0) {
        conversationMessages.push({
          role: 'user',
          content: `The debate topic is: "${config.topic}". Please present your opening argument.`,
        });
      }

      // Safety: ensure the last message is always a 'user' message with non-empty content
      const lastMsg = conversationMessages[conversationMessages.length - 1];
      if (lastMsg && lastMsg.role !== 'user') {
        conversationMessages.push({
          role: 'user',
          content: `Continue the debate on: "${config.topic}". Respond to the arguments above.`,
        });
      }

      return conversationMessages;
    },
    [],
  );

  /**
   * Streams a response from one model and adds it to the message list.
   */
  const streamModelResponse = useCallback(
    async (
      side: 'a' | 'b',
      turnNumber: number,
      action: ActionType,
      currentMessages: BattleMessage[],
      config: BattleConfig,
      previousArgs: string[],
      customPrompt?: string,
    ): Promise<BattleMessage | null> => {
      const modelId = side === 'a' ? config.modelA : config.modelB;
      const messages = buildMessagesForModel(
        side,
        turnNumber,
        action,
        currentMessages,
        config,
        previousArgs,
        customPrompt,
      );

      const maxTokens = MAX_TOKENS_MAP[config.responseLength];

      // Create a placeholder message for streaming
      const messageId = generateId();
      const placeholderMessage: BattleMessage = {
        id: messageId,
        role: side === 'a' ? 'model_a' : 'model_b',
        content: '',
        turn: turnNumber,
        timestamp: Date.now(),
        isStreaming: true,
      };

      // Add placeholder to state
      setState((s) => ({
        ...s,
        messages: [...s.messages, placeholderMessage],
      }));

      // Abort any existing stream
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        // Determine which provider this model uses to get the right API key
        const modelInfo = MODELS.find((m) => m.id === modelId);
        const apiKey = modelInfo ? (config.apiKeys[modelInfo.provider] ?? '') : '';

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modelId,
            messages,
            apiKey,
            maxTokens,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error((errorData as { error?: string }).error ?? `HTTP ${response.status}`);
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;

          // Update the streaming message in state
          setState((s) => ({
            ...s,
            messages: s.messages.map((m) =>
              m.id === messageId ? { ...m, content: fullText } : m,
            ),
          }));
        }

        // Mark message as complete
        const completedMessage: BattleMessage = {
          ...placeholderMessage,
          content: fullText,
          isStreaming: false,
        };

        setState((s) => ({
          ...s,
          messages: s.messages.map((m) => (m.id === messageId ? completedMessage : m)),
        }));

        return completedMessage;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return null;
        }

        const errorMsg = error instanceof Error ? error.message : 'Stream failed';

        // Update placeholder with error
        setState((s) => ({
          ...s,
          messages: s.messages.map((m) =>
            m.id === messageId
              ? { ...m, content: `⚠️ Error: ${errorMsg}`, isStreaming: false }
              : m,
          ),
        }));

        throw error;
      }
    },
    [buildMessagesForModel],
  );

  /**
   * Starts a new battle with the given configuration.
   */
  const startBattle = useCallback(
    async (config: BattleConfig) => {
      setState({
        status: 'starting',
        config,
        messages: [],
        currentTurn: 1,
        modelAArguments: [],
        modelBArguments: [],
      });

      try {
        // ── Model A's opening ────────────────────────────────
        setState((s) => ({ ...s, status: 'model_a_streaming' }));

        const messageA = await streamModelResponse(
          'a',
          1,
          'continue',
          [],
          config,
          [],
        );

        if (!messageA) return; // Aborted

        // Guard: If Model A returned empty content, treat as error
        if (!messageA.content.trim()) {
          throw new Error('Model A returned an empty response. The AI provider may be temporarily unavailable.');
        }

        const argsA = extractArguments(messageA.content);
        setState((s) => ({
          ...s,
          modelAArguments: argsA,
        }));

        // ── Model B's opening ────────────────────────────────
        setState((s) => ({ ...s, status: 'model_b_streaming' }));

        const messagesAfterA: BattleMessage[] = [messageA];
        const messageB = await streamModelResponse(
          'b',
          1,
          'continue',
          messagesAfterA,
          config,
          [],
        );

        if (!messageB) return; // Aborted

        const argsB = extractArguments(messageB.content);
        setState((s) => ({
          ...s,
          modelBArguments: argsB,
          status: 'paused',
        }));
      } catch (error) {
        setState((s) => ({
          ...s,
          status: 'error',
          error: error instanceof Error ? error.message : 'Battle failed',
        }));
      }
    },
    [streamModelResponse],
  );

  /**
   * Continues the battle with a user-selected action.
   * Called when user picks from the action panel.
   */
  const applyAction = useCallback(
    async (action: BattleAction) => {
      const { config, messages, currentTurn, modelAArguments, modelBArguments } = state;
      if (!config || state.status !== 'paused') return;

      const nextTurn = currentTurn + 1;
      const effectiveAction: ActionType =
        action.type === 'closing' || nextTurn > config.maxTurns ? 'closing' : action.type;

      setState((s) => ({ ...s, currentTurn: nextTurn, status: 'model_a_streaming' }));

      try {
        // ── Model A's response ───────────────────────────────
        const messageA = await streamModelResponse(
          'a',
          nextTurn,
          effectiveAction,
          messages,
          config,
          modelAArguments,
          action.customPrompt,
        );

        if (!messageA) return;

        const newArgsA = extractArguments(messageA.content);
        const updatedArgsA = [...modelAArguments, ...newArgsA].slice(-6);

        setState((s) => ({
          ...s,
          modelAArguments: updatedArgsA,
          status: 'model_b_streaming',
        }));

        // ── Model B's response ───────────────────────────────
        // Get latest messages including A's new response
        const currentMessages = [...messages, messageA];
        const messageB = await streamModelResponse(
          'b',
          nextTurn,
          effectiveAction,
          currentMessages,
          config,
          modelBArguments,
          action.customPrompt,
        );

        if (!messageB) return;

        const newArgsB = extractArguments(messageB.content);
        const updatedArgsB = [...modelBArguments, ...newArgsB].slice(-6);

        // Determine if battle should finish
        const isLastTurn = nextTurn >= config.maxTurns || effectiveAction === 'closing';

        setState((s) => ({
          ...s,
          modelBArguments: updatedArgsB,
          status: isLastTurn ? 'finished' : 'paused',
        }));
      } catch (error) {
        setState((s) => ({
          ...s,
          status: 'error',
          error: error instanceof Error ? error.message : 'Battle failed',
        }));
      }
    },
    [state, streamModelResponse],
  );

  /**
   * Stops the current battle.
   */
  const stopBattle = useCallback(() => {
    abortRef.current?.abort();
    setState((s) => ({ ...s, status: 'finished' }));
  }, []);

  /**
   * Resets the battle to initial state.
   */
  const resetBattle = useCallback(() => {
    abortRef.current?.abort();
    setState(INITIAL_STATE);
  }, []);

  return {
    state,
    startBattle,
    applyAction,
    stopBattle,
    resetBattle,
  };
}
