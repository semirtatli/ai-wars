'use client';

import { useState } from 'react';
import { Shuffle, MessageSquare } from 'lucide-react';
import { EXAMPLE_TOPICS } from '@/lib/ai/models';
import { cn } from '@/lib/utils';

interface TopicInputProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Topic input with example topic suggestions.
 * Includes a "Random Topic" button for quick starts.
 */
export function TopicInput({ value, onChange }: TopicInputProps) {
  const [showExamples, setShowExamples] = useState(false);

  const pickRandom = () => {
    const random = EXAMPLE_TOPICS[Math.floor(Math.random() * EXAMPLE_TOPICS.length)];
    if (random) onChange(random);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <MessageSquare className="h-4 w-4" />
          Debate Topic
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
          >
            {showExamples ? 'Hide examples' : 'Show examples'}
          </button>
          <button
            type="button"
            onClick={pickRandom}
            className="flex items-center gap-1 rounded-md bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
          >
            <Shuffle className="h-3 w-3" />
            Random
          </button>
        </div>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter a debate topic... (e.g., 'Is AI a threat to humanity?')"
        rows={3}
        maxLength={500}
        className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-900/50 p-4 text-white placeholder-zinc-500 transition-colors focus:border-zinc-500 focus:outline-none"
      />
      <p className="text-right text-xs text-zinc-600">{value.length}/500</p>

      {showExamples && (
        <div className="grid gap-2 sm:grid-cols-2">
          {EXAMPLE_TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => {
                onChange(topic);
                setShowExamples(false);
              }}
              className={cn(
                'rounded-lg border border-zinc-800 p-3 text-left text-sm text-zinc-400',
                'transition-colors hover:border-zinc-600 hover:text-zinc-200',
                value === topic && 'border-zinc-500 text-white',
              )}
            >
              {topic}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
