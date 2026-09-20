import { PixelRatio } from 'react-native';

import { resolveMapBasemapProvider } from '../config/mapProvider';
import { PASSPORT_CITIES } from '../types/preferences';
import type { GeoPoint } from './geoMap';

/** Logical tile size on screen (Slippy Map 256 world units). */
export const TILE_PX = 256;

const ESRI_STREET_SERVERS = ['services', 'server'] as const;
const CARTO_SUBDOMAINS = ['a', 'b', 'c', 'd'] as const;

/** Prefer @2x raster tiles on retina — keeps sharpness without changing layout math. */
export function mapTilePixelRatio(): number {
  return PixelRatio.get() >= 2 ? 2 : 1;
}

function buildCartoVoyagerTileUri(zoom: number, x: number, y: number): string {
  const host = CARTO_SUBDOMAINS[Math.abs(x + y) % CARTO_SUBDOMAINS.length];
  const retina = mapTilePixelRatio() >= 2 ? '@2x' : '';
  return `https://${host}.basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${x}/${y}${retina}.png`;
}

function buildEsriStreetTileUri(zoom: number, x: number, y: number): string {
  const host = ESRI_STREET_SERVERS[Math.abs(x + y) % ESRI_STREET_SERVERS.length];
  return `https://${host}.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${zoom}/${y}/${x}`;
}

/** Bing-style road labels (requires `EXPO_PUBLIC_BING_MAPS_KEY`). */
function buildBingRoadTileUri(zoom: number, x: number, y: number): string | null {
  const key = process.env.EXPO_PUBLIC_BING_MAPS_KEY?.trim();
  if (!key) {
    return null;
  }
  return `https://t0.tiles.virtualearth.net/tiles/r${zoom}/${x}/${y}.png?key=${encodeURIComponent(key)}`;
}

/**
 * Modern street basemap — default Carto Voyager (Google/Apple-like).
 * Set `EXPO_PUBLIC_MAP_PROVIDER=esri|bing|carto`. Bing needs `EXPO_PUBLIC_BING_MAPS_KEY`.
 */
export function buildMapTileUri(zoom: number, x: number, y: number): string {
  const provider = resolveMapBasemapProvider();
  if (provider === 'bing') {
    const bing = buildBingRoadTileUri(zoom, x, y);
    if (bing) {
      return bing;
    }
  }
  if (provider === 'esri') {
    return buildEsriStreetTileUri(zoom, x, y);
  }
  return buildCartoVoyagerTileUri(zoom, x, y);
}

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
  'Taipei, Taiwan': { lat: 25.033, lng: 121.565 },
  'Shanghai, China': { lat: 31.230, lng: 121.474 },
  'Beijing, China': { lat: 39.904, lng: 116.407 },
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
    return 11;
  }
  return 13;
}

export function mapCenterForCity(city?: string | null): GeoPoint {
  if (city && city in CITY_COORDS) {
    return CITY_COORDS[city as (typeof PASSPORT_CITIES)[number]];
  }
  return DEFAULT_MAP_CENTER;
}

export function lonToTile(lon: number, zoom: number): number {
  return ((lon + 180) / 360) * 2 ** zoom;
}

export function latToTile(lat: number, zoom: number): number {
  const latRad = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * 2 ** zoom;
}

export function tileToLon(x: number, zoom: number): number {
  return (x / 2 ** zoom) * 360 - 180;
}

export function tileToLat(y: number, zoom: number): number {
  const n = Math.PI - (2 * Math.PI * y) / 2 ** zoom;
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

export function moveMapCenter(center: GeoPoint, dx: number, dy: number, zoom: number): GeoPoint {
  const cx = lonToTile(center.lng, zoom);
  const cy = latToTile(center.lat, zoom);
  return {
    lat: tileToLat(cy - dy / TILE_PX, zoom),
    lng: tileToLon(cx - dx / TILE_PX, zoom),
  };
}

export function latLngToPixel(
  point: GeoPoint,
  center: GeoPoint,
  zoom: number,
  mapWidth: number,
  mapHeight: number,
): { left: number; top: number } {
  const cx = lonToTile(center.lng, zoom);
  const cy = latToTile(center.lat, zoom);
  const px = lonToTile(point.lng, zoom);
  const py = latToTile(point.lat, zoom);
  return {
    left: (px - cx) * TILE_PX + mapWidth / 2,
    top: (py - cy) * TILE_PX + mapHeight / 2,
  };
}

/** Web Mercator meters per pixel at latitude. */
export function metersPerPixel(lat: number, zoom: number): number {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom;
}

export function milesToPixels(miles: number, lat: number, zoom: number): number {
  const meters = miles * 1609.34;
  return meters / metersPerPixel(lat, zoom);
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
        uri: buildMapTileUri(zoom, wrappedX, y),
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
  photoUrl?: string;
  name?: string;
};

export function layoutMapPins(
  profiles: Array<{
    id: string;
    latitude?: number;
    longitude?: number;
    photos?: string[];
    name?: string;
  }>,
  center: GeoPoint,
  zoom: number,
  mapWidth: number,
  mapHeight: number,
  maxPins = 48,
): MapPin[] {
  if (mapWidth <= 0 || mapHeight <= 0) {
    return [];
  }

  return profiles.slice(0, maxPins).flatMap((profile) => {
    if (typeof profile.latitude !== 'number' || typeof profile.longitude !== 'number') {
      return [];
    }

    const pixel = latLngToPixel(
      { lat: profile.latitude, lng: profile.longitude },
      center,
      zoom,
      mapWidth,
      mapHeight,
    );
    if (
      pixel.left < -48 ||
      pixel.top < -48 ||
      pixel.left > mapWidth + 48 ||
      pixel.top > mapHeight + 48
    ) {
      return [];
    }
    return [
      {
        id: profile.id,
        left: pixel.left,
        top: pixel.top,
        photoUrl: profile.photos?.[0],
        name: profile.name,
      },
    ];
  });
}
