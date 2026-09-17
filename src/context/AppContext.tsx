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
  getIncomingLikeProfilesForSection,
  getProfileById,
  INCOMING_LIKE_IDS,
  INCOMING_LIKE_IDS_SET,
  EMBER_INCOMING_LIKE_IDS,
  EMBER_INCOMING_LIKE_IDS_SET,
  EMBER_PROFILE_VIEWER_IDS,
  EMBER_RECENTLY_ACTIVE_IDS,
  mockProfiles,
  MUTUAL_MATCH_IDS,
  MUTUAL_SUPER_LIKE_IDS,
  PROFILE_VIEWER_IDS,
  RECENTLY_ACTIVE_IDS,
  STANDOUT_IDS,
} from '../data/profiles';
import {
  buildEmberSeedConversations,
  buildEmberSeedMatches,
  buildEmberSeedSwipeState,
  buildSeedConversations,
  buildSeedMatches,
  buildSeedSwipeState,
} from '../data/seedState';
import { uploadPhotosToCloud } from '../services/cloudStorage';
import { generateDisguiseAdImage } from '../services/disguiseImageGeneration';
import { registerCloudPushToken } from '../services/pushCloud';
import { scheduleDateCheckInReminder } from '../utils/notifications';
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
  matchesSparkSection,
  resolveSparkSection,
  ShowMePreference,
  SparkSection,
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
import { BoostActivationResult, getIsoWeekKey } from '../utils/boostQuota';
import { BOOST_DURATION_MS } from '../types/subscription';
import {
  dailyLikeLimitForGender,
  dailySparkNoteLimitForGender,
} from '../utils/genderAccountPerks';
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
import { matchesPassportCity } from '../utils/passportFilter';
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
import { disguiseWorldMeta } from '../utils/disguiseWorld';
import { DisguiseUnlockConfirm } from '../components/disguise/DisguiseUnlockConfirm';
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

function matchesAdvancedFilters(
  profile: Profile,
  user: UserProfile,
  advanced: DiscoveryPreferences['advancedFilters'],
  isSparkPlus: boolean,
): boolean {
  if (!advanced) {
    return true;
  }

  const emberStatuses = advanced.emberStatuses ?? [];
  if (emberStatuses.length > 0) {
    const status = profile.relationshipStatus;
    if (status !== 'married' && status !== 'divorced') {
      return false;
    }
    if (!emberStatuses.includes(status)) {
      return false;
    }
  }

  const emberDiscretion = advanced.emberDiscretion ?? [];
  if (emberDiscretion.length > 0) {
    if (!profile.emberDiscretion || !emberDiscretion.includes(profile.emberDiscretion)) {
      return false;
    }
  }

  const emberSeeking = advanced.emberSeeking ?? [];
  if (emberSeeking.length > 0) {
    if (!profile.emberSeeking || !emberSeeking.includes(profile.emberSeeking)) {
      return false;
    }
  }

  if (!isSparkPlus) {
    return true;
  }

  const intentFilter = advanced.intents ?? [];
  if (intentFilter.length > 0) {
    if (!profile.intent || !intentFilter.includes(profile.intent)) {
      return false;
    }
  }

  if (advanced.sharedInterestsOnly) {
    const userInterests = new Set(user.interests.map((interest) => interest.toLowerCase()));
    const hasShared = profile.interests.some((interest) =>
      userInterests.has(interest.toLowerCase()),
    );
    if (!hasShared) {
      return false;
    }
  }

  return true;
}

function filterDiscoverProfiles(
  profiles: Profile[],
  preferences: DiscoveryPreferences,
  excludedIds: Set<string>,
  user: UserProfile,
  isSparkPlus: boolean,
  locationSharing = true,
): Profile[] {
  const filters = preferences.discoverFilters ?? [];
  const maxDistance =
    preferences.travelMode && preferences.passportCity
      ? 9999
      : locationSharing
        ? preferences.maxDistanceMiles
        : 9999;
  const section = resolveSparkSection(preferences.sparkSection);
  return profiles.filter(
    (profile) =>
      !excludedIds.has(profile.id) &&
      profile.distanceMiles <= maxDistance &&
      profile.age >= preferences.minAge &&
      profile.age <= preferences.maxAge &&
      matchesGenderFilter(profile, preferences.showMe) &&
      matchesDiscoverFilters(profile, filters) &&
      matchesAdvancedFilters(profile, user, preferences.advancedFilters, isSparkPlus) &&
      matchesSparkSection(profile, section) &&
      (!preferences.travelMode ||
        !preferences.passportCity ||
        matchesPassportCity(profile.city, preferences.passportCity)),
  );
}

function arrayToSet(values: string[]): Set<string> {
  return new Set(values);
}

function setToArray(set: Set<string>): string[] {
  return Array.from(set);
}

/** Stable pseudo-random visibility for incognito mode (~40% of profiles stay discoverable). */
function stableIncognitoVisible(profileId: string): boolean {
  let hash = 0;
  for (let i = 0; i < profileId.length; i++) {
    hash = (hash + profileId.charCodeAt(i)) % 5;
  }
  return hash < 2;
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
  bonusBoosts: number;
  canUseFreeWeeklyBoost: boolean;
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
  hasRewindablePass: boolean;
  rewindKey: number;
  showMomentumUpsell: boolean;
  dismissMomentumUpsell: () => void;
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
  setSparkSection: (section: SparkSection) => void;
  toggleDiscoverFilter: (filter: DiscoverFilter) => void;
  searchMorePeople: () => void;
  expandSearchRadius: (miles: number) => void;
  prioritizeProfileInDeck: (profileId: string) => void;
  holdProfile: (profileId: string) => void;
  unholdProfile: (profileId: string) => void;
  passProfile: (profile: Profile) => void;
  likeProfile: (profile: Profile, sparkNote?: string) => Match | null;
  superLikeProfile: (profile: Profile) => Match | null;
  sendMessage: (conversationId: string, text: string, imageUrl?: string, isGif?: boolean) => void;
  sendVoiceNote: (conversationId: string, durationSeconds: number) => void;
  getConversationIdForProfile: (profileId: string) => string | null;
  blockProfile: (profileId: string) => void;
  unblockProfile: (profileId: string) => void;
  unlikeProfile: (profileId: string) => void;
  reportProfile: (profileId: string, reason?: string) => void;
  unmatchProfile: (profileId: string) => void;
  savePulsePost: (postId: string) => void;
  unsavePulsePost: (postId: string) => void;
  togglePulseLike: (postId: string) => void;
  mutePulseAuthor: (handle: string) => void;
  unmutePulseAuthor: (handle: string) => void;
  reportPulsePost: (postId: string, reason?: string) => void;
  addPulseComment: (postId: string, body: string) => void;
  getPulseComments: (postId: string) => PulseComment[];
  recordReferralShare: () => number;
  activateSparkPlus: () => void;
  restorePurchases: () => Promise<boolean>;
  activateBoost: (options?: { purchased?: boolean }) => BoostActivationResult;
  addBonusBoosts: (count: number) => void;
  recordPulseReading: (title: string, source: string) => void;
  markActivityAlertsRead: () => void;
  purchaseSparkNotes: (count: number) => void;
  rewindLastPass: () => void;
  profileViewers: Profile[];
  profileViewCount: number;
  reactToMessage: (conversationId: string, messageId: string, reaction: string) => void;
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
  const [profileViewerIds, setProfileViewerIds] = useState<string[]>([...PROFILE_VIEWER_IDS]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations);
  const [sparkNotes, setSparkNotes] = useState<Record<string, string>>({});
  const [dailyLikesUsed, setDailyLikesUsed] = useState(0);
  const [isSparkPlus, setIsSparkPlus] = useState(false);
  const [showMomentumUpsell, setShowMomentumUpsell] = useState(false);
  const [momentumUpsellDismissed, setMomentumUpsellDismissed] = useState(false);
  const [boostActiveUntil, setBoostActiveUntil] = useState<string | null>(null);
  const [freeBoostWeekKey, setFreeBoostWeekKey] = useState<string | null>(null);
  const [bonusBoosts, setBonusBoosts] = useState(0);
  const [sparkNotesUsedToday, setSparkNotesUsedToday] = useState(0);
  const [lastSparkNoteDate, setLastSparkNoteDate] = useState<string | null>(null);
  const [bonusSparkNotes, setBonusSparkNotes] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(
    defaultNotificationPreferences,
  );
  const [lastPassedProfileId, setLastPassedProfileId] = useState<string | null>(null);
  const [emberDailyLikesUsed, setEmberDailyLikesUsed] = useState(0);
  const [emberLastPassedProfileId, setEmberLastPassedProfileId] = useState<string | null>(null);
  const [emberSparkNotesUsedToday, setEmberSparkNotesUsedToday] = useState(0);
  const [emberLastSparkNoteDate, setEmberLastSparkNoteDate] = useState<string | null>(null);
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
  const [unlockConfirmVisible, setUnlockConfirmVisible] = useState(false);
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
        setProfileViewerIds(
          saved.profileViewerIds?.length
            ? saved.profileViewerIds
            : [...PROFILE_VIEWER_IDS],
        );
        setMatches(saved.matches);
        setConversations(
          saved.conversations.length > 0 ? saved.conversations : seedConversations,
        );
        const hasEmberData = saved.matches.some((match) =>
          matchesSparkSection(match.profile, 'ember'),
        );
        if (!hasEmberData) {
          const emberMatches = buildEmberSeedMatches();
          const emberSwipe = buildEmberSeedSwipeState();
          setMatches([...saved.matches, ...emberMatches]);
          setConversations([
            ...(saved.conversations.length > 0 ? saved.conversations : seedConversations),
            ...buildEmberSeedConversations(emberMatches),
          ]);
          setLikedIds(arrayToSet([...(saved.likedIds ?? []), ...emberSwipe.likedIds]));
          setPendingLikeIds(
            arrayToSet([...(saved.pendingLikeIds ?? []), ...emberSwipe.pendingLikeIds]),
          );
          setPassedIds(arrayToSet([...(saved.passedIds ?? []), ...emberSwipe.passedIds]));
        }
        setSparkNotes(saved.sparkNotes);
        setDailyLikesUsed(saved.dailyLikesUsed);
        setIsSparkPlus(saved.isSparkPlus);
        setBoostActiveUntil(saved.boostActiveUntil);
        setFreeBoostWeekKey(saved.freeBoostWeekKey ?? null);
        setBonusBoosts(saved.bonusBoosts ?? 0);
        setSparkNotesUsedToday(saved.sparkNotesUsedToday);
        setLastSparkNoteDate(saved.lastSparkNoteDate);
        setBonusSparkNotes(saved.bonusSparkNotes);
        setNotificationsEnabled(saved.notificationsEnabled);
        setNotificationPreferences(saved.notificationPreferences);
        setLastPassedProfileId(saved.lastPassedProfileId);
        setEmberDailyLikesUsed(saved.emberDailyLikesUsed ?? 0);
        setEmberLastPassedProfileId(saved.emberLastPassedProfileId ?? null);
        setEmberSparkNotesUsedToday(saved.emberSparkNotesUsedToday ?? 0);
        setEmberLastSparkNoteDate(saved.emberLastSparkNoteDate ?? null);
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
        const emberMatches = buildEmberSeedMatches();
        const seedSwipe = buildSeedSwipeState();
        const emberSwipe = buildEmberSeedSwipeState();
        setMatches([...seedMatches, ...emberMatches]);
        setConversations([
          ...buildSeedConversations(seedMatches),
          ...buildEmberSeedConversations(emberMatches),
        ]);
        setLikedIds(arrayToSet([...seedSwipe.likedIds, ...emberSwipe.likedIds]));
        setPendingLikeIds(arrayToSet([...seedSwipe.pendingLikeIds, ...emberSwipe.pendingLikeIds]));
        setPassedIds(arrayToSet([...seedSwipe.passedIds, ...emberSwipe.passedIds]));
        setSuperLikedIds(arrayToSet([...seedSwipe.superLikedIds, ...emberSwipe.superLikedIds]));
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
      profileViewerIds,
      matches,
      conversations,
      dailyLikesUsed,
      isSparkPlus,
      sparkNotes,
      boostActiveUntil,
      freeBoostWeekKey,
      bonusBoosts,
      sparkNotesUsedToday,
      lastSparkNoteDate,
      bonusSparkNotes,
      notificationsEnabled,
      notificationPreferences,
      lastPassedProfileId,
      emberDailyLikesUsed,
      emberLastPassedProfileId,
      emberSparkNotesUsedToday,
      emberLastSparkNoteDate,
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
    profileViewerIds,
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
    freeBoostWeekKey,
    bonusBoosts,
    sparkNotesUsedToday,
    lastSparkNoteDate,
    bonusSparkNotes,
    notificationsEnabled,
    notificationPreferences,
    lastPassedProfileId,
    emberDailyLikesUsed,
    emberLastPassedProfileId,
    emberSparkNotesUsedToday,
    emberLastSparkNoteDate,
    isPaused,
    themeMode,
    disguiseMode,
    disguiseAdCreative,
    securitySettings,
  ]);

  const runSparkUnlockFlow = useCallback(async (): Promise<boolean> => {
    const leaveLabel = disguiseWorldMeta(preferences.sparkSection, user.gender).unlockLabel;
    if (await isUnlockLockedOut()) {
      const remaining = await getUnlockLockoutRemainingMs();
      const minutes = Math.ceil(remaining / 60_000);
      setUnlockError(`Too many failed attempts. Try again in ${minutes} min.`);
      setUnlockModalVisible(true);
      return false;
    }

    const result = await unlockSpark(securitySettings, undefined, leaveLabel);
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
  }, [securitySettings, userId, preferences.sparkSection, user.gender]);

  const handleUnlockPinSubmit = useCallback(
    async (pin: string) => {
      const leaveLabel = disguiseWorldMeta(preferences.sparkSection, user.gender).unlockLabel;
      if (await isUnlockLockedOut()) {
        const remaining = await getUnlockLockoutRemainingMs();
        const minutes = Math.ceil(remaining / 60_000);
        setUnlockError(`Too many failed attempts. Try again in ${minutes} min.`);
        return;
      }

      const result = await unlockSpark(securitySettings, pin, leaveLabel);
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
    [securitySettings, userId, preferences.sparkSection, user.gender],
  );

  const handleUnlockCancel = useCallback(() => {
    setUnlockModalVisible(false);
    setUnlockError(null);
    unlockResolverRef.current?.(false);
    unlockResolverRef.current = null;
  }, []);

  const handleRetryBiometric = useCallback(async () => {
    const leaveLabel = disguiseWorldMeta(preferences.sparkSection, user.gender).unlockLabel;
    const result = await unlockSpark(securitySettings, undefined, leaveLabel);
    if (result.ok) {
      setUnlockModalVisible(false);
      setUnlockError(null);
      lastUnlockAtRef.current = Date.now();
      unlockResolverRef.current?.(true);
      unlockResolverRef.current = null;
    }
  }, [securitySettings, preferences.sparkSection, user.gender]);

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
    () => {
      const section = resolveSparkSection(preferences.sparkSection);
      return Array.from(heldIds)
        .map((id) => getProfileById(id))
        .filter((profile): profile is Profile =>
          profile !== undefined && matchesSparkSection(profile, section),
        );
    },
    [heldIds, preferences.sparkSection],
  );

  const standoutsProfiles = useMemo(() => {
    if (!privacyPreferences.personalisationEnabled) {
      return [];
    }
    const section = resolveSparkSection(preferences.sparkSection);
    return STANDOUT_IDS.map((id) => getProfileById(id)).filter(
      (profile): profile is Profile =>
        profile !== undefined &&
        !excludedIds.has(profile.id) &&
        matchesSparkSection(profile, section),
    );
  }, [excludedIds, preferences.sparkSection, privacyPreferences.personalisationEnabled]);

  const recentlyActiveProfiles = useMemo(() => {
    if (!privacyPreferences.showActiveStatus) {
      return [];
    }
    const section = resolveSparkSection(preferences.sparkSection);
    const ids = section === 'ember' ? EMBER_RECENTLY_ACTIVE_IDS : RECENTLY_ACTIVE_IDS;
    return ids.map((id) => getProfileById(id)).filter(
      (profile): profile is Profile =>
        profile !== undefined &&
        !excludedIds.has(profile.id) &&
        matchesSparkSection(profile, section),
    );
  }, [excludedIds, preferences.sparkSection, privacyPreferences.showActiveStatus]);

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
    const section = resolveSparkSection(preferences.sparkSection);
    const incomingExcluded =
      section === 'ember' ? EMBER_INCOMING_LIKE_IDS_SET : INCOMING_LIKE_IDS_SET;
    const pool = mockProfiles.filter((p) => !incomingExcluded.has(p.id));
    let filtered = filterDiscoverProfiles(
      pool,
      preferences,
      excludedIds,
      user,
      isSparkPlus,
      privacyPreferences.locationSharing,
    );
    const incognitoActive = isSparkPlus && privacyPreferences.incognitoMode;
    if (incognitoActive) {
      filtered = filtered.filter(
        (profile) =>
          incomingExcluded.has(profile.id) ||
          likedIds.has(profile.id) ||
          pendingLikeIds.has(profile.id) ||
          stableIncognitoVisible(profile.id),
      );
    }
    return filtered;
  }, [
    excludedIds,
    isPaused,
    isSparkPlus,
    likedIds,
    pendingLikeIds,
    preferences,
    privacyPreferences.incognitoMode,
    privacyPreferences.locationSharing,
    user,
  ]);

  const discoverQueue = useMemo(() => {
    if (isPaused) {
      return [];
    }
    let unlocked = [...discoverPool.slice(0, discoverUnlockedCount)];

    if (isBoosted) {
      const incomingBoost =
        resolveSparkSection(preferences.sparkSection) === 'ember'
          ? EMBER_INCOMING_LIKE_IDS_SET
          : INCOMING_LIKE_IDS_SET;
      unlocked.sort((a, b) => {
        const aIncoming = incomingBoost.has(a.id) ? 1 : 0;
        const bIncoming = incomingBoost.has(b.id) ? 1 : 0;
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
    preferences.sparkSection,
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

  const activeSection = resolveSparkSection(preferences.sparkSection);
  const isEmberWorld = activeSection === 'ember';

  const dailyLikeLimit = dailyLikeLimitForGender(user.gender, isSparkPlus);
  const likesUsedToday = isEmberWorld ? emberDailyLikesUsed : dailyLikesUsed;
  const remainingLikes = isSparkPlus
    ? Infinity
    : Math.max(0, dailyLikeLimit - likesUsedToday);
  const canLike = isSparkPlus || likesUsedToday < dailyLikeLimit;

  const sparkNotesUsedForToday = useMemo(() => {
    const usedDate = isEmberWorld ? emberLastSparkNoteDate : lastSparkNoteDate;
    const usedCount = isEmberWorld ? emberSparkNotesUsedToday : sparkNotesUsedToday;
    if (usedDate !== todayKey()) {
      return 0;
    }
    return usedCount;
  }, [
    emberLastSparkNoteDate,
    emberSparkNotesUsedToday,
    isEmberWorld,
    lastSparkNoteDate,
    sparkNotesUsedToday,
  ]);

  const dailyNoteLimit = dailySparkNoteLimitForGender(user.gender, isSparkPlus);
  const remainingSparkNotes = isSparkPlus
    ? Infinity
    : Math.max(0, dailyNoteLimit - sparkNotesUsedForToday + bonusSparkNotes);
  const canSendSparkNote =
    isSparkPlus || sparkNotesUsedForToday < dailyNoteLimit + bonusSparkNotes;

  const incomingLikes = useMemo(() => {
    const actioned = new Set([...likedIds, ...passedIds, ...blockedIds]);
    const source = getIncomingLikeProfilesForSection(activeSection);
    return source.filter(
      (profile) =>
        !actioned.has(profile.id) &&
        !matches.some((match) => match.profile.id === profile.id) &&
        matchesSparkSection(profile, activeSection),
    );
  }, [activeSection, likedIds, passedIds, blockedIds, matches]);

  const worldMatches = useMemo(
    () => matches.filter((match) => matchesSparkSection(match.profile, activeSection)),
    [activeSection, matches],
  );

  const worldConversations = useMemo(
    () =>
      conversations.filter((conversation) =>
        matchesSparkSection(conversation.match.profile, activeSection),
      ),
    [activeSection, conversations],
  );

  const worldPendingLikeIds = useMemo(() => {
    const next = new Set<string>();
    pendingLikeIds.forEach((id) => {
      const profile = getProfileById(id);
      if (profile && matchesSparkSection(profile, activeSection)) {
        next.add(id);
      }
    });
    return next;
  }, [activeSection, pendingLikeIds]);

  const worldSuperLikedIds = useMemo(() => {
    const next = new Set<string>();
    superLikedIds.forEach((id) => {
      const profile = getProfileById(id);
      if (profile && matchesSparkSection(profile, activeSection)) {
        next.add(id);
      }
    });
    return next;
  }, [activeSection, superLikedIds]);

  const likesTabBadge = isSparkPlus ? 0 : incomingLikes.length;

  const matchesTabBadge = useMemo(() => {
    const newMatchCount = worldMatches.filter(
      (match) =>
        !worldConversations.some(
          (conversation) =>
            conversation.match.id === match.id && conversation.messages.length > 0,
        ),
    ).length;
    const unreadCount = worldConversations.filter((conversation) => conversation.unread).length;
    const yourTurnCount = worldConversations.filter(
      (conversation) => conversation.yourTurn && !conversation.unread,
    ).length;
    return newMatchCount + unreadCount + yourTurnCount;
  }, [worldConversations, worldMatches]);

  const worldLastPassedProfileId = isEmberWorld ? emberLastPassedProfileId : lastPassedProfileId;
  const canRewind = isSparkPlus && worldLastPassedProfileId !== null;
  const hasRewindablePass = worldLastPassedProfileId !== null;

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

  const setSparkSection = useCallback((section: SparkSection) => {
    setPreferences((prev) => {
      if (resolveSparkSection(prev.sparkSection) === section) {
        return prev;
      }
      return { ...prev, sparkSection: section };
    });
    setDiscoverUnlockedCount(DISCOVER_BATCH_SIZE);
    setPriorityProfileId(null);
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

  const maybeRecordViewer = useCallback((profileId: string, chance: number) => {
    if (Math.random() >= chance) {
      return;
    }
    setProfileViewerIds((prev) => (prev.includes(profileId) ? prev : [...prev, profileId]));
  }, []);

  const passProfile = useCallback((profile: Profile) => {
    setPassedIds((prev) => new Set(prev).add(profile.id));
    if (matchesSparkSection(profile, 'ember')) {
      setEmberLastPassedProfileId(profile.id);
    } else {
      setLastPassedProfileId(profile.id);
    }
    maybeRecordViewer(profile.id, 0.25);
  }, [maybeRecordViewer]);

  const rewindLastPass = useCallback(() => {
    const profileId = isEmberWorld ? emberLastPassedProfileId : lastPassedProfileId;
    if (!isSparkPlus || !profileId) {
      return;
    }
    setPassedIds((prev) => {
      const next = new Set(prev);
      next.delete(profileId);
      return next;
    });
    if (isEmberWorld) {
      setEmberLastPassedProfileId(null);
    } else {
      setLastPassedProfileId(null);
    }
    prioritizeProfileInDeck(profileId);
    setRewindKey((k) => k + 1);
  }, [emberLastPassedProfileId, isEmberWorld, isSparkPlus, lastPassedProfileId, prioritizeProfileInDeck]);

  const profileViewers = useMemo(() => {
    const section = resolveSparkSection(preferences.sparkSection);
    const seedViewers =
      section === 'ember' ? EMBER_PROFILE_VIEWER_IDS : PROFILE_VIEWER_IDS;
    const incoming =
      section === 'ember' ? EMBER_INCOMING_LIKE_IDS : INCOMING_LIKE_IDS;
    const merged = new Set([...seedViewers, ...profileViewerIds, ...incoming]);
    return Array.from(merged)
      .map((id) => getProfileById(id))
      .filter(
        (profile): profile is Profile =>
          profile !== undefined && matchesSparkSection(profile, section),
      );
  }, [preferences.sparkSection, profileViewerIds]);

  const profileViewCount = profileViewers.length;

  const reactToMessage = useCallback(
    (conversationId: string, messageId: string, reaction: string) => {
      setConversations((prev) =>
        prev.map((conversation) => {
          if (conversation.id !== conversationId) {
            return conversation;
          }
          return {
            ...conversation,
            messages: conversation.messages.map((message) =>
              message.id === messageId ? { ...message, reaction } : message,
            ),
          };
        }),
      );
    },
    [],
  );

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

      const alreadyLiked = likedIds.has(profile.id);
      setLikedIds((prev) => new Set(prev).add(profile.id));
      if (!isSparkPlus && !alreadyLiked) {
        if (matchesSparkSection(profile, 'ember')) {
          setEmberDailyLikesUsed((count) => count + 1);
        } else {
          setDailyLikesUsed((count) => count + 1);
        }
      }

      if (sparkNote) {
        setSparkNotes((prev) => ({ ...prev, [profile.id]: sparkNote }));
        const today = todayKey();
        if (matchesSparkSection(profile, 'ember')) {
          if (emberLastSparkNoteDate !== today) {
            setEmberLastSparkNoteDate(today);
            setEmberSparkNotesUsedToday(1);
          } else {
            setEmberSparkNotesUsedToday((count) => count + 1);
          }
        } else if (lastSparkNoteDate !== today) {
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
        EMBER_INCOMING_LIKE_IDS_SET.has(profile.id) ||
        AI_PERSONA_IDS.has(profile.id);

      if (!isInstantMatch) {
        setPendingLikeIds((prev) => new Set(prev).add(profile.id));
        maybeRecordViewer(profile.id, 0.4);
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
        const next = [match, ...prev];
        if (!isSparkPlus && !momentumUpsellDismissed && next.length === 3) {
          setShowMomentumUpsell(true);
        }
        return next;
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
      momentumUpsellDismissed,
      lastSparkNoteDate,
      emberLastSparkNoteDate,
      notificationsEnabled,
      notificationPreferences.matches,
      bonusSparkNotes,
      disguiseMode,
      securitySettings.disguiseSafeNotifications,
      maybeRecordViewer,
      likedIds,
    ],
  );

  const dismissMomentumUpsell = useCallback(() => {
    setShowMomentumUpsell(false);
    setMomentumUpsellDismissed(true);
  }, []);

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
      const alreadyCounted = likedIds.has(profile.id) || superLikedIds.has(profile.id);
      if (!canLike && !alreadyCounted) {
        return null;
      }

      setLikedIds((prev) => new Set(prev).add(profile.id));
      setSuperLikedIds((prev) => new Set(prev).add(profile.id));
      if (!isSparkPlus && !alreadyCounted) {
        if (matchesSparkSection(profile, 'ember')) {
          setEmberDailyLikesUsed((count) => count + 1);
        } else {
          setDailyLikesUsed((count) => count + 1);
        }
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
    [canLike, createMatchFromLike, isSparkPlus, likedIds, superLikedIds],
  );

  const sendMessage = useCallback(
    (conversationId: string, text: string, imageUrl?: string, isGif = false) => {
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
        text: trimmed || (isGif ? 'GIF' : '📷 Photo'),
        sentAt: new Date().toISOString(),
        isMine: true,
        imageUrl,
        isGif,
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

  const sendVoiceNote = useCallback(
    (conversationId: string, durationSeconds: number) => {
      const seconds = Math.max(1, Math.min(30, Math.round(durationSeconds)));
      sendMessage(conversationId, `Voice note (${seconds}s)`, undefined, false);
      setConversations((prev) =>
        prev.map((conversation) => {
          if (conversation.id !== conversationId) {
            return conversation;
          }
          const messages = [...conversation.messages];
          const last = messages[messages.length - 1];
          if (!last || !last.isMine) {
            return conversation;
          }
          messages[messages.length - 1] = {
            ...last,
            text: '',
            isVoiceNote: true,
            voiceDurationSeconds: seconds,
          };
          return { ...conversation, messages, lastMessage: `Voice note (${seconds}s)` };
        }),
      );
    },
    [sendMessage],
  );

  const activateSparkPlus = useCallback(() => {
    setIsSparkPlus(true);
  }, []);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSparkPlus(true);
    return true;
  }, []);

  const canUseFreeWeeklyBoost = useMemo(() => {
    if (!isSparkPlus) {
      return false;
    }
    return freeBoostWeekKey !== getIsoWeekKey();
  }, [freeBoostWeekKey, isSparkPlus]);

  const activateBoost = useCallback(
    (options?: { purchased?: boolean }): BoostActivationResult => {
      const activeUntil = boostActiveUntil ? new Date(boostActiveUntil).getTime() : 0;
      if (activeUntil > Date.now()) {
        return { ok: false, reason: 'already_active' };
      }

      const weekKey = getIsoWeekKey();
      let source: 'free_weekly' | 'bonus' | 'purchased';

      if (options?.purchased) {
        source = 'purchased';
      } else if (bonusBoosts > 0) {
        setBonusBoosts((prev) => prev - 1);
        source = 'bonus';
      } else if (isSparkPlus && freeBoostWeekKey !== weekKey) {
        setFreeBoostWeekKey(weekKey);
        source = 'free_weekly';
      } else {
        return { ok: false, reason: 'quota_exhausted' };
      }

      const until = new Date(Date.now() + BOOST_DURATION_MS).toISOString();
      setBoostActiveUntil(until);
      if (notificationsEnabled && notificationPreferences.boosts) {
        void scheduleMatchNotification('You', {
          disguiseSafe: disguiseMode && securitySettings.disguiseSafeNotifications,
        });
      }
      return { ok: true, source };
    },
    [
      boostActiveUntil,
      bonusBoosts,
      disguiseMode,
      freeBoostWeekKey,
      isSparkPlus,
      notificationPreferences.boosts,
      notificationsEnabled,
      securitySettings.disguiseSafeNotifications,
    ],
  );

  const addBonusBoosts = useCallback((count: number) => {
    setBonusBoosts((prev) => prev + count);
  }, []);

  const recordPulseReading = useCallback((title: string, source: string) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }
    setPulseSocial((prev) => {
      const withoutDuplicate = prev.readingHistory.filter((entry) => entry.title !== trimmedTitle);
      const next = [
        { title: trimmedTitle, source, readAt: new Date().toISOString() },
        ...withoutDuplicate,
      ].slice(0, 20);
      return { ...prev, readingHistory: next };
    });
  }, []);

  const markActivityAlertsRead = useCallback(() => {
    setPulseSocial((prev) =>
      prev.activityAlertsRead ? prev : { ...prev, activityAlertsRead: true },
    );
  }, []);

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

  const togglePulseLike = useCallback((postId: string) => {
    setPulseSocial((prev) => ({
      ...prev,
      likedPostIds: prev.likedPostIds.includes(postId)
        ? prev.likedPostIds.filter((id) => id !== postId)
        : [...prev.likedPostIds, postId],
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

  const setDisguiseMode = useCallback(async (enabled: boolean): Promise<boolean> => {
    if (enabled) {
      setDisguiseModeState(true);
      return true;
    }
    setUnlockConfirmVisible(true);
    return false;
  }, []);

  const confirmLeaveDisguise = useCallback(() => {
    setUnlockConfirmVisible(false);
    if (!legalConsent.disguisePolicyAcceptedAt) {
      setLegalConsent((prev) => ({
        ...prev,
        disguisePolicyAcceptedAt: new Date().toISOString(),
      }));
    }
    setDisguiseModeState(false);
  }, [legalConsent.disguisePolicyAcceptedAt]);

  const cancelLeaveDisguise = useCallback(() => {
    setUnlockConfirmVisible(false);
  }, []);

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
      void scheduleDateCheckInReminder(profileName, payload.location, 60);
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
    setLegalConsent((prev) => ({
      ...prev,
      disguisePolicyAcceptedAt: prev.disguisePolicyAcceptedAt ?? new Date().toISOString(),
    }));
  }, []);

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
          section: preferences.sparkSection,
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
    [user.photos, preferences.sparkSection],
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
    setEmberDailyLikesUsed(0);
    setEmberSparkNotesUsedToday(0);
    setEmberLastSparkNoteDate(null);
    setEmberLastPassedProfileId(null);
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
      pendingLikeIds: worldPendingLikeIds,
      superLikedIds: worldSuperLikedIds,
      blockedIds,
      blockedProfiles,
      heldIds,
      heldProfiles,
      pulseSocial,
      standoutsProfiles,
      recentlyActiveProfiles,
      dailyMostCompatible,
      getCompatibilityScore,
      matches: worldMatches,
      conversations: worldConversations,
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
      bonusBoosts,
      canUseFreeWeeklyBoost,
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
      hasRewindablePass,
      rewindKey,
      profileViewers,
      profileViewCount,
      reactToMessage,
      showMomentumUpsell,
      dismissMomentumUpsell,
      isSupabaseEnabled: isSupabaseConfigured(),
      completeOnboarding,
      signInWithAppleStub,
      signInWithEmailMagicLink,
      updateUser,
      applyCloudConversationUpdate,
      updatePreferences,
      setSparkSection,
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
      sendVoiceNote,
      getConversationIdForProfile,
      blockProfile,
      unblockProfile,
      unlikeProfile,
      reportProfile,
      unmatchProfile,
      savePulsePost,
      unsavePulsePost,
      togglePulseLike,
      mutePulseAuthor,
      unmutePulseAuthor,
      reportPulsePost,
      addPulseComment,
      getPulseComments,
      recordReferralShare,
      activateSparkPlus,
      restorePurchases,
      activateBoost,
      addBonusBoosts,
      recordPulseReading,
      markActivityAlertsRead,
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
      worldPendingLikeIds,
      worldSuperLikedIds,
      blockedIds,
      blockedProfiles,
      heldIds,
      heldProfiles,
      pulseSocial,
      standoutsProfiles,
      recentlyActiveProfiles,
      dailyMostCompatible,
      getCompatibilityScore,
      worldMatches,
      worldConversations,
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
      bonusBoosts,
      canUseFreeWeeklyBoost,
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
      hasRewindablePass,
      rewindKey,
      profileViewers,
      profileViewCount,
      reactToMessage,
      showMomentumUpsell,
      dismissMomentumUpsell,
      completeOnboarding,
      signInWithAppleStub,
      signInWithEmailMagicLink,
      updateUser,
      applyCloudConversationUpdate,
      updatePreferences,
      setSparkSection,
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
      sendVoiceNote,
      getConversationIdForProfile,
      blockProfile,
      unblockProfile,
      unlikeProfile,
      reportProfile,
      unmatchProfile,
      savePulsePost,
      unsavePulsePost,
      togglePulseLike,
      mutePulseAuthor,
      unmutePulseAuthor,
      reportPulsePost,
      addPulseComment,
      getPulseComments,
      recordReferralShare,
      activateSparkPlus,
      restorePurchases,
      activateBoost,
      addBonusBoosts,
      recordPulseReading,
      markActivityAlertsRead,
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
      <DisguiseUnlockConfirm
        visible={unlockConfirmVisible}
        disguiseName={disguiseWorldMeta(preferences.sparkSection, user.gender).name}
        unlockLabel={disguiseWorldMeta(preferences.sparkSection, user.gender).unlockLabel}
        accent={disguiseWorldMeta(preferences.sparkSection, user.gender).accent}
        onConfirm={confirmLeaveDisguise}
        onCancel={cancelLeaveDisguise}
      />
      <SparkUnlockModal
        visible={unlockModalVisible}
        error={unlockError}
        unlockLabel={disguiseWorldMeta(preferences.sparkSection, user.gender).unlockLabel}
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
