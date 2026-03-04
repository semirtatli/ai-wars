'use client';

import { cn } from '@/lib/utils';
import { getModelInfo } from '@/lib/ai/models';
import type { BattleStatus } from '@/types';

interface BattleHeaderProps {
  modelAId: string;
  modelBId: string;
  currentTurn: number;
  maxTurns: number;
  status: BattleStatus;
}

/**
 * Battle header showing model names, VS divider, and turn counter.
 */
export function BattleHeader({
  modelAId,
  modelBId,
  currentTurn,
  maxTurns,
  status,
}: BattleHeaderProps) {
  const modelA = getModelInfo(modelAId);
  const modelB = getModelInfo(modelBId);

  const statusLabels: Record<BattleStatus, string> = {
    idle: 'Ready',
    starting: 'Starting...',
    model_a_streaming: `${modelA?.name ?? 'Model A'} speaking...`,
    model_b_streaming: `${modelB?.name ?? 'Model B'} speaking...`,
    paused: 'Your turn — choose an action',
    finished: 'Battle complete!',
    error: 'Error occurred',
  };

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      {/* Model names with VS */}
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold text-blue-400">{modelA?.name ?? modelAId}</span>
        <span
          className={cn(
            'rounded-full bg-zinc-800 px-3 py-1 text-sm font-black',
            status === 'paused' || status === 'finished'
              ? 'text-yellow-400'
              : 'animate-pulse text-zinc-400',
          )}
        >
          VS
        </span>
        <span className="text-lg font-bold text-red-400">{modelB?.name ?? modelBId}</span>
      </div>

      {/* Status & turn counter */}
      <div className="flex items-center gap-3 text-sm">
        <span className="rounded-md bg-zinc-800 px-2.5 py-0.5 font-mono text-zinc-300">
          Turn {currentTurn}/{maxTurns}
        </span>
        <span className="text-zinc-500">{statusLabels[status]}</span>
      </div>
    </div>
  );
}
