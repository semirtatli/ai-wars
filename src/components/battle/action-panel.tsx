'use client';

import { useState } from 'react';
import {
  ArrowRight,
  Lightbulb,
  Search,
  Flame,
  PenLine,
  Flag,
} from 'lucide-react';
import type { BattleAction, ActionType } from '@/types';
import { cn } from '@/lib/utils';

interface ActionPanelProps {
  onAction: (action: BattleAction) => void;
  currentTurn: number;
  maxTurns: number;
}

const ACTIONS: {
  type: ActionType;
  label: string;
  description: string;
  icon: typeof ArrowRight;
  color: string;
}[] = [
  {
    type: 'continue',
    label: 'Continue',
    description: 'Natural flow',
    icon: ArrowRight,
    color: 'text-green-400 bg-green-500/10 border-green-500/30 hover:border-green-500/60',
  },
  {
    type: 'new_angle',
    label: 'New Angle',
    description: 'Fresh perspective',
    icon: Lightbulb,
    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/60',
  },
  {
    type: 'deepen',
    label: 'Deepen',
    description: 'More detail',
    icon: Search,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30 hover:border-blue-500/60',
  },
  {
    type: 'intensify',
    label: 'Intensify',
    description: 'Sharper debate',
    icon: Flame,
    color: 'text-orange-400 bg-orange-500/10 border-orange-500/30 hover:border-orange-500/60',
  },
  {
    type: 'custom',
    label: 'Custom',
    description: 'Your instruction',
    icon: PenLine,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30 hover:border-purple-500/60',
  },
  {
    type: 'closing',
    label: 'Closing',
    description: 'Final round',
    icon: Flag,
    color: 'text-red-400 bg-red-500/10 border-red-500/30 hover:border-red-500/60',
  },
];

/**
 * Action panel shown between turns.
 * User selects how the debate should continue.
 */
export function ActionPanel({ onAction, currentTurn, maxTurns }: ActionPanelProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleAction = (type: ActionType) => {
    if (type === 'custom') {
      setShowCustomInput(true);
      return;
    }
    onAction({ type });
  };

  const handleCustomSubmit = () => {
    if (customPrompt.trim()) {
      onAction({ type: 'custom', customPrompt: customPrompt.trim() });
      setCustomPrompt('');
      setShowCustomInput(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-900/80 p-4 backdrop-blur-sm">
      {/* Turn info */}
      <div className="mb-3 text-center">
        <p className="text-xs font-medium text-zinc-400">
          Turn {currentTurn} of {maxTurns} completed
        </p>
        <p className="mt-1 text-sm text-zinc-300">How should the debate continue?</p>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.type}
              onClick={() => handleAction(action.type)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border p-3 transition-all active:scale-95',
                action.color,
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs font-semibold">{action.label}</span>
              <span className="text-[10px] text-zinc-500">{action.description}</span>
            </button>
          );
        })}
      </div>

      {/* Custom prompt input */}
      {showCustomInput && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
            placeholder="Direct the debate... (e.g., 'Discuss the economic impact')"
            className="flex-1 rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={handleCustomSubmit}
            disabled={!customPrompt.trim()}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
