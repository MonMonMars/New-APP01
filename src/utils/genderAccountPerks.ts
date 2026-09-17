import { FREE_DAILY_LIKE_LIMIT, FREE_DAILY_SPARK_NOTES } from '../types/subscription';
import type { ProfileGender } from '../types/profile';

/** Women get richer free tiers — they're rarer on the platform. */
export const FEMALE_DAILY_LIKE_LIMIT = 25;
export const FEMALE_DAILY_SPARK_NOTES = 3;

export function resolveProfileGender(gender?: ProfileGender | null): ProfileGender {
  return gender ?? 'man';
}

export function isWomanAccount(gender: ProfileGender): boolean {
  return gender === 'woman';
}

export function dailyLikeLimitForGender(gender: ProfileGender | undefined | null, isSparkPlus: boolean): number {
  if (isSparkPlus) {
    return Number.POSITIVE_INFINITY;
  }
  return isWomanAccount(resolveProfileGender(gender)) ? FEMALE_DAILY_LIKE_LIMIT : FREE_DAILY_LIKE_LIMIT;
}

export function dailySparkNoteLimitForGender(gender: ProfileGender | undefined | null, isSparkPlus: boolean): number {
  if (isSparkPlus) {
    return Number.POSITIVE_INFINITY;
  }
  return isWomanAccount(resolveProfileGender(gender)) ? FEMALE_DAILY_SPARK_NOTES : FREE_DAILY_SPARK_NOTES;
}

/** Women can see who liked them without Spark+. */
export function canRevealIncomingLikes(gender: ProfileGender | undefined | null, isSparkPlus: boolean): boolean {
  return isSparkPlus || isWomanAccount(resolveProfileGender(gender));
}

export function usesFemalePulseExperience(gender?: ProfileGender | null): boolean {
  return isWomanAccount(resolveProfileGender(gender));
}
