import { isAiPersonaProfile } from '../data/aiPersonas';
import { ShowMePreference } from '../types/preferences';
import { Profile } from '../types/profile';

export function matchesShowMePreference(profile: Profile, showMe: ShowMePreference): boolean {
  switch (showMe) {
    case 'everyone':
      return true;
    case 'women':
      return profile.gender === 'woman';
    case 'men':
      return profile.gender === 'man';
    default: {
      const _exhaustive: never = showMe;
      return _exhaustive;
    }
  }
}

/** Demo dating surfaces — exclude AI practice personas from discover/Pulse pools. */
export function isDiscoverableDemoProfile(profile: Profile): boolean {
  return !isAiPersonaProfile(profile);
}

export function filterProfilesForShowMe(
  profiles: Profile[],
  showMe: ShowMePreference,
  options?: { requireDiscoverable?: boolean },
): Profile[] {
  const requireDiscoverable = options?.requireDiscoverable ?? true;
  return profiles.filter((profile) => {
    if (requireDiscoverable && !isDiscoverableDemoProfile(profile)) {
      return false;
    }
    return matchesShowMePreference(profile, showMe);
  });
}
