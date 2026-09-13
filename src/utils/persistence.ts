import AsyncStorage from '@react-native-async-storage/async-storage';

import { Conversation, Match } from '../types/match';
import { defaultPreferences, DiscoveryPreferences } from '../types/preferences';
import { UserProfile } from '../types/profile';

const STORAGE_KEY = '@spark/app_state';
const STORAGE_VERSION = 2;

export type PersistedAppState = {
  version: number;
  hasOnboarded: boolean;
  isAuthenticated: boolean;
  user: UserProfile;
  preferences: DiscoveryPreferences;
  passedIds: string[];
  likedIds: string[];
  pendingLikeIds: string[];
  blockedIds: string[];
  matches: Match[];
  conversations: Conversation[];
  dailyLikesUsed: number;
  isSparkPlus: boolean;
  sparkNotes: Record<string, string>;
  boostActiveUntil: string | null;
  sparkNotesUsedToday: number;
  lastSparkNoteDate: string | null;
  notificationsEnabled: boolean;
  lastPassedProfileId: string | null;
};

export function createDefaultPersistedState(): PersistedAppState {
  return {
    version: STORAGE_VERSION,
    hasOnboarded: false,
    isAuthenticated: false,
    user: {
      name: 'Mon',
      age: 28,
      bio: 'Designer exploring the city.',
      photos: ['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80'],
      interests: ['Design', 'Coffee', 'Travel'],
    },
    preferences: defaultPreferences,
    passedIds: [],
    likedIds: [],
    pendingLikeIds: [],
    blockedIds: [],
    matches: [],
    conversations: [],
    dailyLikesUsed: 0,
    isSparkPlus: false,
    sparkNotes: {},
    boostActiveUntil: null,
    sparkNotesUsedToday: 0,
    lastSparkNoteDate: null,
    notificationsEnabled: false,
    lastPassedProfileId: null,
  };
}

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
    const defaults = createDefaultPersistedState();
    return {
      ...defaults,
      ...parsed,
      version: STORAGE_VERSION,
      user: parsed.user,
      preferences: { ...defaultPreferences, ...parsed.preferences },
      passedIds: parsed.passedIds ?? [],
      likedIds: parsed.likedIds ?? [],
      pendingLikeIds: parsed.pendingLikeIds ?? [],
      blockedIds: parsed.blockedIds ?? [],
      matches: parsed.matches ?? [],
      conversations: parsed.conversations ?? [],
      sparkNotes: parsed.sparkNotes ?? {},
    };
  } catch {
    return null;
  }
}

export async function savePersistedState(state: PersistedAppState): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, version: STORAGE_VERSION }),
    );
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
