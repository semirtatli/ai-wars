import { describe, it, expect } from 'vitest';
import { cn, generateId, extractArguments, truncate } from '@/lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('resolves tailwind conflicts (last wins)', () => {
    const result = cn('p-4', 'p-2');
    expect(result).toBe('p-2');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'end')).toBe('base end');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });
});

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
  });

  it('returns unique IDs', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateId()));
    expect(ids.size).toBe(50);
  });
});

describe('extractArguments', () => {
  it('extracts sentences with argument indicators', () => {
    const text =
      'Climate change is a serious threat because global temperatures are rising. ' +
      'The sun is bright. ' +
      'This demonstrates that we need immediate action on emissions.';

    const args = extractArguments(text, 2);
    expect(args.length).toBeLessThanOrEqual(2);
    // Should prioritize sentences with "because" and "demonstrates"
    expect(args.some((a) => a.includes('because') || a.includes('demonstrates'))).toBe(true);
  });

  it('filters out very short sentences', () => {
    const text = 'Yes. No. OK. This is a much longer sentence because it makes a real point.';
    const args = extractArguments(text, 3);
    // Short sentences ("Yes", "No", "OK") should be filtered (< 20 chars)
    args.forEach((arg) => {
      expect(arg.length).toBeGreaterThanOrEqual(20);
    });
  });

  it('returns empty array for empty text', () => {
    expect(extractArguments('')).toEqual([]);
  });

  it('respects maxArguments limit', () => {
    const text =
      'First because of this. Second therefore we see. Third however there is. Fourth importantly we note. Fifth crucially the data.';
    const args = extractArguments(text, 2);
    expect(args.length).toBeLessThanOrEqual(2);
  });
});

describe('truncate', () => {
  it('returns text unchanged if within limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates and adds ellipsis', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
  });

  it('handles exact length', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });
});
