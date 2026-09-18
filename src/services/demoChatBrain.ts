import { Message } from '../types/match';
import { Profile } from '../types/profile';

import {
  AGREE_REPLIES,
  BUSY_REPLIES,
  CHECKIN_REPLIES,
  CITY_REPLIES,
  COMPLIMENT_BACK_REPLIES,
  CONVERSATION_STARTERS,
  DATE_REPLIES,
  EMOJI_REPLIES,
  FALLBACK_REPLIES,
  FLIRT_REPLIES,
  FOOD_ORDER_REPLIES,
  GOODBYE_REPLIES,
  GREETING_REPLIES,
  GYM_REPLIES,
  INTEREST_REPLIES,
  JOB_KEYWORD_REPLIES,
  LAUGH_REPLIES,
  LATE_NIGHT_REPLIES,
  MATCH_REPLIES,
  MISS_YOU_REPLIES,
  MOVIE_REPLIES,
  MUSIC_GENERIC_REPLIES,
  NERVOUS_REPLIES,
  OPINION_REPLIES,
  PET_REPLIES,
  PHOTO_REPLIES,
  PLAYFUL_DEBATE_REPLIES,
  QUESTION_REPLIES,
  RELATIONSHIP_REPLIES,
  SHORT_ACK_REPLIES,
  SORRY_REPLIES,
  STORY_PROMPT_REPLIES,
  THANKS_REPLIES,
  TRAVEL_GENERIC_REPLIES,
  VOICE_NOTE_REPLIES,
  WEATHER_REPLIES,
  WEEKEND_REPLIES,
  WORK_STRESS_REPLIES,
} from './demoChatReplies';

export type DemoReplyContext = {
  profile: Profile;
  userMessage: string;
  recentMessages: Message[];
  userName: string;
};

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
    const parts = key.split(/[\s/&]+/).filter(Boolean);
    const bucket =
      INTEREST_REPLIES[key] ??
      INTEREST_REPLIES[parts[0]] ??
      parts.map((part) => INTEREST_REPLIES[part]).find(Boolean);

    if (bucket && (text.includes(key) || parts.some((part) => part.length > 2 && text.includes(part)))) {
      return pick(bucket);
    }
  }

  for (const [keyword, bucket] of Object.entries(INTEREST_REPLIES)) {
    if (keyword.length > 3 && text.includes(keyword)) {
      return pick(bucket);
    }
  }

  return null;
}

function jobReply(profile: Profile): string | null {
  const job = profile.job?.toLowerCase() ?? '';
  if (!job) {
    return null;
  }

  for (const [keyword, replies] of Object.entries(JOB_KEYWORD_REPLIES)) {
    if (job.includes(keyword)) {
      return pick(replies);
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
    `My profile said "${prompt.answer}" — still accurate.`,
    `If you read my prompt: ${prompt.answer}`,
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
    `You asked "${profile.openingMove}" — fair. Here is my answer: yes.`,
    `Still thinking about your opener. Good one.`,
  ]);
}

function cityPersonalReply(profile: Profile): string | null {
  const cityLabel = profile.city?.split(',')[0]?.trim();
  if (!cityLabel) {
    return null;
  }
  return pick([
    `${cityLabel} has some great spots — I can share recs.`,
    `I am usually around ${cityLabel} if that helps.`,
    `There is a hidden gem in ${cityLabel} I swear by.`,
    `${cityLabel} dates are underrated honestly.`,
  ]);
}

function bioReply(profile: Profile, text: string): string | null {
  const bio = profile.bio.toLowerCase();
  const bioWords = bio.split(/\s+/).filter((w) => w.length > 5);
  const overlap = bioWords.filter((word) => text.includes(word.replace(/[^\w]/g, '')));
  if (overlap.length === 0) {
    return null;
  }
  return pick([
    'You read my bio — I respect the homework.',
    'Caught that reference from my profile 😊',
    'Yes exactly — you get it.',
    'That is literally my whole personality.',
    'Bio accuracy check: passed.',
  ]);
}

function contextualReply(ctx: DemoReplyContext): string {
  const text = normalize(ctx.userMessage);
  const name = ctx.profile.name;

  if (!text || text === 'photo' || text.includes('sent a photo')) {
    return pick(PHOTO_REPLIES);
  }

  if (text.includes('voice note') || text.includes('🎤')) {
    return pick(VOICE_NOTE_REPLIES);
  }

  if (text.includes('check in') || text.includes('checked in') || text.includes('home safe')) {
    return pick(CHECKIN_REPLIES);
  }

  if (matchesAny(text, ['busy', 'work', 'meeting', 'later', 'brb', 'gtg', 'gotta go', 'one sec'])) {
    return pick(BUSY_REPLIES);
  }

  if (matchesAny(text, ['nervous', 'awkward', 'first message', 'bad at this', 'not good at', 'anxious'])) {
    return pick(NERVOUS_REPLIES);
  }

  if (matchesAny(text, ['matched', 'match', 'swiped', 'glad we', 'happy we matched'])) {
    return pick(MATCH_REPLIES);
  }

  if (matchesAny(text, ['hot take', 'unpopular', 'controversial', 'opinion', 'debate'])) {
    return pick(OPINION_REPLIES);
  }

  if (matchesAny(text, ['hi', 'hey', 'hello', 'sup', 'yo', 'hiya', 'howdy', 'heya'])) {
    return pick(GREETING_REPLIES);
  }

  const dayKeywords = ['weekend', 'friday', 'saturday', 'sunday'];
  const dateIntentKeywords = [
    'coffee',
    'drink',
    'dinner',
    'date',
    'tonight',
    'tomorrow',
    'meet',
    'grab',
    'hang',
    'free',
    'available',
  ];

  if (
    matchesAny(text, dateIntentKeywords) ||
    (matchesAny(text, dayKeywords) && matchesAny(text, [...dateIntentKeywords, 'plans']))
  ) {
    return pick(DATE_REPLIES);
  }

  if (matchesAny(text, dayKeywords) || text.includes('plans this week')) {
    return pick(WEEKEND_REPLIES);
  }

  if (
    matchesAny(text, [
      'cute',
      'hot',
      'beautiful',
      'handsome',
      'pretty',
      'gorgeous',
      'stunning',
      'attractive',
      'fine',
      'sexy',
    ])
  ) {
    return pick(FLIRT_REPLIES);
  }

  if (text.includes('?') || matchesAny(text, ['what', 'how', 'why', 'when', 'where', 'who', 'which'])) {
    const interest = interestReply(ctx.profile, text);
    if (interest) {
      return interest;
    }
    const fromJob = jobReply(ctx.profile);
    if (fromJob && Math.random() < 0.4) {
      return fromJob;
    }
    return pick(QUESTION_REPLIES);
  }

  if (matchesAny(text, ['lol', 'haha', 'lmao', 'funny', 'joke', 'dying', 'dead'])) {
    return pick(LAUGH_REPLIES);
  }

  if (matchesAny(text, ['thanks', 'thank you', 'appreciate', 'ty', 'thx'])) {
    return pick(THANKS_REPLIES);
  }

  if (matchesAny(text, ['bye', 'goodnight', 'gn', 'talk later', 'ttyl', 'good night', 'cya', 'see you'])) {
    return pick(GOODBYE_REPLIES);
  }

  if (matchesAny(text, ['sorry', 'my bad', 'apologize', 'didnt mean', "didn't mean"])) {
    return pick(SORRY_REPLIES);
  }

  if (matchesAny(text, ['miss you', 'missed you', 'where have you been', 'been a while', 'long time'])) {
    return pick(MISS_YOU_REPLIES);
  }

  if (
    matchesAny(text, [
      'story',
      'happened',
      'crazy day',
      'wild',
      'you wont believe',
      "you won't believe",
      'guess what',
      'so basically',
    ])
  ) {
    return pick(STORY_PROMPT_REPLIES);
  }

  if (matchesAny(text, ['you too', 'likewise', 'same to you', 'right back', 'back at you'])) {
    return pick(COMPLIMENT_BACK_REPLIES);
  }

  if (matchesAny(text, ['late', 'cant sleep', "can't sleep", 'insomnia', '2am', '3am', 'up late'])) {
    return pick(LATE_NIGHT_REPLIES);
  }

  if (matchesAny(text, ['city', 'neighborhood', 'borough', 'area', 'live near', 'where do you live'])) {
    const personalCity = cityPersonalReply(ctx.profile);
    if (personalCity && Math.random() < 0.45) {
      return personalCity;
    }
    return pick(CITY_REPLIES);
  }

  if (matchesAny(text, ['hungry', 'food', 'eat', 'lunch', 'breakfast', 'takeout', 'restaurant', 'order'])) {
    const foodInterest = interestReply(ctx.profile, text);
    if (foodInterest) {
      return foodInterest;
    }
    return pick(FOOD_ORDER_REPLIES);
  }

  if (matchesAny(text, ['song', 'playlist', 'spotify', 'album', 'concert', 'band'])) {
    const musicInterest = interestReply(ctx.profile, text);
    if (musicInterest) {
      return musicInterest;
    }
    return pick(MUSIC_GENERIC_REPLIES);
  }

  if (matchesAny(text, ['trip', 'flight', 'vacation', 'abroad', 'passport', 'airport'])) {
    const travelInterest = interestReply(ctx.profile, text);
    if (travelInterest) {
      return travelInterest;
    }
    return pick(TRAVEL_GENERIC_REPLIES);
  }

  if (
    matchesAny(text, [
      'looking for',
      'relationship',
      'long term',
      'short term',
      'situationship',
      'what do you want',
      'serious',
      'casual',
    ])
  ) {
    return pick(RELATIONSHIP_REPLIES);
  }

  if (matchesAny(text, ['weather', 'rain', 'snow', 'cold', 'hot out', 'sunny', 'forecast'])) {
    return pick(WEATHER_REPLIES);
  }

  if (matchesAny(text, ['rough day', 'stressful', 'exhausted', 'burnt out', 'long day', 'tired from work'])) {
    return pick(WORK_STRESS_REPLIES);
  }

  if (matchesAny(text, ['gym', 'workout', 'lift', 'run', 'exercise', 'training'])) {
    const fitnessInterest = interestReply(ctx.profile, text);
    if (fitnessInterest) {
      return fitnessInterest;
    }
    return pick(GYM_REPLIES);
  }

  if (matchesAny(text, ['agree', 'same', 'totally', 'exactly', 'yep', 'yeah', 'for sure', '100'])) {
    return pick(AGREE_REPLIES);
  }

  if (matchesAny(text, ['disagree', 'nah', 'wrong', 'debate', 'fight me', 'controversial'])) {
    return pick(PLAYFUL_DEBATE_REPLIES);
  }

  if (/^[\s\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u.test(ctx.userMessage.trim())) {
    return pick(EMOJI_REPLIES);
  }

  if (text.length <= 12 && matchesAny(text, ['bet', 'valid', 'fair', 'true', 'real', 'copy', 'heard', 'mood'])) {
    return pick(SHORT_ACK_REPLIES);
  }

  if (matchesAny(text, ['movie', 'film', 'netflix', 'show', 'series', 'watch', 'binge'])) {
    return pick(MOVIE_REPLIES);
  }

  if (matchesAny(text, ['dog', 'cat', 'pet', 'puppy', 'kitten'])) {
    return pick(PET_REPLIES);
  }

  const fromBio = bioReply(ctx.profile, text);
  if (fromBio) {
    return fromBio;
  }

  const fromInterest = interestReply(ctx.profile, text);
  if (fromInterest) {
    return fromInterest;
  }

  const fromJob = jobReply(ctx.profile);
  if (fromJob && Math.random() < 0.3) {
    return fromJob;
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

  if (Math.random() < 0.15 && ctx.recentMessages.length >= 4) {
    return pick(CONVERSATION_STARTERS);
  }

  const personalized = pick(FALLBACK_REPLIES);
  if (Math.random() < 0.2 && ctx.userName.trim()) {
    return `${personalized} — ${ctx.userName.trim()}`;
  }
  if (Math.random() < 0.25) {
    return `${personalized} — ${name}`;
  }
  return personalized;
}

/** Fast local reply engine — always available, no network. */
export function generateLocalDemoReply(ctx: DemoReplyContext): string {
  const avoidRepeat = new Set(
    ctx.recentMessages.filter((m) => !m.isMine).map((m) => normalize(m.text)),
  );

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = contextualReply(ctx);
    if (!avoidRepeat.has(normalize(candidate))) {
      return candidate;
    }
  }

  return contextualReply(ctx);
}
