'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Swords, Sparkles, LogIn } from 'lucide-react';
import Link from 'next/link';

import { ModelSelector } from './model-selector';
import { TopicInput } from './topic-input';
import { RoundConfig } from './round-config';
import type { ResponseLength } from '@/types';
import { cn } from '@/lib/utils';

/**
 * Main setup form that combines all configuration components.
 * Requires authentication. Validates all fields and navigates to battle page.
 */
export function SetupForm() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [modelA, setModelA] = useState<string | null>(null);
  const [modelB, setModelB] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [maxTurns, setMaxTurns] = useState(5);
  const [responseLength, setResponseLength] = useState<ResponseLength>('medium');

  const isValid = modelA && modelB && modelA !== modelB && topic.trim().length > 5;

  const handleStart = () => {
    if (!isValid) return;

    const params = new URLSearchParams({
      modelA: modelA,
      modelB: modelB,
      topic: topic.trim(),
      maxTurns: maxTurns.toString(),
      responseLength,
    });

    router.push(`/battle?${params.toString()}`);
  };

  // Show loading state while checking auth
  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!session?.user) {
    return (
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
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

        <div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
          <LogIn className="h-10 w-10 text-zinc-500" />
          <p className="text-lg font-medium text-zinc-300">Sign in to start battling</p>
          <p className="text-sm text-zinc-500">Use Google or GitHub to log in instantly</p>
          <Link
            href="/login"
            className="mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

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
          {topic.trim().length <= 5 && 'Enter a topic (at least 6 chars)'}
        </div>
      )}
    </div>
  );
}
