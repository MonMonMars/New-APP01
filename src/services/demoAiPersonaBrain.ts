import { getAiPersonaConfig, isAiPersonaProfile } from '../data/aiPersonas';
import { DemoReplyContext } from './demoChatBrain';

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

const STYLE_GREETINGS: Record<string, string[]> = {
  warm: ['Hey! So glad you reached out 😊', 'Hi there — this is nice.', 'Hey! I was hoping you\'d message.'],
  chill: ['Hey. Good to hear from you.', 'Hi — no rush, just here.', 'Hey. What\'s on your mind?'],
  witty: ['yooo hey', 'oh we\'re doing this? I\'m in', 'hey hey — talk to me'],
  poetic: ['Hello ✨', 'Hi — lovely to connect.', 'Hey, you have my attention.'],
  flirty: ['Well hello 😏', 'Hey you.', 'Hi — you\'ve got good timing.'],
  nerdy: ['Hey! Okay quick question before we continue—', 'Hi! Fascinating that you messaged.', 'Hey — data point: I\'m glad you did.'],
  bold: ['Yo! Let\'s go.', 'Hey — bring the energy.', 'What\'s up! Ready when you are.'],
  coach: ['Hey — love the initiative.', 'Hi. Clear communication already.', 'Hey! What are we building today?'],
};

const STYLE_DATES: Record<string, string[]> = {
  warm: ['I\'d love that. When works for you?', 'Yes — coffee or a walk sounds perfect.', 'I\'m free this weekend if you are.'],
  chill: ['That could be nice. Low pressure works for me.', 'I\'m open to it. Something quiet?', 'Sure — what feels easy for you?'],
  witty: ['say less I\'m there', 'bold of you to ask and I respect it', 'okay but only if you pick the spot'],
  poetic: ['That sounds like a small beautiful plan.', 'I\'d wander somewhere with you.', 'Yes — let\'s make an evening of it.'],
  flirty: ['Are you asking me out? Because yes.', 'I was hoping you\'d say that.', 'Pick a place — impress me.'],
  nerdy: ['Optimized answer: yes. Send coordinates.', 'I\'ve run the simulations — good idea.', 'Adding that to the shared calendar (metaphorically).'],
  bold: ['Game on. You pick or I pick?', 'I\'m in. Loser buys drinks?', 'Let\'s do it — make it interesting.'],
  coach: ['Strong move. I\'d block time for that.', 'Good ask. What\'s the goal — fun or fancy?', 'Yes — intentional plans are hot.'],
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
    for (let i = 0; i < 5; i += 1) {
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
