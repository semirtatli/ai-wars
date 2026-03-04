'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RotateCcw, Copy, StopCircle, Trophy } from 'lucide-react';

import { useBattle } from '@/hooks/use-battle';
import { ModelPanel } from './model-panel';
import { ActionPanel } from './action-panel';
import { BattleHeader } from './battle-header';
import type { BattleConfig, BattleAction, ResponseLength } from '@/types';
import { cn } from '@/lib/utils';

/**
 * Main battle arena component.
 * Reads config from URL params, manages the debate flow via useBattle hook,
 * and renders the VS layout with two model panels and an action panel.
 */
export function BattleArena() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state, startBattle, applyAction, stopBattle, resetBattle } = useBattle();

  // Parse battle config from URL params
  const config: BattleConfig | null = useMemo(() => {
    const modelA = searchParams.get('modelA');
    const modelB = searchParams.get('modelB');
    const topic = searchParams.get('topic');
    const maxTurns = Number(searchParams.get('maxTurns')) || 5;
    const responseLength = (searchParams.get('responseLength') ?? 'medium') as ResponseLength;

    if (!modelA || !modelB || !topic) return null;

    return { modelA, modelB, topic, maxTurns, responseLength };
  }, [searchParams]);

  // Auto-start battle when config is available
  useEffect(() => {
    if (config && state.status === 'idle') {
      startBattle(config);
    }
  }, [config, state.status, startBattle]);

  const handleAction = useCallback(
    (action: BattleAction) => {
      applyAction(action);
    },
    [applyAction],
  );

  const handleNewBattle = useCallback(() => {
    resetBattle();
    router.push('/');
  }, [resetBattle, router]);

  const handleCopyTranscript = useCallback(() => {
    const transcript = state.messages
      .map((m) => {
        const speaker = m.role === 'model_a' ? 'Model A' : 'Model B';
        return `[${speaker} — Turn ${m.turn}]\n${m.content}\n`;
      })
      .join('\n---\n\n');

    navigator.clipboard.writeText(transcript);
  }, [state.messages]);

  // Filter messages by side
  const modelAMessages = state.messages.filter((m) => m.role === 'model_a');
  const modelBMessages = state.messages.filter((m) => m.role === 'model_b');

  // Redirect if no config
  if (!config) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg text-zinc-400">No battle configuration found.</p>
          <button
            onClick={() => router.push('/')}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700"
          >
            Go to Setup
          </button>
        </div>
      </div>
    );
  }

  const isStreamingA = state.status === 'model_a_streaming';
  const isStreamingB = state.status === 'model_b_streaming';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* Battle header */}
      <BattleHeader
        modelAId={config.modelA}
        modelBId={config.modelB}
        currentTurn={state.currentTurn}
        maxTurns={config.maxTurns}
        status={state.status}
      />

      {/* Topic display */}
      <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-center text-sm text-zinc-400">
        <span className="font-medium text-zinc-300">Topic:</span> {config.topic}
      </div>

      {/* VS Layout — Two panels side by side */}
      <div className="grid gap-4 md:grid-cols-2" style={{ minHeight: '50vh' }}>
        <ModelPanel
          modelId={config.modelA}
          messages={modelAMessages}
          side="a"
          isActive={isStreamingA}
        />
        <ModelPanel
          modelId={config.modelB}
          messages={modelBMessages}
          side="b"
          isActive={isStreamingB}
        />
      </div>

      {/* Action Panel — shown when paused */}
      {state.status === 'paused' && (
        <div className="mt-4">
          <ActionPanel
            onAction={handleAction}
            currentTurn={state.currentTurn}
            maxTurns={config.maxTurns}
          />
        </div>
      )}

      {/* Error state */}
      {state.status === 'error' && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-center">
          <p className="text-sm text-red-400">{state.error}</p>
          <button
            onClick={handleNewBattle}
            className="mt-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700"
          >
            Start Over
          </button>
        </div>
      )}

      {/* Finished state */}
      {state.status === 'finished' && (
        <div className="mt-4 rounded-2xl border border-yellow-500/30 bg-yellow-950/10 p-6 text-center">
          <Trophy className="mx-auto mb-3 h-8 w-8 text-yellow-400" />
          <h3 className="mb-1 text-lg font-bold text-white">Battle Complete!</h3>
          <p className="mb-4 text-sm text-zinc-400">
            {state.currentTurn} turns of debate between{' '}
            <span className="text-blue-400">{config.modelA}</span> and{' '}
            <span className="text-red-400">{config.modelB}</span>
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleNewBattle}
              className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700"
            >
              <RotateCcw className="h-4 w-4" />
              New Battle
            </button>
            <button
              onClick={handleCopyTranscript}
              className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700"
            >
              <Copy className="h-4 w-4" />
              Copy Transcript
            </button>
          </div>
        </div>
      )}

      {/* Stop button — visible during streaming */}
      {(isStreamingA || isStreamingB || state.status === 'starting') && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={stopBattle}
            className={cn(
              'flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300',
              'transition-colors hover:border-red-500/50 hover:text-red-400',
            )}
          >
            <StopCircle className="h-4 w-4" />
            Stop Battle
          </button>
        </div>
      )}
    </div>
  );
}
