import { Profile } from '../types/profile';

import { DEMO_CATALOG_NAME_BY_ID } from './demoCatalogNames';

const CLICHE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/love language/gi, 'weak spot'],
  [/bad puns/gi, 'dry humor'],
  [/Coffee person\./gi, 'Early riser.'],
  [/Weekend hikes\./gi, 'Trail walks when the weather cooperates.'],
  [/Looking for someone who laughs at bad puns\./gi, 'Looking for someone who gets the joke.'],
  [/Tacos are a love language/gi, 'Taco spots are a personality test'],
  [/tacos as a love language/gi, 'tacos as a non-negotiable'],
  [/tacos are a love language/gi, 'taco rankings are serious business'],
  [/dad jokes are my love language/gi, 'dad jokes are mandatory'],
  [/Dad jokes are my cardio\./gi, 'Bad jokes keep me honest.'],
  [/Plant mom/gi, 'Too many plants'],
  [/Will send you dog pics/gi, 'Dog photos happen without warning'],
  [/tabs or spaces/gi, 'pineapple on pizza'],
];

/** Strip dating-app filler and tighten demo bios without changing voice per profile. */
export function polishDemoBio(bio: string | undefined): string | undefined {
  if (!bio?.trim()) {
    return bio;
  }
  let next = bio.trim();
  for (const [pattern, replacement] of CLICHE_REPLACEMENTS) {
    next = next.replace(pattern, replacement);
  }
  return next;
}

export function applyDemoCatalogPolish(profile: Profile): Profile {
  if (profile.isAiPersona || profile.id.startsWith('ai-')) {
    return profile;
  }
  const numericId = Number(profile.id);
  if (!Number.isFinite(numericId) || numericId < 1 || numericId > 320) {
    return profile;
  }

  const name = DEMO_CATALOG_NAME_BY_ID[profile.id] ?? profile.name;
  const bio = polishDemoBio(profile.bio) ?? profile.bio;

  if (name === profile.name && bio === profile.bio) {
    return profile;
  }

  return {
    ...profile,
    name,
    ...(bio !== undefined ? { bio } : {}),
  };
}
