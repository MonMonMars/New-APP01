import { PASSPORT_CITIES } from '../types/preferences';
import { NEIGHBORHOOD_COORDS } from './neighborhoodCoords';
import type { GeoPoint } from './geoMap';
import { CITY_COORDS } from './searchMapTiles';

export type MapPlaceSuggestion = {
  id: string;
  label: string;
  coords: GeoPoint;
  kind: 'passport' | 'neighborhood';
};

const PASSPORT_PLACES: MapPlaceSuggestion[] = PASSPORT_CITIES.map((city) => ({
  id: `passport:${city}`,
  label: city,
  coords: CITY_COORDS[city],
  kind: 'passport' as const,
}));

const NEIGHBORHOOD_PLACES: MapPlaceSuggestion[] = Object.entries(NEIGHBORHOOD_COORDS).map(
  ([label, coords]) => ({
    id: `hood:${label}`,
    label,
    coords,
    kind: 'neighborhood' as const,
  }),
);

const ALL_PLACES: MapPlaceSuggestion[] = [...PASSPORT_PLACES, ...NEIGHBORHOOD_PLACES];

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

/** City and neighborhood suggestions for the map search bar. */
export function searchMapPlaces(query: string, limit = 6): MapPlaceSuggestion[] {
  const normalized = normalizeQuery(query);
  if (normalized.length < 2) {
    return [];
  }

  const scored = ALL_PLACES.flatMap((place) => {
    const label = place.label.toLowerCase();
    const cityPart = label.split(',')[0].toLowerCase();
    let score = 0;
    if (label.startsWith(normalized)) {
      score = 100;
    } else if (cityPart.startsWith(normalized)) {
      score = 80;
    } else if (label.includes(normalized)) {
      score = 60;
    } else if (cityPart.includes(normalized)) {
      score = 40;
    } else {
      return [];
    }
    if (place.kind === 'passport') {
      score += 5;
    }
    return [{ place, score }];
  });

  scored.sort((a, b) => b.score - a.score || a.place.label.localeCompare(b.place.label));

  const seen = new Set<string>();
  const results: MapPlaceSuggestion[] = [];
  for (const { place } of scored) {
    if (seen.has(place.label)) {
      continue;
    }
    seen.add(place.label);
    results.push(place);
    if (results.length >= limit) {
      break;
    }
  }
  return results;
}
