import { UserProfile } from '../types/profile';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

export type ProfileCoachSuggestions = {
  bios: string[];
  openingMoves: string[];
  source: 'llm' | 'local';
};

function getGroqApiKey(): string | null {
  const key = process.env.EXPO_PUBLIC_GROQ_API_KEY?.trim();
  return key && key.length > 10 ? key : null;
}

function buildLocalSuggestions(user: UserProfile): ProfileCoachSuggestions {
  const interest = user.interests[0] ?? 'good conversation';
  const second = user.interests[1] ?? 'exploring the city';

  return {
    bios: [
      `${user.name.split(' ')[0]} · ${user.age}. Into ${interest.toLowerCase()} and ${second.toLowerCase()}. Here for real connections.`,
      `Probably at a coffee shop talking about ${interest.toLowerCase()}. Will trade playlist recs for date ideas.`,
      `${interest} enthusiast, ${second} curious, and always up for trying something new.`,
    ],
    openingMoves: [
      `What's your go-to spot for ${interest.toLowerCase()}?`,
      `Rate your week 1–10 — I'll guess why.`,
      `Two truths and a lie: I start with ${interest.toLowerCase()}.`,
    ],
    source: 'local',
  };
}

async function fetchGroqSuggestions(user: UserProfile): Promise<ProfileCoachSuggestions | null> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    return null;
  }

  const prompt = [
    `You are a dating profile coach for Spark app.`,
    `User: ${user.name}, ${user.age}. Bio: "${user.bio}"`,
    `Interests: ${user.interests.join(', ')}`,
    `Current opening move: ${user.openingMove ?? 'none'}`,
    `Return exactly 3 bio suggestions (max 120 chars each) and 3 opening move questions (max 80 chars).`,
    `Format as JSON: {"bios":["..."],"openingMoves":["..."]}`,
    `Warm, specific, not cringe. No hashtags.`,
  ].join('\n');

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
        max_tokens: 300,
        temperature: 0.85,
      }),
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

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]) as { bios?: string[]; openingMoves?: string[] };
    if (!parsed.bios?.length || !parsed.openingMoves?.length) {
      return null;
    }

    return {
      bios: parsed.bios.slice(0, 3).map((text) => text.slice(0, 140)),
      openingMoves: parsed.openingMoves.slice(0, 3).map((text) => text.slice(0, 100)),
      source: 'llm',
    };
  } catch {
    return null;
  }
}

export async function generateProfileCoachSuggestions(
  user: UserProfile,
): Promise<ProfileCoachSuggestions> {
  const llm = await fetchGroqSuggestions(user);
  if (llm) {
    return llm;
  }
  return buildLocalSuggestions(user);
}
