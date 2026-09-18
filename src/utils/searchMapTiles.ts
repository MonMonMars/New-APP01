import { PASSPORT_CITIES } from '../types/preferences';

export const TILE_PX = 256;

export const DEFAULT_MAP_CENTER = { lat: 40.758, lng: -73.985 };

export const CITY_COORDS: Record<(typeof PASSPORT_CITIES)[number], { lat: number; lng: number }> = {
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

export type MapTile = {
  key: string;
  uri: string;
  left: number;
  top: number;
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
    return 10;
  }
  return 12;
}

export function mapCenterForCity(city?: string | null): { lat: number; lng: number } {
  if (city && city in CITY_COORDS) {
    return CITY_COORDS[city as (typeof PASSPORT_CITIES)[number]];
  }
  return DEFAULT_MAP_CENTER;
}

function lonToTile(lon: number, zoom: number): number {
  return ((lon + 180) / 360) * 2 ** zoom;
}

function latToTile(lat: number, zoom: number): number {
  const latRad = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * 2 ** zoom;
}

export function buildMapTiles(
  zoom: number,
  width: number,
  height: number,
  lat: number,
  lng: number,
): MapTile[] {
  if (width <= 0 || height <= 0) {
    return [];
  }
  const n = 2 ** zoom;
  const cx = lonToTile(lng, zoom);
  const cy = latToTile(lat, zoom);
  const minX = Math.floor(cx - width / 2 / TILE_PX) - 1;
  const maxX = Math.ceil(cx + width / 2 / TILE_PX) + 1;
  const minY = Math.floor(cy - height / 2 / TILE_PX) - 1;
  const maxY = Math.ceil(cy + height / 2 / TILE_PX) + 1;
  const tiles: MapTile[] = [];
  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      if (y < 0 || y >= n) {
        continue;
      }
      const wrappedX = ((x % n) + n) % n;
      tiles.push({
        key: `${zoom}-${wrappedX}-${y}-${x}`,
        uri: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${zoom}/${y}/${wrappedX}`,
        left: (x - cx) * TILE_PX + width / 2,
        top: (y - cy) * TILE_PX + height / 2,
      });
    }
  }
  return tiles;
}

export type MapPin = {
  id: string;
  left: number;
  top: number;
};

export function layoutMapPins(
  profiles: Array<{ id: string; distanceMiles: number; mapX?: number; mapY?: number }>,
  mapWidth: number,
  mapHeight: number,
  radiusMiles: number,
  maxPins = 24,
): MapPin[] {
  const scale = Math.min(mapWidth, mapHeight);
  const ringDiameter = scale * 0.52;
  if (ringDiameter <= 0) {
    return [];
  }

  return profiles.slice(0, maxPins).map((profile) => {
    const dx = (profile.mapX ?? 50) - 50;
    const dy = (profile.mapY ?? 50) - 50;
    const angle = Math.atan2(dy, dx);
    const distNorm =
      radiusMiles >= 9999
        ? Math.min(profile.distanceMiles / 400, 0.92)
        : Math.min(profile.distanceMiles / Math.max(radiusMiles, 1), 0.92);
    const radius = distNorm * (ringDiameter / 2);
    return {
      id: profile.id,
      left: mapWidth / 2 + Math.cos(angle) * radius,
      top: mapHeight / 2 + Math.sin(angle) * radius,
    };
  });
}
