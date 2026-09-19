import { emberHidesCity } from '../types/profile';
import type { Profile } from '../types/profile';
import { geocodeCity } from './neighborhoodCoords';
import { DEFAULT_MAP_CENTER } from './searchMapTiles';

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

/** Stable lat/lng for a demo profile from city + distance seed. */
export function profileGeoLocation(
  profile: Pick<Profile, 'city' | 'distanceMiles'>,
  seed: number,
): GeoPoint {
  const base = geocodeCity(profile.city) ?? DEFAULT_MAP_CENTER;
  const bearing = (seed * 137.508) % 360;
  const jitterMiles = Math.max(0.15, profile.distanceMiles * (0.08 + (seed % 17) / 100));
  return offsetLatLng(base, jitterMiles, bearing);
}

export function profileHasGeo(profile: Profile): profile is Profile & { latitude: number; longitude: number } {
  return typeof profile.latitude === 'number' && typeof profile.longitude === 'number';
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
