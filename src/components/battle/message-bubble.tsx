'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  content: string;
  isStreaming?: boolean;
  side: 'a' | 'b';
  turn: number;
}

/**
 * Single message bubble with sanitized markdown rendering.
 * Uses react-markdown + rehype-sanitize for XSS protection.
 */
export function MessageBubble({ content, isStreaming, side, turn }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        side === 'a'
          ? 'border-blue-500/20 bg-blue-950/20'
          : 'border-red-500/20 bg-red-950/20',
      )}
    >
      {/* Turn badge */}
      <div className="mb-2 flex items-center gap-2">
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-semibold',
            side === 'a' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400',
          )}
        >
          Turn {turn}
        </span>
        {isStreaming && (
          <span className="text-[10px] text-zinc-500">streaming...</span>
        )}
      </div>

      {/* Markdown content — XSS safe via rehype-sanitize */}
      <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-p:my-1 prose-li:my-0 prose-headings:my-2">
        {content ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
            {content}
          </ReactMarkdown>
        ) : isStreaming ? (
          <TypingIndicator />
        ) : null}
      </div>

      {/* Streaming cursor */}
      {isStreaming && content && (
        <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-zinc-400" />
      )}
    </div>
  );
}

/** Three-dot typing animation */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-2">
      <div className="typing-dot h-2 w-2 rounded-full bg-zinc-500" />
      <div className="typing-dot h-2 w-2 rounded-full bg-zinc-500" />
      <div className="typing-dot h-2 w-2 rounded-full bg-zinc-500" />
    </div>
  );
}
