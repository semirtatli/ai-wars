'use client';

import { Settings2 } from 'lucide-react';
import type { ResponseLength } from '@/types';
import { cn } from '@/lib/utils';

interface RoundConfigProps {
  maxTurns: number;
  onMaxTurnsChange: (value: number) => void;
  responseLength: ResponseLength;
  onResponseLengthChange: (value: ResponseLength) => void;
}

const lengthOptions: { value: ResponseLength; label: string; description: string }[] = [
  { value: 'short', label: 'Short', description: '~100 words' },
  { value: 'medium', label: 'Medium', description: '~200 words' },
  { value: 'long', label: 'Long', description: '~400 words' },
];

/**
 * Configuration controls for turn count and response length.
 */
export function RoundConfig({
  maxTurns,
  onMaxTurnsChange,
  responseLength,
  onResponseLengthChange,
}: RoundConfigProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
        <Settings2 className="h-4 w-4" />
        Battle Settings
      </div>

      {/* Turn count slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-zinc-400">Max Turns</label>
          <span className="rounded-md bg-zinc-800 px-2.5 py-0.5 text-sm font-mono font-semibold text-white">
            {maxTurns}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={maxTurns}
          onChange={(e) => onMaxTurnsChange(Number(e.target.value))}
          className="w-full accent-red-500"
        />
        <div className="flex justify-between text-xs text-zinc-600">
          <span>1 (Quick)</span>
          <span>10 (Deep)</span>
        </div>
      </div>

      {/* Response length */}
      <div className="space-y-2">
        <label className="text-sm text-zinc-400">Response Length</label>
        <div className="grid grid-cols-3 gap-2">
          {lengthOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onResponseLengthChange(option.value)}
              className={cn(
                'rounded-lg border p-3 text-center transition-all',
                responseLength === option.value
                  ? 'border-red-500/50 bg-red-500/10 text-white'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200',
              )}
            >
              <p className="text-sm font-medium">{option.label}</p>
              <p className="text-xs text-zinc-500">{option.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
