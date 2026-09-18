import { getAiPersonaConfig, isAiPersonaProfile } from '../data/aiPersonas';
import { DemoReplyContext } from './demoChatBrain';

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

const STYLE_GREETINGS: Record<string, string[]> = {
  warm: [
    'Hey! So glad you reached out 😊',
    'Hi there — this is nice.',
    'Hey! I was hoping you\'d message.',
    'Hello! Good timing — I was just thinking about chatting.',
    'Hi — you seem easy to talk to already.',
  ],
  chill: [
    'Hey. Good to hear from you.',
    'Hi — no rush, just here.',
    'Hey. What\'s on your mind?',
    'Hello. Low pressure — say whatever.',
    'Hey — I\'m around if you want to talk.',
  ],
  witty: [
    'yooo hey',
    'oh we\'re doing this? I\'m in',
    'hey hey — talk to me',
    'well well well look who texted',
    'okay the convo just leveled up',
  ],
  poetic: [
    'Hello ✨',
    'Hi — lovely to connect.',
    'Hey, you have my attention.',
    'Hello — small moment, nice message.',
    'Hi there. This feels like a good opening.',
  ],
  flirty: [
    'Well hello 😏',
    'Hey you.',
    'Hi — you\'ve got good timing.',
    'Oh hey — I was hoping you\'d show up.',
    'Hello hello — keep going.',
  ],
  nerdy: [
    'Hey! Okay quick question before we continue—',
    'Hi! Fascinating that you messaged.',
    'Hey — data point: I\'m glad you did.',
    'Hello! Hypothesis: this chat will be good.',
    'Hi — logging this as a positive interaction.',
  ],
  bold: [
    'Yo! Let\'s go.',
    'Hey — bring the energy.',
    'What\'s up! Ready when you are.',
    'Hey hey — I like the initiative.',
    'Hi — game on.',
  ],
  coach: [
    'Hey — love the initiative.',
    'Hi. Clear communication already.',
    'Hey! What are we building today?',
    'Hello — strong opener energy.',
    'Hi — I\'m listening. What\'s next?',
  ],
};

const STYLE_DATES: Record<string, string[]> = {
  warm: [
    'I\'d love that. When works for you?',
    'Yes — coffee or a walk sounds perfect.',
    'I\'m free this weekend if you are.',
    'That sounds lovely — daytime or evening?',
    'Count me in. Pick a time?',
  ],
  chill: [
    'That could be nice. Low pressure works for me.',
    'I\'m open to it. Something quiet?',
    'Sure — what feels easy for you?',
    'Yeah — no rush, we can figure it out.',
    'I\'d be down for something low-key.',
  ],
  witty: [
    'say less I\'m there',
    'bold of you to ask and I respect it',
    'okay but only if you pick the spot',
    'you had me at plans honestly',
    'fine I\'ll show up looking cute',
  ],
  poetic: [
    'That sounds like a small beautiful plan.',
    'I\'d wander somewhere with you.',
    'Yes — let\'s make an evening of it.',
    'That could be a lovely little adventure.',
    'I\'d say yes to that kind of evening.',
  ],
  flirty: [
    'Are you asking me out? Because yes.',
    'I was hoping you\'d say that.',
    'Pick a place — impress me.',
    'Is this a date? I\'m saying yes either way.',
    'You plan it — I\'ll bring the charm.',
  ],
  nerdy: [
    'Optimized answer: yes. Send coordinates.',
    'I\'ve run the simulations — good idea.',
    'Adding that to the shared calendar (metaphorically).',
    'Probability of a good time: high. Confirmed.',
    'Route accepted. ETA: whenever you\'re free.',
  ],
  bold: [
    'Game on. You pick or I pick?',
    'I\'m in. Loser buys drinks?',
    'Let\'s do it — make it interesting.',
    'Yes. Bring your A-game.',
    'Done. Make it worth showing up.',
  ],
  coach: [
    'Strong move. I\'d block time for that.',
    'Good ask. What\'s the goal — fun or fancy?',
    'Yes — intentional plans are hot.',
    'Clear invite. I\'m a yes.',
    'Love directness. When works?',
  ],
};

const STYLE_FLIRT: Record<string, string[]> = {
  warm: ['That\'s sweet — you\'re making me smile.', 'Okay you\'re kind of charming.', 'You say nice things — I notice.'],
  chill: ['Appreciate that. You seem solid too.', 'Noted — you\'re easy on the eyes as well.', 'Fair compliment. Reciprocated.'],
  witty: ['okay rizz detected', 'careful I might start liking you', 'you\'re not so bad yourself lol'],
  poetic: ['You paint a flattering picture.', 'That lands softly — thank you.', 'Kind words suit you.'],
  flirty: ['Keep talking like that 😏', 'You\'re trouble and I\'m here for it.', 'Smooth — I approve.'],
  nerdy: ['Compliment received and logged.', 'Statistically you\'re in my top tier.', 'Hypothesis confirmed: you\'re cute.'],
  bold: ['Say less — I\'m flattered.', 'You\'ve got taste.', 'Right back at you.'],
  coach: ['Confidence looks good on you.', 'Good delivery — authentic too.', 'That\'s the energy — keep it.'],
};

const STYLE_LAUGH: Record<string, string[]> = {
  warm: ['Haha you\'re funny 😊', 'That got me — good one.', 'You make this easy to laugh at.'],
  chill: ['lol fair', 'okay that\'s good', 'you\'re amusing — I\'ll give you that'],
  witty: ['LMAO stop', 'comedy unlocked', 'you\'re a menace I mean that nicely'],
  poetic: ['A little joy in text form — thank you.', 'That brightened the thread.', 'Laughter suits this chat.'],
  flirty: ['Laughing and slightly blushing ngl', 'Funny and cute — dangerous combo', 'Keep being funny like that'],
  nerdy: ['Humor metrics: elevated.', 'Unexpected punchline — well played.', 'Error: too funny. Recovering.'],
  bold: ['HA okay you got me', 'Solid joke. Respect.', 'You\'re funny — I\'ll allow it.'],
  coach: ['Good comedic timing.', 'Humor is a green flag.', 'That\'s the kind of energy I like.'],
};

export function generateAiPersonaReply(ctx: DemoReplyContext): string {
  const config = getAiPersonaConfig(ctx.profile);
  if (!config) {
    return pick(['Interesting!', 'Tell me more?', 'I\'m listening.']);
  }

  const text = normalize(ctx.userMessage);
  const used = new Set(
    ctx.recentMessages.filter((m) => !m.isMine).map((m) => normalize(m.text)),
  );

  const pickUnique = (pool: string[]): string => {
    for (let i = 0; i < 8; i += 1) {
      const candidate = pick(pool);
      if (!used.has(normalize(candidate))) {
        return candidate;
      }
    }
    return pick(pool);
  };

  if (text.includes('ai') || text.includes('bot') || text.includes('real')) {
    return pickUnique([
      'Yep — I\'m a Spark AI practice persona. Real replies, zero awkward stakes.',
      'AI here! Built so you can practice chatting before the real matches.',
      'Guilty — I\'m AI. But I\'m still fun to talk to, promise.',
    ]);
  }

  if (/\b(hi|hey|hello|sup|yo|hiya)\b/.test(text)) {
    return pickUnique(STYLE_GREETINGS[config.style] ?? STYLE_GREETINGS.warm);
  }

  if (/\b(coffee|date|weekend|tonight|tomorrow|friday|saturday|meet|grab|drink|dinner)\b/.test(text)) {
    return pickUnique(STYLE_DATES[config.style] ?? STYLE_DATES.warm);
  }

  if (/\b(cute|hot|beautiful|handsome|pretty|gorgeous|attractive|sexy|fine)\b/.test(text)) {
    return pickUnique(STYLE_FLIRT[config.style] ?? STYLE_FLIRT.warm);
  }

  if (/\b(lol|haha|lmao|funny|joke|dying|dead)\b/.test(text)) {
    return pickUnique(STYLE_LAUGH[config.style] ?? STYLE_LAUGH.warm);
  }

  if (/\b(thanks|thank you|appreciate|ty|thx)\b/.test(text)) {
    return pickUnique([
      'Anytime!',
      'Of course 😊',
      'Happy to!',
      'You are welcome!',
      'Always.',
    ]);
  }

  if (/\b(bye|goodnight|gn|talk later|ttyl|good night|cya)\b/.test(text)) {
    return pickUnique([
      'Night — talk soon!',
      'Sleep well ✨',
      'Catch you later!',
      'Sweet dreams!',
    ]);
  }

  if (/\b(nervous|awkward|anxious|bad at this)\b/.test(text)) {
    return pickUnique([
      'Hey — no pressure. I am nervous sometimes too.',
      'Same honestly. Just be yourself.',
      'First messages are awkward for everyone.',
      'Low stakes here — you are doing fine.',
    ]);
  }

  if (/\b(looking for|relationship|long term|serious|casual)\b/.test(text)) {
    return pickUnique([
      'Something real but low pressure to start.',
      'Good convo first — rest follows.',
      'Kindness and consistency over perfect timing.',
      'Open to seeing where it goes — you?',
    ]);
  }

  if (text.includes('?')) {
    return pickUnique([
      ...config.replyBank,
      'Good question — what\'s your take?',
      'Hmm. I\'d lean yes on that.',
    ]);
  }

  return pickUnique(config.replyBank);
}

export function shouldUseAiPersonaBrain(profile: DemoReplyContext['profile']): boolean {
  return isAiPersonaProfile(profile);
}
