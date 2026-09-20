import {
  AI_PERSONA_PEXELS_IDS,
  photosForPexelsId,
  VERIFIED_PORTRAIT_IDS,
} from '../data/demoPhotoSets';
import { photosForLegacyProfile } from '../data/legacyProfilePhotos';
import { Profile } from '../types/profile';

/** Extra Pexels portrait ids for passport / high-id profiles without a legacy mapping. */
const PASSPORT_PEXELS_IDS: readonly number[] = [
  1926769, 1988681, 2014422, 2042109, 2064340, 2087360, 2103808, 2122961, 2148535, 2165644,
  2182970, 2194794, 220453, 2212476, 2233348, 2256940, 2272949, 2291367, 2302632, 2317953,
];


function hashProfileId(profileId: string): number {
  let hash = 0;
  for (let i = 0; i < profileId.length; i += 1) {
    hash = (hash * 31 + profileId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function isDemoSeedProfile(profile: Profile): boolean {
  if (profile.isAiPersona || profile.aiPersonaId) {
    return true;
  }
  if (profile.id.startsWith('ai-')) {
    return true;
  }
  const numericId = Number(profile.id);
  return Number.isFinite(numericId) && numericId >= 1 && numericId <= 320;
}

function photosForExtendedProfile(profileId: string): string[] {
  const numericId = Number(profileId);
  if (Number.isFinite(numericId) && numericId >= 201 && numericId <= 218) {
    const index = numericId - 201;
    return photosForPexelsId(PASSPORT_PEXELS_IDS[index % PASSPORT_PEXELS_IDS.length]);
  }
  const index = hashProfileId(profileId);
  const primary = VERIFIED_PORTRAIT_IDS[index % VERIFIED_PORTRAIT_IDS.length] ?? VERIFIED_PORTRAIT_IDS[0];
  return photosForPexelsId(primary);
}

/** Replace stock URLs with curated human portrait galleries (Pexels). */
export function withDemoProfilePhotos(profile: Profile): Profile {
  if (profile.isAiPersona || profile.aiPersonaId) {
    const pexelsId = AI_PERSONA_PEXELS_IDS[profile.id];
    if (pexelsId) {
      return { ...profile, photos: photosForPexelsId(pexelsId) };
    }
    return profile;
  }

  if (!isDemoSeedProfile(profile)) {
    return profile;
  }

  const legacyPhotos = photosForLegacyProfile(profile.id);
  if (legacyPhotos) {
    return { ...profile, photos: legacyPhotos };
  }

  return { ...profile, photos: photosForExtendedProfile(profile.id) };
}
