import { PASSPORT_CITIES } from '../types/preferences';

type MapPoint = { lat: number; lng: number };

export const DEFAULT_MAP_CENTER: MapPoint = { lat: 40.758, lng: -73.985 };

export const CITY_COORDS: Record<(typeof PASSPORT_CITIES)[number], MapPoint> = {
  'New York, NY': { lat: 40.758, lng: -73.985 },
  'Los Angeles, CA': { lat: 34.052, lng: -118.244 },
  'Chicago, IL': { lat: 41.878, lng: -87.63 },
  'Miami, FL': { lat: 25.762, lng: -80.192 },
  'Austin, TX': { lat: 30.267, lng: -97.743 },
  'San Francisco, CA': { lat: 37.775, lng: -122.419 },
  'London, UK': { lat: 51.507, lng: -0.128 },
  'Paris, France': { lat: 48.857, lng: 2.352 },
  'Tokyo, Japan': { lat: 35.676, lng: 139.65 },
  'Sydney, Australia': { lat: -33.869, lng: 151.209 },
};

export function zoomForRadius(miles: number): number {
  if (miles >= 9999) {
    return 4;
  }
  if (miles >= 250) {
    return 7;
  }
  if (miles >= 100) {
    return 8;
  }
  if (miles >= 50) {
    return 11;
  }
  return 13;
}

export function mapCenterForCity(city?: string | null): MapPoint {
  if (city && city in CITY_COORDS) {
    return CITY_COORDS[city as (typeof PASSPORT_CITIES)[number]];
  }
  return DEFAULT_MAP_CENTER;
}
