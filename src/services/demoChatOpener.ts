import { Profile } from '../types/profile';

import { GREETING_REPLIES } from './demoChatReplies';

const MATCH_OPENER_TEMPLATES = [
  'Hey! Glad we matched 😊',
  'Hi — your profile stood out.',
  'Hey hey — excited to chat.',
  'Hello! This could be fun.',
  'Hi there — how is your week going?',
];

function pickDeterministic<T>(items: T[], seed: number): T {
  const index = Math.abs(seed) % items.length;
  return items[index];
}

/** Optional first message when a new demo match is created. */
export function buildMatchOpenerMessage(profile: Profile): string | null {
  const trimmed = profile.openingMove?.trim();
  if (trimmed) {
    return trimmed;
  }

  const seed = Number.parseInt(profile.id, 10);
  if (Number.isNaN(seed)) {
    return null;
  }

  // Newer realistic batches (97+) get a deterministic greeting opener ~1/3 of the time.
  if (seed >= 97 && seed % 3 === 0) {
    const pool = [...GREETING_REPLIES, ...MATCH_OPENER_TEMPLATES];
    return pickDeterministic(pool, seed);
  }

  return null;
}
