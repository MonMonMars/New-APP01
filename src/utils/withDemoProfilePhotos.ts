import {
  AI_PERSONA_PEXELS_IDS,
  photosForPexelsId,
  VERIFIED_PORTRAIT_IDS,
} from '../data/demoPhotoSets';
import { photosForLegacyProfile } from '../data/legacyProfilePhotos';
import { Profile } from '../types/profile';

/** Passport deck (ids 201–218) — disjoint from legacy + batch `photosForSet` primaries. */
const PASSPORT_PEXELS_IDS: readonly number[] = [
  3398464, 3408744, 3417775, 3423564, 3433333, 3443584, 3455279, 3465021, 3474219, 3483471,
  3493974, 3506189, 3516064, 3525544, 3535077, 3544825, 3554575, 3564325,
];


function hashProfileId(profileId: string): number {
  let hash = 0;
  for (let i = 0; i < profileId.length; i += 1) {
    hash = (hash * 31 + profileId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pexelsIdFromUrl(url: string): string | null {
  const match = url.match(/pexels\.com\/photos\/(\d+)\//);
  return match ? match[1] : null;
}

/** Raw batches 97–176 already use `photosForSet` — do not re-hash over them. */
function hasCuratedPexelsGallery(photos: string[]): boolean {
  if (photos.length === 0) {
    return false;
  }
  const ids = photos.map(pexelsIdFromUrl);
  if (ids.some((id) => id === null)) {
    return false;
  }
  return new Set(ids).size === 1;
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
  if (Number.isFinite(numericId) && numericId >= 1) {
    const primary =
      VERIFIED_PORTRAIT_IDS[(numericId - 1) % VERIFIED_PORTRAIT_IDS.length] ?? VERIFIED_PORTRAIT_IDS[0];
    return photosForPexelsId(primary);
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

  if (hasCuratedPexelsGallery(profile.photos)) {
    return profile;
  }

  const legacyPhotos = photosForLegacyProfile(profile.id);
  if (legacyPhotos) {
    return { ...profile, photos: legacyPhotos };
  }

  return { ...profile, photos: photosForExtendedProfile(profile.id) };
}
