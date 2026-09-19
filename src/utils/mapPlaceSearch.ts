import { getNeighborhoodLabel, getPassportCityLabel } from '../i18n/labels';
import { PASSPORT_CITIES } from '../types/preferences';
import type { AppLocale } from '../types/locale';
import { NEIGHBORHOOD_COORDS } from './neighborhoodCoords';
import type { GeoPoint } from './geoMap';
import { CITY_COORDS } from './searchMapTiles';

export type MapPlaceSuggestion = {
  id: string;
  label: string;
  searchKey: string;
  coords: GeoPoint;
  kind: 'passport' | 'neighborhood';
};

function buildPassportPlaces(locale: AppLocale): MapPlaceSuggestion[] {
  return PASSPORT_CITIES.map((city) => ({
    id: `passport:${city}`,
    label: getPassportCityLabel(locale, city),
    searchKey: city.toLowerCase(),
    coords: CITY_COORDS[city],
    kind: 'passport' as const,
  }));
}

function buildNeighborhoodPlaces(locale: AppLocale): MapPlaceSuggestion[] {
  return Object.entries(NEIGHBORHOOD_COORDS).map(([key, coords]) => ({
    id: `hood:${key}`,
    label: getNeighborhoodLabel(locale, key),
    searchKey: key.toLowerCase(),
    coords,
    kind: 'neighborhood' as const,
  }));
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

/** City and neighborhood suggestions for the map search bar. */
export function searchMapPlaces(query: string, locale: AppLocale, limit = 6): MapPlaceSuggestion[] {
  const normalized = normalizeQuery(query);
  if (normalized.length < 2) {
    return [];
  }

  const allPlaces = [...buildPassportPlaces(locale), ...buildNeighborhoodPlaces(locale)];

  const scored = allPlaces.flatMap((place) => {
    const label = place.searchKey;
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
