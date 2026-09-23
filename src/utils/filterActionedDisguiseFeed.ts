import { DisguisedProfilePost, FeedItem, NewsReporter } from '../data/disguiseFeed';
import { buildSectionProfilePool } from './discoveryProfilePool';
import { buildPulseProfilePool, PulseWorldPoolScope } from './pulseWorldPool';
import { ShowMePreference, SparkSection } from '../types/preferences';
import { Profile } from '../types/profile';
import { disguiseDisplayName } from './disguiseProfileFeed';
import { profileIntroCaption } from './profileIntroCaption';
import {
  profileIdFromPostId,
  explicitReporterProfileId,
  syncActionedProfileIds,
} from './resolveDisguiseProfile';

function actionedProfileIds(
  likedIds: Set<string>,
  passedIds: Set<string>,
  superLikedIds: Set<string>,
): Set<string> {
  const ids = new Set<string>();
  likedIds.forEach((id) => ids.add(id));
  passedIds.forEach((id) => ids.add(id));
  superLikedIds.forEach((id) => ids.add(id));
  return ids;
}

function hashSlotId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function reporterProfileId(
  reporter: NewsReporter,
  showMe: ShowMePreference,
  section?: SparkSection | string | null,
  poolScope?: PulseWorldPoolScope,
): string | undefined {
  return explicitReporterProfileId(reporter.id, reporter.profileId, showMe, section, poolScope);
}

function disguisedProfileId(
  item: DisguisedProfilePost,
  showMe: ShowMePreference,
  section?: SparkSection | string | null,
): string | undefined {
  return explicitReporterProfileId(
    item.id,
    item.profileId ?? profileIdFromPostId(item.id),
    showMe,
    section,
  );
}

function buildReplacementPool(
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

function pickReplacementProfile(
  slotId: string,
  pool: Profile[],
  reserved: Set<string>,
  fallbackPool?: Profile[],
  excludeProfileId?: string,
): Profile | undefined {
  const notReserved = (profile: Profile) =>
    !reserved.has(profile.id) && profile.id !== excludeProfileId;

  const available = pool.filter(notReserved);
  if (available.length > 0) {
    return available[hashSlotId(slotId) % available.length];
  }
  const fallback = (fallbackPool ?? pool).filter(notReserved);
  if (fallback.length === 0) {
    return undefined;
  }
  return fallback[hashSlotId(`${slotId}:fallback`) % fallback.length];
}

function profileToReporter(reporter: NewsReporter, profile: Profile): NewsReporter {
  const intro = profileIntroCaption(profile);
  return {
    ...reporter,
    profileId: profile.id,
    name: disguiseDisplayName(profile.name),
    avatarUrl: profile.photos[0],
    photos: profile.photos,
    quote: intro,
  };
}

function profileToDisguisedPost(post: DisguisedProfilePost, profile: Profile): DisguisedProfilePost {
  const intro = profileIntroCaption(profile);
  return {
    ...post,
    profileId: profile.id,
    name: disguiseDisplayName(profile.name),
    avatarUrl: profile.photos[0],
    photos: profile.photos,
    overlayText: intro,
    summary: post.variant === 'social' ? profile.bio.trim() : post.summary,
  };
}

function collectReservedProfileIds(
  items: FeedItem[],
  showMe: ShowMePreference,
  section?: SparkSection | string | null,
  poolScope?: PulseWorldPoolScope,
): Set<string> {
  const reserved = new Set<string>();

  items.forEach((item) => {
    if (item.type === 'disguised_profile') {
      const profileId = disguisedProfileId(item, showMe, section);
      if (profileId) {
        reserved.add(profileId);
      }
      return;
    }

    if (item.type === 'news') {
      item.reporters.forEach((reporter) => {
        const profileId = reporterProfileId(reporter, showMe, section, poolScope);
        if (profileId) {
          reserved.add(profileId);
        }
      });
    }
  });

  return reserved;
}

/** Swap liked/passed/super-liked Pulse profiles with fresh faces instead of leaving empty slots. */
export function filterActionedDisguiseFeed(
  items: FeedItem[],
  likedIds: Set<string>,
  passedIds: Set<string>,
  superLikedIds: Set<string>,
  section?: SparkSection | string | null,
  showMe: ShowMePreference = 'everyone',
  poolScope?: PulseWorldPoolScope,
): FeedItem[] {
  const actioned = actionedProfileIds(likedIds, passedIds, superLikedIds);
  syncActionedProfileIds(actioned);

  if (actioned.size === 0) {
    return items;
  }

  const reserved = collectReservedProfileIds(items, showMe, section, poolScope);
  actioned.forEach((id) => reserved.delete(id));

  const pool = buildReplacementPool(section, actioned, showMe, poolScope);
  const displayFallbackPool = buildReplacementPool(section, new Set(), showMe, poolScope);

  return items.flatMap((item): FeedItem[] => {
    if (item.type === 'disguised_profile') {
      if (item.id === 'disguised-user') {
        return [item];
      }

      const profileId = disguisedProfileId(item, showMe, section);
      if (!profileId || !actioned.has(profileId)) {
        return [item];
      }

      const replacement = pickReplacementProfile(
        item.id,
        pool,
        reserved,
        displayFallbackPool,
        profileId,
      );
      if (!replacement) {
        return [item];
      }

      reserved.add(replacement.id);
      return [profileToDisguisedPost(item, replacement)];
    }

    if (item.type === 'news') {
      let changed = false;
      const reporters = item.reporters.flatMap((reporter) => {
        const profileId = reporterProfileId(reporter, showMe, section, poolScope);
        if (!profileId || !actioned.has(profileId)) {
          return [reporter];
        }

        const replacement = pickReplacementProfile(
          reporter.id,
          pool,
          reserved,
          displayFallbackPool,
          profileId,
        );
        if (!replacement) {
          return [reporter];
        }

        changed = true;
        reserved.add(replacement.id);
        return [profileToReporter(reporter, replacement)];
      });

      if (!changed) {
        return [item];
      }

      return [{ ...item, reporters }];
    }

    return [item];
  });
}
