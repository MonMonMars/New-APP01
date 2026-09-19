import { TranslationParams } from '../i18n/types';
import { FREE_DAILY_LIKE_LIMIT, FREE_DAILY_SPARK_NOTES } from '../types/subscription';
import type { ProfileGender } from '../types/profile';

type TranslateFn = (key: string, params?: TranslationParams) => string;

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

/** Women can see profile viewers without Spark+. */
export function canRevealProfileViews(gender: ProfileGender | undefined | null, isSparkPlus: boolean): boolean {
  return isSparkPlus || isWomanAccount(resolveProfileGender(gender));
}

export type FreeTierComparisonRow = {
  feature: string;
  free: string | boolean;
  plus: string | boolean;
};

export function freeTierComparisonRows(
  gender: ProfileGender | undefined | null,
  t: TranslateFn,
): FreeTierComparisonRow[] {
  const woman = usesFemalePulseExperience(gender);
  return [
    {
      feature: t('sparkPlusComparison.dailyLikes'),
      free: woman ? String(FEMALE_DAILY_LIKE_LIMIT) : String(FREE_DAILY_LIKE_LIMIT),
      plus: t('sparkPlusComparison.unlimited'),
    },
    { feature: t('sparkPlusComparison.seeWhoLikesYou'), free: woman, plus: true },
    { feature: t('sparkPlusComparison.seeWhoViewedYou'), free: woman, plus: true },
    { feature: t('sparkPlusComparison.rewindPasses'), free: false, plus: true },
    {
      feature: t('sparkPlusComparison.sparkNotes'),
      free: woman
        ? t('sparkPlusComparison.perDay', { count: FEMALE_DAILY_SPARK_NOTES })
        : t('sparkPlusComparison.perDay', { count: FREE_DAILY_SPARK_NOTES }),
      plus: t('sparkPlusComparison.unlimited'),
    },
    {
      feature: t('sparkPlusComparison.boost'),
      free: false,
      plus: t('sparkPlusComparison.perWeek', { count: 1 }),
    },
    { feature: t('sparkPlusComparison.advancedFilters'), free: false, plus: true },
    { feature: t('sparkPlusComparison.readReceipts'), free: false, plus: true },
    { feature: t('sparkPlusComparison.passportMode'), free: false, plus: true },
  ];
}

export function sparkPlusFeatureDescriptions(gender?: ProfileGender | null): Array<{
  icon: string;
  title: string;
  description: string;
}> {
  const woman = usesFemalePulseExperience(gender);
  return [
    {
      icon: 'heart',
      title: 'See who likes you',
      description: woman
        ? 'You already see incoming likes on the free tier — Spark+ adds unlimited likes and rewinds.'
        : 'Skip the guesswork — match instantly with people who already liked you.',
    },
    {
      icon: 'infinite',
      title: 'Unlimited likes',
      description: woman
        ? 'Go beyond 25 free likes per day with no cap.'
        : 'No daily cap. Like as many profiles as you want.',
    },
    {
      icon: 'flash',
      title: '1 free Boost / week',
      description: 'Be a top profile in your area for 30 minutes.',
    },
    {
      icon: 'refresh',
      title: 'Unlimited rewinds',
      description: 'Undo a pass if you changed your mind.',
    },
    {
      icon: 'options',
      title: 'Advanced filters',
      description: 'Filter by intent, interests, and more.',
    },
    {
      icon: 'chatbubble-ellipses',
      title: 'Spark Notes',
      description: woman
        ? 'Send a message before you match — 3/day free, unlimited on Spark+.'
        : 'Send one message before you match (1/day free).',
    },
  ];
}
