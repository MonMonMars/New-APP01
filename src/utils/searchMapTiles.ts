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

/** Max zoom for the active raster basemap (overzoom uses +1 fetch below this cap). */
export const MAP_TILE_MAX_ZOOM = 19;

/** Basemap id — bump when tile URL changes so clients drop stale cached tiles. */
export const MAP_RASTER_BASEMAP_ID = 'osm-org-v1';

/** Standard OSM raster tiles (no API key). Avoid osmfr/carto — they serve watermark PNGs. */
const OSM_SUBDOMAINS = ['a', 'b', 'c'] as const;

/**
 * Device pixel ratio for retina tile fetch.
 * RN Web often reports PixelRatio 1 while the screen is 2x or 3x.
 */
export function mapTilePixelRatio(): number {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      return Math.min(3, Math.max(1, window.devicePixelRatio || 1));
    }
    return 1;
  }
  return PixelRatio.get();
}

type TileFetchPlan = {
  fetchZoom: number;
  /** Each tile drawn at TILE_PX * pixelScale (0.5 when fetching zoom+1 on retina). */
  pixelScale: number;
};

/** Retina: fetch one zoom level deeper, draw tiles at half size — sharp on phone/desktop. */
export function tileFetchPlan(displayZoom: number): TileFetchPlan {
  const dpr = mapTilePixelRatio();
  if (dpr >= 1.5 && displayZoom < MAP_TILE_MAX_ZOOM - 1) {
    return { fetchZoom: displayZoom + 1, pixelScale: 0.5 };
  }
  return { fetchZoom: displayZoom, pixelScale: 1 };
}

/**
 * OSM raster tile URL. Sharpness on retina comes from tileFetchPlan() (fetch zoom+1, draw half size).
 * pixelScale is kept for cache keys when overzooming.
 */
export function buildMapTileUri(
  zoom: number,
  x: number,
  y: number,
  _pixelScale = 1,
): string {
  const subdomain = OSM_SUBDOMAINS[Math.abs(x + y) % OSM_SUBDOMAINS.length];
  return `https://${subdomain}.tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
}

export type MapTile = {
  key: string;
  uri: string;
  left: number;
  top: number;
  size: number;
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
  displayZoom: number,
  width: number,
  height: number,
  lat: number,
  lng: number,
): MapTile[] {
  if (width <= 0 || height <= 0) {
    return [];
  }

  const { fetchZoom, pixelScale } = tileFetchPlan(displayZoom);
  const tileSpan = TILE_PX * pixelScale;
  const n = 2 ** fetchZoom;
  const cx = lonToTile(lng, fetchZoom);
  const cy = latToTile(lat, fetchZoom);
  const minX = Math.floor(cx - width / 2 / tileSpan) - 1;
  const maxX = Math.ceil(cx + width / 2 / tileSpan) + 1;
  const minY = Math.floor(cy - height / 2 / tileSpan) - 1;
  const maxY = Math.ceil(cy + height / 2 / tileSpan) + 1;
  const tiles: MapTile[] = [];
  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      if (y < 0 || y >= n) {
        continue;
      }
      const wrappedX = ((x % n) + n) % n;
      tiles.push({
        key: `${MAP_RASTER_BASEMAP_ID}-${fetchZoom}-${wrappedX}-${y}-${x}-${pixelScale}`,
        uri: buildMapTileUri(fetchZoom, wrappedX, y, pixelScale),
        left: (x - cx) * tileSpan + width / 2,
        top: (y - cy) * tileSpan + height / 2,
        size: tileSpan,
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
