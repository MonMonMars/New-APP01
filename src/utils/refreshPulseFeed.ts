import { DisguisedProfilePost, FeedItem } from '../data/disguiseFeed';
import { getAllProfiles, getIncomingLikeProfilesForSection } from '../data/profiles';
import { matchesSparkSection, resolveSparkSection, SparkSection } from '../types/preferences';
import { Profile } from '../types/profile';
import { pinFeedProfileLinks, stripPulseProfileLinks, syncReporterPhotos } from './buildDisguiseFeed';
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

function buildProfilePool(
  section: SparkSection | string | null | undefined,
  excluded: Set<string>,
): Profile[] {
  const resolved = resolveSparkSection(section);
  const incoming = getIncomingLikeProfilesForSection(resolved);
  const rest = getAllProfiles().filter((profile) => matchesSparkSection(profile, resolved));
  const merged = [...incoming, ...rest];
  const unique = merged.filter(
    (profile, index, list) => list.findIndex((item) => item.id === profile.id) === index,
  );
  return unique.filter((profile) => !excluded.has(profile.id) && profile.photos.length > 0);
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
): FeedItem[] {
  const pool = buildProfilePool(section, new Set());
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

/** Reassign every Pulse profile slot — used when the user scrolls to the feed end. */
export function renewPulseFeedProfiles(
  items: FeedItem[],
  section?: SparkSection | string | null,
  generation = 1,
): FeedItem[] {
  clearReporterProfileCache();
  setPulseProfileMappingGeneration(generation);

  const stripped = stripPulseProfileLinks(items);
  const withRotatedCards = renewDisguisedProfiles(stripped, section, generation);
  return syncReporterPhotos(pinFeedProfileLinks(withRotatedCards, section), section);
}
