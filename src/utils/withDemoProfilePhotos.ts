import { AI_PERSONA_PEXELS_IDS, photosForPexelsId } from '../data/demoPhotoSets';
import { photosForLegacyProfile } from '../data/legacyProfilePhotos';
import { Profile } from '../types/profile';

/** Replace stock / mixed-photo URLs with curated same-person Pexels sets. */
export function withDemoProfilePhotos(profile: Profile): Profile {
  if (profile.isAiPersona || profile.aiPersonaId) {
    const pexelsId = AI_PERSONA_PEXELS_IDS[profile.id];
    if (pexelsId) {
      return { ...profile, photos: photosForPexelsId(pexelsId) };
    }
    return profile;
  }

  const numericId = Number(profile.id);
  if (Number.isFinite(numericId) && numericId >= 97) {
    return profile;
  }

  const legacyPhotos = photosForLegacyProfile(profile.id);
  if (legacyPhotos) {
    return { ...profile, photos: legacyPhotos };
  }

  return profile;
}
