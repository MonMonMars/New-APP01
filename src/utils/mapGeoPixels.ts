import type { GeoPoint } from './geoMap';

/** Logical tile size on screen (Slippy Map 256 world units). */
export const TILE_PX = 256;

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
