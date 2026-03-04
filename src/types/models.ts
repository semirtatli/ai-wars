/**
 * Model types — AI model and provider metadata.
 */

import type { ProviderId } from './battle';

/** Speed rating for a model */
export type ModelSpeed = 'fast' | 'medium' | 'slow';

/** Model metadata displayed in the UI */
export interface ModelInfo {
  /** Unique model identifier (used in API calls) */
  id: string;
  /** Human-readable model name */
  name: string;
  /** Provider identifier */
  provider: ProviderId;
  /** Short description */
  description: string;
  /** Capability rating (1-5) */
  capability: 1 | 2 | 3 | 4 | 5;
  /** Speed rating */
  speed: ModelSpeed;
  /** Provider-specific model ID (for SDK calls) */
  sdkModelId: string;
}

/** Provider metadata */
export interface ProviderInfo {
  id: ProviderId;
  name: string;
  /** Provider website URL */
  url: string;
  /** Color used in UI for this provider */
  color: string;
}
