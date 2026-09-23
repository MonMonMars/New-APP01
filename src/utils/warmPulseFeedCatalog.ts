import type { FeedItem } from '../data/disguiseFeed';
import type { DisguiseAdCreative } from '../types/disguise';
import type { AppLocale } from '../types/locale';
import { resolveAppLocale } from '../types/locale';
import type { ShowMePreference } from '../types/preferences';
import type { UserProfile } from '../types/profile';
import { buildDisguiseFeed } from './buildDisguiseFeed';

export type PulseFeedPrime = {
  signature: string;
  base: FeedItem[];
};

/** Consumed by useDisguiseFeedItems on first Home paint. */
export let pulseFeedPrime: PulseFeedPrime | null = null;

export function disguiseFeedPrimeSignature(input: {
  userId: string;
  gender: string | undefined;
  pulseSection: string;
  creativeKey: string;
  showMe: ShowMePreference;
  refreshGeneration: number;
  liveNewsRevision: number;
}): string {
  return `${input.pulseSection}|${input.userId}|${input.gender ?? ''}|${input.showMe}|${input.creativeKey}|refresh:${input.refreshGeneration}|news:${input.liveNewsRevision}`;
}

/** Build Pulse feed before Home mounts — first paint shows cards immediately. */
export function warmPulseFeedCatalog(input: {
  user: UserProfile;
  userId: string;
  disguiseAdCreative: DisguiseAdCreative | null;
  pulseSection: string;
  appLocale: AppLocale | undefined;
  showMe: ShowMePreference;
  liveNewsRevision: number;
  creativeKey: string;
}): void {
  const locale = resolveAppLocale(input.appLocale);
  const signature = disguiseFeedPrimeSignature({
    userId: input.userId,
    gender: input.user.gender,
    pulseSection: input.pulseSection,
    creativeKey: input.creativeKey,
    showMe: input.showMe,
    refreshGeneration: 0,
    liveNewsRevision: input.liveNewsRevision,
  });
  if (pulseFeedPrime?.signature === signature) {
    return;
  }
  const base = buildDisguiseFeed(
    input.user,
    input.disguiseAdCreative,
    input.pulseSection,
    0,
    locale,
    input.showMe,
  );
  pulseFeedPrime = { signature, base };
}
