import { isAiPersonaProfile } from '../data/aiPersonas';
import { getProfileById } from '../data/profiles';
import type { Profile } from '../types/profile';

/** Demo / fake profiles get AI openers and auto-replies — not real humans. */
export function isDemoChatProfile(profile: Profile): boolean {
  if (isAiPersonaProfile(profile)) {
    return true;
  }
  return getProfileById(profile.id) !== undefined;
}
