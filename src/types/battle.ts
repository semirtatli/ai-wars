/**
 * Battle types — core domain models for the AI debate system.
 *
 * The battle follows a state machine:
 * IDLE → STARTING → MODEL_A_STREAMING → MODEL_B_STREAMING → PAUSED → ... → FINISHED
 */

/** Supported AI provider identifiers */
export type ProviderId = 'google' | 'groq' | 'openrouter';

/** Battle state machine states */
export type BattleStatus =
  | 'idle'
  | 'starting'
  | 'model_a_streaming'
  | 'model_b_streaming'
  | 'paused'
  | 'finished'
  | 'error';

/** User actions available between turns */
export type ActionType =
  | 'continue'
  | 'new_angle'
  | 'deepen'
  | 'intensify'
  | 'custom'
  | 'closing';

/** Response length preference */
export type ResponseLength = 'short' | 'medium' | 'long';

/** A single message in the debate */
export interface BattleMessage {
  /** Unique message identifier */
  id: string;
  /** Which side sent this message ('a' | 'b' | 'system') */
  role: 'model_a' | 'model_b' | 'system';
  /** The message content (markdown) */
  content: string;
  /** Turn number (1-indexed) */
  turn: number;
  /** Timestamp */
  timestamp: number;
  /** Whether this message is currently streaming */
  isStreaming?: boolean;
}

/** Configuration for a single battle */
export interface BattleConfig {
  /** Model ID for side A */
  modelA: string;
  /** Model ID for side B */
  modelB: string;
  /** The debate topic / initial prompt */
  topic: string;
  /** Maximum number of turns (1-10) */
  maxTurns: number;
  /** Response length preference */
  responseLength: ResponseLength;

}

/** Full battle state */
export interface BattleState {
  /** Current battle status */
  status: BattleStatus;
  /** Battle configuration */
  config: BattleConfig | null;
  /** All messages in the debate */
  messages: BattleMessage[];
  /** Current turn number */
  currentTurn: number;
  /** Key arguments extracted per model (for anti-repetition) */
  modelAArguments: string[];
  modelBArguments: string[];
  /** Error message if status is 'error' */
  error?: string;
}

/** Action panel selection */
export interface BattleAction {
  type: ActionType;
  /** Custom prompt text (only for 'custom' type) */
  customPrompt?: string;
}
