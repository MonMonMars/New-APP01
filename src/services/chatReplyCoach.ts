import { Message } from '../types/match';
import { Profile, UserProfile } from '../types/profile';

import { getAiPersonaConfig } from '../data/aiPersonas';
import { getIcebreakerSuggestions } from '../utils/openingMove';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';
const LLM_TIMEOUT_MS = 9000;

export type ChatCoachSuggestions = {
  options: [string, string, string];
  source: 'llm' | 'local';
};

function getGroqApiKey(): string | null {
  const key = process.env.EXPO_PUBLIC_GROQ_API_KEY?.trim();
  return key && key.length > 10 ? key : null;
}

function normalizeOptions(values: string[]): [string, string, string] | null {
  const cleaned = values
    .map((value) => value.replace(/^["'\d.)\s-]+/, '').replace(/["']$/g, '').trim())
    .filter((value) => value.length >= 4)
    .slice(0, 3);
  if (cleaned.length < 3) {
    return null;
  }
  return [cleaned[0], cleaned[1], cleaned[2]];
}

function buildLocalOpeners(profile: Profile, user: UserProfile): ChatCoachSuggestions {
  const base = getIcebreakerSuggestions(profile, user);
  while (base.length < 3) {
    base.push(`What's your take on ${profile.interests[0] ?? 'weekend plans'}?`);
  }
  return {
    options: [base[0], base[1], base[2]],
    source: 'local',
  };
}

function buildLocalReplies(
  profile: Profile,
  user: UserProfile,
  recentMessages: Message[],
): ChatCoachSuggestions {
  const lastTheirs = [...recentMessages].reverse().find((message) => !message.isMine);
  const snippet = lastTheirs?.text?.slice(0, 60) ?? 'your message';
  const interest = profile.interests[0]?.toLowerCase() ?? 'that';
  const options: [string, string, string] = [
    `Ha — ${snippet.toLowerCase().includes('?') ? 'great question. ' : ''}I'm into ${interest} too. What got you into it?`,
    `Love that energy. Want to grab coffee and talk ${interest} sometime?`,
    `Ha, fair. ${user.name.split(' ')[0]} here — what would your perfect Sunday look like?`,
  ];
  return { options, source: 'local' };
}

async function fetchGroqJson(prompt: string): Promise<string[] | null> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 220,
        temperature: 0.88,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = payload.choices?.[0]?.message?.content?.trim();
    if (!raw) {
      return null;
    }

    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as string[];
      if (Array.isArray(parsed) && parsed.length >= 3) {
        return parsed;
      }
    }

    const lines = raw
      .split('\n')
      .map((line) => line.replace(/^\d+[.)]\s*/, '').trim())
      .filter(Boolean);
    return lines.length >= 3 ? lines : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function profileContext(profile: Profile): string {
  const persona = getAiPersonaConfig(profile);
  const lines = [
    `Match: ${profile.name}, ${profile.age}. Bio: "${profile.bio}"`,
    profile.interests.length ? `Interests: ${profile.interests.join(', ')}` : '',
    profile.prompts?.[0] ? `Prompt: "${profile.prompts[0].answer}"` : '',
    profile.openingMove ? `Their opening move: "${profile.openingMove}"` : '',
    persona ? `Practice AI persona: ${persona.codename}` : '',
  ];
  return lines.filter(Boolean).join('\n');
}

function recentTranscript(messages: Message[], userName: string, matchName: string): string {
  return messages
    .slice(-10)
    .map((message) => `${message.isMine ? userName : matchName}: ${message.text}`)
    .join('\n');
}

/** Three AI opening lines for the user to send first. */
export async function generateOpenerSuggestions(
  profile: Profile,
  user: UserProfile,
): Promise<ChatCoachSuggestions> {
  const prompt = [
    'You are a dating chat coach for Spark.',
    `User: ${user.name}, ${user.age}. Interests: ${user.interests.join(', ')}`,
    profileContext(profile),
    'Write exactly 3 distinct first messages the user could send (max 90 chars each).',
    'Warm, specific, not cringe. Reference their bio or interests when possible.',
    'Return JSON array of 3 strings only.',
  ].join('\n');

  const llm = await fetchGroqJson(prompt);
  const normalized = llm ? normalizeOptions(llm) : null;
  if (normalized) {
    return { options: normalized, source: 'llm' };
  }
  return buildLocalOpeners(profile, user);
}

/** Three AI reply options after their last message. */
export async function generateReplySuggestions(
  profile: Profile,
  user: UserProfile,
  recentMessages: Message[],
): Promise<ChatCoachSuggestions> {
  const prompt = [
    'You are a dating chat coach for Spark.',
    `User: ${user.name}, ${user.age}.`,
    profileContext(profile),
    'Recent chat:',
    recentTranscript(recentMessages, user.name, profile.name),
    'Write exactly 3 reply options the user could send next (max 90 chars each).',
    'Match their tone. One can be playful, one curious, one forward about meeting.',
    'Return JSON array of 3 strings only.',
  ].join('\n');

  const llm = await fetchGroqJson(prompt);
  const normalized = llm ? normalizeOptions(llm) : null;
  if (normalized) {
    return { options: normalized, source: 'llm' };
  }
  return buildLocalReplies(profile, user, recentMessages);
}
