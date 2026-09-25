import type { UserProfile } from '../types/profile';
import type { Profile } from '../types/profile';
import type { DiscoveryPreferences } from '../types/preferences';
import { filterDiscoverProfiles } from './discoverProfileFilter';
import {
  filterProfilesInRadius,
  relocateProfilesForMapSearch,
  sortProfilesByDistance,
  type GeoPoint,
} from './geoMap';

export type MapDiscoverySuitability = {
  preferences: DiscoveryPreferences;
  user: UserProfile;
  isSparkPlus: boolean;
  excludedIds: Set<string>;
  locationSharing?: boolean;
};

export type MapAreaPeopleOptions = {
  nameQuery?: string;
  /**
   * Re-apply discovery prefs (show me, age, filters, section) before radius.
   * Use with the section catalog pool, not an already-filtered pool.
   */
  suitability?: MapDiscoverySuitability;
};

/**
 * Suitable candidates within the selected radius chip (not the map viewport).
 * Same scatter as `searchMapAt` / discover deck, optionally narrowed by name.
 */
export function profilesForMapViewport(
  pool: Profile[],
  center: GeoPoint,
  radiusMiles: number,
): Profile[] {
  const relocated = relocateProfilesForMapSearch(pool, center, radiusMiles);
  return sortProfilesByDistance(
    filterProfilesInRadius(relocated, center, radiusMiles),
    center,
  );
}

export function filterMapPeopleByName(profiles: Profile[], query: string): Profile[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return profiles;
  }
  return profiles.filter((profile) => profile.name.toLowerCase().includes(normalized));
}

export function resolveMapAreaPeople(
  pool: Profile[],
  center: GeoPoint,
  radiusMiles: number,
  options: MapAreaPeopleOptions = {},
): Profile[] {
  const { nameQuery, suitability } = options;

  let candidates = pool;
  if (suitability) {
    candidates = filterDiscoverProfiles(
      pool,
      suitability.preferences,
      suitability.excludedIds,
      suitability.user,
      suitability.isSparkPlus,
      suitability.locationSharing ?? true,
      { forMapSearch: true },
    );
  }

  let list = profilesForMapViewport(candidates, center, radiusMiles);

  if (nameQuery?.trim()) {
    list = filterMapPeopleByName(list, nameQuery);
  }

  return list;
}
