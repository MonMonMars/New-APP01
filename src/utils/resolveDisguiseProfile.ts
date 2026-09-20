import { NewsReporter } from '../data/disguiseFeed';
import { getAllProfiles, getIncomingLikeProfilesForSection, getProfileById } from '../data/profiles';
import { matchesSparkSection, resolveSparkSection, SparkSection } from '../types/preferences';
import { Profile } from '../types/profile';

const reporterProfileCache = new Map<string, string>();
const actionedProfileIds = new Set<string>();
let pulseProfileMappingGeneration = 0;

export function clearReporterProfileCache(): void {
  reporterProfileCache.clear();
}

export function setPulseProfileMappingGeneration(generation: number): void {
  pulseProfileMappingGeneration = generation;
}

export function getPulseProfileMappingGeneration(): number {
  return pulseProfileMappingGeneration;
}

/** Keep social / activity reporter remaps aligned with Pulse feed swaps. */
export function syncActionedProfileIds(ids: Set<string>): void {
  actionedProfileIds.clear();
  ids.forEach((id) => actionedProfileIds.add(id));

  for (const [key, profileId] of reporterProfileCache.entries()) {
    if (actionedProfileIds.has(profileId)) {
      reporterProfileCache.delete(key);
    }
  }
}

export function profileIdFromPostId(postId: string): string | undefined {
  if (postId === 'disguised-user') {
    return undefined;
  }
  if (postId.startsWith('disguised-profile-')) {
    return postId.replace('disguised-profile-', '');
  }
  if (postId.startsWith('disguised-')) {
    return postId.replace('disguised-', '');
  }
  return undefined;
}

/** Map disguise reporter / card ids back to a dating profile when woven from seed data. */
/** Profile link only when seed data or woven card ids provide one — never hash-mapped random names. */
export function explicitReporterProfileId(reporter: {
  id: string;
  profileId?: string;
}): string | undefined {
  return reporter.profileId ?? resolveDisguiseProfileId(reporter.id);
}

export function resolveDisguiseProfileId(reporterId: string): string | undefined {
  if (reporterId === 'disguised-user') {
    return undefined;
  }

  const disguisedProfile = reporterId.match(/^disguised-profile-(.+)$/);
  if (disguisedProfile) {
    return disguisedProfile[1];
  }

  const disguised = reporterId.match(/^disguised-(.+)$/);
  if (disguised) {
    return disguised[1];
  }

  return undefined;
}

function hashReporterId(id: string): number {
  let hash = pulseProfileMappingGeneration * 9973;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function cacheKey(reporterId: string, section: SparkSection): string {
  return `${section}:${reporterId}`;
}

/** Stable map from disguise commenter / social avatar ids → dating profile ids in the active world. */
/** Stable reporter → profile mapping for Pulse feed links (survives likes/passes). */
export function pinnedReporterProfileId(
  reporterId: string,
  section?: SparkSection | string | null,
): string | undefined {
  return mappedProfileIdForReporter(reporterId, section);
}

function mappedProfileIdForReporter(
  reporterId: string,
  section?: SparkSection | string | null,
): string | undefined {
  const resolvedSection = resolveSparkSection(section);
  const key = cacheKey(reporterId, resolvedSection);
  const cached = reporterProfileCache.get(key);
  if (cached && !actionedProfileIds.has(cached)) {
    return cached;
  }
  if (cached) {
    reporterProfileCache.delete(key);
  }

  const explicit = resolveDisguiseProfileId(reporterId);
  if (explicit) {
    reporterProfileCache.set(key, explicit);
    return explicit;
  }

  const incoming = getIncomingLikeProfilesForSection(resolvedSection);
  const rest = getAllProfiles().filter((profile) => matchesSparkSection(profile, resolvedSection));
  const pool = [...incoming, ...rest];
  const uniquePool = pool.filter(
    (profile, index, list) => list.findIndex((item) => item.id === profile.id) === index,
  );
  const availablePool = uniquePool.filter((profile) => !actionedProfileIds.has(profile.id));
  if (availablePool.length === 0) {
    return undefined;
  }

  const picked = availablePool[hashReporterId(reporterId) % availablePool.length];
  reporterProfileCache.set(key, picked.id);
  return picked.id;
}

export function resolveDisguiseProfile(
  reporterId: string,
  profileId?: string,
  section?: SparkSection | string | null,
): Profile | null {
  const id =
    profileId ??
    resolveDisguiseProfileId(reporterId) ??
    mappedProfileIdForReporter(reporterId, section);
  if (!id) {
    return null;
  }

  return getProfileById(id) ?? null;
}

/** Only link Pulse UI to dating profiles when an explicit profile id is provided. */
export function resolveExplicitDatingProfile(
  profileId: string | undefined,
  section?: SparkSection | string | null,
): Profile | null {
  if (!profileId) {
    return null;
  }
  const profile = getProfileById(profileId);
  if (!profile) {
    return null;
  }
  if (!matchesSparkSection(profile, resolveSparkSection(section))) {
    return null;
  }
  return profile;
}

/**
 * Resolve a Pulse / Harbor persona to a real dating profile for like, unlike, pass, and match.
 * Returns null only for the user's own disguised ad slot.
 */
export function resolveReporterSparkProfile(
  reporter: NewsReporter,
  section?: SparkSection | string | null,
): Profile | null {
  if (reporter.id === 'disguised-user') {
    return null;
  }

  const profileId =
    reporter.profileId ??
    resolveDisguiseProfileId(reporter.id) ??
    mappedProfileIdForReporter(reporter.id, section);

  if (!profileId) {
    return null;
  }

  const base = getProfileById(profileId);
  if (!base) {
    return null;
  }

  return {
    ...base,
    photos: reporter.photos.length > 0 ? reporter.photos : base.photos,
  };
}
