'use client';

import { useState, useEffect, useCallback } from 'react';
import { Key, Eye, EyeOff, ExternalLink, Check, X, Trash2 } from 'lucide-react';
import { PROVIDERS } from '@/lib/ai/models';
import type { ProviderId } from '@/types';
import { cn } from '@/lib/utils';

/** localStorage key prefix for API keys */
const STORAGE_PREFIX = 'ai-wars-key-';

/** Provider-specific instructions for getting API keys */
const KEY_INSTRUCTIONS: Record<ProviderId, { label: string; url: string; placeholder: string }> = {
  google: {
    label: 'Google AI API Key',
    url: 'https://aistudio.google.com/apikey',
    placeholder: 'AIza...',
  },
  groq: {
    label: 'Groq API Key',
    url: 'https://console.groq.com/keys',
    placeholder: 'gsk_...',
  },
  openai: {
    label: 'OpenAI API Key',
    url: 'https://platform.openai.com/api-keys',
    placeholder: 'sk-...',
  },
  openrouter: {
    label: 'OpenRouter API Key',
    url: 'https://openrouter.ai/keys',
    placeholder: 'sk-or-...',
  },
};

interface ApiKeyInputProps {
  /** Which provider keys are needed (based on selected models) */
  requiredProviders: ProviderId[];
  /** Callback with the current keys map */
  onKeysChange: (keys: Record<string, string>) => void;
}

/**
 * API Key Input Component
 *
 * Renders input fields for each required provider's API key.
 * Keys are stored in localStorage (same-origin only) and sent per-request over HTTPS.
 * Keys are NEVER stored server-side.
 */
export function ApiKeyInput({ requiredProviders, onKeysChange }: ApiKeyInputProps) {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  // Load saved keys from localStorage on mount
  useEffect(() => {
    const loaded: Record<string, string> = {};
    for (const providerId of ['google', 'groq', 'openai', 'openrouter'] as ProviderId[]) {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}${providerId}`);
      if (saved) {
        loaded[providerId] = saved;
      }
    }
    setKeys(loaded);
    onKeysChange(loaded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateKey = useCallback(
    (providerId: string, value: string) => {
      const newKeys = { ...keys, [providerId]: value };
      setKeys(newKeys);

      // Save to localStorage
      if (value) {
        localStorage.setItem(`${STORAGE_PREFIX}${providerId}`, value);
      } else {
        localStorage.removeItem(`${STORAGE_PREFIX}${providerId}`);
      }

      onKeysChange(newKeys);
    },
    [keys, onKeysChange],
  );

  const clearKey = useCallback(
    (providerId: string) => {
      const newKeys = { ...keys };
      delete newKeys[providerId];
      setKeys(newKeys);
      localStorage.removeItem(`${STORAGE_PREFIX}${providerId}`);
      onKeysChange(newKeys);
    },
    [keys, onKeysChange],
  );

  const toggleShow = useCallback((providerId: string) => {
    setShowKeys((prev) => ({ ...prev, [providerId]: !prev[providerId] }));
  }, []);

  // Deduplicate required providers
  const uniqueProviders = [...new Set(requiredProviders)];

  if (uniqueProviders.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center text-sm text-zinc-500">
        Select models above to see which API keys you need.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Key className="h-4 w-4" />
        <span className="font-medium">API Keys</span>
        <span className="text-xs text-zinc-600">
          — stored in your browser only, sent securely via HTTPS
        </span>
      </div>

      {uniqueProviders.map((providerId) => {
        const provider = PROVIDERS[providerId];
        const instructions = KEY_INSTRUCTIONS[providerId];
        const hasKey = Boolean(keys[providerId]?.trim());

        if (!provider || !instructions) return null;

        return (
          <div
            key={providerId}
            className={cn(
              'rounded-xl border bg-zinc-900/50 p-3 transition-colors',
              hasKey ? 'border-green-500/30' : 'border-zinc-700',
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: provider.color }}
                />
                <span className="text-sm font-medium text-zinc-300">
                  {instructions.label}
                </span>
                {hasKey ? (
                  <Check className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <X className="h-3.5 w-3.5 text-red-400" />
                )}
              </div>
              <a
                href={instructions.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-blue-400"
              >
                Get key
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKeys[providerId] ? 'text' : 'password'}
                  value={keys[providerId] ?? ''}
                  onChange={(e) => updateKey(providerId, e.target.value)}
                  placeholder={instructions.placeholder}
                  className={cn(
                    'w-full rounded-lg border bg-zinc-950 px-3 py-2 pr-10 text-sm text-white',
                    'placeholder:text-zinc-600 focus:outline-none focus:ring-1',
                    hasKey
                      ? 'border-green-500/30 focus:ring-green-500/50'
                      : 'border-zinc-700 focus:ring-blue-500/50',
                  )}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={() => toggleShow(providerId)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  title={showKeys[providerId] ? 'Hide key' : 'Show key'}
                >
                  {showKeys[providerId] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {hasKey && (
                <button
                  type="button"
                  onClick={() => clearKey(providerId)}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 text-zinc-500 transition-colors hover:border-red-500/50 hover:text-red-400"
                  title="Clear key"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}

      <p className="text-center text-xs text-zinc-600">
        Your keys are stored locally in your browser and sent directly to AI providers over HTTPS.
        <br />
        They are never stored or logged on our servers.
      </p>
    </div>
  );
}
