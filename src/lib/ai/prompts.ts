/**
 * Dynamic System Prompt Builder
 *
 * Generates context-aware system prompts for each turn of the debate.
 * Implements anti-repetition, turn-based progression, and action modifiers.
 *
 * Architecture:
 * - Base prompt: Sets the debater persona and rules
 * - Turn modifier: Adjusts behavior based on turn number
 * - Action modifier: Applies user's chosen action (continue, new angle, etc.)
 * - Anti-repetition: Lists previously used arguments to discourage reuse
 * - Length control: Specifies response length constraints
 */

import type { ActionType, ResponseLength } from '@/types';

/** Max token mapping for response length preferences */
export const MAX_TOKENS_MAP: Record<ResponseLength, number> = {
  short: 200,
  medium: 400,
  long: 700,
};

/** Word count guidance for response length */
const LENGTH_GUIDANCE: Record<ResponseLength, string> = {
  short: 'Keep your response under 100 words. Be concise and punchy.',
  medium: 'Keep your response between 100-250 words. Be thorough but focused.',
  long: 'You may use up to 400 words. Provide detailed analysis with examples.',
};

/**
 * Builds the base system prompt that establishes the debater persona.
 */
function buildBasePrompt(topic: string, side: 'a' | 'b'): string {
  const position = side === 'a' ? 'first speaker (proponent)' : 'second speaker (opponent)';

  return [
    `You are a skilled debater participating in a structured debate.`,
    `You are the ${position}.`,
    ``,
    `DEBATE TOPIC: "${topic}"`,
    ``,
    `RULES:`,
    `- Stay strictly on topic. Do not go off on tangents.`,
    `- Address your opponent's specific arguments. Do not create straw men.`,
    `- Use logical reasoning and concrete examples.`,
    `- Do not fabricate statistics or fake sources.`,
    `- Be respectful but assertive. Attack arguments, not character.`,
    `- Do not repeat arguments you've already made.`,
    `- Write in the same language as the debate topic.`,
  ].join('\n');
}

/**
 * Returns a turn-specific modifier that guides the conversation progression.
 */
function getTurnModifier(turnNumber: number, maxTurns: number): string {
  if (turnNumber === 1) {
    return [
      `\nTURN GUIDANCE (Opening):`,
      `This is the opening round. Present your initial position clearly.`,
      `- Introduce your main thesis`,
      `- Provide 2-3 strong supporting arguments`,
      `- Set the tone for a productive debate`,
    ].join('\n');
  }

  if (turnNumber === maxTurns) {
    return [
      `\nTURN GUIDANCE (Closing):`,
      `This is the FINAL round. Deliver your closing statement.`,
      `- Summarize your strongest arguments`,
      `- Address the most critical counterpoints raised`,
      `- End with a compelling conclusion`,
      `- Do NOT introduce entirely new arguments`,
    ].join('\n');
  }

  if (turnNumber <= 3) {
    return [
      `\nTURN GUIDANCE (Early Rebuttal):`,
      `Directly counter your opponent's arguments from a NEW angle.`,
      `- Identify weaknesses in their reasoning`,
      `- Provide counter-evidence or counterexamples`,
      `- Introduce at least one fresh perspective`,
    ].join('\n');
  }

  return [
    `\nTURN GUIDANCE (Advanced):`,
    `Bring NEW evidence and perspectives not yet discussed.`,
    `- Avoid repeating previous points — find unexplored angles`,
    `- Consider edge cases, long-term implications, or alternative frameworks`,
    `- Build on the strongest threads from earlier rounds`,
  ].join('\n');
}

/**
 * Returns an action modifier based on the user's chosen action.
 */
function getActionModifier(action: ActionType, customPrompt?: string): string {
  switch (action) {
    case 'continue':
      return '\nACTION: Continue the debate naturally. Respond to your opponent\'s last argument.';

    case 'new_angle':
      return [
        '\nACTION: Approach from a COMPLETELY DIFFERENT angle.',
        'Drop your current line of reasoning entirely.',
        'Consider: economic, ethical, historical, scientific, cultural, or philosophical perspectives.',
        'Surprise your opponent with an argument they haven\'t anticipated.',
      ].join('\n');

    case 'deepen':
      return [
        '\nACTION: Go DEEPER on the last point discussed.',
        'Provide specific examples, case studies, or detailed analysis.',
        'Explain the nuances and implications thoroughly.',
      ].join('\n');

    case 'intensify':
      return [
        '\nACTION: INTENSIFY your argumentation.',
        'Be more direct and forceful in your rebuttal.',
        'Identify the WEAKEST point in your opponent\'s argument and dismantle it.',
        'Use sharp, compelling rhetoric while remaining factual.',
      ].join('\n');

    case 'custom':
      return customPrompt
        ? `\nMODERATOR INSTRUCTION: ${customPrompt}\nFollow this instruction in your next response.`
        : '\nACTION: Continue the debate naturally.';

    case 'closing':
      return [
        '\nACTION: This is your FINAL statement.',
        'Deliver a powerful closing argument summarizing your position.',
        'Address the strongest counterpoint raised against you.',
        'End with a memorable concluding thought.',
      ].join('\n');

    default:
      return '';
  }
}

/**
 * Returns anti-repetition instructions with previously used arguments.
 */
function getAntiRepetitionBlock(previousArguments: string[]): string {
  if (previousArguments.length === 0) return '';

  return [
    '\nANTI-REPETITION:',
    'You have already used these arguments in previous turns:',
    ...previousArguments.map((arg, i) => `${i + 1}. "${arg}"`),
    'Do NOT repeat these. Bring fresh arguments and perspectives.',
  ].join('\n');
}

/**
 * Builds the complete dynamic system prompt for a debate turn.
 *
 * @param params - All parameters needed to construct the prompt
 * @returns The fully assembled system prompt string
 */
export function buildSystemPrompt(params: {
  topic: string;
  side: 'a' | 'b';
  turnNumber: number;
  maxTurns: number;
  action: ActionType;
  previousArguments: string[];
  responseLength: ResponseLength;
  customPrompt?: string;
}): string {
  const {
    topic,
    side,
    turnNumber,
    maxTurns,
    action,
    previousArguments,
    responseLength,
    customPrompt,
  } = params;

  const parts = [
    buildBasePrompt(topic, side),
    getTurnModifier(turnNumber, maxTurns),
    getActionModifier(action, customPrompt),
    getAntiRepetitionBlock(previousArguments),
    `\nRESPONSE FORMAT:`,
    LENGTH_GUIDANCE[responseLength],
    `Use markdown formatting where appropriate (bold for emphasis, lists for enumeration).`,
  ];

  return parts.join('\n');
}
