import { Message } from '../types/match';
import { Profile } from '../types/profile';

export type DemoReplyContext = {
  profile: Profile;
  userMessage: string;
  recentMessages: Message[];
  userName: string;
};

const GREETING_REPLIES = [
  'Hey! So glad you messaged 😊',
  'Hi! Was hoping you would say hi.',
  'Hey hey — how is your day going?',
  'Oh hi! Perfect timing, I was just thinking about this app.',
  'Hello! Your profile made me smile.',
];

const DATE_REPLIES = [
  'I am free this weekend if you want to grab coffee ☕',
  'Down! There is a cute spot near me — want me to send the name?',
  'Yes please. Friday or Saturday works better for me.',
  'I would love that. Daytime or evening?',
  'Let us do it — I know a great low-key place.',
];

const FLIRT_REPLIES = [
  'Okay you are kind of charming ngl 😏',
  'Stop, you are making me blush.',
  'Careful — I might start liking you for real.',
  'Haha smooth. I approve.',
  'You are trouble and I am here for it.',
];

const QUESTION_REPLIES = [
  'Good question — honestly I am still figuring that out too.',
  'Hmm let me think… okay yes, definitely.',
  'I would say yes, with the right person for sure.',
  'That depends — what is your take?',
  'Great question. Short answer: absolutely.',
];

const INTEREST_REPLIES: Record<string, string[]> = {
  coffee: ['Espresso person or pour-over?', 'There is a roastery on my block — game changer.', 'Coffee date is always a yes from me.'],
  food: ['I will judge a date by their restaurant pick, fair warning.', 'Are you a sharer or an order-your-own person?', 'I know a spot with insane tacos if you are hungry.'],
  music: ['Send me a song — I will send one back.', 'What is on repeat for you lately?', 'Concert person or playlist-at-home person?'],
  travel: ['Where is the last place that surprised you?', 'Window or aisle seat?', 'I am always planning the next weekend trip.'],
  dogs: ['Dog park dates count as real dates, right?', 'I have so many dog photos. You asked for this.', 'Golden retriever energy is my type.'],
  hiking: ['Trail recs are my love language.', 'Sunrise hike or lazy Sunday walk?', 'I have been meaning to hit a new trail — join?'],
  art: ['Museum date? I am so in.', 'Gallery hop this month — you should come.', 'I nerd out over good typography too.'],
  gaming: ['Co-op or competitive?', 'What are you playing right now?', 'I respect a good side quest.'],
  wine: ['Red or white tonight?', 'I know a wine bar with tiny plates — dangerous combo.', 'Cheese board is non-negotiable for me.'],
  books: ['What are you reading? I need recs.', 'Bookstore dates are underrated.', 'I just finished something good — want the title?'],
  fitness: ['Gym person or outdoor workout person?', 'I am sore in a good way today lol', 'Walk-and-talk dates are elite.'],
  comedy: ['I laugh at everything, fair warning.', 'Open mic night sometime?', 'Dry humor or chaos humor?'],
};

const FALLBACK_REPLIES = [
  'Haha love that! Tell me more.',
  'Okay that is actually really cute.',
  'I am into this energy.',
  'Wait that is so relatable 😂',
  'You seem fun — I like it.',
  'Noted. Very noted.',
  'That made my day honestly.',
  'I was not expecting that — in a good way.',
  'Same wavelength, I think.',
  'Okay now I am curious.',
  'You are easy to talk to.',
  'I could get used to this.',
  'Solid answer. Approved.',
  'That tracks. I respect it.',
  'Ha — fair point.',
  'Interesting… go on.',
  'I feel that.',
  'Mood.',
  'Say less — I am in.',
  'You had me at that.',
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function matchesAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function interestReply(profile: Profile, text: string): string | null {
  for (const interest of profile.interests) {
    const key = interest.toLowerCase();
    const bucket = INTEREST_REPLIES[key] ?? INTEREST_REPLIES[key.split(' ')[0]];
    if (bucket && (text.includes(key) || key.split(' ').some((part) => text.includes(part)))) {
      return pick(bucket);
    }
  }
  return null;
}

function promptReply(profile: Profile): string | null {
  const prompt = profile.prompts?.[0];
  if (!prompt) {
    return null;
  }
  const templates = [
    `Re: "${prompt.question}" — ${prompt.answer}`,
    `You saw my answer about "${prompt.question}"? Still true lol`,
    `Honestly "${prompt.answer}" says it all about me.`,
  ];
  return pick(templates);
}

function openingMoveReply(profile: Profile): string | null {
  if (!profile.openingMove) {
    return null;
  }
  return pick([
    `Re your opening move — ${profile.openingMove} My answer: definitely yes.`,
    `Love that opening move. My take: ${profile.openingMove.toLowerCase().includes('?') ? 'great question' : 'same vibe'}.`,
    `Okay "${profile.openingMove}" — I have thoughts 😄`,
  ]);
}

function contextualReply(ctx: DemoReplyContext): string {
  const text = normalize(ctx.userMessage);
  const name = ctx.profile.name;

  if (!text || text === 'photo') {
    return pick(['Cute pic!', 'Okay wow 😍', 'I like what I see.', 'Photo approved ✅']);
  }

  if (text.includes('voice note') || text.includes('🎤')) {
    return pick([
      'Just listened — your voice is nice!',
      'Haha love a voice note, feels more real.',
      'Okay that was charming. Send another sometime.',
    ]);
  }

  if (text.includes('check in') || text.includes('checked in') || text.includes('home safe')) {
    return pick([
      'Glad you are safe! Text me when you are home.',
      'Thanks for checking in — that means a lot.',
      'Good to know. Hope it was fun!',
    ]);
  }

  if (matchesAny(text, ['hi', 'hey', 'hello', 'sup', 'yo', 'hiya', 'howdy'])) {
    return pick(GREETING_REPLIES);
  }

  if (matchesAny(text, ['coffee', 'drink', 'dinner', 'date', 'weekend', 'friday', 'saturday', 'tonight', 'tomorrow', 'meet', 'grab'])) {
    return pick(DATE_REPLIES);
  }

  if (matchesAny(text, ['cute', 'hot', 'beautiful', 'handsome', 'pretty', 'gorgeous', 'stunning'])) {
    return pick(FLIRT_REPLIES);
  }

  if (text.includes('?') || matchesAny(text, ['what', 'how', 'why', 'when', 'where', 'who'])) {
    const interest = interestReply(ctx.profile, text);
    if (interest) {
      return interest;
    }
    return pick(QUESTION_REPLIES);
  }

  if (matchesAny(text, ['lol', 'haha', 'lmao', 'funny', 'joke'])) {
    return pick(['You are funny 😂', 'Okay that got me', 'I am laughing', 'Comedy gold']);
  }

  if (matchesAny(text, ['thanks', 'thank you', 'appreciate'])) {
    return pick(['Of course!', 'Anytime 😊', 'Happy to!', 'You are welcome!']);
  }

  if (matchesAny(text, ['bye', 'goodnight', 'gn', 'talk later', 'ttyl'])) {
    return pick(['Night! Sweet dreams.', 'Talk soon ✨', 'Goodnight — message me tomorrow?', 'Sleep well!']);
  }

  const fromInterest = interestReply(ctx.profile, text);
  if (fromInterest) {
    return fromInterest;
  }

  if (Math.random() < 0.25) {
    const fromPrompt = promptReply(ctx.profile);
    if (fromPrompt) {
      return fromPrompt;
    }
  }

  if (Math.random() < 0.2 && ctx.profile.openingMove) {
    const fromOpening = openingMoveReply(ctx.profile);
    if (fromOpening) {
      return fromOpening;
    }
  }

  const personalized = pick(FALLBACK_REPLIES);
  if (Math.random() < 0.35) {
    return `${personalized} — ${name}`;
  }
  return personalized;
}

/** Fast local reply engine — always available, no network. */
export function generateLocalDemoReply(ctx: DemoReplyContext): string {
  const avoidRepeat = new Set(
    ctx.recentMessages.filter((m) => !m.isMine).map((m) => normalize(m.text)),
  );

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = contextualReply(ctx);
    if (!avoidRepeat.has(normalize(candidate))) {
      return candidate;
    }
  }

  return contextualReply(ctx);
}
