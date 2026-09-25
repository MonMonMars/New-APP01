import type { Profile } from '../types/profile';
import {
  filterProfilesInRadius,
  relocateProfilesForMapSearch,
  sortProfilesByDistance,
  type GeoPoint,
} from './geoMap';
import { latLngToPixel } from './mapGeoPixels';

export type MapAreaPeopleOptions = {
  nameQuery?: string;
  mapZoom?: number;
  mapWidth?: number;
  mapHeight?: number;
};

/**
 * People for the map area — same scatter as `searchMapAt` / discover deck,
 * optionally narrowed to the on-screen map bounds and a name query.
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

/** Keep profiles whose scatter pin falls inside the current map viewport. */
export function filterProfilesInMapBounds(
  profiles: Profile[],
  center: GeoPoint,
  zoom: number,
  mapWidth: number,
  mapHeight: number,
  marginPx = 48,
): Profile[] {
  if (mapWidth <= 0 || mapHeight <= 0) {
    return profiles;
  }

  return profiles.filter((profile) => {
    if (typeof profile.latitude !== 'number' || typeof profile.longitude !== 'number') {
      return false;
    }
    const pixel = latLngToPixel(
      { lat: profile.latitude, lng: profile.longitude },
      center,
      zoom,
      mapWidth,
      mapHeight,
    );
    return (
      pixel.left >= -marginPx &&
      pixel.top >= -marginPx &&
      pixel.left <= mapWidth + marginPx &&
      pixel.top <= mapHeight + marginPx
    );
  });
}

export function resolveMapAreaPeople(
  pool: Profile[],
  center: GeoPoint,
  radiusMiles: number,
  options: MapAreaPeopleOptions = {},
): Profile[] {
  let list = profilesForMapViewport(pool, center, radiusMiles);
  const { nameQuery, mapZoom, mapWidth, mapHeight } = options;

  if (
    mapZoom != null &&
    mapWidth != null &&
    mapHeight != null &&
    mapWidth > 0 &&
    mapHeight > 0
  ) {
    list = filterProfilesInMapBounds(list, center, mapZoom, mapWidth, mapHeight);
  }

  if (nameQuery?.trim()) {
    list = filterMapPeopleByName(list, nameQuery);
  }

  return list;
}
