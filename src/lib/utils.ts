import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes with conflict resolution.
 * Combines clsx (conditional classes) with tailwind-merge (dedup).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Generates a unique ID for messages and other entities.
 * Uses crypto.randomUUID when available, falls back to timestamp + random.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Extracts key arguments from a response text.
 * Used for anti-repetition: previous arguments are included in the system prompt
 * to encourage models to bring new perspectives each turn.
 *
 * Simple heuristic: extracts sentences that contain strong claim indicators.
 */
export function extractArguments(text: string, maxArguments = 3): string[] {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 200);

  // Prioritize sentences with argument indicators
  const indicators = [
    'because',
    'therefore',
    'however',
    'importantly',
    'crucially',
    'key point',
    'argument',
    'evidence',
    'proves',
    'shows that',
    'demonstrates',
    'çünkü',
    'dolayısıyla',
    'ancak',
    'önemli',
    'kanıt',
    'gösteriyor',
  ];

  const scored = sentences.map((sentence) => {
    const score = indicators.reduce(
      (acc, indicator) => acc + (sentence.toLowerCase().includes(indicator) ? 1 : 0),
      0,
    );
    return { sentence, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxArguments)
    .map((s) => s.sentence);
}

/**
 * Truncates text to a maximum length, adding ellipsis if needed.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
