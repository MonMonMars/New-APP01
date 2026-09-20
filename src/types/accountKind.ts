import { AI_PERSONA_IDS } from '../data/aiPersonas';
import type { Profile } from './profile';

let catalogProfileIds: ReadonlySet<string> = new Set();

/** Called once from profile seed module after mock profiles load. */
export function setCatalogProfileIds(ids: ReadonlySet<string>): void {
  catalogProfileIds = ids;
}

/** Internal classification — never shown to consumers unless admin UI. */
export type AccountKind = 'real' | 'demo' | 'ai_persona';

export function resolveAccountKind(profile: Profile): AccountKind {
  if (profile.accountKind) {
    return profile.accountKind;
  }
  if (profile.isAiPersona === true || AI_PERSONA_IDS.has(profile.id)) {
    return 'ai_persona';
  }
  if (profile.isDemoProfile === true) {
    return 'demo';
  }
  if (catalogProfileIds.has(profile.id)) {
    return 'demo';
  }
  return 'real';
}

export function isDemoProfile(profile: Profile): boolean {
  const kind = resolveAccountKind(profile);
  return kind === 'demo' || kind === 'ai_persona';
}

export const ACCOUNT_KIND_LABELS: Record<AccountKind, string> = {
  real: 'Real',
  demo: 'Demo seed',
  ai_persona: 'AI persona',
};
