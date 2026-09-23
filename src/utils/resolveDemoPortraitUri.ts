import { Image } from 'react-native';

import { PORTRAIT_ASSET_BY_FILENAME } from '../data/demoAiPortraitAssets';
import {
  DEMO_PORTRAIT_URI_PREFIX,
  resolveLegacyDemoPortraitFilename,
} from '../data/demoAiPortraitPool';

const resolvedCache = new Map<string, string>();

export function isDemoPortraitUri(uri: string): boolean {
  return uri.startsWith(DEMO_PORTRAIT_URI_PREFIX);
}

function uriFromAssetModule(assetModule: number): string | null {
  if (typeof assetModule === 'string') {
    return assetModule;
  }
  if (
    typeof assetModule === 'object' &&
    assetModule !== null &&
    'uri' in assetModule &&
    typeof (assetModule as { uri: unknown }).uri === 'string'
  ) {
    return (assetModule as { uri: string }).uri;
  }
  if (typeof Image.resolveAssetSource === 'function') {
    const resolved = Image.resolveAssetSource(assetModule);
    if (resolved?.uri) {
      return resolved.uri;
    }
  }
  return null;
}

export function resolveDemoPortraitUri(uri: string): string {
  if (!isDemoPortraitUri(uri)) {
    return uri;
  }
  const cached = resolvedCache.get(uri);
  if (cached) {
    return cached;
  }
  const filename = uri.slice(DEMO_PORTRAIT_URI_PREFIX.length);
  const pexelsFallback = resolveLegacyDemoPortraitFilename(filename);
  if (pexelsFallback) {
    resolvedCache.set(uri, pexelsFallback);
    return pexelsFallback;
  }
  const assetModule = PORTRAIT_ASSET_BY_FILENAME[filename];
  if (!assetModule) {
    return uri;
  }
  const resolved = uriFromAssetModule(assetModule);
  if (!resolved) {
    return uri;
  }
  resolvedCache.set(uri, resolved);
  return resolved;
}

export function resolveDemoPortraitPhotos(photos: string[]): string[] {
  return photos.map(resolveDemoPortraitUri);
}
