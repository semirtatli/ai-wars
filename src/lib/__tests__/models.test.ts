import { describe, it, expect } from 'vitest';
import { MODELS, PROVIDERS, getModelInfo, getModelsByProvider, EXAMPLE_TOPICS } from '@/lib/ai/models';

describe('PROVIDERS', () => {
  it('has all 4 providers', () => {
    expect(Object.keys(PROVIDERS)).toHaveLength(4);
    expect(PROVIDERS.google).toBeDefined();
    expect(PROVIDERS.groq).toBeDefined();
    expect(PROVIDERS.openai).toBeDefined();
    expect(PROVIDERS.openrouter).toBeDefined();
  });

  it('each provider has required fields', () => {
    Object.values(PROVIDERS).forEach((p) => {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.url).toMatch(/^https?:\/\//);
      expect(p.color).toMatch(/^#/);
    });
  });
});

describe('MODELS', () => {
  it('has expected number of models', () => {
    expect(MODELS.length).toBeGreaterThanOrEqual(9);
  });

  it('every model has required fields', () => {
    MODELS.forEach((m) => {
      expect(m.id).toBeTruthy();
      expect(m.name).toBeTruthy();
      expect(m.provider).toBeTruthy();
      expect(m.description).toBeTruthy();
      expect(m.capability).toBeGreaterThanOrEqual(1);
      expect(m.capability).toBeLessThanOrEqual(5);
      expect(['fast', 'medium', 'slow']).toContain(m.speed);
      expect(m.sdkModelId).toBeTruthy();
    });
  });

  it('every model references a valid provider', () => {
    MODELS.forEach((m) => {
      expect(PROVIDERS[m.provider]).toBeDefined();
    });
  });

  it('has unique IDs', () => {
    const ids = MODELS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('getModelInfo', () => {
  it('returns model for valid ID', () => {
    const model = getModelInfo('gemini-2.0-flash');
    expect(model).toBeDefined();
    expect(model?.name).toBe('Gemini 2.0 Flash');
  });

  it('returns undefined for invalid ID', () => {
    expect(getModelInfo('nonexistent-model')).toBeUndefined();
  });
});

describe('getModelsByProvider', () => {
  it('returns correct models for groq', () => {
    const groqModels = getModelsByProvider('groq');
    expect(groqModels.length).toBeGreaterThanOrEqual(3);
    groqModels.forEach((m) => expect(m.provider).toBe('groq'));
  });

  it('returns empty array for unknown provider', () => {
    expect(getModelsByProvider('unknown')).toEqual([]);
  });
});

describe('EXAMPLE_TOPICS', () => {
  it('has at least 10 topics', () => {
    expect(EXAMPLE_TOPICS.length).toBeGreaterThanOrEqual(10);
  });

  it('all topics are non-empty strings', () => {
    EXAMPLE_TOPICS.forEach((t) => {
      expect(typeof t).toBe('string');
      expect(t.length).toBeGreaterThan(10);
    });
  });
});
