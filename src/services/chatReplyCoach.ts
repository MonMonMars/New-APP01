import { Message } from '../types/match';
import { AppLocale } from '../types/locale';
import { Profile, UserProfile } from '../types/profile';

import { getAiPersonaConfig } from '../data/aiPersonas';
import { getIcebreakerSuggestions } from '../utils/openingMove';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';
const LLM_TIMEOUT_MS = 9000;

export const CHAT_SUGGESTION_COUNT = 5;

export type ChatCoachSuggestions = {
  options: string[];
  source: 'llm' | 'local';
};

/** What the dialogue helper is generating: first message, direct reply, or fresh topic. */
export type ChatDialogueMode = 'opener' | 'reply' | 'topic';

function getGroqApiKey(): string | null {
  const key = process.env.EXPO_PUBLIC_GROQ_API_KEY?.trim();
  return key && key.length > 10 ? key : null;
}

function normalizeOptions(values: string[]): string[] | null {
  const cleaned = values
    .map((value) => value.replace(/^["'\d.)\s-]+/, '').replace(/["']$/g, '').trim())
    .filter((value) => value.length >= 4);
  const unique = [...new Set(cleaned)];
  if (unique.length < CHAT_SUGGESTION_COUNT) {
    return null;
  }
  return unique.slice(0, CHAT_SUGGESTION_COUNT);
}

function sharedInterests(profile: Profile, user: UserProfile): string[] {
  const userSet = new Set(user.interests.map((item) => item.toLowerCase()));
  return profile.interests.filter((item) => userSet.has(item.toLowerCase()));
}

function lastIncomingMessage(messages: Message[]): Message | undefined {
  return [...messages].reverse().find((message) => !message.isMine);
}

const LOCAL_OPENERS_ZH: string[] = [
  '週末通常會做什麼？',
  '城裡有什麼私房好去處？',
  '第一次約會喝咖啡還是小酌？',
  '最近有在追什麼劇或書嗎？',
  '如果只能推薦一家店，你會選哪裡？',
];

const LOCAL_OPENERS_EN: string[] = [
  "What's your go-to weekend plan?",
  'Best hidden gem in the city?',
  'Coffee or cocktails first date?',
  'What are you passionate about right now?',
  'If you could only recommend one spot, what would it be?',
];

function buildLocalOpeners(
  profile: Profile,
  user: UserProfile,
  locale: AppLocale,
): ChatCoachSuggestions {
  const shared = sharedInterests(profile, user);
  const promptAnswer = profile.prompts?.[0]?.answer;
  const openingMove = profile.openingMove?.trim();

  if (locale === 'zh-TW') {
    const options = [
      openingMove ? `看到你想問「${openingMove}」— 我的答案是…` : LOCAL_OPENERS_ZH[0],
      shared[0] ? `我也喜歡${shared[0]}！你是怎麼入坑的？` : LOCAL_OPENERS_ZH[1],
      promptAnswer ? `你寫的「${promptAnswer.slice(0, 40)}…」很有趣 — 多說一點？` : LOCAL_OPENERS_ZH[2],
      LOCAL_OPENERS_ZH[3],
      LOCAL_OPENERS_ZH[4],
    ];
    return { options: options.slice(0, CHAT_SUGGESTION_COUNT), source: 'local' };
  }

  const base = getIcebreakerSuggestions(profile, user);
  const options = [
    openingMove ? `Love your opening move — ${openingMove}` : base[0] ?? LOCAL_OPENERS_EN[0],
    shared[0] ? `I'm into ${shared[0]} too — what got you into it?` : base[1] ?? LOCAL_OPENERS_EN[1],
    promptAnswer
      ? `Your prompt about "${promptAnswer.slice(0, 50)}…" caught my eye — tell me more?`
      : base[2] ?? LOCAL_OPENERS_EN[2],
    LOCAL_OPENERS_EN[3],
    LOCAL_OPENERS_EN[4],
  ];
  return { options: options.slice(0, CHAT_SUGGESTION_COUNT), source: 'local' };
}

function buildLocalReplies(
  profile: Profile,
  user: UserProfile,
  recentMessages: Message[],
  locale: AppLocale,
): ChatCoachSuggestions {
  const interest = profile.interests[0]?.toLowerCase() ?? 'that';
  const firstName = user.name.split(' ')[0];
  const lastTheirs = lastIncomingMessage(recentMessages);
  const snippet = lastTheirs?.text?.slice(0, 80) ?? '';
  const isQuestion = snippet.includes('?') || snippet.includes('？');
  const shared = sharedInterests(profile, user);

  if (locale === 'zh-TW') {
    const interestLabel = profile.interests[0] ?? '聊天';
    if (lastTheirs?.isGif) {
      return {
        options: [
          '哈哈這張圖太準了 😂',
          '我需要知道背後的故事',
          '你的迷因品味很可以',
          '下一張會更誇張嗎？',
          '笑死 — 你平常都去哪找這些？',
        ],
        source: 'local',
      };
    }
    if (lastTheirs?.imageUrl && !lastTheirs.isGif) {
      return {
        options: [
          '這張照片好好看 — 在哪拍的？',
          '光線跟構圖都很讚',
          '看了更想認識你 ☕',
          '這個地方我也想去',
          '下一張會是什麼？',
        ],
        source: 'local',
      };
    }
    if (lastTheirs?.isVoiceNote) {
      return {
        options: [
          '剛聽完 — 聲音很 chill',
          '哈哈語氣跟我想像的一樣',
          '用語音聊天很加分',
          '改天也用語音繼續聊？',
          '這段我會重播 😄',
        ],
        source: 'local',
      };
    }
    if (isQuestion) {
      return {
        options: [
          `好問題 — 我會說${interestLabel}算一個`,
          '讓我想一下…其實我週末通常很隨性',
          `哈哈公平 — ${firstName}在這，你呢？`,
          shared[0] ? `我也超愛${shared[0]} — 你呢？` : `我對${interestLabel}很有感`,
          '換我問你 — 理想週日會怎麼過？',
        ],
        source: 'local',
      };
    }
    return {
      options: [
        `哈哈，我也對${interestLabel}很有興趣 — 你是怎麼入坑的？`,
        '感覺聊得來 ☕ 要不要找時間喝杯咖啡？',
        `${firstName} 在這 — 你理想的週日會怎麼過？`,
        snippet ? `「${snippet.slice(0, 24)}…」這點我懂` : '繼續說，我在聽',
        shared[0] ? `我們都喜歡${shared[0]} — 小眾推薦有嗎？` : '你平常都在城裡哪區混？',
      ],
      source: 'local',
    };
  }

  if (lastTheirs?.isGif) {
    return {
      options: [
        'Ha — that GIF is perfect 😂',
        'Ok I need the backstory on that one',
        'Your meme game is strong',
        'Please tell me there is a part 2',
        'I am saving this for group chat',
      ],
      source: 'local',
    };
  }
  if (lastTheirs?.imageUrl && !lastTheirs.isGif) {
    return {
      options: [
        'Love this shot — where was it taken?',
        'Ok you have great taste',
        'This makes me want to visit',
        'The lighting is chef\'s kiss',
        'Send me the location — I need to go',
      ],
      source: 'local',
    };
  }
  if (lastTheirs?.isVoiceNote) {
    return {
      options: [
        'Just listened — love the vibe in your voice',
        'Ha, same energy honestly',
        'Voice notes are underrated',
        'Want to keep this going over coffee?',
        'That was worth a replay 😄',
      ],
      source: 'local',
    };
  }
  if (isQuestion) {
    return {
      options: [
        `Good question — I'd say ${interest} is a big one for me`,
        'Hmm, honestly my weekends are pretty spontaneous',
        `Ha, fair — ${firstName} here. What about you?`,
        shared[0] ? `Same — I'm really into ${shared[0]}. You?` : `I'm big on ${interest} lately`,
        'Your turn — what would a perfect Sunday look like for you?',
      ],
      source: 'local',
    };
  }

  const options = [
    `Ha — ${snippet ? `"${snippet.slice(0, 40)}…" — ` : ''}I'm into ${interest} too. What got you into it?`,
    `Love that energy. Want to grab coffee and talk ${interest} sometime?`,
    `Ha, fair. ${firstName} here — what would your perfect Sunday look like?`,
    snippet ? 'That tracks — tell me more' : 'Keep going, I am listening',
    shared[0] ? `We both like ${shared[0]} — any recs?` : 'What part of the city do you hang in most?',
  ];
  return { options: options.slice(0, CHAT_SUGGESTION_COUNT), source: 'local' };
}

function chatTranscriptText(messages: Message[]): string {
  return messages
    .map((message) => message.text ?? '')
    .join(' ')
    .toLowerCase();
}

function interestMentionedInChat(transcript: string, interest: string): boolean {
  return transcript.includes(interest.toLowerCase());
}

function localeInstruction(locale: AppLocale): string {
  return locale === 'zh-TW'
    ? 'Write every suggestion in Traditional Chinese (zh-TW).'
    : 'Write every suggestion in English.';
}

function buildLocalTopics(
  profile: Profile,
  user: UserProfile,
  recentMessages: Message[],
  locale: AppLocale,
): ChatCoachSuggestions {
  const transcript = chatTranscriptText(recentMessages);
  const unexplored = profile.interests.filter(
    (interest) => !interestMentionedInChat(transcript, interest),
  );
  const shared = sharedInterests(profile, user).filter(
    (interest) => !interestMentionedInChat(transcript, interest),
  );
  const promptTopic = profile.prompts?.[1]?.question ?? profile.prompts?.[0]?.question;
  const matchName = profile.name.split(' ')[0];

  if (locale === 'zh-TW') {
    const options = [
      unexplored[0]
        ? `我們還沒聊過${unexplored[0]} — 你是怎麼開始喜歡的？`
        : `如果${matchName}只能推薦一個週末活動，會是什麼？`,
      shared[0] ? `我們都喜歡${shared[0]} — 有什麼小眾推薦？` : '最近有發現什麼新的好去處嗎？',
      promptTopic ? `想聽你聊聊「${promptTopic}」` : '有什麼事是最近讓你特別開心的？',
      '如果明天可以飛任何地方，你會選哪？',
      '你平常怎麼放鬆 — 獨處還是跟朋友？',
    ];
    return { options: options.slice(0, CHAT_SUGGESTION_COUNT), source: 'local' };
  }

  const options = [
    unexplored[0]
      ? `We have not talked about ${unexplored[0]} yet — how did you get into it?`
      : `If you could plan the perfect weekend, what would ${matchName} pick?`,
    shared[0] ? `We both like ${shared[0]} — any hidden gems?` : 'Found any new spots in the city lately?',
    promptTopic ? `Curious about your take on "${promptTopic}"` : 'What has been making you happy lately?',
    'If you could fly anywhere tomorrow, where would you go?',
    'How do you recharge — solo time or with friends?',
  ];
  return { options: options.slice(0, CHAT_SUGGESTION_COUNT), source: 'local' };
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
        max_tokens: 320,
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
      if (Array.isArray(parsed) && parsed.length >= CHAT_SUGGESTION_COUNT) {
        return parsed;
      }
    }

    const lines = raw
      .split('\n')
      .map((line) => line.replace(/^\d+[.)]\s*/, '').trim())
      .filter(Boolean);
    return lines.length >= CHAT_SUGGESTION_COUNT ? lines : null;
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
    .map((message) => {
      if (message.isVoiceNote) {
        return `${message.isMine ? userName : matchName}: [voice note ${message.voiceDurationSeconds ?? 0}s]`;
      }
      if (message.isGif) {
        return `${message.isMine ? userName : matchName}: [GIF]${message.text ? ` ${message.text}` : ''}`;
      }
      if (message.imageUrl) {
        return `${message.isMine ? userName : matchName}: [photo]${message.text ? ` ${message.text}` : ''}`;
      }
      return `${message.isMine ? userName : matchName}: ${message.text}`;
    })
    .join('\n');
}

/** Five AI opening lines for the user to send first. */
export async function generateOpenerSuggestions(
  profile: Profile,
  user: UserProfile,
  locale: AppLocale = 'en',
): Promise<ChatCoachSuggestions> {
  const prompt = [
    'You are a dating chat coach for Spark.',
    `User: ${user.name}, ${user.age}. Interests: ${user.interests.join(', ')}`,
    profileContext(profile),
    `Write exactly ${CHAT_SUGGESTION_COUNT} distinct first messages the user could send (max 90 chars each).`,
    'Warm, specific, not cringe. Reference their bio, prompts, or interests when possible.',
    localeInstruction(locale),
    'Return JSON array of 5 strings only.',
  ].join('\n');

  const llm = await fetchGroqJson(prompt);
  const normalized = llm ? normalizeOptions(llm) : null;
  if (normalized) {
    return { options: normalized, source: 'llm' };
  }
  return buildLocalOpeners(profile, user, locale);
}

/** Five AI reply options after their last message. */
export async function generateReplySuggestions(
  profile: Profile,
  user: UserProfile,
  recentMessages: Message[],
  locale: AppLocale = 'en',
): Promise<ChatCoachSuggestions> {
  const lastTheirs = lastIncomingMessage(recentMessages);
  const mediaHint = lastTheirs?.isGif
    ? 'They sent a GIF.'
    : lastTheirs?.isVoiceNote
      ? 'They sent a voice note.'
      : lastTheirs?.imageUrl
        ? 'They sent a photo.'
        : '';

  const prompt = [
    'You are a dating chat coach for Spark.',
    `User: ${user.name}, ${user.age}.`,
    profileContext(profile),
    mediaHint,
    'Recent chat:',
    recentTranscript(recentMessages, user.name, profile.name),
    `Write exactly ${CHAT_SUGGESTION_COUNT} reply options the user could send next (max 90 chars each).`,
    'Match their tone. Include playful, curious, and forward-about-meeting options.',
    localeInstruction(locale),
    'Return JSON array of 5 strings only.',
  ].join('\n');

  const llm = await fetchGroqJson(prompt);
  const normalized = llm ? normalizeOptions(llm) : null;
  if (normalized) {
    return { options: normalized, source: 'llm' };
  }
  return buildLocalReplies(profile, user, recentMessages, locale);
}

/** Five fresh conversation topics to pivot or re-energize the chat. */
export async function generateTopicSuggestions(
  profile: Profile,
  user: UserProfile,
  recentMessages: Message[],
  locale: AppLocale = 'en',
): Promise<ChatCoachSuggestions> {
  const prompt = [
    'You are a dating chat coach for Spark.',
    `User: ${user.name}, ${user.age}. Interests: ${user.interests.join(', ')}`,
    profileContext(profile),
    'Recent chat:',
    recentTranscript(recentMessages, user.name, profile.name),
    `Suggest exactly ${CHAT_SUGGESTION_COUNT} NEW conversation topics or pivot questions (max 90 chars each).`,
    'Do not repeat what was already discussed. Draw from their bio, prompts, or interests not yet mentioned.',
    'Mix light/fun with deeper getting-to-know-you angles.',
    localeInstruction(locale),
    'Return JSON array of 5 strings only.',
  ].join('\n');

  const llm = await fetchGroqJson(prompt);
  const normalized = llm ? normalizeOptions(llm) : null;
  if (normalized) {
    return { options: normalized, source: 'llm' };
  }
  return buildLocalTopics(profile, user, recentMessages, locale);
}

/** Unified entry for the dialogue helper UI. */
export async function generateDialogueSuggestions(
  mode: ChatDialogueMode,
  profile: Profile,
  user: UserProfile,
  recentMessages: Message[],
  locale: AppLocale = 'en',
): Promise<ChatCoachSuggestions> {
  switch (mode) {
    case 'opener':
      return generateOpenerSuggestions(profile, user, locale);
    case 'reply':
      return generateReplySuggestions(profile, user, recentMessages, locale);
    case 'topic':
      return generateTopicSuggestions(profile, user, recentMessages, locale);
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}
