import { Message } from '../types/match';
import { Profile } from '../types/profile';

import { getAiPersonaConfig, isAiPersonaProfile } from '../data/aiPersonas';

import { generateAiPersonaReply } from './demoAiPersonaBrain';
import { DemoReplyContext, generateLocalDemoReply } from './demoChatBrain';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';
const LLM_TIMEOUT_MS = 8000;

function getGroqApiKey(): string | null {
  const key = process.env.EXPO_PUBLIC_GROQ_API_KEY?.trim();
  return key && key.length > 10 ? key : null;
}

function buildSystemPrompt(profile: Profile): string {
  const persona = getAiPersonaConfig(profile);
  if (persona) {
    return persona.systemPrompt;
  }

  const interests = profile.interests.join(', ');
  const promptLine = profile.prompts?.[0]
    ? `Favorite prompt answer: "${profile.prompts[0].answer}"`
    : '';
  const opening = profile.openingMove ? `Opening move: "${profile.openingMove}"` : '';

  return [
    `You are ${profile.name}, ${profile.age}, on a dating app called Spark.`,
    `Bio: ${profile.bio}`,
    profile.job ? `Job: ${profile.job}` : '',
    interests ? `Interests: ${interests}` : '',
    promptLine,
    opening,
    'Reply in 1-2 short casual sentences like texting a match.',
    'Be warm, specific, and slightly flirty when appropriate.',
    'No hashtags. No "As an AI". Match their energy.',
    'Use emoji sparingly (0-1 per message).',
  ]
    .filter(Boolean)
    .join('\n');
}

function buildChatMessages(
  profile: Profile,
  userName: string,
  userMessage: string,
  recentMessages: Message[],
): { role: 'system' | 'user' | 'assistant'; content: string }[] {
  const history = recentMessages.slice(-8).map((message) => ({
    role: message.isMine ? ('user' as const) : ('assistant' as const),
    content: message.isMine ? message.text : message.text,
  }));

  return [
    { role: 'system', content: buildSystemPrompt(profile) },
    ...history,
    { role: 'user', content: `${userName} says: ${userMessage}` },
  ];
}

async function fetchGroqReply(ctx: DemoReplyContext): Promise<string | null> {
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
        messages: buildChatMessages(
          ctx.profile,
          ctx.userName,
          ctx.userMessage,
          ctx.recentMessages,
        ),
        max_tokens: 80,
        temperature: 0.9,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = payload.choices?.[0]?.message?.content?.trim();
    if (!text || text.length < 2) {
      return null;
    }
    return text.replace(/^["']|["']$/g, '').slice(0, 280);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export type DemoReplySource = 'llm' | 'local';

export type DemoReplyResult = {
  text: string;
  source: DemoReplySource;
};

/**
 * Tries Groq free-tier LLM when EXPO_PUBLIC_GROQ_API_KEY is set,
 * otherwise uses the local personality-aware reply brain.
 */
export async function generateDemoReply(ctx: DemoReplyContext): Promise<DemoReplyResult> {
  const isAi = isAiPersonaProfile(ctx.profile);

  if (isAi) {
    const llmText = await fetchGroqReply(ctx);
    if (llmText) {
      return { text: llmText, source: 'llm' };
    }
    return { text: generateAiPersonaReply(ctx), source: 'local' };
  }

  const llmText = await fetchGroqReply(ctx);
  if (llmText) {
    return { text: llmText, source: 'llm' };
  }
  return { text: generateLocalDemoReply(ctx), source: 'local' };
}

export function isDemoLlmEnabled(): boolean {
  return getGroqApiKey() !== null;
}

function buildLocalMatchOpener(profile: Profile): string {
  const persona = getAiPersonaConfig(profile);
  if (persona) {
    return persona.openerMessages[0] ?? `Hey! I'm ${profile.name} — how's your week going?`;
  }
  if (profile.openingMove?.trim()) {
    return profile.openingMove.trim();
  }
  const interest = profile.interests[0]?.toLowerCase() ?? 'good conversation';
  const templates = [
    `Hey! ${profile.name} here — your profile caught my eye. Into ${interest} too?`,
    `Hi! I liked your vibe. What's been the highlight of your week?`,
    `Hey — ${profile.name} 👋 Saw we both like ${interest}. Tell me more?`,
  ];
  const index = Number.parseInt(profile.id, 10) % templates.length;
  return templates[Number.isNaN(index) ? 0 : index];
}

async function fetchGroqMatchOpener(profile: Profile): Promise<string | null> {
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
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt(profile),
          },
          {
            role: 'user',
            content:
              'You just matched with someone on Spark. Send your opening text — 1-2 casual sentences, warm and specific. No hashtags.',
          },
        ],
        max_tokens: 70,
        temperature: 0.92,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = payload.choices?.[0]?.message?.content?.trim();
    if (!text || text.length < 2) {
      return null;
    }
    return text.replace(/^["']|["']$/g, '').slice(0, 200);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** First message a demo match sends when the conversation opens. */
export async function generateMatchOpener(profile: Profile): Promise<DemoReplyResult> {
  const llmText = await fetchGroqMatchOpener(profile);
  if (llmText) {
    return { text: llmText, source: 'llm' };
  }
  return { text: buildLocalMatchOpener(profile), source: 'local' };
}
