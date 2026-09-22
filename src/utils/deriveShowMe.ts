import type { Orientation, ProfileGender } from '../types/profile';
import type { ShowMePreference } from '../types/preferences';

/** Infer default discovery "show me" from onboarding identity. */
export function deriveShowMe(gender: ProfileGender, orientation: Orientation): ShowMePreference {
  if (gender === 'nonbinary') {
    return 'everyone';
  }

  switch (orientation) {
    case 'straight':
      return gender === 'woman' ? 'men' : 'women';
    case 'gay':
      return gender === 'woman' ? 'women' : 'men';
    case 'lesbian':
      return 'women';
    case 'bisexual':
    case 'pansexual':
    case 'queer':
    case 'asexual':
    case 'other':
      return 'everyone';
    default: {
      const _exhaustive: never = orientation;
      return _exhaustive;
    }
  }
}
