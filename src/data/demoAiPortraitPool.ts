import { photosForLegacyProfile } from './legacyProfilePhotos';
import {
  AI_PERSONA_PEXELS_IDS,
  galleryForPrimary,
  photosForPexelsId,
  VERIFIED_PORTRAIT_IDS,
} from './demoPhotoSets';
import { Profile, ProfileGender } from '../types/profile';

/** Legacy logical prefix — resolved to Pexels URLs at runtime for older persisted state. */
export const DEMO_PORTRAIT_URI_PREFIX = 'spark-demo-portrait://';

function hashProfileId(profileId: string): number {
  let hash = 0;
  for (let i = 0; i < profileId.length; i += 1) {
    hash = (hash * 31 + profileId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function primaryIdForCatalogProfile(profile: Pick<Profile, 'id' | 'gender'>): number {
  const legacy = photosForLegacyProfile(profile.id);
  if (legacy?.[0]) {
    const match = legacy[0].match(/photos\/(\d+)\//);
    if (match) {
      return Number(match[1]);
    }
  }

  const personaId = AI_PERSONA_PEXELS_IDS[profile.id];
  if (personaId) {
    return personaId;
  }

  const pool = VERIFIED_PORTRAIT_IDS;
  const base = hashProfileId(`${profile.gender}:${profile.id}`);
  return pool[base % pool.length] ?? pool[0];
}

/** Three face-forward Pexels crops per catalog profile (stable per id). */
export function photosForDemoProfile(profile: Pick<Profile, 'id' | 'gender'>): string[] {
  return galleryForPrimary(primaryIdForCatalogProfile(profile));
}

export function demoAvatarUriForProfile(profile: Pick<Profile, 'id' | 'gender'>): string {
  return photosForDemoProfile(profile)[0];
}

/** Map old bundled-filename URIs to Pexels for persisted decks. */
export function resolveLegacyDemoPortraitFilename(filename: string): string | null {
  const index = hashProfileId(filename);
  const id = VERIFIED_PORTRAIT_IDS[index % VERIFIED_PORTRAIT_IDS.length];
  return photosForPexelsId(id)[0];
}
