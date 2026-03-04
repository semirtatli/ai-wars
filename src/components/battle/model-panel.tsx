'use client';

import { useEffect, useRef } from 'react';
import { Brain } from 'lucide-react';
import { getModelInfo, PROVIDERS } from '@/lib/ai/models';
import { MessageBubble } from './message-bubble';
import type { BattleMessage } from '@/types';
import { cn } from '@/lib/utils';

interface ModelPanelProps {
  modelId: string;
  messages: BattleMessage[];
  side: 'a' | 'b';
  isActive: boolean;
}

/**
 * Panel for one side of the debate.
 * Shows model info at top, scrollable message list below.
 * Active panel has a glow animation.
 */
export function ModelPanel({ modelId, messages, side, isActive }: ModelPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const model = getModelInfo(modelId);
  const provider = model ? PROVIDERS[model.provider] : null;

  // Auto-scroll to bottom on new messages or content updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-2xl border bg-zinc-900/50 transition-all',
        side === 'a' ? 'border-blue-500/30' : 'border-red-500/30',
        isActive && (side === 'a' ? 'panel-glow-blue' : 'panel-glow-red'),
      )}
    >
      {/* Model header */}
      <div
        className={cn(
          'flex items-center gap-3 border-b px-4 py-3',
          side === 'a' ? 'border-blue-500/20' : 'border-red-500/20',
        )}
      >
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            side === 'a' ? 'bg-blue-500/20' : 'bg-red-500/20',
          )}
        >
          <Brain className={cn('h-4 w-4', side === 'a' ? 'text-blue-400' : 'text-red-400')} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{model?.name ?? modelId}</p>
          <p className="text-xs text-zinc-500">{provider?.name ?? 'Unknown'}</p>
        </div>
        {isActive && (
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                'h-2 w-2 animate-pulse rounded-full',
                side === 'a' ? 'bg-blue-400' : 'bg-red-400',
              )}
            />
            <span className="text-xs text-zinc-400">Speaking</span>
          </div>
        )}
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && !isActive && (
          <div className="flex h-full items-center justify-center text-sm text-zinc-600">
            Waiting for debate to start...
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            content={message.content}
            isStreaming={message.isStreaming}
            side={side}
            turn={message.turn}
          />
        ))}
      </div>
    </div>
  );
}
