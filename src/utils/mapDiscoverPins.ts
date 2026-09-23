import type { Profile } from '../types/profile';
import {
  filterProfilesInRadius,
  profileHasGeo,
  relocateProfilesForMapSearch,
  sortProfilesByDistance,
  type GeoPoint,
} from './geoMap';

/**
 * Pins for the map viewport: prefer profiles at their pinned lat/lng worldwide,
 * then demo-fill empty regions so panning always shows searchable people.
 */
export function profilesForMapViewport(
  pool: Profile[],
  center: GeoPoint,
  radiusMiles: number,
): Profile[] {
  const withGeo = pool.filter(profileHasGeo);
  const pinnedInView = sortProfilesByDistance(
    filterProfilesInRadius(withGeo, center, radiusMiles),
    center,
  );
  if (pinnedInView.length > 0) {
    return pinnedInView;
  }

  const relocated = relocateProfilesForMapSearch(pool, center, radiusMiles);
  return sortProfilesByDistance(
    filterProfilesInRadius(relocated, center, radiusMiles),
    center,
  );
}
