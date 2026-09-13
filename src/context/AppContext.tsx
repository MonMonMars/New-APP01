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

import { seedConversations } from '../data/conversations';
import { incomingLikeProfiles, mockProfiles, MUTUAL_MATCH_IDS } from '../data/profiles';
import { Conversation, Match } from '../types/match';
import {
  defaultPreferences,
  DiscoveryPreferences,
  ShowMePreference,
} from '../types/preferences';
import { Profile, UserProfile } from '../types/profile';
import { FREE_DAILY_LIKE_LIMIT, FREE_DAILY_SPARK_NOTES } from '../types/subscription';
import { BOOST_DURATION_MS } from '../types/subscription';
import { requestNotificationPermission, scheduleMatchNotification } from '../utils/notifications';
import {
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

function filterDiscoverProfiles(
  profiles: Profile[],
  preferences: DiscoveryPreferences,
  excludedIds: Set<string>,
): Profile[] {
  return profiles.filter(
    (profile) =>
      !excludedIds.has(profile.id) &&
      profile.distanceMiles <= preferences.maxDistanceMiles &&
      profile.age >= preferences.minAge &&
      profile.age <= preferences.maxAge &&
      matchesGenderFilter(profile, preferences.showMe),
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
  user: UserProfile;
  preferences: DiscoveryPreferences;
  discoverQueue: Profile[];
  passedIds: Set<string>;
  likedIds: Set<string>;
  pendingLikeIds: Set<string>;
  blockedIds: Set<string>;
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
  canRewind: boolean;
  completeOnboarding: (user: UserProfile) => void;
  signInWithAppleStub: () => Promise<void>;
  updateUser: (user: UserProfile) => void;
  updatePreferences: (preferences: DiscoveryPreferences) => void;
  passProfile: (profile: Profile) => void;
  likeProfile: (profile: Profile, sparkNote?: string) => Match | null;
  sendMessage: (conversationId: string, text: string) => void;
  getConversationIdForProfile: (profileId: string) => string | null;
  blockProfile: (profileId: string) => void;
  reportProfile: (profileId: string, reason?: string) => void;
  unmatchProfile: (profileId: string) => void;
  activateSparkPlus: () => void;
  activateBoost: () => void;
  rewindLastPass: () => void;
  enableNotifications: () => Promise<boolean>;
  dismissNotificationPrompt: () => void;
  showNotificationPrompt: boolean;
};

const defaultPersisted = createDefaultPersistedState();

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile>(defaultPersisted.user);
  const [preferences, setPreferences] = useState<DiscoveryPreferences>(defaultPreferences);
  const [passedIds, setPassedIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [pendingLikeIds, setPendingLikeIds] = useState<Set<string>>(new Set());
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [matches, setMatches] = useState<Match[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations);
  const [sparkNotes, setSparkNotes] = useState<Record<string, string>>({});
  const [dailyLikesUsed, setDailyLikesUsed] = useState(0);
  const [isSparkPlus, setIsSparkPlus] = useState(false);
  const [boostActiveUntil, setBoostActiveUntil] = useState<string | null>(null);
  const [sparkNotesUsedToday, setSparkNotesUsedToday] = useState(0);
  const [lastSparkNoteDate, setLastSparkNoteDate] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [lastPassedProfileId, setLastPassedProfileId] = useState<string | null>(null);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [notificationPromptDismissed, setNotificationPromptDismissed] = useState(false);

  const hydratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    loadPersistedState().then((saved) => {
      if (cancelled) {
        return;
      }

      if (saved) {
        setUser(saved.user);
        setPreferences(saved.preferences);
        setHasOnboarded(saved.hasOnboarded);
        setIsAuthenticated(saved.isAuthenticated);
        setPassedIds(arrayToSet(saved.passedIds));
        setLikedIds(arrayToSet(saved.likedIds));
        setPendingLikeIds(arrayToSet(saved.pendingLikeIds));
        setBlockedIds(arrayToSet(saved.blockedIds));
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
        setNotificationsEnabled(saved.notificationsEnabled);
        setLastPassedProfileId(saved.lastPassedProfileId);
      }

      hydratedRef.current = true;
      setIsHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const buildPersistedState = useCallback((): PersistedAppState => {
    return {
      version: 2,
      hasOnboarded,
      isAuthenticated,
      user,
      preferences,
      passedIds: setToArray(passedIds),
      likedIds: setToArray(likedIds),
      pendingLikeIds: setToArray(pendingLikeIds),
      blockedIds: setToArray(blockedIds),
      matches,
      conversations,
      dailyLikesUsed,
      isSparkPlus,
      sparkNotes,
      boostActiveUntil,
      sparkNotesUsedToday,
      lastSparkNoteDate,
      notificationsEnabled,
      lastPassedProfileId,
    };
  }, [
    hasOnboarded,
    isAuthenticated,
    user,
    preferences,
    passedIds,
    likedIds,
    pendingLikeIds,
    blockedIds,
    matches,
    conversations,
    dailyLikesUsed,
    isSparkPlus,
    sparkNotes,
    boostActiveUntil,
    sparkNotesUsedToday,
    lastSparkNoteDate,
    notificationsEnabled,
    lastPassedProfileId,
  ]);

  useEffect(() => {
    if (!hydratedRef.current || !hasOnboarded) {
      return;
    }
    void savePersistedState(buildPersistedState());
  }, [buildPersistedState, hasOnboarded]);

  const excludedIds = useMemo(() => {
    const ids = new Set<string>();
    passedIds.forEach((id) => ids.add(id));
    likedIds.forEach((id) => ids.add(id));
    blockedIds.forEach((id) => ids.add(id));
    return ids;
  }, [blockedIds, likedIds, passedIds]);

  const discoverQueue = useMemo(() => {
    const queue = filterDiscoverProfiles(mockProfiles, preferences, excludedIds);
    const now = Date.now();
    const boosted = boostActiveUntil && new Date(boostActiveUntil).getTime() > now;
    if (boosted) {
      return [...queue];
    }
    return queue;
  }, [boostActiveUntil, excludedIds, preferences]);

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
    : Math.max(0, dailyNoteLimit - sparkNotesUsedForToday);
  const canSendSparkNote = isSparkPlus || sparkNotesUsedForToday < FREE_DAILY_SPARK_NOTES;

  const likesTabBadge = isSparkPlus ? 0 : incomingLikeProfiles.length;

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

  const signInWithAppleStub = useCallback(async () => {
    setIsAuthenticated(true);
  }, []);

  const completeOnboarding = useCallback((nextUser: UserProfile) => {
    setUser(nextUser);
    setHasOnboarded(true);
    if (!notificationPromptDismissed && !notificationsEnabled) {
      setShowNotificationPrompt(true);
    }
  }, [notificationPromptDismissed, notificationsEnabled]);

  const updateUser = useCallback((nextUser: UserProfile) => {
    setUser(nextUser);
  }, []);

  const updatePreferences = useCallback((next: DiscoveryPreferences) => {
    setPreferences(next);
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
    (profileId: string, _reason?: string) => {
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
      }

      if (!MUTUAL_MATCH_IDS.has(profile.id)) {
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

      if (notificationsEnabled) {
        void scheduleMatchNotification(profile.name);
      } else if (!notificationPromptDismissed) {
        setShowNotificationPrompt(true);
      }

      return match;
    },
    [canLike, isSparkPlus, lastSparkNoteDate, notificationsEnabled, notificationPromptDismissed],
  );

  const sendMessage = useCallback((conversationId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    const message = {
      id: `msg-${Date.now()}`,
      text: trimmed,
      sentAt: new Date().toISOString(),
      isMine: true,
    };

    setConversations((prev) =>
      prev.map((conversation) => {
        if (conversation.id !== conversationId) {
          return conversation;
        }
        return {
          ...conversation,
          messages: [...conversation.messages, message],
          lastMessage: trimmed,
          lastMessageAt: message.sentAt,
          yourTurn: false,
          unread: false,
        };
      }),
    );
  }, []);

  const activateSparkPlus = useCallback(() => {
    setIsSparkPlus(true);
  }, []);

  const activateBoost = useCallback(() => {
    const until = new Date(Date.now() + BOOST_DURATION_MS).toISOString();
    setBoostActiveUntil(until);
  }, []);

  const enableNotifications = useCallback(async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    setShowNotificationPrompt(false);
    setNotificationPromptDismissed(true);
    return granted;
  }, []);

  const dismissNotificationPrompt = useCallback(() => {
    setShowNotificationPrompt(false);
    setNotificationPromptDismissed(true);
  }, []);

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
      user,
      preferences,
      discoverQueue,
      passedIds,
      likedIds,
      pendingLikeIds,
      blockedIds,
      matches,
      conversations,
      incomingLikes: incomingLikeProfiles,
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
      canRewind,
      completeOnboarding,
      signInWithAppleStub,
      updateUser,
      updatePreferences,
      passProfile,
      likeProfile,
      sendMessage,
      getConversationIdForProfile,
      blockProfile,
      reportProfile,
      unmatchProfile,
      activateSparkPlus,
      activateBoost,
      rewindLastPass,
      enableNotifications,
      dismissNotificationPrompt,
      showNotificationPrompt,
    }),
    [
      hasOnboarded,
      isHydrated,
      isAuthenticated,
      user,
      preferences,
      discoverQueue,
      passedIds,
      likedIds,
      pendingLikeIds,
      blockedIds,
      matches,
      conversations,
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
      canRewind,
      completeOnboarding,
      signInWithAppleStub,
      updateUser,
      updatePreferences,
      passProfile,
      likeProfile,
      sendMessage,
      getConversationIdForProfile,
      blockProfile,
      reportProfile,
      unmatchProfile,
      activateSparkPlus,
      activateBoost,
      rewindLastPass,
      enableNotifications,
      dismissNotificationPrompt,
      showNotificationPrompt,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
