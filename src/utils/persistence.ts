import AsyncStorage from '@react-native-async-storage/async-storage';

import { Conversation, Match } from '../types/match';
import { defaultPreferences, DiscoveryPreferences } from '../types/preferences';
import { UserProfile } from '../types/profile';
import {
  defaultNotificationPreferences,
  NotificationPreferences,
  ThemeMode,
} from '../types/settings';

const STORAGE_KEY = '@spark/app_state';
const STORAGE_VERSION = 4;

export type PersistedAppState = {
  version: number;
  hasOnboarded: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  user: UserProfile;
  preferences: DiscoveryPreferences;
  passedIds: string[];
  likedIds: string[];
  pendingLikeIds: string[];
  superLikedIds: string[];
  blockedIds: string[];
  matches: Match[];
  conversations: Conversation[];
  dailyLikesUsed: number;
  isSparkPlus: boolean;
  sparkNotes: Record<string, string>;
  boostActiveUntil: string | null;
  sparkNotesUsedToday: number;
  lastSparkNoteDate: string | null;
  bonusSparkNotes: number;
  notificationsEnabled: boolean;
  notificationPreferences: NotificationPreferences;
  lastPassedProfileId: string | null;
  isPaused: boolean;
  themeMode: ThemeMode;
};

export function createDefaultPersistedState(): PersistedAppState {
  return {
    version: STORAGE_VERSION,
    hasOnboarded: false,
    isAuthenticated: false,
    userId: null,
    user: {
      name: 'Mon',
      age: 28,
      bio: 'Designer exploring the city.',
      photos: ['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80'],
      interests: ['Design', 'Coffee', 'Travel'],
      prompts: [],
      instagramConnected: false,
      spotifyConnected: false,
      ageVerified: false,
    },
    preferences: defaultPreferences,
    passedIds: [],
    likedIds: [],
    pendingLikeIds: [],
    superLikedIds: [],
    blockedIds: [],
    matches: [],
    conversations: [],
    dailyLikesUsed: 0,
    isSparkPlus: false,
    sparkNotes: {},
    boostActiveUntil: null,
    sparkNotesUsedToday: 0,
    lastSparkNoteDate: null,
    bonusSparkNotes: 0,
    notificationsEnabled: false,
    notificationPreferences: defaultNotificationPreferences,
    lastPassedProfileId: null,
    isPaused: false,
    themeMode: 'dark',
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
      user: { ...defaults.user, ...parsed.user },
      preferences: { ...defaultPreferences, ...parsed.preferences },
      passedIds: parsed.passedIds ?? [],
      likedIds: parsed.likedIds ?? [],
      pendingLikeIds: parsed.pendingLikeIds ?? [],
      superLikedIds: parsed.superLikedIds ?? [],
      blockedIds: parsed.blockedIds ?? [],
      matches: parsed.matches ?? [],
      conversations: parsed.conversations ?? [],
      sparkNotes: parsed.sparkNotes ?? {},
      notificationPreferences: {
        ...defaultNotificationPreferences,
        ...parsed.notificationPreferences,
      },
      themeMode: parsed.themeMode ?? 'dark',
      bonusSparkNotes: parsed.bonusSparkNotes ?? 0,
      isPaused: parsed.isPaused ?? false,
      userId: parsed.userId ?? null,
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
