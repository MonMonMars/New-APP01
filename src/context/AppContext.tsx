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
import {
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
import {
  defaultNotificationPreferences,
  NotificationPreferences,
  ThemeMode,
} from '../types/settings';
import { defaultSecuritySettings, SecuritySettings } from '../types/security';
import { FREE_DAILY_LIKE_LIMIT, FREE_DAILY_SPARK_NOTES } from '../types/subscription';
import { BOOST_DURATION_MS } from '../types/subscription';
import { unlockSpark } from '../utils/appLock';
import { computeCompatibilityScore, pickDailyMostCompatible } from '../utils/compatibility';
import { requestNotificationPermission, scheduleMatchNotification } from '../utils/notifications';
import {
  checkClientRateLimit,
  isProductionBuild,
  sanitizeMessage,
  sanitizeReportReason,
} from '../utils/securityGuards';
import { clearVaultKey } from '../utils/secureStorage';
import { SparkUnlockModal } from '../components/security/SparkUnlockModal';
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
): Profile[] {
  const filters = preferences.discoverFilters ?? [];
  return profiles.filter(
    (profile) =>
      !excludedIds.has(profile.id) &&
      profile.distanceMiles <= preferences.maxDistanceMiles &&
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
  heldIds: Set<string>;
  heldProfiles: Profile[];
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
  reportProfile: (profileId: string, reason?: string) => void;
  unmatchProfile: (profileId: string) => void;
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
  const [unlockModalVisible, setUnlockModalVisible] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const unlockResolverRef = useRef<((ok: boolean) => void) | null>(null);
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
    const result = await unlockSpark(securitySettings);
    if (result.ok) {
      lastUnlockAtRef.current = Date.now();
      return true;
    }
    if (!securitySettings.pinEnabled) {
      return false;
    }
    return new Promise<boolean>((resolve) => {
      unlockResolverRef.current = resolve;
      setUnlockError(null);
      setUnlockModalVisible(true);
    });
  }, [securitySettings]);

  const handleUnlockPinSubmit = useCallback(
    async (pin: string) => {
      const result = await unlockSpark(securitySettings, pin);
      if (result.ok) {
        setUnlockModalVisible(false);
        setUnlockError(null);
        lastUnlockAtRef.current = Date.now();
        unlockResolverRef.current?.(true);
        unlockResolverRef.current = null;
        return;
      }
      setUnlockError('Incorrect PIN. Try again.');
    },
    [securitySettings],
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

  const standoutsProfiles = useMemo(
    () =>
      STANDOUT_IDS.map((id) => getProfileById(id)).filter(
        (profile): profile is Profile =>
          profile !== undefined && !excludedIds.has(profile.id),
      ),
    [excludedIds],
  );

  const recentlyActiveProfiles = useMemo(
    () =>
      RECENTLY_ACTIVE_IDS.map((id) => getProfileById(id)).filter(
        (profile): profile is Profile =>
          profile !== undefined && !excludedIds.has(profile.id),
      ),
    [excludedIds],
  );

  const getCompatibilityScore = useCallback(
    (profile: Profile) => computeCompatibilityScore(user, profile),
    [user],
  );

  const discoverPool = useMemo(() => {
    if (isPaused) {
      return [];
    }
    const incomingExcluded = new Set<string>(INCOMING_LIKE_IDS);
    const pool = mockProfiles.filter((p) => !incomingExcluded.has(p.id));
    return filterDiscoverProfiles(pool, preferences, excludedIds);
  }, [excludedIds, isPaused, preferences]);

  const discoverQueue = useMemo(() => {
    if (isPaused) {
      return [];
    }
    const unlocked = discoverPool.slice(0, discoverUnlockedCount);
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
  }, [discoverPool, discoverUnlockedCount, isPaused, priorityProfileId]);

  const discoverPoolTotal = discoverPool.length;
  const hasMoreInPool = discoverPool.length > discoverUnlockedCount;

  const dailyMostCompatible = useMemo(
    () => pickDailyMostCompatible(user, discoverPool, todayKey()),
    [discoverPool, user],
  );

  const isBoosted = useMemo(() => {
    if (!boostActiveUntil) {
      return false;
    }
    return new Date(boostActiveUntil).getTime() > Date.now();
  }, [boostActiveUntil]);

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
    return { ok: true, message: 'Signed in (demo mode). Cloud email requires Supabase.' };
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
      const sanitizedReason = reason ? sanitizeReportReason(reason) : undefined;
      void sanitizedReason;
      blockProfile(profileId);
    },
    [blockProfile],
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

      if (!MUTUAL_MATCH_IDS.has(profile.id) && !INCOMING_LIKE_IDS_SET.has(profile.id)) {
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

      const message: Message = {
        id: `msg-${Date.now()}`,
        text: trimmed || '📷 Photo',
        sentAt: new Date().toISOString(),
        isMine: true,
        imageUrl,
        status: 'sent',
      };

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

      setTimeout(() => {
        setConversations((prev) =>
          prev.map((conversation) => {
            if (conversation.id !== conversationId) {
              return conversation;
            }
            const reply: Message = {
              id: `msg-reply-${Date.now()}`,
              text: 'Haha, love that! 😊',
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
      }, 4500);
    },
    [isSparkPlus],
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
  }, []);

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

  const updateNotificationPreferences = useCallback((prefs: NotificationPreferences) => {
    setNotificationPreferences(prefs);
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
  }, []);

  const setDisguiseMode = useCallback(
    async (enabled: boolean): Promise<boolean> => {
      if (enabled) {
        setDisguiseModeState(true);
        return true;
      }
      const unlocked = await runSparkUnlockFlow();
      if (unlocked) {
        setDisguiseModeState(false);
      }
      return unlocked;
    },
    [runSparkUnlockFlow],
  );

  const updateSecuritySettings = useCallback((settings: SecuritySettings) => {
    setSecuritySettings(settings);
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
      heldIds,
      heldProfiles,
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
      reportProfile,
      unmatchProfile,
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
      heldIds,
      heldProfiles,
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
      reportProfile,
      unmatchProfile,
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
      generateDisguiseAd,
      clearDisguiseAd,
      setPaused,
      deleteAccount,
    ],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
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
