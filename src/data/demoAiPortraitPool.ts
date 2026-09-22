import { Profile, ProfileGender } from '../types/profile';

export const DEMO_PORTRAIT_URI_PREFIX = 'spark-demo-portrait://';

const WOMEN_PORTRAIT_FILES = [
  'portrait-w-01.png',
  'portrait-w-02.png',
  'portrait-w-03.png',
  'portrait-w-04.png',
  'portrait-w-05.png',
  'portrait-w-06.png',
  'portrait-w-07.png',
  'portrait-w-08.png',
] as const;

const MEN_PORTRAIT_FILES = [
  'portrait-m-01.png',
  'portrait-m-02.png',
  'portrait-m-03.png',
  'portrait-m-04.png',
  'portrait-m-05.png',
  'portrait-m-06.png',
] as const;

const NONBINARY_PORTRAIT_FILES = [
  'portrait-n-01.png',
  'portrait-n-02.png',
  ...WOMEN_PORTRAIT_FILES,
  ...MEN_PORTRAIT_FILES,
] as const;

function hashProfileId(profileId: string): number {
  let hash = 0;
  for (let i = 0; i < profileId.length; i += 1) {
    hash = (hash * 31 + profileId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function poolForGender(gender: ProfileGender): readonly string[] {
  switch (gender) {
    case 'woman':
      return WOMEN_PORTRAIT_FILES;
    case 'man':
      return MEN_PORTRAIT_FILES;
    case 'nonbinary':
      return NONBINARY_PORTRAIT_FILES;
    default: {
      const _exhaustive: never = gender;
      return _exhaustive;
    }
  }
}

function portraitUri(filename: string): string {
  return `${DEMO_PORTRAIT_URI_PREFIX}${filename}`;
}

/** Three bundled portrait stills per catalog profile (stable logical URIs until resolved in UI). */
export function photosForDemoProfile(profile: Pick<Profile, 'id' | 'gender'>): string[] {
  const pool = poolForGender(profile.gender);
  const base = hashProfileId(profile.id);
  const offsets = [0, 5, 11];
  const indices = offsets.map((offset) => (base + offset) % pool.length);
  const uniqueIndices = [...new Set(indices)];
  while (uniqueIndices.length < 3 && uniqueIndices.length < pool.length) {
    const next = (base + uniqueIndices.length * 7) % pool.length;
    if (!uniqueIndices.includes(next)) {
      uniqueIndices.push(next);
    } else {
      break;
    }
  }
  return uniqueIndices.slice(0, 3).map((index) => portraitUri(pool[index]));
}

export function demoAvatarUriForProfile(profile: Pick<Profile, 'id' | 'gender'>): string {
  return photosForDemoProfile(profile)[0];
}
