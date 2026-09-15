/** Personality config for Spark AI demo matches — powers chat replies. */
export type AiPersonaConfig = {
  id: string;
  codename: string;
  tagline: string;
  /** Full system prompt for LLM replies */
  systemPrompt: string;
  /** Short style hint for local fallback brain */
  style: 'warm' | 'witty' | 'nerdy' | 'poetic' | 'bold' | 'chill' | 'flirty' | 'coach';
  /** First message sent when you match */
  openerMessages: string[];
  /** Personality-specific quick replies when LLM is unavailable */
  replyBank: string[];
};
