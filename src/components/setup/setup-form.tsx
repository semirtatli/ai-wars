'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Swords, Sparkles } from 'lucide-react';

import { ModelSelector } from './model-selector';
import { TopicInput } from './topic-input';
import { RoundConfig } from './round-config';
import { TurnstileWidget } from '@/components/turnstile';
import type { ResponseLength } from '@/types';
import { cn } from '@/lib/utils';

/**
 * Main setup form that combines all configuration components.
 * Validates all fields and navigates to the battle page with config as URL params.
 */
export function SetupForm() {
  const router = useRouter();

  const [modelA, setModelA] = useState<string | null>(null);
  const [modelB, setModelB] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [maxTurns, setMaxTurns] = useState(5);
  const [responseLength, setResponseLength] = useState<ResponseLength>('medium');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const isValid = modelA && modelB && modelA !== modelB && topic.trim().length > 5 && turnstileToken;

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleStart = () => {
    if (!isValid) return;

    // Encode battle config as URL search params
    const params = new URLSearchParams({
      modelA: modelA,
      modelB: modelB,
      topic: topic.trim(),
      maxTurns: maxTurns.toString(),
      responseLength,
      turnstileToken: turnstileToken,
    });

    router.push(`/battle?${params.toString()}`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      {/* Hero section */}
      <div className="text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          <span className="text-blue-400">AI</span> vs{' '}
          <span className="text-red-400">AI</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-zinc-400">
          Pick two AI models, give them a topic, and watch them debate.
          You control the flow — continue, redirect, or intensify the argument.
        </p>
      </div>

      {/* Model selection — VS layout */}
      <div className="grid gap-4 sm:grid-cols-[1fr,auto,1fr] sm:items-start">
        <ModelSelector
          label="Model A"
          selectedModelId={modelA}
          onSelect={setModelA}
          excludeModelId={modelB}
          side="a"
        />

        <div className="hidden items-center justify-center pt-10 sm:flex">
          <span className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm font-bold text-zinc-400">
            VS
          </span>
        </div>

        <div className="flex justify-center sm:hidden">
          <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-400">
            VS
          </span>
        </div>

        <ModelSelector
          label="Model B"
          selectedModelId={modelB}
          onSelect={setModelB}
          excludeModelId={modelA}
          side="b"
        />
      </div>

      {/* Topic input */}
      <TopicInput value={topic} onChange={setTopic} />

      {/* Battle settings */}
      <RoundConfig
        maxTurns={maxTurns}
        onMaxTurnsChange={setMaxTurns}
        responseLength={responseLength}
        onResponseLengthChange={setResponseLength}
      />

      {/* Turnstile verification */}
      <div className="flex justify-center">
        <TurnstileWidget
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? 'test'}
          onVerify={handleTurnstileVerify}
        />
      </div>

      {/* Start button */}
      <div className="flex justify-center">
        <button
          onClick={handleStart}
          disabled={!isValid}
          className={cn(
            'group flex items-center gap-3 rounded-xl px-8 py-4 text-lg font-bold transition-all',
            isValid
              ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 active:scale-[0.98]'
              : 'cursor-not-allowed bg-zinc-800 text-zinc-500',
          )}
        >
          <Swords className={cn('h-5 w-5', isValid && 'transition-transform group-hover:rotate-12')} />
          Start Battle
          <Sparkles className={cn('h-4 w-4', isValid ? 'text-yellow-300' : 'text-zinc-600')} />
        </button>
      </div>

      {/* Validation hints */}
      {!isValid && (
        <div className="text-center text-sm text-zinc-500">
          {!modelA && 'Select Model A · '}
          {!modelB && 'Select Model B · '}
          {modelA && modelB && modelA === modelB && 'Models must be different · '}
          {topic.trim().length <= 5 && 'Enter a topic (at least 6 chars) · '}
          {!turnstileToken && 'Complete verification'}
        </div>
      )}
    </div>
  );
}
