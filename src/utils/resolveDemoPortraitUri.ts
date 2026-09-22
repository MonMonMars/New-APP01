import { Image } from 'react-native';

import { PORTRAIT_ASSET_BY_FILENAME } from '../data/demoAiPortraitAssets';
import { DEMO_PORTRAIT_URI_PREFIX } from '../data/demoAiPortraitPool';

const resolvedCache = new Map<string, string>();

export function isDemoPortraitUri(uri: string): boolean {
  return uri.startsWith(DEMO_PORTRAIT_URI_PREFIX);
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
  const assetModule = PORTRAIT_ASSET_BY_FILENAME[filename];
  if (!assetModule) {
    return uri;
  }
  const resolved = Image.resolveAssetSource(assetModule).uri;
  resolvedCache.set(uri, resolved);
  return resolved;
}

export function resolveDemoPortraitPhotos(photos: string[]): string[] {
  return photos.map(resolveDemoPortraitUri);
}
