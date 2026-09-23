import { DisguisedProfilePost, FeedItem } from '../data/disguiseFeed';
import { translate } from '../i18n';
import { AppLocale, resolveAppLocale } from '../types/locale';
import { buildSectionProfilePool } from './discoveryProfilePool';
import { buildPulseProfilePool, PulseWorldPoolScope } from './pulseWorldPool';
import { resolveSparkSection, ShowMePreference, SparkSection } from '../types/preferences';
import { Profile } from '../types/profile';
import {
  pinFeedProfileLinks,
  stripPulseProfileLinks,
  syncReporterPhotos,
  syncSocialPostProfiles,
} from './buildDisguiseFeed';
import { disguiseDisplayName } from './disguiseProfileFeed';
import { profileIntroCaption } from './profileIntroCaption';
import { clearReporterProfileCache, setPulseProfileMappingGeneration } from './resolveDisguiseProfile';

function hashSlotId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Rotate a static Pulse list so scroll-to-end reload feels like a fresh page. */
export function rotatePulseList<T>(items: readonly T[], generation: number): T[] {
  if (items.length === 0 || generation === 0) {
    return [...items];
  }
  const offset = generation % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

function formatRefreshedTimeAgo(
  index: number,
  generation: number,
  locale: AppLocale,
): string {
  const minutes = ((index + generation * 5) % 58) + 1;
  if (minutes <= 2) {
    return translate(locale, 'time.justNow');
  }
  if (minutes < 60) {
    return translate(locale, 'time.minutesAgo', { n: minutes });
  }
  return translate(locale, 'time.hoursAgo', { n: Math.floor(minutes / 60) });
}

/** Refresh relative timestamps on feed cards after a bottom reload. */
export function freshenPulseFeedTimestamps(
  items: FeedItem[],
  generation: number,
  locale?: AppLocale | null,
): FeedItem[] {
  const resolvedLocale = resolveAppLocale(locale);
  if (generation === 0) {
    return items;
  }

  return items.map((item, index) => {
    const timeAgo = formatRefreshedTimeAgo(index, generation, resolvedLocale);
    if (item.type === 'news' || item.type === 'social' || item.type === 'disguised_profile') {
      return { ...item, timeAgo };
    }
    return item;
  });
}

function buildProfilePool(
  section: SparkSection | string | null | undefined,
  excluded: Set<string>,
  showMe: ShowMePreference,
  poolScope?: PulseWorldPoolScope,
): Profile[] {
  if (poolScope) {
    return buildPulseProfilePool(poolScope, showMe, excluded);
  }
  return buildSectionProfilePool(section, showMe, excluded);
}

function pickProfile(slotKey: string, pool: Profile[], reserved: Set<string>): Profile | undefined {
  const available = pool.filter((profile) => !reserved.has(profile.id));
  if (available.length === 0) {
    return undefined;
  }
  return available[hashSlotId(slotKey) % available.length];
}

function renewDisguisedProfiles(
  items: FeedItem[],
  section: SparkSection | string | null | undefined,
  generation: number,
  showMe: ShowMePreference,
  poolScope?: PulseWorldPoolScope,
): FeedItem[] {
  const pool = buildProfilePool(section, new Set(), showMe, poolScope);
  const reserved = new Set<string>();

  return items.map((item) => {
    if (item.type !== 'disguised_profile' || item.id === 'disguised-user') {
      return item;
    }

    const profile = pickProfile(`${item.id}:${generation}`, pool, reserved);
    if (!profile) {
      return item;
    }

    reserved.add(profile.id);
    const intro = profileIntroCaption(profile);
    const renewed: DisguisedProfilePost = {
      ...item,
      profileId: profile.id,
      name: disguiseDisplayName(profile.name),
      avatarUrl: profile.photos[0],
      photos: profile.photos,
      overlayText: intro,
      summary: item.variant === 'social' ? profile.bio.trim() : item.summary,
    };
    return renewed;
  });
}

/** Reassign every Pulse profile slot — used when the user scrolls to the page end. */
export function renewPulseFeedProfiles(
  items: FeedItem[],
  section?: SparkSection | string | null,
  generation = 1,
  showMe: ShowMePreference = 'everyone',
  poolScope?: PulseWorldPoolScope,
): FeedItem[] {
  clearReporterProfileCache();
  setPulseProfileMappingGeneration(generation);

  const stripped = stripPulseProfileLinks(items);
  const withRotatedCards = renewDisguisedProfiles(stripped, section, generation, showMe, poolScope);
  return syncSocialPostProfiles(
    syncReporterPhotos(
      pinFeedProfileLinks(withRotatedCards, section, showMe, poolScope),
      section,
      showMe,
      poolScope,
    ),
    section,
    showMe,
  );
}

/** Full Pulse page reload — rotate stories, freshen timestamps, renew profile photos. */
export function renewPulseFeedPage(
  items: FeedItem[],
  section?: SparkSection | string | null,
  generation = 1,
  showMe: ShowMePreference = 'everyone',
  poolScope?: PulseWorldPoolScope,
): FeedItem[] {
  const rotated = rotatePulseList(items, generation);
  const freshened = freshenPulseFeedTimestamps(rotated, generation);
  return renewPulseFeedProfiles(freshened, section, generation, showMe, poolScope);
}
