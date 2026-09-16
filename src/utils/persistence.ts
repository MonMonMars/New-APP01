import AsyncStorage from '@react-native-async-storage/async-storage';

import { Conversation, Match } from '../types/match';
import { defaultPreferences, DiscoveryPreferences } from '../types/preferences';
import { UserProfile } from '../types/profile';
import { DisguiseAdCreative } from '../types/disguise';
import {
  defaultLegalConsent,
  defaultPrivacyPreferences,
  LegalConsentRecord,
  PrivacyPreferences,
} from '../types/privacy';
import { defaultPulseSocialState, PulseSocialState } from '../types/pulseSocial';
import {
  defaultNotificationPreferences,
  NotificationPreferences,
  ThemeMode,
} from '../types/settings';
import { DateCheckIn } from '../types/safetyCheckIn';
import { defaultSecuritySettings, SecuritySettings } from '../types/security';
import { decryptLocalPayload, encryptLocalPayload } from './localEncryption';

const STORAGE_KEY = '@spark/app_state';
const SENSITIVE_VAULT_KEY = '@spark/sensitive_vault';
const STORAGE_VERSION = 16;

type SensitiveVault = {
  conversations: Conversation[];
  sparkNotes: Record<string, string>;
};

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
  heldIds: string[];
  profileViewerIds: string[];
  matches: Match[];
  conversations: Conversation[];
  dailyLikesUsed: number;
  isSparkPlus: boolean;
  sparkNotes: Record<string, string>;
  boostActiveUntil: string | null;
  freeBoostWeekKey: string | null;
  bonusBoosts: number;
  sparkNotesUsedToday: number;
  lastSparkNoteDate: string | null;
  bonusSparkNotes: number;
  notificationsEnabled: boolean;
  notificationPreferences: NotificationPreferences;
  lastPassedProfileId: string | null;
  isPaused: boolean;
  themeMode: ThemeMode;
  disguiseMode: boolean;
  disguiseAdCreative: DisguiseAdCreative | null;
  securitySettings: SecuritySettings;
  privacyPreferences: PrivacyPreferences;
  legalConsent: LegalConsentRecord;
  pulseSocial: PulseSocialState;
  dateCheckIns: DateCheckIn[];
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
      photoVerified: false,
      personVerified: false,
    },
    preferences: defaultPreferences,
    passedIds: [],
    likedIds: [],
    pendingLikeIds: [],
    superLikedIds: [],
    blockedIds: [],
    heldIds: [],
    profileViewerIds: [],
    matches: [],
    conversations: [],
    dailyLikesUsed: 0,
    isSparkPlus: false,
    sparkNotes: {},
    boostActiveUntil: null,
    freeBoostWeekKey: null,
    bonusBoosts: 0,
    sparkNotesUsedToday: 0,
    lastSparkNoteDate: null,
    bonusSparkNotes: 0,
    notificationsEnabled: false,
    notificationPreferences: defaultNotificationPreferences,
    lastPassedProfileId: null,
    isPaused: false,
    themeMode: 'dark',
    disguiseMode: true,
    disguiseAdCreative: null,
    securitySettings: defaultSecuritySettings,
    privacyPreferences: defaultPrivacyPreferences,
    legalConsent: defaultLegalConsent,
    pulseSocial: defaultPulseSocialState,
    dateCheckIns: [],
  };
}

async function loadSensitiveVault(): Promise<SensitiveVault | null> {
  try {
    const raw = await AsyncStorage.getItem(SENSITIVE_VAULT_KEY);
    if (!raw) {
      return null;
    }
    const decrypted = await decryptLocalPayload(raw);
    if (!decrypted) {
      return null;
    }
    return JSON.parse(decrypted) as SensitiveVault;
  } catch {
    return null;
  }
}

async function saveSensitiveVault(vault: SensitiveVault): Promise<void> {
  try {
    const encrypted = await encryptLocalPayload(JSON.stringify(vault));
    await AsyncStorage.setItem(SENSITIVE_VAULT_KEY, encrypted);
  } catch {
    // Fall back silently — prototype builds may lack secure vault key.
  }
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
    const vault = await loadSensitiveVault();

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
      conversations: vault?.conversations ?? parsed.conversations ?? [],
      sparkNotes: vault?.sparkNotes ?? parsed.sparkNotes ?? {},
      notificationPreferences: {
        ...defaultNotificationPreferences,
        ...parsed.notificationPreferences,
      },
      themeMode: parsed.themeMode ?? 'dark',
      bonusSparkNotes: parsed.bonusSparkNotes ?? 0,
      isPaused: parsed.isPaused ?? false,
      disguiseMode: parsed.disguiseMode ?? true,
      disguiseAdCreative: parsed.disguiseAdCreative ?? null,
      heldIds: parsed.heldIds ?? [],
      profileViewerIds: parsed.profileViewerIds ?? [],
      userId: parsed.userId ?? null,
      securitySettings: {
        ...defaultSecuritySettings,
        ...parsed.securitySettings,
      },
      privacyPreferences: {
        ...defaultPrivacyPreferences,
        ...parsed.privacyPreferences,
      },
      legalConsent: {
        ...defaultLegalConsent,
        ...parsed.legalConsent,
      },
      freeBoostWeekKey: parsed.freeBoostWeekKey ?? null,
      bonusBoosts: parsed.bonusBoosts ?? 0,
      pulseSocial: {
        ...defaultPulseSocialState,
        ...parsed.pulseSocial,
        postComments: parsed.pulseSocial?.postComments ?? {},
        readingHistory: parsed.pulseSocial?.readingHistory ?? [],
        likedPostIds: parsed.pulseSocial?.likedPostIds ?? [],
      },
      dateCheckIns: parsed.dateCheckIns ?? [],
    };
  } catch {
    return null;
  }
}

export async function savePersistedState(state: PersistedAppState): Promise<void> {
  try {
    const { conversations, sparkNotes, ...publicState } = state;
    await saveSensitiveVault({ conversations, sparkNotes });
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...publicState,
        version: STORAGE_VERSION,
        conversations: [],
        sparkNotes: {},
      }),
    );
  } catch {
    // Prototype: fail silently if storage unavailable (e.g. web private mode).
  }
}

export async function clearPersistedState(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEY),
      AsyncStorage.removeItem(SENSITIVE_VAULT_KEY),
    ]);
  } catch {
    // Ignore storage errors in prototype.
  }
}
