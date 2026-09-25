import type { UserProfile } from '../types/profile';
import type { Profile } from '../types/profile';
import {
  type DiscoverFilter,
  type DiscoveryPreferences,
  matchesSparkSection,
  resolveSparkSection,
} from '../types/preferences';
import { matchesPassportCity } from './passportFilter';
import { isDiscoverableDemoProfile, matchesShowMePreference } from './showMeFilter';

function matchesDiscoverFilters(profile: Profile, filters: DiscoverFilter[]): boolean {
  if (filters.length === 0) {
    return true;
  }
  return filters.every((filter) => {
    switch (filter) {
      case 'active_today':
        return profile.activeToday === true;
      case 'new_here':
        return profile.isNew === true;
      case 'has_bio':
        return profile.bio.trim().length > 0;
      case 'verified':
        return (
          (profile.photoVerified === true && profile.personVerified === true) ||
          profile.verified === true
        );
      default: {
        const _exhaustive: never = filter;
        return _exhaustive;
      }
    }
  });
}

function matchesAdvancedFilters(
  profile: Profile,
  user: UserProfile,
  advanced: DiscoveryPreferences['advancedFilters'],
  isSparkPlus: boolean,
): boolean {
  if (!advanced) {
    return true;
  }

  const emberStatuses = advanced.emberStatuses ?? [];
  if (emberStatuses.length > 0) {
    const status = profile.relationshipStatus;
    if (status !== 'married' && status !== 'divorced') {
      return false;
    }
    if (!emberStatuses.includes(status)) {
      return false;
    }
  }

  const emberDiscretion = advanced.emberDiscretion ?? [];
  if (emberDiscretion.length > 0) {
    if (!profile.emberDiscretion || !emberDiscretion.includes(profile.emberDiscretion)) {
      return false;
    }
  }

  const emberSeeking = advanced.emberSeeking ?? [];
  if (emberSeeking.length > 0) {
    if (!profile.emberSeeking || !emberSeeking.includes(profile.emberSeeking)) {
      return false;
    }
  }

  if (!isSparkPlus) {
    return true;
  }

  const intentFilter = advanced.intents ?? [];
  if (intentFilter.length > 0) {
    if (!profile.intent || !intentFilter.includes(profile.intent)) {
      return false;
    }
  }

  if (advanced.sharedInterestsOnly) {
    const userInterests = new Set(user.interests.map((interest) => interest.toLowerCase()));
    const hasShared = profile.interests.some((interest) =>
      userInterests.has(interest.toLowerCase()),
    );
    if (!hasShared) {
      return false;
    }
  }

  return true;
}

export type DiscoverProfileFilterOptions = {
  /** Map search uses the worldwide demo pool (no home-radius / passport city gate). */
  forMapSearch?: boolean;
};

/** Same rules as the main discover deck — show me, age range, section, filters, etc. */
export function filterDiscoverProfiles(
  profiles: Profile[],
  preferences: DiscoveryPreferences,
  excludedIds: Set<string>,
  user: UserProfile,
  isSparkPlus: boolean,
  locationSharing = true,
  options: DiscoverProfileFilterOptions = {},
): Profile[] {
  const filters = preferences.discoverFilters ?? [];
  const forMapSearch = options.forMapSearch ?? false;
  const hasMapSearch =
    preferences.mapSearchLat != null && preferences.mapSearchLng != null;
  const maxDistance =
    preferences.travelMode && preferences.passportCity
      ? 9999
      : locationSharing
        ? preferences.maxDistanceMiles
        : 9999;
  const section = resolveSparkSection(preferences.sparkSection);
  const skipHomeDistance = forMapSearch || hasMapSearch;
  const skipPassportGate = forMapSearch || hasMapSearch;
  return profiles.filter(
    (profile) =>
      !excludedIds.has(profile.id) &&
      (skipHomeDistance || profile.distanceMiles <= maxDistance) &&
      profile.age >= preferences.minAge &&
      profile.age <= preferences.maxAge &&
      isDiscoverableDemoProfile(profile) &&
      matchesShowMePreference(profile, preferences.showMe) &&
      matchesDiscoverFilters(profile, filters) &&
      matchesAdvancedFilters(profile, user, preferences.advancedFilters, isSparkPlus) &&
      matchesSparkSection(profile, section) &&
      (skipPassportGate ||
        !preferences.travelMode ||
        !preferences.passportCity ||
        matchesPassportCity(profile.city, preferences.passportCity)),
  );
}
