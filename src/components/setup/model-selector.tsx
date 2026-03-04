'use client';

import { useState } from 'react';
import { Zap, Brain, ChevronDown } from 'lucide-react';
import type { ModelInfo, ProviderInfo } from '@/types';
import { cn } from '@/lib/utils';

interface ModelSelectorProps {
  /** Label for this side (e.g., "Model A", "Model B") */
  label: string;
  /** Currently selected model ID */
  selectedModelId: string | null;
  /** Callback when a model is selected */
  onSelect: (modelId: string) => void;
  /** Model ID to exclude (the other side's selection) */
  excludeModelId?: string | null;
  /** Side color theme */
  side: 'a' | 'b';
  /** Available models (only those with configured provider keys) */
  models: ModelInfo[];
  /** Available providers */
  providers: Record<string, ProviderInfo>;
}

/** Star rating display */
function CapabilityStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            i < rating ? 'bg-yellow-400' : 'bg-zinc-700',
          )}
        />
      ))}
    </div>
  );
}

/** Speed badge */
function SpeedBadge({ speed }: { speed: ModelInfo['speed'] }) {
  const config = {
    fast: { label: 'Fast', color: 'text-green-400' },
    medium: { label: 'Medium', color: 'text-yellow-400' },
    slow: { label: 'Slow', color: 'text-orange-400' },
  };
  const { label, color } = config[speed];

  return (
    <span className={cn('flex items-center gap-1 text-xs', color)}>
      <Zap className="h-3 w-3" />
      {label}
    </span>
  );
}

/**
 * Model selector card for one side of the debate.
 * Shows a dropdown with all available models grouped by provider.
 */
export function ModelSelector({
  label,
  selectedModelId,
  onSelect,
  excludeModelId,
  side,
  models,
  providers,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedModel = models.find((m) => m.id === selectedModelId);

  const sideStyles = {
    a: {
      border: 'border-blue-500/30 hover:border-blue-500/60',
      activeBorder: 'border-blue-500',
      glow: 'shadow-blue-500/10',
      badge: 'bg-blue-500/20 text-blue-400',
    },
    b: {
      border: 'border-red-500/30 hover:border-red-500/60',
      activeBorder: 'border-red-500',
      glow: 'shadow-red-500/10',
      badge: 'bg-red-500/20 text-red-400',
    },
  };

  const styles = sideStyles[side];

  return (
    <div className="relative w-full">
      <div className="mb-2 flex items-center gap-2">
        <span className={cn('rounded-md px-2 py-0.5 text-xs font-semibold', styles.badge)}>
          {label}
        </span>
      </div>

      {/* Dropdown trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between rounded-xl border bg-zinc-900/50 p-4 transition-all',
          isOpen ? styles.activeBorder : styles.border,
          isOpen && `shadow-lg ${styles.glow}`,
        )}
      >
        {selectedModel ? (
          <div className="flex items-center gap-3 text-left">
            <Brain className="h-5 w-5 text-zinc-400" />
            <div>
              <p className="font-medium text-white">{selectedModel.name}</p>
              <p className="text-xs text-zinc-500">
                {providers[selectedModel.provider]?.name ?? selectedModel.provider}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-zinc-500">Select a model...</span>
        )}
        <ChevronDown
          className={cn('h-4 w-4 text-zinc-500 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2 shadow-2xl">
          {Object.entries(providers).map(([providerId, provider]) => {
            const providerModels = models.filter(
              (m) => m.provider === providerId && m.id !== excludeModelId,
            );
            if (providerModels.length === 0) return null;

            return (
              <div key={providerId} className="mb-2 last:mb-0">
                <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {provider.name}
                </p>
                {providerModels.map((model: ModelInfo) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      onSelect(model.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors',
                      selectedModelId === model.id
                        ? 'bg-zinc-700/50 text-white'
                        : 'text-zinc-300 hover:bg-zinc-800',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{model.name}</p>
                      <p className="truncate text-xs text-zinc-500">{model.description}</p>
                    </div>
                    <div className="ml-3 flex flex-col items-end gap-1">
                      <CapabilityStars rating={model.capability} />
                      <SpeedBadge speed={model.speed} />
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
