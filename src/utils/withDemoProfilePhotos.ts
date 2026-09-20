import { AI_PERSONA_PEXELS_IDS, photosForPexelsId } from '../data/demoPhotoSets';
import { LEGACY_PROFILE_IDS } from '../data/legacyProfilePhotos';
import { photosForLegacyProfile } from '../data/legacyProfilePhotos';
import { Profile } from '../types/profile';

/** Extra Pexels portrait ids for passport / high-id profiles without a legacy mapping. */
const PASSPORT_PEXELS_IDS: readonly number[] = [
  1926769, 1988681, 2014422, 2042109, 2064340, 2087360, 2103808, 2122961, 2148535, 2165644,
  2182970, 2194794, 220453, 2212476, 2233348, 2256940, 2272949, 2291367, 2302632, 2317953,
];

const EXTENDED_PEXELS_IDS: readonly number[] = [
  3299891, 3306624, 3318052, 3322781, 3333336, 3344375, 3354338, 3365034, 3379934, 3390255,
  3394658, 3401411, 3415217, 3426892, 3437729, 3448498, 3458483, 3468852, 3479090, 3489037,
];

function hashProfileId(profileId: string): number {
  let hash = 0;
  for (let i = 0; i < profileId.length; i += 1) {
    hash = (hash * 31 + profileId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function photosNeedCuration(photos: string[]): boolean {
  if (photos.length === 0) {
    return true;
  }
  return photos.some(
    (url) =>
      url.includes('picsum.photos') ||
      url.includes('placeholder') ||
      url.includes('lorem') ||
      url.includes('pravatar'),
  );
}

function photosForExtendedProfile(profileId: string): string[] {
  const numericId = Number(profileId);
  if (Number.isFinite(numericId) && numericId >= 201 && numericId <= 218) {
    const index = numericId - 201;
    return photosForPexelsId(PASSPORT_PEXELS_IDS[index % PASSPORT_PEXELS_IDS.length]);
  }
  const index = hashProfileId(profileId);
  return photosForPexelsId(EXTENDED_PEXELS_IDS[index % EXTENDED_PEXELS_IDS.length]);
}

/** Replace stock / mixed-photo URLs with curated same-person Pexels sets. */
export function withDemoProfilePhotos(profile: Profile): Profile {
  if (profile.isAiPersona || profile.aiPersonaId) {
    const pexelsId = AI_PERSONA_PEXELS_IDS[profile.id];
    if (pexelsId) {
      return { ...profile, photos: photosForPexelsId(pexelsId) };
    }
    return profile;
  }

  const legacyPhotos = photosForLegacyProfile(profile.id);
  if (legacyPhotos) {
    return { ...profile, photos: legacyPhotos };
  }

  const numericId = Number(profile.id);
  const isLegacyRange =
    Number.isFinite(numericId) &&
    LEGACY_PROFILE_IDS.includes(profile.id as (typeof LEGACY_PROFILE_IDS)[number]);

  if (isLegacyRange || photosNeedCuration(profile.photos)) {
    return { ...profile, photos: photosForExtendedProfile(profile.id) };
  }

  return profile;
}
