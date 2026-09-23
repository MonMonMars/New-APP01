import { photosForPexelsId, VERIFIED_PORTRAIT_IDS } from '../data/demoPhotoSets';
import {
  DEMO_PORTRAIT_URI_PREFIX,
  resolveLegacyDemoPortraitFilename,
} from '../data/demoAiPortraitPool';

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
  const pexelsFallback = resolveLegacyDemoPortraitFilename(filename);
  if (pexelsFallback) {
    resolvedCache.set(uri, pexelsFallback);
    return pexelsFallback;
  }
  const pool = VERIFIED_PORTRAIT_IDS;
  let hash = 0;
  for (let i = 0; i < filename.length; i += 1) {
    hash = (hash * 31 + filename.charCodeAt(i)) | 0;
  }
  const primary = pool[Math.abs(hash) % pool.length] ?? pool[0];
  const resolved = photosForPexelsId(primary)[0];
  resolvedCache.set(uri, resolved);
  return resolved;
}

export function resolveDemoPortraitPhotos(photos: string[]): string[] {
  return photos.map(resolveDemoPortraitUri);
}
