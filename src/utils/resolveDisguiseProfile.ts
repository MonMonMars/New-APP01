import { NewsReporter } from '../data/disguiseFeed';
import { getAllProfiles, getProfileById, incomingLikeProfiles } from '../data/profiles';
import { Profile } from '../types/profile';

const reporterProfileCache = new Map<string, string>();

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
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Stable map from Pulse commenter / social avatar ids → real Spark profile ids. */
function mappedProfileIdForReporter(reporterId: string): string | undefined {
  const cached = reporterProfileCache.get(reporterId);
  if (cached) {
    return cached;
  }

  const explicit = resolveDisguiseProfileId(reporterId);
  if (explicit) {
    reporterProfileCache.set(reporterId, explicit);
    return explicit;
  }

  const pool = [...incomingLikeProfiles, ...getAllProfiles()];
  const uniquePool = pool.filter(
    (profile, index, list) => list.findIndex((item) => item.id === profile.id) === index,
  );
  if (uniquePool.length === 0) {
    return undefined;
  }

  const picked = uniquePool[hashReporterId(reporterId) % uniquePool.length];
  reporterProfileCache.set(reporterId, picked.id);
  return picked.id;
}

export function resolveDisguiseProfile(reporterId: string, profileId?: string): Profile | null {
  const id = profileId ?? resolveDisguiseProfileId(reporterId) ?? mappedProfileIdForReporter(reporterId);
  if (!id) {
    return null;
  }

  return getProfileById(id) ?? null;
}

/**
 * Resolve a Pulse / disguise persona to a real Spark profile for like, unlike, pass, and match.
 * Returns null only for the user's own disguised ad slot.
 */
export function resolveReporterSparkProfile(reporter: NewsReporter): Profile | null {
  if (reporter.id === 'disguised-user') {
    return null;
  }

  const profileId =
    reporter.profileId ??
    resolveDisguiseProfileId(reporter.id) ??
    mappedProfileIdForReporter(reporter.id);

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
    bio: reporter.quote.trim() ? reporter.quote : base.bio,
  };
}
