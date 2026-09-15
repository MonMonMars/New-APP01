import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { seedConversations } from '../data/conversations';
import { getAiPersonaConfig } from '../data/aiPersonas';
import {
  AI_PERSONA_IDS,
  getProfileById,
  incomingLikeProfiles,
  INCOMING_LIKE_IDS,
  INCOMING_LIKE_IDS_SET,
  mockProfiles,
  MUTUAL_MATCH_IDS,
  MUTUAL_SUPER_LIKE_IDS,
  RECENTLY_ACTIVE_IDS,
  STANDOUT_IDS,
} from '../data/profiles';
import {
  buildSeedConversations,
  buildSeedMatches,
  buildSeedSwipeState,
} from '../data/seedState';
import { uploadPhotosToCloud } from '../services/cloudStorage';
import { generateDisguiseAdImage } from '../services/disguiseImageGeneration';
import { registerCloudPushToken } from '../services/pushCloud';
import type { ConversationRealtimeUpdate } from '../services/realtimeChat';
import {
  deleteSupabaseAccount,
  getSupabaseSession,
  isSupabaseConfigured,
  loadFromSupabase,
  signInWithAppleToken,
  signInWithMagicLink,
  syncToSupabase,
} from '../services/supabase';
import { Conversation, Match, Message } from '../types/match';
import {
  defaultPreferences,
  DISCOVER_BATCH_SIZE,
  DiscoverFilter,
  DiscoveryPreferences,
  ShowMePreference,
} from '../types/preferences';
import { DisguiseAdCreative, DisguiseOverlayVariant } from '../types/disguise';
import { Profile, UserProfile } from '../types/profile';
import { DateCheckIn, isDateCheckInActive } from '../types/safetyCheckIn';
import {
  defaultNotificationPreferences,
  NotificationPreferences,
  ThemeMode,
} from '../types/settings';
import { defaultSecuritySettings, SecuritySettings } from '../types/security';
import { FREE_DAILY_LIKE_LIMIT, FREE_DAILY_SPARK_NOTES } from '../types/subscription';
import { BOOST_DURATION_MS } from '../types/subscription';
import { logSecurityEvent, submitSecurityReport } from '../services/securityReports';
import { unlockSpark } from '../utils/appLock';
import { isAllowedImageUrl } from '../utils/urlSafety';
import {
  clearFailedUnlockAttempts,
  getUnlockLockoutRemainingMs,
  isUnlockLockedOut,
  recordFailedUnlockAttempt,
} from '../utils/unlockLockout';
import { computeCompatibilityScore, pickDailyMostCompatible } from '../utils/compatibility';
import {
  requestNotificationPermission,
  scheduleMatchNotification,
  scheduleMessageNotification,
} from '../utils/notifications';
import { defaultPulseSocialState, PulseComment, PulseSocialState } from '../types/pulseSocial';
import {
  checkClientRateLimit,
  isProductionBuild,
  sanitizeMessage,
  sanitizeReportReason,
} from '../utils/securityGuards';
import { clearVaultKey } from '../utils/secureStorage';
import { DisguisePolicyModal } from '../components/legal/DisguisePolicyModal';
import { SparkUnlockModal } from '../components/security/SparkUnlockModal';
import {
  defaultLegalConsent,
  defaultPrivacyPreferences,
  LegalConsentRecord,
  PrivacyPreferences,
} from '../types/privacy';
import { generateDemoReply } from '../services/demoChatLlm';
import { buildUserDataExport, shareUserDataExport } from '../utils/dataExport';
import {
  clearPersistedState,
  createDefaultPersistedState,
  loadPersistedState,
  PersistedAppState,
  savePersistedState,
} from '../utils/persistence';

function matchesGenderFilter(profile: Profile, showMe: ShowMePreference): boolean {
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

function matchesDiscoverFilters(profile: Profile, filters: DiscoverFilter[]): boolean {
  if (filters.length === 0) {
    return true;
  }
  return filters.every((filter) => {
    switch (filter) {
      case 'active_today':
        return profile.activeToday === true;
      case 'new_here':
        return profile.isNew === true;
      case 'has_bio':
        return profile.bio.trim().length > 0;
      case 'verified':
        return (
          (profile.photoVerified === true && profile.personVerified === true) ||
          profile.verified === true
        );
      default: {
        const _exhaustive: never = filter;
        return _exhaustive;
      }
    }
  });
}

function filterDiscoverProfiles(
  profiles: Profile[],
  preferences: DiscoveryPreferences,
  excludedIds: Set<string>,
  locationSharing = true,
): Profile[] {
  const filters = preferences.discoverFilters ?? [];
  const maxDistance = locationSharing ? preferences.maxDistanceMiles : 9999;
  return profiles.filter(
    (profile) =>
      !excludedIds.has(profile.id) &&
      profile.distanceMiles <= maxDistance &&
      profile.age >= preferences.minAge &&
      profile.age <= preferences.maxAge &&
      matchesGenderFilter(profile, preferences.showMe) &&
      matchesDiscoverFilters(profile, filters),
  );
}

function arrayToSet(values: string[]): Set<string> {
  return new Set(values);
}

function setToArray(set: Set<string>): string[] {
  return Array.from(set);
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

type AppContextValue = {
  hasOnboarded: boolean;
  isHydrated: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  user: UserProfile;
  preferences: DiscoveryPreferences;
  discoverQueue: Profile[];
  discoverPoolTotal: number;
  hasMoreInPool: boolean;
  passedIds: Set<string>;
  likedIds: Set<string>;
  pendingLikeIds: Set<string>;
  superLikedIds: Set<string>;
  blockedIds: Set<string>;
  blockedProfiles: Profile[];
  heldIds: Set<string>;
  heldProfiles: Profile[];
  pulseSocial: PulseSocialState;
  standoutsProfiles: Profile[];
  recentlyActiveProfiles: Profile[];
  dailyMostCompatible: Profile | null;
  getCompatibilityScore: (profile: Profile) => number;
  matches: Match[];
  conversations: Conversation[];
  incomingLikes: Profile[];
  sparkNotes: Record<string, string>;
  dailyLikesUsed: number;
  remainingLikes: number;
  remainingSparkNotes: number;
  canLike: boolean;
  canSendSparkNote: boolean;
  likesTabBadge: number;
  matchesTabBadge: number;
  isSparkPlus: boolean;
  isBoosted: boolean;
  boostActiveUntil: string | null;
  notificationsEnabled: boolean;
  notificationPreferences: NotificationPreferences;
  isPaused: boolean;
  themeMode: ThemeMode;
  disguiseMode: boolean;
  disguiseAdCreative: DisguiseAdCreative | null;
  isGeneratingDisguiseAd: boolean;
  securitySettings: SecuritySettings;
  privacyPreferences: PrivacyPreferences;
  isIncognitoActive: boolean;
  legalConsent: LegalConsentRecord;
  dateCheckIns: DateCheckIn[];
  canRewind: boolean;
  rewindKey: number;
  isSupabaseEnabled: boolean;
  completeOnboarding: (user: UserProfile) => void;
  signInWithAppleStub: (identityToken?: string, displayName?: string) => Promise<void>;
  signInWithEmailMagicLink: (email: string) => Promise<{ ok: boolean; message: string }>;
  updateUser: (user: UserProfile) => void;
  applyCloudConversationUpdate: (
    conversationId: string,
    update: ConversationRealtimeUpdate,
  ) => void;
  updatePreferences: (preferences: DiscoveryPreferences) => void;
  toggleDiscoverFilter: (filter: DiscoverFilter) => void;
  searchMorePeople: () => void;
  expandSearchRadius: (miles: number) => void;
  prioritizeProfileInDeck: (profileId: string) => void;
  holdProfile: (profileId: string) => void;
  unholdProfile: (profileId: string) => void;
  passProfile: (profile: Profile) => void;
  likeProfile: (profile: Profile, sparkNote?: string) => Match | null;
  superLikeProfile: (profile: Profile) => Match | null;
  sendMessage: (conversationId: string, text: string, imageUrl?: string) => void;
  getConversationIdForProfile: (profileId: string) => string | null;
  blockProfile: (profileId: string) => void;
  unblockProfile: (profileId: string) => void;
  unlikeProfile: (profileId: string) => void;
  reportProfile: (profileId: string, reason?: string) => void;
  unmatchProfile: (profileId: string) => void;
  savePulsePost: (postId: string) => void;
  unsavePulsePost: (postId: string) => void;
  mutePulseAuthor: (handle: string) => void;
  unmutePulseAuthor: (handle: string) => void;
  reportPulsePost: (postId: string, reason?: string) => void;
  addPulseComment: (postId: string, body: string) => void;
  getPulseComments: (postId: string) => PulseComment[];
  recordReferralShare: () => number;
  activateSparkPlus: () => void;
  restorePurchases: () => Promise<boolean>;
  activateBoost: () => void;
  purchaseSparkNotes: (count: number) => void;
  rewindLastPass: () => void;
  enableNotifications: () => Promise<boolean>;
  updateNotificationPreferences: (prefs: NotificationPreferences) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setDisguiseMode: (enabled: boolean) => Promise<boolean>;
  updateSecuritySettings: (settings: SecuritySettings) => void;
  updatePrivacyPreferences: (prefs: PrivacyPreferences) => void;
  setIncognitoMode: (enabled: boolean) => boolean;
  getActiveDateCheckIn: (profileId: string) => DateCheckIn | null;
  startDateCheckIn: (
    profileId: string,
    profileName: string,
    payload: { location: string; plannedAt: string; emergencyContact?: string },
  ) => void;
  checkInDateNow: (checkInId: string) => void;
  completeDateCheckIn: (checkInId: string) => void;
  acceptOnboardingLegal: () => void;
  acceptDisguisePolicy: () => void;
  acceptCookieConsent: () => void;
  exportUserData: () => Promise<boolean>;
  generateDisguiseAd: (
    overlayText: string,
    variant: DisguiseOverlayVariant,
  ) => Promise<{ ok: boolean; message?: string }>;
  clearDisguiseAd: () => void;
  setPaused: (paused: boolean) => void;
  deleteAccount: () => Promise<void>;
};

const defaultPersisted = createDefaultPersistedState();

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile>(defaultPersisted.user);
  const [preferences, setPreferences] = useState<DiscoveryPreferences>(defaultPreferences);
  const [passedIds, setPassedIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [pendingLikeIds, setPendingLikeIds] = useState<Set<string>>(new Set());
  const [superLikedIds, setSuperLikedIds] = useState<Set<string>>(new Set());
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [heldIds, setHeldIds] = useState<Set<string>>(new Set());
  const [matches, setMatches] = useState<Match[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations);
  const [sparkNotes, setSparkNotes] = useState<Record<string, string>>({});
  const [dailyLikesUsed, setDailyLikesUsed] = useState(0);
  const [isSparkPlus, setIsSparkPlus] = useState(false);
  const [boostActiveUntil, setBoostActiveUntil] = useState<string | null>(null);
  const [sparkNotesUsedToday, setSparkNotesUsedToday] = useState(0);
  const [lastSparkNoteDate, setLastSparkNoteDate] = useState<string | null>(null);
  const [bonusSparkNotes, setBonusSparkNotes] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(
    defaultNotificationPreferences,
  );
  const [lastPassedProfileId, setLastPassedProfileId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [disguiseMode, setDisguiseModeState] = useState(true);
  const [disguiseAdCreative, setDisguiseAdCreative] = useState<DisguiseAdCreative | null>(null);
  const [isGeneratingDisguiseAd, setIsGeneratingDisguiseAd] = useState(false);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(defaultSecuritySettings);
  const [privacyPreferences, setPrivacyPreferences] = useState<PrivacyPreferences>(
    defaultPrivacyPreferences,
  );
  const [legalConsent, setLegalConsent] = useState<LegalConsentRecord>(defaultLegalConsent);
  const [pulseSocial, setPulseSocial] = useState<PulseSocialState>(defaultPulseSocialState);
  const [dateCheckIns, setDateCheckIns] = useState<DateCheckIn[]>([]);
  const [unlockModalVisible, setUnlockModalVisible] = useState(false);
  const [disguisePolicyModalVisible, setDisguisePolicyModalVisible] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const unlockResolverRef = useRef<((ok: boolean) => void) | null>(null);
  const pendingDisguiseUnlockRef = useRef(false);
  const lastUnlockAtRef = useRef<number>(Date.now());
  const backgroundedAtRef = useRef<number | null>(null);
  const [rewindKey, setRewindKey] = useState(0);
  const [discoverUnlockedCount, setDiscoverUnlockedCount] = useState(DISCOVER_BATCH_SIZE);
  const [priorityProfileId, setPriorityProfileId] = useState<string | null>(null);

  const hydratedRef = useRef(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    let hydrationFinished = false;
    const finishHydration = () => {
      if (cancelled || hydrationFinished) {
        return;
      }
      hydrationFinished = true;
      hydratedRef.current = true;
      setIsHydrated(true);
    };

    const hydrationTimeout = setTimeout(finishHydration, 8000);

    void loadPersistedState()
      .then(async (saved) => {
      if (cancelled) {
        return;
      }

      if (saved) {
        setUser(saved.user);
        setPreferences(saved.preferences);
        setHasOnboarded(saved.hasOnboarded);
        setIsAuthenticated(saved.isAuthenticated);
        setUserId(saved.userId);
        setPassedIds(arrayToSet(saved.passedIds));
        setLikedIds(arrayToSet(saved.likedIds));
        setPendingLikeIds(arrayToSet(saved.pendingLikeIds));
        setSuperLikedIds(arrayToSet(saved.superLikedIds ?? []));
        setBlockedIds(arrayToSet(saved.blockedIds));
        setHeldIds(arrayToSet(saved.heldIds ?? []));
        setMatches(saved.matches);
        setConversations(
          saved.conversations.length > 0 ? saved.conversations : seedConversations,
        );
        setSparkNotes(saved.sparkNotes);
        setDailyLikesUsed(saved.dailyLikesUsed);
        setIsSparkPlus(saved.isSparkPlus);
        setBoostActiveUntil(saved.boostActiveUntil);
        setSparkNotesUsedToday(saved.sparkNotesUsedToday);
        setLastSparkNoteDate(saved.lastSparkNoteDate);
        setBonusSparkNotes(saved.bonusSparkNotes);
        setNotificationsEnabled(saved.notificationsEnabled);
        setNotificationPreferences(saved.notificationPreferences);
        setLastPassedProfileId(saved.lastPassedProfileId);
        setIsPaused(saved.isPaused);
        setThemeModeState(saved.themeMode);
        setDisguiseModeState(saved.disguiseMode ?? true);
        setDisguiseAdCreative(saved.disguiseAdCreative ?? null);
        setSecuritySettings({
          ...defaultSecuritySettings,
          ...saved.securitySettings,
        });
        setPrivacyPreferences({
          ...defaultPrivacyPreferences,
          ...saved.privacyPreferences,
        });
        setLegalConsent({
          ...defaultLegalConsent,
          ...saved.legalConsent,
        });
        setPulseSocial({
          ...defaultPulseSocialState,
          ...saved.pulseSocial,
          postComments: saved.pulseSocial?.postComments ?? {},
        });
        setDateCheckIns(saved.dateCheckIns ?? []);

        if (isSupabaseConfigured()) {
          const session = await getSupabaseSession();
          const cloudUserId = session?.userId ?? saved.userId;
          if (session?.userId && !cancelled) {
            setUserId(session.userId);
            setIsAuthenticated(true);
          }
          if (cloudUserId) {
            const remote = await loadFromSupabase(cloudUserId);
            if (remote && !cancelled) {
              if (remote.user) {
                setUser(remote.user);
              }
              if (remote.preferences) {
                setPreferences(remote.preferences);
              }
              setPassedIds(arrayToSet(remote.passedIds ?? []));
              setLikedIds(arrayToSet(remote.likedIds ?? []));
              setPendingLikeIds(arrayToSet(remote.pendingLikeIds ?? []));
              setSuperLikedIds(arrayToSet(saved.superLikedIds ?? []));
              setBlockedIds(arrayToSet(remote.blockedIds ?? []));
              setMatches(remote.matches ?? []);
              if (remote.conversations && remote.conversations.length > 0) {
                setConversations(remote.conversations);
              }
              setIsSparkPlus(remote.isSparkPlus ?? false);
              setIsPaused(remote.isPaused ?? false);
            }
          }
        }
      } else {
        const seedMatches = buildSeedMatches();
        const seedSwipe = buildSeedSwipeState();
        setMatches(seedMatches);
        setConversations(buildSeedConversations(seedMatches));
        setLikedIds(arrayToSet(seedSwipe.likedIds));
        setPendingLikeIds(arrayToSet(seedSwipe.pendingLikeIds));
        setPassedIds(arrayToSet(seedSwipe.passedIds));
        setSuperLikedIds(arrayToSet(seedSwipe.superLikedIds));
      }

      finishHydration();
    })
      .catch(() => {
        finishHydration();
      });

    return () => {
      cancelled = true;
      clearTimeout(hydrationTimeout);
    };
  }, []);

  const buildPersistedState = useCallback((): PersistedAppState => {
    return {
      version: 6,
      hasOnboarded,
      isAuthenticated,
      userId,
      user,
      preferences,
      passedIds: setToArray(passedIds),
      likedIds: setToArray(likedIds),
      pendingLikeIds: setToArray(pendingLikeIds),
      superLikedIds: setToArray(superLikedIds),
      blockedIds: setToArray(blockedIds),
      heldIds: setToArray(heldIds),
      matches,
      conversations,
      dailyLikesUsed,
      isSparkPlus,
      sparkNotes,
      boostActiveUntil,
      sparkNotesUsedToday,
      lastSparkNoteDate,
      bonusSparkNotes,
      notificationsEnabled,
      notificationPreferences,
      lastPassedProfileId,
      isPaused,
      themeMode,
      disguiseMode,
      disguiseAdCreative,
      securitySettings,
      privacyPreferences,
      legalConsent,
      pulseSocial,
      dateCheckIns,
    };
  }, [
    hasOnboarded,
    isAuthenticated,
    userId,
    user,
    preferences,
    passedIds,
    likedIds,
    pendingLikeIds,
    superLikedIds,
    blockedIds,
    heldIds,
    matches,
    conversations,
    privacyPreferences,
    legalConsent,
    pulseSocial,
    dateCheckIns,
    dailyLikesUsed,
    isSparkPlus,
    sparkNotes,
    boostActiveUntil,
    sparkNotesUsedToday,
    lastSparkNoteDate,
    bonusSparkNotes,
    notificationsEnabled,
    notificationPreferences,
    lastPassedProfileId,
    isPaused,
    themeMode,
    disguiseMode,
    disguiseAdCreative,
    securitySettings,
  ]);

  const runSparkUnlockFlow = useCallback(async (): Promise<boolean> => {
    if (await isUnlockLockedOut()) {
      const remaining = await getUnlockLockoutRemainingMs();
      const minutes = Math.ceil(remaining / 60_000);
      setUnlockError(`Too many failed attempts. Try again in ${minutes} min.`);
      setUnlockModalVisible(true);
      return false;
    }

    const result = await unlockSpark(securitySettings);
    if (result.ok) {
      await clearFailedUnlockAttempts();
      void logSecurityEvent(userId, 'spark_unlock_success', { method: result.method });
      lastUnlockAtRef.current = Date.now();
      return true;
    }
    if (!securitySettings.pinEnabled) {
      // Biometric was declined on device and no PIN fallback is configured.
      return false;
    }
    return new Promise<boolean>((resolve) => {
      unlockResolverRef.current = resolve;
      setUnlockError(null);
      setUnlockModalVisible(true);
    });
  }, [securitySettings, userId]);

  const handleUnlockPinSubmit = useCallback(
    async (pin: string) => {
      if (await isUnlockLockedOut()) {
        const remaining = await getUnlockLockoutRemainingMs();
        const minutes = Math.ceil(remaining / 60_000);
        setUnlockError(`Too many failed attempts. Try again in ${minutes} min.`);
        return;
      }

      const result = await unlockSpark(securitySettings, pin);
      if (result.ok) {
        await clearFailedUnlockAttempts();
        void logSecurityEvent(userId, 'spark_unlock_success', { method: 'pin' });
        setUnlockModalVisible(false);
        setUnlockError(null);
        lastUnlockAtRef.current = Date.now();
        unlockResolverRef.current?.(true);
        unlockResolverRef.current = null;
        return;
      }

      const lockout = await recordFailedUnlockAttempt();
      void logSecurityEvent(userId, 'spark_unlock_failed', { method: 'pin' });
      if (lockout.locked) {
        setUnlockError('Too many failed attempts. Locked for 5 minutes.');
        setUnlockModalVisible(false);
        unlockResolverRef.current?.(false);
        unlockResolverRef.current = null;
        return;
      }
      setUnlockError(`Incorrect PIN. ${lockout.remainingAttempts} attempts left.`);
    },
    [securitySettings, userId],
  );

  const handleUnlockCancel = useCallback(() => {
    setUnlockModalVisible(false);
    setUnlockError(null);
    unlockResolverRef.current?.(false);
    unlockResolverRef.current = null;
  }, []);

  const handleRetryBiometric = useCallback(async () => {
    const result = await unlockSpark(securitySettings);
    if (result.ok) {
      setUnlockModalVisible(false);
      setUnlockError(null);
      lastUnlockAtRef.current = Date.now();
      unlockResolverRef.current?.(true);
      unlockResolverRef.current = null;
    }
  }, [securitySettings]);

  useEffect(() => {
    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        backgroundedAtRef.current = Date.now();
        if (securitySettings.autoDisguiseOnBackground && !disguiseMode) {
          setDisguiseModeState(true);
        }
        return;
      }

      if (nextState === 'active' && backgroundedAtRef.current) {
        const elapsedMs = Date.now() - backgroundedAtRef.current;
        const timeoutMs = securitySettings.sessionTimeoutMinutes * 60_000;
        if (
          timeoutMs > 0 &&
          !disguiseMode &&
          elapsedMs >= timeoutMs &&
          securitySettings.appLockEnabled
        ) {
          setDisguiseModeState(true);
        }
        backgroundedAtRef.current = null;
      }
    };

    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, [disguiseMode, securitySettings]);

  const scheduleSync = useCallback(() => {
    if (!isSupabaseConfigured() || !userId || !hasOnboarded) {
      return;
    }
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(() => {
      void syncToSupabase({
        userId,
        user,
        preferences,
        passedIds: setToArray(passedIds),
        likedIds: setToArray(likedIds),
        pendingLikeIds: setToArray(pendingLikeIds),
        blockedIds: setToArray(blockedIds),
        matches,
        conversations,
        isSparkPlus,
        isPaused,
      });
    }, 1500);
  }, [
    userId,
    hasOnboarded,
    user,
    preferences,
      passedIds,
      likedIds,
      pendingLikeIds,
      superLikedIds,
      blockedIds,
      matches,
    conversations,
    isSparkPlus,
    isPaused,
  ]);

  useEffect(() => {
    if (!hydratedRef.current || !hasOnboarded) {
      return;
    }
    void savePersistedState(buildPersistedState());
    scheduleSync();
  }, [buildPersistedState, hasOnboarded, scheduleSync]);

  const excludedIds = useMemo(() => {
    const ids = new Set<string>();
    passedIds.forEach((id) => ids.add(id));
    likedIds.forEach((id) => ids.add(id));
    blockedIds.forEach((id) => ids.add(id));
    heldIds.forEach((id) => ids.add(id));
    return ids;
  }, [blockedIds, heldIds, likedIds, passedIds]);

  const heldProfiles = useMemo(
    () =>
      Array.from(heldIds)
        .map((id) => getProfileById(id))
        .filter((profile): profile is Profile => profile !== undefined),
    [heldIds],
  );

  const standoutsProfiles = useMemo(() => {
    if (!privacyPreferences.personalisationEnabled) {
      return [];
    }
    return STANDOUT_IDS.map((id) => getProfileById(id)).filter(
      (profile): profile is Profile =>
        profile !== undefined && !excludedIds.has(profile.id),
    );
  }, [excludedIds, privacyPreferences.personalisationEnabled]);

  const recentlyActiveProfiles = useMemo(() => {
    if (!privacyPreferences.showActiveStatus) {
      return [];
    }
    return RECENTLY_ACTIVE_IDS.map((id) => getProfileById(id)).filter(
      (profile): profile is Profile =>
        profile !== undefined && !excludedIds.has(profile.id),
    );
  }, [excludedIds, privacyPreferences.showActiveStatus]);

  const blockedProfiles = useMemo(
    () =>
      Array.from(blockedIds)
        .map((id) => getProfileById(id))
        .filter((profile): profile is Profile => profile !== undefined),
    [blockedIds],
  );

  const getCompatibilityScore = useCallback(
    (profile: Profile) => computeCompatibilityScore(user, profile),
    [user],
  );

  const isBoosted = useMemo(() => {
    if (!boostActiveUntil) {
      return false;
    }
    return new Date(boostActiveUntil).getTime() > Date.now();
  }, [boostActiveUntil]);

  const discoverPool = useMemo(() => {
    if (isPaused) {
      return [];
    }
    const incomingExcluded = new Set<string>(INCOMING_LIKE_IDS);
    const pool = mockProfiles.filter((p) => !incomingExcluded.has(p.id));
    return filterDiscoverProfiles(
      pool,
      preferences,
      excludedIds,
      privacyPreferences.locationSharing,
    );
  }, [excludedIds, isPaused, preferences, privacyPreferences.locationSharing]);

  const discoverQueue = useMemo(() => {
    if (isPaused) {
      return [];
    }
    let unlocked = [...discoverPool.slice(0, discoverUnlockedCount)];

    if (isBoosted) {
      unlocked.sort((a, b) => {
        const aIncoming = INCOMING_LIKE_IDS_SET.has(a.id) ? 1 : 0;
        const bIncoming = INCOMING_LIKE_IDS_SET.has(b.id) ? 1 : 0;
        return bIncoming - aIncoming;
      });
    } else if (privacyPreferences.personalisationEnabled) {
      unlocked.sort(
        (a, b) => computeCompatibilityScore(user, b) - computeCompatibilityScore(user, a),
      );
    }

    if (!priorityProfileId) {
      return unlocked;
    }
    const priorityIndex = unlocked.findIndex((profile) => profile.id === priorityProfileId);
    if (priorityIndex <= 0) {
      return unlocked;
    }
    const priorityProfile = unlocked[priorityIndex];
    return [
      priorityProfile,
      ...unlocked.filter((profile) => profile.id !== priorityProfileId),
    ];
  }, [
    discoverPool,
    discoverUnlockedCount,
    isBoosted,
    isPaused,
    priorityProfileId,
    privacyPreferences.personalisationEnabled,
    user,
  ]);

  const discoverPoolTotal = discoverPool.length;
  const hasMoreInPool = discoverPool.length > discoverUnlockedCount;

  const dailyMostCompatible = useMemo(
    () =>
      privacyPreferences.personalisationEnabled
        ? pickDailyMostCompatible(user, discoverPool, todayKey())
        : null,
    [discoverPool, privacyPreferences.personalisationEnabled, user],
  );

  const remainingLikes = isSparkPlus
    ? Infinity
    : Math.max(0, FREE_DAILY_LIKE_LIMIT - dailyLikesUsed);
  const canLike = isSparkPlus || dailyLikesUsed < FREE_DAILY_LIKE_LIMIT;

  const sparkNotesUsedForToday = useMemo(() => {
    if (lastSparkNoteDate !== todayKey()) {
      return 0;
    }
    return sparkNotesUsedToday;
  }, [lastSparkNoteDate, sparkNotesUsedToday]);

  const dailyNoteLimit = isSparkPlus ? Infinity : FREE_DAILY_SPARK_NOTES;
  const remainingSparkNotes = isSparkPlus
    ? Infinity
    : Math.max(0, dailyNoteLimit - sparkNotesUsedForToday + bonusSparkNotes);
  const canSendSparkNote =
    isSparkPlus || sparkNotesUsedForToday < FREE_DAILY_SPARK_NOTES + bonusSparkNotes;

  const incomingLikes = useMemo(() => {
    const actioned = new Set([...likedIds, ...passedIds, ...blockedIds]);
    return incomingLikeProfiles.filter(
      (profile) =>
        !actioned.has(profile.id) &&
        !matches.some((match) => match.profile.id === profile.id),
    );
  }, [likedIds, passedIds, blockedIds, matches]);

  const likesTabBadge = isSparkPlus ? 0 : incomingLikes.length;

  const matchesTabBadge = useMemo(() => {
    const newMatchCount = matches.filter(
      (match) =>
        !conversations.some(
          (conversation) =>
            conversation.match.id === match.id && conversation.messages.length > 0,
        ),
    ).length;
    const unreadCount = conversations.filter((conversation) => conversation.unread).length;
    const yourTurnCount = conversations.filter(
      (conversation) => conversation.yourTurn && !conversation.unread,
    ).length;
    return newMatchCount + unreadCount + yourTurnCount;
  }, [conversations, matches]);

  const canRewind = isSparkPlus && lastPassedProfileId !== null;

  const isIncognitoActive = isSparkPlus && privacyPreferences.incognitoMode;

  const getActiveDateCheckIn = useCallback(
    (profileId: string): DateCheckIn | null => {
      const active = dateCheckIns.find(
        (checkIn) => checkIn.profileId === profileId && isDateCheckInActive(checkIn),
      );
      return active ?? null;
    },
    [dateCheckIns],
  );

  const signInWithAppleStub = useCallback(
    async (identityToken?: string, displayName?: string) => {
      setIsAuthenticated(true);

      if (isSupabaseConfigured() && identityToken) {
        const result = await signInWithAppleToken(identityToken, displayName);
        if (result.userId) {
          setUserId(result.userId);
          return;
        }
      }

      if (isSupabaseConfigured()) {
        const session = await getSupabaseSession();
        if (session?.userId) {
          setUserId(session.userId);
          return;
        }
      }

      if (!userId && !isProductionBuild()) {
        setUserId(`demo-${Date.now()}`);
      }
    },
    [userId],
  );

  const signInWithEmailMagicLink = useCallback(async (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes('@')) {
      return { ok: false, message: 'Enter a valid email address.' };
    }

    if (isSupabaseConfigured()) {
      const result = await signInWithMagicLink(trimmed);
      if (!result.ok) {
        return { ok: false, message: result.error ?? 'Could not send magic link.' };
      }
      return {
        ok: true,
        message: 'Magic link sent! Check your email to complete sign-in before continuing.',
      };
    }

    if (isProductionBuild()) {
      return { ok: false, message: 'Email sign-in requires Supabase configuration.' };
    }

    setIsAuthenticated(true);
    setUserId(`demo-email-${Date.now()}`);
    return { ok: true, message: 'Signed in locally. Connect Supabase for cloud email sign-in.' };
  }, []);

  const completeOnboarding = useCallback(
    (nextUser: UserProfile) => {
      setUser(nextUser);
      setHasOnboarded(true);
      setDisguiseModeState(true);
      if (!userId && isSupabaseConfigured()) {
        setUserId(`user-${Date.now()}`);
      }
    },
    [userId],
  );

  const updateUser = useCallback(
    (nextUser: UserProfile) => {
      setUser(nextUser);
      if (userId && isSupabaseConfigured()) {
        void uploadPhotosToCloud(userId, nextUser.photos).then((cloudPhotos) => {
          const changed = cloudPhotos.some((url, index) => url !== nextUser.photos[index]);
          if (changed) {
            setUser((current) => ({ ...current, photos: cloudPhotos }));
          }
        });
      }
    },
    [userId],
  );

  const applyCloudConversationUpdate = useCallback(
    (conversationId: string, update: ConversationRealtimeUpdate) => {
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: update.messages,
                yourTurn: update.yourTurn,
                unread: update.unread,
                lastMessage: update.lastMessage ?? conversation.lastMessage,
                lastMessageAt: update.lastMessageAt ?? conversation.lastMessageAt,
              }
            : conversation,
        ),
      );
    },
    [],
  );

  const updatePreferences = useCallback((next: DiscoveryPreferences) => {
    setPreferences(next);
  }, []);

  const toggleDiscoverFilter = useCallback((filter: DiscoverFilter) => {
    setPreferences((prev) => {
      const current = prev.discoverFilters ?? [];
      const next = current.includes(filter)
        ? current.filter((f) => f !== filter)
        : [...current, filter];
      return { ...prev, discoverFilters: next };
    });
    setDiscoverUnlockedCount(DISCOVER_BATCH_SIZE);
  }, []);

  const searchMorePeople = useCallback(() => {
    setDiscoverUnlockedCount((count) => count + DISCOVER_BATCH_SIZE);
  }, []);

  const expandSearchRadius = useCallback((miles: number) => {
    setPreferences((prev) => ({ ...prev, maxDistanceMiles: miles }));
    setDiscoverUnlockedCount(DISCOVER_BATCH_SIZE);
    setPriorityProfileId(null);
  }, []);

  const prioritizeProfileInDeck = useCallback(
    (profileId: string) => {
      const poolIndex = discoverPool.findIndex((profile) => profile.id === profileId);
      if (poolIndex < 0) {
        return;
      }
      if (poolIndex >= discoverUnlockedCount) {
        setDiscoverUnlockedCount(poolIndex + 1);
      }
      setPriorityProfileId(profileId);
    },
    [discoverPool, discoverUnlockedCount],
  );

  const holdProfile = useCallback((profileId: string) => {
    setHeldIds((prev) => new Set(prev).add(profileId));
  }, []);

  const unholdProfile = useCallback((profileId: string) => {
    setHeldIds((prev) => {
      const next = new Set(prev);
      next.delete(profileId);
      return next;
    });
  }, []);

  const passProfile = useCallback((profile: Profile) => {
    setPassedIds((prev) => new Set(prev).add(profile.id));
    setLastPassedProfileId(profile.id);
  }, []);

  const rewindLastPass = useCallback(() => {
    if (!isSparkPlus || !lastPassedProfileId) {
      return;
    }
    setPassedIds((prev) => {
      const next = new Set(prev);
      next.delete(lastPassedProfileId);
      return next;
    });
    setLastPassedProfileId(null);
    setRewindKey((k) => k + 1);
  }, [isSparkPlus, lastPassedProfileId]);

  const blockProfile = useCallback((profileId: string) => {
    setBlockedIds((prev) => new Set(prev).add(profileId));
    setMatches((prev) => prev.filter((match) => match.profile.id !== profileId));
    setConversations((prev) =>
      prev.filter((conversation) => conversation.match.profile.id !== profileId),
    );
    setPendingLikeIds((prev) => {
      const next = new Set(prev);
      next.delete(profileId);
      return next;
    });
  }, []);

  const unblockProfile = useCallback((profileId: string) => {
    setBlockedIds((prev) => {
      const next = new Set(prev);
      next.delete(profileId);
      return next;
    });
  }, []);

  const unlikeProfile = useCallback((profileId: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      next.delete(profileId);
      return next;
    });
    setPendingLikeIds((prev) => {
      const next = new Set(prev);
      next.delete(profileId);
      return next;
    });
    setSuperLikedIds((prev) => {
      const next = new Set(prev);
      next.delete(profileId);
      return next;
    });
    setSparkNotes((prev) => {
      const next = { ...prev };
      delete next[profileId];
      return next;
    });
  }, []);

  const unmatchProfile = useCallback((profileId: string) => {
    setMatches((prev) => prev.filter((match) => match.profile.id !== profileId));
    setConversations((prev) =>
      prev.filter((conversation) => conversation.match.profile.id !== profileId),
    );
    setLikedIds((prev) => {
      const next = new Set(prev);
      next.delete(profileId);
      return next;
    });
    setPendingLikeIds((prev) => {
      const next = new Set(prev);
      next.delete(profileId);
      return next;
    });
    setPassedIds((prev) => new Set(prev).add(profileId));
  }, []);

  const reportProfile = useCallback(
    (profileId: string, reason?: string) => {
      if (!checkClientRateLimit('report', 10, 60_000)) {
        return;
      }
      const sanitizedReason = reason ? sanitizeReportReason(reason) : 'Reported from app';
      if (userId) {
        void submitSecurityReport({
          reporterUserId: userId,
          reportedProfileId: profileId,
          reason: sanitizedReason,
          context: 'profile',
        });
        void logSecurityEvent(userId, 'profile_reported', { profileId });
      }
      blockProfile(profileId);
    },
    [blockProfile, userId],
  );

  const likeProfile = useCallback(
    (profile: Profile, sparkNote?: string): Match | null => {
      if (!canLike) {
        return null;
      }

      setLikedIds((prev) => new Set(prev).add(profile.id));
      if (!isSparkPlus) {
        setDailyLikesUsed((count) => count + 1);
      }

      if (sparkNote) {
        setSparkNotes((prev) => ({ ...prev, [profile.id]: sparkNote }));
        const today = todayKey();
        if (lastSparkNoteDate !== today) {
          setLastSparkNoteDate(today);
          setSparkNotesUsedToday(1);
        } else {
          setSparkNotesUsedToday((count) => count + 1);
        }
        if (bonusSparkNotes > 0 && !isSparkPlus) {
          setBonusSparkNotes((count) => Math.max(0, count - 1));
        }
      }

      const isInstantMatch =
        MUTUAL_MATCH_IDS.has(profile.id) ||
        INCOMING_LIKE_IDS_SET.has(profile.id) ||
        AI_PERSONA_IDS.has(profile.id);

      if (!isInstantMatch) {
        setPendingLikeIds((prev) => new Set(prev).add(profile.id));
        return null;
      }

      setPendingLikeIds((prev) => {
        const next = new Set(prev);
        next.delete(profile.id);
        return next;
      });

      const match: Match = {
        id: `match-${profile.id}`,
        profile,
        matchedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      };

      setMatches((prev) => {
        if (prev.some((item) => item.profile.id === profile.id)) {
          return prev;
        }
        return [match, ...prev];
      });

      setConversations((prev) => {
        if (prev.some((item) => item.match.profile.id === profile.id)) {
          return prev;
        }

        const persona = getAiPersonaConfig(profile);
        const openerText = persona?.openerMessages[0];
        const openerMessage = openerText
          ? {
              id: `msg-opener-${profile.id}`,
              text: openerText,
              sentAt: new Date().toISOString(),
              isMine: false,
            }
          : null;

        const conversation: Conversation = {
          id: `conv-${profile.id}`,
          match,
          messages: openerMessage ? [openerMessage] : [],
          yourTurn: true,
          unread: false,
          lastMessage: openerText,
          lastMessageAt: openerMessage?.sentAt,
        };
        return [conversation, ...prev];
      });

      if (notificationsEnabled && notificationPreferences.matches) {
        void scheduleMatchNotification(profile.name, {
          disguiseSafe: disguiseMode && securitySettings.disguiseSafeNotifications,
        });
      }

      return match;
    },
    [
      canLike,
      isSparkPlus,
      lastSparkNoteDate,
      notificationsEnabled,
      notificationPreferences.matches,
      bonusSparkNotes,
      disguiseMode,
      securitySettings.disguiseSafeNotifications,
    ],
  );

  const createMatchFromLike = useCallback(
    (profile: Profile, isSuperMatch: boolean): Match => {
      const match: Match = {
        id: `match-${profile.id}`,
        profile,
        matchedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        isSuperMatch,
      };

      setMatches((prev) => {
        if (prev.some((item) => item.profile.id === profile.id)) {
          return prev;
        }
        return [match, ...prev];
      });

      setConversations((prev) => {
        if (prev.some((item) => item.match.profile.id === profile.id)) {
          return prev;
        }
        const conversation: Conversation = {
          id: `conv-${profile.id}`,
          match,
          messages: [],
          yourTurn: true,
          unread: false,
        };
        return [conversation, ...prev];
      });

      if (notificationsEnabled && notificationPreferences.matches) {
        void scheduleMatchNotification(profile.name, {
          disguiseSafe: disguiseMode && securitySettings.disguiseSafeNotifications,
        });
      }

      return match;
    },
    [
      notificationsEnabled,
      notificationPreferences.matches,
      disguiseMode,
      securitySettings.disguiseSafeNotifications,
    ],
  );

  const superLikeProfile = useCallback(
    (profile: Profile): Match | null => {
      if (!canLike) {
        return null;
      }

      setLikedIds((prev) => new Set(prev).add(profile.id));
      setSuperLikedIds((prev) => new Set(prev).add(profile.id));
      if (!isSparkPlus) {
        setDailyLikesUsed((count) => count + 1);
      }

      const isMutual =
        MUTUAL_SUPER_LIKE_IDS.has(profile.id) || MUTUAL_MATCH_IDS.has(profile.id);

      if (!isMutual) {
        setPendingLikeIds((prev) => new Set(prev).add(profile.id));
        return null;
      }

      setPendingLikeIds((prev) => {
        const next = new Set(prev);
        next.delete(profile.id);
        return next;
      });

      return createMatchFromLike(profile, MUTUAL_SUPER_LIKE_IDS.has(profile.id));
    },
    [canLike, createMatchFromLike, isSparkPlus],
  );

  const sendMessage = useCallback(
    (conversationId: string, text: string, imageUrl?: string) => {
      if (!checkClientRateLimit(`message:${conversationId}`, 30, 60_000)) {
        return;
      }
      const trimmed = sanitizeMessage(text);
      if (!trimmed && !imageUrl) {
        return;
      }
      if (imageUrl && !isAllowedImageUrl(imageUrl)) {
        return;
      }

      const message: Message = {
        id: `msg-${Date.now()}`,
        text: trimmed || '📷 Photo',
        sentAt: new Date().toISOString(),
        isMine: true,
        imageUrl,
        status: 'sent',
      };

      const targetConversation = conversations.find((item) => item.id === conversationId);

      setConversations((prev) =>
        prev.map((conversation) => {
          if (conversation.id !== conversationId) {
            return conversation;
          }
          const updatedMessages = [...conversation.messages, message];
          return {
            ...conversation,
            messages: updatedMessages,
            lastMessage: trimmed || 'Photo',
            lastMessageAt: message.sentAt,
            yourTurn: false,
            unread: false,
            isTyping: false,
          };
        }),
      );

      if (
        notificationsEnabled &&
        notificationPreferences.messages &&
        trimmed &&
        targetConversation
      ) {
        void scheduleMessageNotification(targetConversation.match.profile.name, trimmed, {
          disguiseSafe: disguiseMode && securitySettings.disguiseSafeNotifications,
        });
      }

      setTimeout(() => {
        setConversations((prev) =>
          prev.map((conversation) => {
            if (conversation.id !== conversationId) {
              return conversation;
            }
            return {
              ...conversation,
              messages: conversation.messages.map((m) =>
                m.id === message.id ? { ...m, status: 'delivered' as const } : m,
              ),
            };
          }),
        );
      }, 800);

      if (isSparkPlus) {
        setTimeout(() => {
          setConversations((prev) =>
            prev.map((conversation) => {
              if (conversation.id !== conversationId) {
                return conversation;
              }
              return {
                ...conversation,
                messages: conversation.messages.map((m) =>
                  m.id === message.id ? { ...m, status: 'read' as const } : m,
                ),
              };
            }),
          );
        }, 2000);
      }

      setTimeout(() => {
        setConversations((prev) =>
          prev.map((conversation) => {
            if (conversation.id !== conversationId) {
              return conversation;
            }
            return { ...conversation, isTyping: true };
          }),
        );
      }, 2500);

      const replyProfile = targetConversation?.match.profile;
      const replyHistory = targetConversation
        ? [...targetConversation.messages, message]
        : [message];

      setTimeout(() => {
        void (async () => {
          let replyText = 'Haha, love that! 😊';
          if (replyProfile) {
            const result = await generateDemoReply({
              profile: replyProfile,
              userMessage: trimmed || (imageUrl ? 'sent a photo' : ''),
              recentMessages: replyHistory,
              userName: user.name,
            });
            replyText = result.text;
          }

          setConversations((prev) =>
            prev.map((conversation) => {
              if (conversation.id !== conversationId) {
                return conversation;
              }
              const reply: Message = {
                id: `msg-reply-${Date.now()}`,
                text: replyText,
                sentAt: new Date().toISOString(),
                isMine: false,
              };
              return {
                ...conversation,
                isTyping: false,
                messages: [...conversation.messages, reply],
                lastMessage: reply.text,
                lastMessageAt: reply.sentAt,
                yourTurn: true,
                unread: true,
              };
            }),
          );
        })();
      }, 4500);
    },
    [
      conversations,
      disguiseMode,
      isSparkPlus,
      notificationPreferences.messages,
      notificationsEnabled,
      securitySettings.disguiseSafeNotifications,
      user.name,
    ],
  );

  const activateSparkPlus = useCallback(() => {
    setIsSparkPlus(true);
  }, []);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSparkPlus(true);
    return true;
  }, []);

  const activateBoost = useCallback(() => {
    const until = new Date(Date.now() + BOOST_DURATION_MS).toISOString();
    setBoostActiveUntil(until);
    if (notificationsEnabled && notificationPreferences.boosts) {
      void scheduleMatchNotification('You', {
        disguiseSafe: disguiseMode && securitySettings.disguiseSafeNotifications,
      });
    }
  }, [
    disguiseMode,
    notificationPreferences.boosts,
    notificationsEnabled,
    securitySettings.disguiseSafeNotifications,
  ]);

  const savePulsePost = useCallback((postId: string) => {
    setPulseSocial((prev) => ({
      ...prev,
      savedPostIds: prev.savedPostIds.includes(postId)
        ? prev.savedPostIds
        : [...prev.savedPostIds, postId],
    }));
  }, []);

  const unsavePulsePost = useCallback((postId: string) => {
    setPulseSocial((prev) => ({
      ...prev,
      savedPostIds: prev.savedPostIds.filter((id) => id !== postId),
    }));
  }, []);

  const mutePulseAuthor = useCallback((handle: string) => {
    const normalized = handle.trim().toLowerCase();
    if (!normalized) {
      return;
    }
    setPulseSocial((prev) => ({
      ...prev,
      mutedAuthors: prev.mutedAuthors.includes(normalized)
        ? prev.mutedAuthors
        : [...prev.mutedAuthors, normalized],
    }));
  }, []);

  const unmutePulseAuthor = useCallback((handle: string) => {
    const normalized = handle.trim().toLowerCase();
    setPulseSocial((prev) => ({
      ...prev,
      mutedAuthors: prev.mutedAuthors.filter((author) => author !== normalized),
    }));
  }, []);

  const reportPulsePost = useCallback(
    (postId: string, reason?: string) => {
      setPulseSocial((prev) => ({
        ...prev,
        reportedPostIds: prev.reportedPostIds.includes(postId)
          ? prev.reportedPostIds
          : [...prev.reportedPostIds, postId],
      }));
      if (userId) {
        void submitSecurityReport({
          reporterUserId: userId,
          reportedProfileId: postId,
          reason: reason ? sanitizeReportReason(reason) : 'Reported Pulse post',
          context: 'pulse_post',
        });
      }
    },
    [userId],
  );

  const addPulseComment = useCallback(
    (postId: string, body: string) => {
      const trimmed = body.trim();
      if (!trimmed) {
        return;
      }
      const comment: PulseComment = {
        author: user.name,
        handle: `@${user.name.toLowerCase().replace(/\s+/g, '')}`,
        body: trimmed,
        sentAt: new Date().toISOString(),
      };
      setPulseSocial((prev) => ({
        ...prev,
        postComments: {
          ...prev.postComments,
          [postId]: [...(prev.postComments[postId] ?? []), comment],
        },
      }));
    },
    [user.name],
  );

  const getPulseComments = useCallback(
    (postId: string) => pulseSocial.postComments[postId] ?? [],
    [pulseSocial.postComments],
  );

  const recordReferralShare = useCallback(() => {
    const nextCount = pulseSocial.referralShareCount + 1;
    setPulseSocial((prev) => ({ ...prev, referralShareCount: nextCount }));
    if (nextCount >= 3 && nextCount % 3 === 0) {
      const until = new Date(Date.now() + BOOST_DURATION_MS).toISOString();
      setBoostActiveUntil(until);
    }
    return nextCount;
  }, [pulseSocial.referralShareCount]);

  const purchaseSparkNotes = useCallback((count: number) => {
    setBonusSparkNotes((prev) => prev + count);
  }, []);

  const enableNotifications = useCallback(async () => {
    const granted = await requestNotificationPermission();
    if (granted && userId) {
      await registerCloudPushToken(userId);
    }
    setNotificationsEnabled(granted);
    return granted;
  }, [userId]);

  const updateNotificationPreferences = useCallback(
    (prefs: NotificationPreferences) => {
      setNotificationPreferences(prefs);
      setPrivacyPreferences((prev) => ({
        ...prev,
        marketingConsent: prefs.marketing,
      }));
    },
    [],
  );

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
  }, []);

  const proceedSparkUnlock = useCallback(async (): Promise<boolean> => {
    const unlocked = await runSparkUnlockFlow();
    if (unlocked) {
      setDisguiseModeState(false);
    }
    return unlocked;
  }, [runSparkUnlockFlow]);

  const setDisguiseMode = useCallback(
    async (enabled: boolean): Promise<boolean> => {
      if (enabled) {
        setDisguiseModeState(true);
        return true;
      }
      if (!legalConsent.disguisePolicyAcceptedAt) {
        pendingDisguiseUnlockRef.current = true;
        setDisguisePolicyModalVisible(true);
        return false;
      }
      return proceedSparkUnlock();
    },
    [legalConsent.disguisePolicyAcceptedAt, proceedSparkUnlock],
  );

  const updateSecuritySettings = useCallback((settings: SecuritySettings) => {
    setSecuritySettings(settings);
  }, []);

  const updatePrivacyPreferences = useCallback((prefs: PrivacyPreferences) => {
    setPrivacyPreferences(prefs);
  }, []);

  const setIncognitoMode = useCallback(
    (enabled: boolean): boolean => {
      if (enabled && !isSparkPlus) {
        return false;
      }
      setPrivacyPreferences((prev) => ({ ...prev, incognitoMode: enabled }));
      return true;
    },
    [isSparkPlus],
  );

  const startDateCheckIn = useCallback(
    (
      profileId: string,
      profileName: string,
      payload: { location: string; plannedAt: string; emergencyContact?: string },
    ) => {
      const checkIn: DateCheckIn = {
        id: `checkin-${Date.now()}`,
        profileId,
        profileName,
        location: payload.location,
        plannedAt: payload.plannedAt,
        emergencyContact: payload.emergencyContact,
      };
      setDateCheckIns((prev) => [checkIn, ...prev.filter((item) => item.profileId !== profileId)]);
    },
    [],
  );

  const checkInDateNow = useCallback((checkInId: string) => {
    setDateCheckIns((prev) =>
      prev.map((checkIn) =>
        checkIn.id === checkInId
          ? { ...checkIn, checkedInAt: new Date().toISOString() }
          : checkIn,
      ),
    );
  }, []);

  const completeDateCheckIn = useCallback((checkInId: string) => {
    setDateCheckIns((prev) =>
      prev.map((checkIn) =>
        checkIn.id === checkInId
          ? { ...checkIn, completedAt: new Date().toISOString() }
          : checkIn,
      ),
    );
  }, []);

  const acceptOnboardingLegal = useCallback(() => {
    const now = new Date().toISOString();
    setLegalConsent((prev) => ({
      ...prev,
      termsAcceptedAt: now,
      privacyAcceptedAt: now,
    }));
  }, []);

  const acceptDisguisePolicy = useCallback(() => {
    const now = new Date().toISOString();
    setLegalConsent((prev) => ({ ...prev, disguisePolicyAcceptedAt: now }));
    setDisguisePolicyModalVisible(false);
    if (pendingDisguiseUnlockRef.current) {
      pendingDisguiseUnlockRef.current = false;
      void proceedSparkUnlock();
    }
  }, [proceedSparkUnlock]);

  const acceptCookieConsent = useCallback(() => {
    setLegalConsent((prev) => ({ ...prev, cookieConsentAt: new Date().toISOString() }));
  }, []);

  const exportUserData = useCallback(async (): Promise<boolean> => {
    try {
      const payload = buildUserDataExport(buildPersistedState());
      await shareUserDataExport(payload);
      return true;
    } catch {
      return false;
    }
  }, [buildPersistedState]);

  const cancelDisguisePolicy = useCallback(() => {
    pendingDisguiseUnlockRef.current = false;
    setDisguisePolicyModalVisible(false);
  }, []);

  const generateDisguiseAd = useCallback(
    async (overlayText: string, variant: DisguiseOverlayVariant) => {
      const sourcePhotoUrl = user.photos[0];
      if (!sourcePhotoUrl) {
        return { ok: false, message: 'Add a profile photo first.' };
      }

      setIsGeneratingDisguiseAd(true);
      try {
        const creative = await generateDisguiseAdImage({
          sourcePhotoUrl,
          overlayText,
          variant,
        });
        setDisguiseAdCreative(creative);
        return { ok: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Generation failed.';
        return { ok: false, message };
      } finally {
        setIsGeneratingDisguiseAd(false);
      }
    },
    [user.photos],
  );

  const clearDisguiseAd = useCallback(() => {
    setDisguiseAdCreative(null);
  }, []);

  const setPaused = useCallback((paused: boolean) => {
    setIsPaused(paused);
  }, []);

  const deleteAccount = useCallback(async () => {
    if (userId && isSupabaseConfigured()) {
      await deleteSupabaseAccount(userId);
    }
    await clearPersistedState();
    await clearVaultKey();
    setHasOnboarded(false);
    setIsAuthenticated(false);
    setUserId(null);
    setUser(defaultPersisted.user);
    setPreferences(defaultPreferences);
    setPassedIds(new Set());
    setLikedIds(new Set());
    setPendingLikeIds(new Set());
    setSuperLikedIds(new Set());
    setBlockedIds(new Set());
    setMatches([]);
    setConversations(seedConversations);
    setSparkNotes({});
    setDailyLikesUsed(0);
    setIsSparkPlus(false);
    setBoostActiveUntil(null);
    setIsPaused(false);
    setDisguiseModeState(true);
    setDisguiseAdCreative(null);
    setSecuritySettings(defaultSecuritySettings);
    setPrivacyPreferences(defaultPrivacyPreferences);
    setLegalConsent(defaultLegalConsent);
    setPulseSocial(defaultPulseSocialState);
    setLastPassedProfileId(null);
    setDiscoverUnlockedCount(DISCOVER_BATCH_SIZE);
    setPriorityProfileId(null);
  }, [userId]);

  const getConversationIdForProfile = useCallback(
    (profileId: string) => {
      const conversation = conversations.find(
        (item) => item.match.profile.id === profileId,
      );
      return conversation?.id ?? `conv-${profileId}`;
    },
    [conversations],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      hasOnboarded,
      isHydrated,
      isAuthenticated,
      userId,
      user,
      preferences,
      discoverQueue,
      discoverPoolTotal,
      hasMoreInPool,
      passedIds,
      likedIds,
      pendingLikeIds,
      superLikedIds,
      blockedIds,
      blockedProfiles,
      heldIds,
      heldProfiles,
      pulseSocial,
      standoutsProfiles,
      recentlyActiveProfiles,
      dailyMostCompatible,
      getCompatibilityScore,
      matches,
      conversations,
      incomingLikes,
      sparkNotes,
      dailyLikesUsed,
      remainingLikes,
      remainingSparkNotes,
      canLike,
      canSendSparkNote,
      likesTabBadge,
      matchesTabBadge,
      isSparkPlus,
      isBoosted,
      boostActiveUntil,
      notificationsEnabled,
      notificationPreferences,
      isPaused,
      themeMode,
      disguiseMode,
      disguiseAdCreative,
      isGeneratingDisguiseAd,
      securitySettings,
      privacyPreferences,
      isIncognitoActive,
      legalConsent,
      dateCheckIns,
      canRewind,
      rewindKey,
      isSupabaseEnabled: isSupabaseConfigured(),
      completeOnboarding,
      signInWithAppleStub,
      signInWithEmailMagicLink,
      updateUser,
      applyCloudConversationUpdate,
      updatePreferences,
      toggleDiscoverFilter,
      searchMorePeople,
      expandSearchRadius,
      prioritizeProfileInDeck,
      holdProfile,
      unholdProfile,
      passProfile,
      likeProfile,
      superLikeProfile,
      sendMessage,
      getConversationIdForProfile,
      blockProfile,
      unblockProfile,
      unlikeProfile,
      reportProfile,
      unmatchProfile,
      savePulsePost,
      unsavePulsePost,
      mutePulseAuthor,
      unmutePulseAuthor,
      reportPulsePost,
      addPulseComment,
      getPulseComments,
      recordReferralShare,
      activateSparkPlus,
      restorePurchases,
      activateBoost,
      purchaseSparkNotes,
      rewindLastPass,
      enableNotifications,
      updateNotificationPreferences,
      setThemeMode,
      setDisguiseMode,
      updateSecuritySettings,
      updatePrivacyPreferences,
      setIncognitoMode,
      getActiveDateCheckIn,
      startDateCheckIn,
      checkInDateNow,
      completeDateCheckIn,
      acceptOnboardingLegal,
      acceptDisguisePolicy,
      acceptCookieConsent,
      exportUserData,
      generateDisguiseAd,
      clearDisguiseAd,
      setPaused,
      deleteAccount,
    }),
    [
      hasOnboarded,
      isHydrated,
      isAuthenticated,
      userId,
      user,
      preferences,
      discoverQueue,
      discoverPoolTotal,
      hasMoreInPool,
      passedIds,
      likedIds,
      pendingLikeIds,
      superLikedIds,
      blockedIds,
      blockedProfiles,
      heldIds,
      heldProfiles,
      pulseSocial,
      standoutsProfiles,
      recentlyActiveProfiles,
      dailyMostCompatible,
      getCompatibilityScore,
      matches,
      conversations,
      incomingLikes,
      sparkNotes,
      dailyLikesUsed,
      remainingLikes,
      remainingSparkNotes,
      canLike,
      canSendSparkNote,
      likesTabBadge,
      matchesTabBadge,
      isSparkPlus,
      isBoosted,
      boostActiveUntil,
      notificationsEnabled,
      notificationPreferences,
      isPaused,
      themeMode,
      disguiseMode,
      disguiseAdCreative,
      isGeneratingDisguiseAd,
      securitySettings,
      privacyPreferences,
      isIncognitoActive,
      legalConsent,
      dateCheckIns,
      canRewind,
      rewindKey,
      completeOnboarding,
      signInWithAppleStub,
      signInWithEmailMagicLink,
      updateUser,
      applyCloudConversationUpdate,
      updatePreferences,
      toggleDiscoverFilter,
      searchMorePeople,
      expandSearchRadius,
      prioritizeProfileInDeck,
      holdProfile,
      unholdProfile,
      passProfile,
      likeProfile,
      superLikeProfile,
      sendMessage,
      getConversationIdForProfile,
      blockProfile,
      unblockProfile,
      unlikeProfile,
      reportProfile,
      unmatchProfile,
      savePulsePost,
      unsavePulsePost,
      mutePulseAuthor,
      unmutePulseAuthor,
      reportPulsePost,
      addPulseComment,
      getPulseComments,
      recordReferralShare,
      activateSparkPlus,
      restorePurchases,
      activateBoost,
      purchaseSparkNotes,
      rewindLastPass,
      enableNotifications,
      updateNotificationPreferences,
      setThemeMode,
      setDisguiseMode,
      updateSecuritySettings,
      updatePrivacyPreferences,
      setIncognitoMode,
      getActiveDateCheckIn,
      startDateCheckIn,
      checkInDateNow,
      completeDateCheckIn,
      acceptOnboardingLegal,
      acceptDisguisePolicy,
      acceptCookieConsent,
      exportUserData,
      generateDisguiseAd,
      clearDisguiseAd,
      setPaused,
      deleteAccount,
    ],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <DisguisePolicyModal
        visible={disguisePolicyModalVisible}
        onAccept={acceptDisguisePolicy}
        onCancel={cancelDisguisePolicy}
      />
      <SparkUnlockModal
        visible={unlockModalVisible}
        error={unlockError}
        onSubmitPin={handleUnlockPinSubmit}
        onCancel={handleUnlockCancel}
        onRetryBiometric={handleRetryBiometric}
        showBiometricRetry={securitySettings.biometricEnabled}
      />
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
