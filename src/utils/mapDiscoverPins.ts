import type { Profile } from '../types/profile';
import {
  filterProfilesInRadius,
  relocateProfilesForMapSearch,
  sortProfilesByDistance,
  type GeoPoint,
} from './geoMap';

/**
 * People/pins for the map viewport — same scatter as `searchMapAt` / discover deck
 * so counts and browse results match the searchable pool in the area.
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
