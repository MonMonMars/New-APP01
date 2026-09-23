import { NewsReporter } from '../data/disguiseFeed';
import { reporterDemoProfileId } from '../data/disguiseReporterProfileLinks';
import { getProfileById } from '../data/profiles';
import { matchesSparkSection, resolveSparkSection, ShowMePreference, SparkSection } from '../types/preferences';
import { Profile } from '../types/profile';
import { buildSectionProfilePool } from './discoveryProfilePool';
import { buildPulseProfilePool, PulseWorldPoolScope } from './pulseWorldPool';
import { isDiscoverableDemoProfile, matchesShowMePreference } from './showMeFilter';

const reporterProfileCache = new Map<string, string>();
/** Feed slot → profile currently shown after a like/pass swap (reporter id or disguised card id). */
const pulseSlotDisplayProfile = new Map<string, string>();
const actionedProfileIds = new Set<string>();
let pulseProfileMappingGeneration = 0;

export function clearReporterProfileCache(): void {
  reporterProfileCache.clear();
  pulseSlotDisplayProfile.clear();
}

export function getPulseSlotDisplayProfile(slotKey: string): string | undefined {
  return pulseSlotDisplayProfile.get(slotKey);
}

export function setPulseSlotDisplayProfile(slotKey: string, profileId: string | undefined): void {
  if (!profileId) {
    pulseSlotDisplayProfile.delete(slotKey);
    return;
  }
  pulseSlotDisplayProfile.set(slotKey, profileId);
}

export function clearPulseSlotDisplayProfiles(): void {
  pulseSlotDisplayProfile.clear();
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

/** Stable reporter slot id for social posts (matches buildSocialReporter). */
export function pulseSocialPostReporterId(postId: string): string {
  return `social-${postId}`;
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
/** Reporter id → demo profile only when explicitly mapped (not hash-assigned). */
function profileEligibleForShowMe(profileId: string, showMe: ShowMePreference): boolean {
  const profile = getProfileById(profileId);
  if (!profile) {
    return false;
  }
  if (!isDiscoverableDemoProfile(profile)) {
    return false;
  }
  return matchesShowMePreference(profile, showMe);
}

export function explicitReporterProfileId(
  reporterId: string,
  profileId?: string,
  showMe: ShowMePreference = 'everyone',
  section?: SparkSection | string | null,
  poolScope?: PulseWorldPoolScope | null,
): string | undefined {
  if (profileId && profileEligibleForShowMe(profileId, showMe)) {
    return profileId;
  }
  const explicit = resolveDisguiseProfileId(reporterId);
  if (explicit && profileEligibleForShowMe(explicit, showMe)) {
    return explicit;
  }
  return mappedProfileIdForReporter(reporterId, section, showMe, poolScope);
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

  const explicitReporter = reporterDemoProfileId(reporterId);
  if (explicitReporter) {
    return explicitReporter;
  }

  const liveReporter = reporterId.match(/^live-rep-(.+)$/);
  if (liveReporter) {
    return liveReporter[1];
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

function poolScopeKey(scope?: PulseWorldPoolScope | null): string {
  if (!scope) {
    return '';
  }
  const spark = scope.pulseDisplaySpark !== false ? '1' : '0';
  const ember = scope.pulseDisplayEmber ? '1' : '0';
  return `:ps${spark}pe${ember}`;
}

function cacheKey(
  reporterId: string,
  section: SparkSection,
  showMe: ShowMePreference,
  poolScope?: PulseWorldPoolScope | null,
): string {
  return `${section}:${showMe}${poolScopeKey(poolScope)}:${reporterId}`;
}

/** Stable map from disguise commenter / social avatar ids → dating profile ids in the active world. */
/** Stable reporter → profile mapping for Pulse feed links (survives likes/passes). */
export function pinnedReporterProfileId(
  reporterId: string,
  section?: SparkSection | string | null,
  showMe: ShowMePreference = 'everyone',
): string | undefined {
  return mappedProfileIdForReporter(reporterId, section, showMe);
}

function mappedProfileIdForReporter(
  reporterId: string,
  section?: SparkSection | string | null,
  showMe: ShowMePreference = 'everyone',
  poolScope?: PulseWorldPoolScope | null,
): string | undefined {
  const resolvedSection = resolveSparkSection(section);
  const key = cacheKey(reporterId, resolvedSection, showMe, poolScope);
  const cached = reporterProfileCache.get(key);
  if (cached && !actionedProfileIds.has(cached) && profileEligibleForShowMe(cached, showMe)) {
    return cached;
  }
  if (cached) {
    reporterProfileCache.delete(key);
  }

  const availablePool = poolScope
    ? buildPulseProfilePool(poolScope, showMe, actionedProfileIds)
    : buildSectionProfilePool(resolvedSection, showMe, actionedProfileIds);
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
  const id = profileId ?? resolveDisguiseProfileId(reporterId);
  if (!id) {
    return null;
  }

  return resolveExplicitDatingProfile(id, section);
}

/** Resolve a disguised-profile feed card to a dating profile (honors show-me + slot remapping). */
export function resolveDisguisedProfilePost(
  post: { id: string; profileId?: string },
  section?: SparkSection | string | null,
  showMe: ShowMePreference = 'everyone',
): Profile | null {
  const profileId = explicitReporterProfileId(
    post.id,
    post.profileId ?? profileIdFromPostId(post.id),
    showMe,
    section,
  );
  return resolveExplicitDatingProfile(profileId, section, showMe);
}

/** Resolve a woven dating profile id for the active Spark/Ember section. */
export function resolveExplicitDatingProfile(
  profileId: string | undefined,
  section?: SparkSection | string | null,
  showMe: ShowMePreference = 'everyone',
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
  if (!isDiscoverableDemoProfile(profile)) {
    return null;
  }
  if (!matchesShowMePreference(profile, showMe)) {
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

  const profileId = reporter.profileId ?? resolveDisguiseProfileId(reporter.id);

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
