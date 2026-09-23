import { PixelRatio, Platform } from 'react-native';

import type { GeoPoint } from './geoMap';
import {
  CITY_COORDS,
  DEFAULT_MAP_CENTER,
  mapCenterForCity,
  zoomForRadius,
} from './mapConstants';

export { CITY_COORDS, DEFAULT_MAP_CENTER, mapCenterForCity, zoomForRadius };

/** Logical tile size on screen (Slippy Map 256 world units). */
export const TILE_PX = 256;

const CARTO_SUBDOMAINS = ['a', 'b', 'c', 'd'] as const;

/**
 * Device pixel ratio for choosing @2x raster tiles.
 * RN Web often reports PixelRatio 1 while the screen is 2x — that made @2x tiles skipped and maps look soft.
 */
export function mapTilePixelRatio(): number {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.devicePixelRatio >= 1.5) {
      return 2;
    }
    return 1;
  }
  return PixelRatio.get() >= 2 ? 2 : 1;
}

/** Carto Positron (light) without labels — clean streets, no baked-in caption tiles. */
export function buildMapTileUri(zoom: number, x: number, y: number): string {
  const useRetina = mapTilePixelRatio() >= 2;
  const retinaSuffix = useRetina ? '@2x' : '';
  const subdomain = CARTO_SUBDOMAINS[Math.abs(x + y) % CARTO_SUBDOMAINS.length];
  return `https://${subdomain}.basemaps.cartocdn.com/rastertiles/light_nolabels/${zoom}/${x}/${y}${retinaSuffix}.png`;
}

export type MapTile = {
  key: string;
  uri: string;
  left: number;
  top: number;
};

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
