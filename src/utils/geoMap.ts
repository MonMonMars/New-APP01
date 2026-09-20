import { emberHidesCity } from '../types/profile';
import type { Profile } from '../types/profile';
import { geocodeCity } from './neighborhoodCoords';
import { CITY_COORDS, DEFAULT_MAP_CENTER } from './searchMapTiles';

const EARTH_RADIUS_MILES = 3958.8;

export type GeoPoint = { lat: number; lng: number };

/** Great-circle distance in miles. */
export function haversineDistanceMiles(a: GeoPoint, b: GeoPoint): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Destination point from start, distance (miles), and bearing (degrees). */
export function offsetLatLng(
  start: GeoPoint,
  distanceMiles: number,
  bearingDegrees: number,
): GeoPoint {
  const bearing = (bearingDegrees * Math.PI) / 180;
  const angular = distanceMiles / EARTH_RADIUS_MILES;
  const lat1 = (start.lat * Math.PI) / 180;
  const lng1 = (start.lng * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angular) +
      Math.cos(lat1) * Math.sin(angular) * Math.cos(bearing),
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angular) * Math.cos(lat1),
      Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2),
    );

  return {
    lat: (lat2 * 180) / Math.PI,
    lng: (lng2 * 180) / Math.PI,
  };
}

/** Passport + extra cities so demo accounts spread across continents on the map. */
export const WORLD_DEMO_ANCHORS: GeoPoint[] = [
  ...Object.values(CITY_COORDS),
  { lat: 52.52, lng: 13.405 },
  { lat: 55.755, lng: 37.617 },
  { lat: 28.613, lng: 77.209 },
  { lat: -23.55, lng: -46.633 },
  { lat: 19.432, lng: -99.133 },
  { lat: 25.204, lng: 55.271 },
  { lat: 1.352, lng: 103.819 },
  { lat: -33.924, lng: 18.424 },
  { lat: 43.653, lng: -79.383 },
];

function isNearNycMetro(point: GeoPoint): boolean {
  return haversineDistanceMiles(point, DEFAULT_MAP_CENTER) < 120;
}

/** Stable lat/lng for a demo profile — global anchors for NYC-metro seeds, geocode elsewhere. */
export function profileGeoLocation(
  profile: Pick<Profile, 'city' | 'distanceMiles'>,
  seed: number,
): GeoPoint {
  const geocoded = geocodeCity(profile.city);
  const base =
    geocoded && !isNearNycMetro(geocoded)
      ? geocoded
      : WORLD_DEMO_ANCHORS[seed % WORLD_DEMO_ANCHORS.length];
  const bearing = (seed * 137.508) % 360;
  const jitterMiles = Math.max(0.35, profile.distanceMiles * (0.12 + (seed % 17) / 90));
  const spreadCap = base === geocoded ? 18 : 28;
  return offsetLatLng(base, Math.min(jitterMiles, spreadCap), bearing);
}

export function profileHasGeo(profile: Profile): profile is Profile & { latitude: number; longitude: number } {
  return typeof profile.latitude === 'number' && typeof profile.longitude === 'number';
}

/**
 * Demo map search: deterministically scatter profiles around the searched center so
 * every filtered profile can appear as a pin/deck card in the new area.
 */
export function relocateProfilesForMapSearch(
  profiles: Profile[],
  center: GeoPoint,
  radiusMiles: number,
): Profile[] {
  const spreadMiles =
    radiusMiles >= 9999 ? 30 : Math.max(1, radiusMiles);

  return profiles.map((profile, index) => {
    if (emberHidesCity(profile.emberDiscretion)) {
      return profile;
    }
    const seed = Number(profile.id) || index + 1;
    const bearing = (seed * 137.508) % 360;
    const dist =
      spreadMiles >= 9999
        ? 0.5 + ((seed * 19) % 100) / 100 * (spreadMiles - 0.5)
        : Math.max(0.2, ((seed * 17) % 1000) / 1000 * spreadMiles);
    const coords = offsetLatLng(center, dist, bearing);
    return {
      ...profile,
      latitude: coords.lat,
      longitude: coords.lng,
      distanceMiles: Math.round(dist * 10) / 10,
    };
  });
}

/** Profiles within radius of map center; hidden Ember profiles excluded from pins. */
export function filterProfilesInRadius(
  profiles: Profile[],
  center: GeoPoint,
  radiusMiles: number,
): Profile[] {
  const cap = radiusMiles >= 9999 ? Number.POSITIVE_INFINITY : radiusMiles;
  return profiles.filter((profile) => {
    if (emberHidesCity(profile.emberDiscretion)) {
      return false;
    }
    if (!profileHasGeo(profile)) {
      return false;
    }
    return haversineDistanceMiles(center, { lat: profile.latitude, lng: profile.longitude }) <= cap;
  });
}

/** Sort profiles nearest-first from a map center. */
export function sortProfilesByDistance(profiles: Profile[], center: GeoPoint): Profile[] {
  return [...profiles].sort((a, b) => {
    const da = profileHasGeo(a)
      ? haversineDistanceMiles(center, { lat: a.latitude, lng: a.longitude })
      : a.distanceMiles;
    const db = profileHasGeo(b)
      ? haversineDistanceMiles(center, { lat: b.latitude, lng: b.longitude })
      : b.distanceMiles;
    return da - db;
  });
}

export function distanceFromCenter(profile: Profile, center: GeoPoint): number {
  if (profileHasGeo(profile)) {
    return haversineDistanceMiles(center, { lat: profile.latitude, lng: profile.longitude });
  }
  return profile.distanceMiles;
}
