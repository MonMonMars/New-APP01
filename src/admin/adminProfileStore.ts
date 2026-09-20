import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AccountKind } from '../types/accountKind';
import { resolveAccountKind } from '../types/accountKind';
import type { Profile } from '../types/profile';

const OVERRIDES_KEY = '@spark/admin_profile_overrides_v1';

export type AdminProfileOverride = {
  name?: string;
  bio?: string;
  city?: string;
  photos?: string[];
  accountKind?: AccountKind;
  isDemoProfile?: boolean;
};

type OverrideMap = Record<string, AdminProfileOverride>;

let overridesCache: OverrideMap | null = null;
let hydratePromise: Promise<void> | null = null;

function catalogDemoDefault(profile: Profile): boolean {
  return resolveAccountKind(profile) !== 'real';
}

export async function hydrateAdminProfileOverrides(): Promise<void> {
  if (hydratesDone()) {
    return hydratePromise ?? Promise.resolve();
  }
  hydratePromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(OVERRIDES_KEY);
      overridesCache = raw ? (JSON.parse(raw) as OverrideMap) : {};
    } catch {
      overridesCache = {};
    }
  })();
  return hydratePromise;
}

function hydratesDone(): boolean {
  return overridesCache !== null;
}

export function getAdminProfileOverridesSync(): OverrideMap {
  return overridesCache ?? {};
}

export async function saveAdminProfileOverride(
  profileId: string,
  patch: AdminProfileOverride,
): Promise<void> {
  await hydrateAdminProfileOverrides();
  const next = { ...getAdminProfileOverridesSync() };
  next[profileId] = { ...next[profileId], ...patch };
  overridesCache = next;
  await AsyncStorage.setItem(OVERRIDES_KEY, JSON.stringify(next));
}

export function applyAdminProfileOverride(profile: Profile): Profile {
  const patch = getAdminProfileOverridesSync()[profile.id];
  if (!patch) {
    return withDemoDefaults(profile);
  }
  const merged: Profile = {
    ...profile,
    ...patch,
    photos: patch.photos ?? profile.photos,
  };
  if (patch.accountKind) {
    merged.accountKind = patch.accountKind;
    merged.isDemoProfile = patch.accountKind === 'demo' || patch.accountKind === 'ai_persona';
    merged.isAiPersona = patch.accountKind === 'ai_persona';
  } else if (patch.isDemoProfile !== undefined) {
    merged.isDemoProfile = patch.isDemoProfile;
  }
  return withDemoDefaults(merged);
}

function withDemoDefaults(profile: Profile): Profile {
  if (profile.isDemoProfile !== undefined || profile.accountKind) {
    return profile;
  }
  if (catalogDemoDefault(profile)) {
    const kind = resolveAccountKind(profile);
    return {
      ...profile,
      isDemoProfile: kind === 'demo' || kind === 'ai_persona',
      accountKind: kind === 'real' ? 'demo' : kind,
    };
  }
  return profile;
}

export function listAdminCatalogProfiles(source: Profile[]): Profile[] {
  return source.map((p) => applyAdminProfileOverride(p));
}

/** TODO(production): Replace AsyncStorage overrides with Supabase `admin_profile_overrides` + RLS. */
