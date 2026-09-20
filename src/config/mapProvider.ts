/** Basemap style for SearchMapView raster tiles (no API key required by default). */
export type MapBasemapProvider = 'carto' | 'esri' | 'bing';

const VALID: MapBasemapProvider[] = ['carto', 'esri', 'bing'];

export function resolveMapBasemapProvider(): MapBasemapProvider {
  const raw = (process.env.EXPO_PUBLIC_MAP_PROVIDER ?? 'esri').toLowerCase();
  if (VALID.includes(raw as MapBasemapProvider)) {
    return raw as MapBasemapProvider;
  }
  return 'carto';
}
