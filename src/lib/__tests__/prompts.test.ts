import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, MAX_TOKENS_MAP } from '@/lib/ai/prompts';

describe('MAX_TOKENS_MAP', () => {
  it('has correct values for all response lengths', () => {
    expect(MAX_TOKENS_MAP.short).toBe(200);
    expect(MAX_TOKENS_MAP.medium).toBe(400);
    expect(MAX_TOKENS_MAP.long).toBe(700);
  });
});

describe('buildSystemPrompt', () => {
  const baseParams = {
    topic: 'Tabs vs Spaces',
    side: 'a' as const,
    turnNumber: 1,
    maxTurns: 5,
    action: 'continue' as const,
    previousArguments: [],
    responseLength: 'medium' as const,
  };

  it('includes the debate topic', () => {
    const prompt = buildSystemPrompt(baseParams);
    expect(prompt).toContain('Tabs vs Spaces');
  });

  it('includes debater role for side A', () => {
    const prompt = buildSystemPrompt(baseParams);
    expect(prompt).toContain('first speaker');
  });

  it('includes debater role for side B', () => {
    const prompt = buildSystemPrompt({ ...baseParams, side: 'b' });
    expect(prompt).toContain('second speaker');
  });

  it('includes opening guidance on turn 1', () => {
    const prompt = buildSystemPrompt(baseParams);
    expect(prompt).toContain('Opening');
    expect(prompt).toContain('initial position');
  });

  it('includes closing guidance on final turn', () => {
    const prompt = buildSystemPrompt({ ...baseParams, turnNumber: 5, maxTurns: 5 });
    expect(prompt).toContain('Closing');
    expect(prompt).toContain('FINAL');
  });

  it('includes early rebuttal guidance on turns 2-3', () => {
    const prompt = buildSystemPrompt({ ...baseParams, turnNumber: 2 });
    expect(prompt).toContain('Early Rebuttal');
  });

  it('includes advanced guidance on middle turns', () => {
    const prompt = buildSystemPrompt({ ...baseParams, turnNumber: 4, maxTurns: 8 });
    expect(prompt).toContain('Advanced');
  });

  describe('action modifiers', () => {
    it('adds new angle instruction', () => {
      const prompt = buildSystemPrompt({ ...baseParams, action: 'new_angle' });
      expect(prompt).toContain('COMPLETELY DIFFERENT angle');
    });

    it('adds deepen instruction', () => {
      const prompt = buildSystemPrompt({ ...baseParams, action: 'deepen' });
      expect(prompt).toContain('DEEPER');
    });

    it('adds intensify instruction', () => {
      const prompt = buildSystemPrompt({ ...baseParams, action: 'intensify' });
      expect(prompt).toContain('INTENSIFY');
    });

    it('adds custom prompt when provided', () => {
      const prompt = buildSystemPrompt({
        ...baseParams,
        action: 'custom',
        customPrompt: 'Focus on economics',
      });
      expect(prompt).toContain('Focus on economics');
      expect(prompt).toContain('MODERATOR INSTRUCTION');
    });

    it('falls back for custom action without prompt', () => {
      const prompt = buildSystemPrompt({ ...baseParams, action: 'custom' });
      expect(prompt).toContain('Continue the debate naturally');
    });

    it('adds closing instruction', () => {
      const prompt = buildSystemPrompt({ ...baseParams, action: 'closing' });
      expect(prompt).toContain('FINAL statement');
    });
  });

  describe('anti-repetition', () => {
    it('includes previous arguments when provided', () => {
      const prompt = buildSystemPrompt({
        ...baseParams,
        previousArguments: ['AI is efficient', 'Automation saves time'],
      });
      expect(prompt).toContain('ANTI-REPETITION');
      expect(prompt).toContain('AI is efficient');
      expect(prompt).toContain('Automation saves time');
    });

    it('omits anti-repetition block when no previous arguments', () => {
      const prompt = buildSystemPrompt(baseParams);
      expect(prompt).not.toContain('ANTI-REPETITION');
    });
  });

  describe('response length', () => {
    it('includes short guidance', () => {
      const prompt = buildSystemPrompt({ ...baseParams, responseLength: 'short' });
      expect(prompt).toContain('under 100 words');
    });

    it('includes long guidance', () => {
      const prompt = buildSystemPrompt({ ...baseParams, responseLength: 'long' });
      expect(prompt).toContain('up to 400 words');
    });
  });

  it('includes core rules', () => {
    const prompt = buildSystemPrompt(baseParams);
    expect(prompt).toContain('Stay strictly on topic');
    expect(prompt).toContain('Do not fabricate');
    expect(prompt).toContain('same language as the debate topic');
  });
});
