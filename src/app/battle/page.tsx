import { Suspense } from 'react';
import { BattleArena } from '@/components/battle/battle-arena';

/**
 * Battle page — renders the debate arena.
 * Wrapped in Suspense because BattleArena uses useSearchParams().
 */
export default function BattlePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-red-500" />
            <p className="text-sm text-zinc-500">Preparing battle arena...</p>
          </div>
        </div>
      }
    >
      <BattleArena />
    </Suspense>
  );
}
