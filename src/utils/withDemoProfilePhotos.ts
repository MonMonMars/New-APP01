import { photosForDemoProfile } from '../data/demoAiPortraitPool';
import { Profile } from '../types/profile';

function isCatalogProfile(profile: Profile): boolean {
  if (profile.isAiPersona || profile.aiPersonaId) {
    return true;
  }
  if (profile.id.startsWith('ai-')) {
    return true;
  }
  const numericId = Number(profile.id);
  return Number.isFinite(numericId) && numericId >= 1 && numericId <= 320;
}

/** Catalog profiles use curated Pexels portrait crops — plain photos, no baked-in text. */
export function withDemoProfilePhotos(profile: Profile): Profile {
  if (!isCatalogProfile(profile)) {
    return profile;
  }
  return { ...profile, photos: photosForDemoProfile(profile) };
}
