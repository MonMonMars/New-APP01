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
  'Taipei, Taiwan': { lat: 25.033, lng: 121.565 },
  'Shanghai, China': { lat: 31.23, lng: 121.474 },
  'Beijing, China': { lat: 39.904, lng: 116.407 },
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

/** Extra global metros for demo pins and map place search (beyond passport list). */
export const EXTRA_WORLD_MAP_CITIES: { id: string; label: string; lat: number; lng: number }[] = [
  { id: 'berlin', label: 'Berlin, Germany', lat: 52.52, lng: 13.405 },
  { id: 'moscow', label: 'Moscow, Russia', lat: 55.755, lng: 37.617 },
  { id: 'delhi', label: 'New Delhi, India', lat: 28.613, lng: 77.209 },
  { id: 'saopaulo', label: 'São Paulo, Brazil', lat: -23.55, lng: -46.633 },
  { id: 'mexicocity', label: 'Mexico City, Mexico', lat: 19.432, lng: -99.133 },
  { id: 'dubai', label: 'Dubai, UAE', lat: 25.204, lng: 55.271 },
  { id: 'singapore', label: 'Singapore', lat: 1.352, lng: 103.819 },
  { id: 'capetown', label: 'Cape Town, South Africa', lat: -33.924, lng: 18.424 },
  { id: 'toronto', label: 'Toronto, Canada', lat: 43.653, lng: -79.383 },
  { id: 'seoul', label: 'Seoul, South Korea', lat: 37.566, lng: 126.978 },
  { id: 'bangkok', label: 'Bangkok, Thailand', lat: 13.756, lng: 100.501 },
  { id: 'istanbul', label: 'Istanbul, Turkey', lat: 41.008, lng: 28.978 },
  { id: 'cairo', label: 'Cairo, Egypt', lat: 30.044, lng: 31.235 },
  { id: 'lagos', label: 'Lagos, Nigeria', lat: 6.524, lng: 3.379 },
  { id: 'mumbai', label: 'Mumbai, India', lat: 19.076, lng: 72.877 },
  { id: 'hongkong', label: 'Hong Kong', lat: 22.319, lng: 114.169 },
  { id: 'rome', label: 'Rome, Italy', lat: 41.902, lng: 12.496 },
  { id: 'madrid', label: 'Madrid, Spain', lat: 40.416, lng: -3.703 },
  { id: 'amsterdam', label: 'Amsterdam, Netherlands', lat: 52.367, lng: 4.904 },
  { id: 'stockholm', label: 'Stockholm, Sweden', lat: 59.329, lng: 18.068 },
];
