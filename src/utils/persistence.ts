import AsyncStorage from '@react-native-async-storage/async-storage';

import { defaultPreferences, DiscoveryPreferences } from '../types/preferences';
import { UserProfile } from '../types/profile';

const STORAGE_KEY = '@spark/app_state';

export type PersistedAppState = {
  hasOnboarded: boolean;
  user: UserProfile;
  preferences: DiscoveryPreferences;
};

export async function loadPersistedState(): Promise<PersistedAppState | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<PersistedAppState>;
    if (!parsed.hasOnboarded || !parsed.user) {
      return null;
    }
    return {
      hasOnboarded: true,
      user: parsed.user,
      preferences: { ...defaultPreferences, ...parsed.preferences },
    };
  } catch {
    return null;
  }
}

export async function savePersistedState(state: PersistedAppState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Prototype: fail silently if storage unavailable (e.g. web private mode).
  }
}

export async function clearPersistedState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors in prototype.
  }
}
