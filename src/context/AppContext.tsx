import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
import { FREE_DAILY_LIKE_LIMIT } from '../types/subscription';
import { loadPersistedState, savePersistedState } from '../utils/persistence';

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

type AppContextValue = {
  hasOnboarded: boolean;
  isHydrated: boolean;
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
  dailyLikesUsed: number;
  remainingLikes: number;
  canLike: boolean;
  likesTabBadge: number;
  matchesTabBadge: number;
  completeOnboarding: (user: UserProfile) => void;
  updateUser: (user: UserProfile) => void;
  updatePreferences: (preferences: DiscoveryPreferences) => void;
  passProfile: (profile: Profile) => void;
  likeProfile: (profile: Profile) => Match | null;
  sendMessage: (conversationId: string, text: string) => void;
  getConversationIdForProfile: (profileId: string) => string | null;
  blockProfile: (profileId: string) => void;
  reportProfile: (profileId: string) => void;
  isSparkPlus: boolean;
  activateSparkPlus: () => void;
};

const defaultUser: UserProfile = {
  name: 'Mon',
  age: 28,
  bio: 'Designer exploring the city.',
  photos: ['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80'],
  interests: ['Design', 'Coffee', 'Travel'],
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [preferences, setPreferences] = useState<DiscoveryPreferences>(defaultPreferences);
  const [passedIds, setPassedIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [pendingLikeIds, setPendingLikeIds] = useState<Set<string>>(new Set());
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [matches, setMatches] = useState<Match[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations);
  const [dailyLikesUsed, setDailyLikesUsed] = useState(0);
  const [isSparkPlus, setIsSparkPlus] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadPersistedState().then((saved) => {
      if (cancelled || !saved) {
        setIsHydrated(true);
        return;
      }
      setUser(saved.user);
      setPreferences(saved.preferences);
      setHasOnboarded(saved.hasOnboarded);
      setIsHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const persistState = useCallback(
    (nextUser: UserProfile, nextPreferences: DiscoveryPreferences, onboarded: boolean) => {
      if (!onboarded) {
        return;
      }
      void savePersistedState({
        hasOnboarded: true,
        user: nextUser,
        preferences: nextPreferences,
      });
    },
    [],
  );

  const excludedIds = useMemo(() => {
    const ids = new Set<string>();
    passedIds.forEach((id) => ids.add(id));
    likedIds.forEach((id) => ids.add(id));
    blockedIds.forEach((id) => ids.add(id));
    return ids;
  }, [blockedIds, likedIds, passedIds]);

  const discoverQueue = useMemo(
    () => filterDiscoverProfiles(mockProfiles, preferences, excludedIds),
    [excludedIds, preferences],
  );

  const remainingLikes = isSparkPlus
    ? Infinity
    : Math.max(0, FREE_DAILY_LIKE_LIMIT - dailyLikesUsed);
  const canLike = isSparkPlus || dailyLikesUsed < FREE_DAILY_LIKE_LIMIT;

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

  const completeOnboarding = useCallback(
    (nextUser: UserProfile) => {
      setUser(nextUser);
      setHasOnboarded(true);
      persistState(nextUser, preferences, true);
    },
    [persistState, preferences],
  );

  const updateUser = useCallback(
    (nextUser: UserProfile) => {
      setUser(nextUser);
      if (hasOnboarded) {
        persistState(nextUser, preferences, true);
      }
    },
    [hasOnboarded, persistState, preferences],
  );

  const updatePreferences = useCallback(
    (next: DiscoveryPreferences) => {
      setPreferences(next);
      if (hasOnboarded) {
        persistState(user, next, true);
      }
    },
    [hasOnboarded, persistState, user],
  );

  const passProfile = useCallback((profile: Profile) => {
    setPassedIds((prev) => new Set(prev).add(profile.id));
  }, []);

  const blockProfile = useCallback((profileId: string) => {
    setBlockedIds((prev) => new Set(prev).add(profileId));
    setMatches((prev) => prev.filter((match) => match.profile.id !== profileId));
    setConversations((prev) =>
      prev.filter((conversation) => conversation.match.profile.id !== profileId),
    );
  }, []);

  const reportProfile = useCallback(
    (profileId: string) => {
      blockProfile(profileId);
    },
    [blockProfile],
  );

  const likeProfile = useCallback(
    (profile: Profile): Match | null => {
      if (!canLike) {
        return null;
      }

      setLikedIds((prev) => new Set(prev).add(profile.id));
      if (!isSparkPlus) {
        setDailyLikesUsed((count) => count + 1);
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

      return match;
    },
    [canLike, isSparkPlus],
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
      dailyLikesUsed,
      remainingLikes,
      canLike,
      likesTabBadge,
      matchesTabBadge,
      completeOnboarding,
      updateUser,
      updatePreferences,
      passProfile,
      likeProfile,
      sendMessage,
      getConversationIdForProfile,
      blockProfile,
      reportProfile,
      isSparkPlus,
      activateSparkPlus,
    }),
    [
      hasOnboarded,
      isHydrated,
      user,
      preferences,
      discoverQueue,
      passedIds,
      likedIds,
      pendingLikeIds,
      blockedIds,
      matches,
      conversations,
      dailyLikesUsed,
      remainingLikes,
      canLike,
      likesTabBadge,
      matchesTabBadge,
      completeOnboarding,
      updateUser,
      updatePreferences,
      passProfile,
      likeProfile,
      sendMessage,
      getConversationIdForProfile,
      blockProfile,
      reportProfile,
      isSparkPlus,
      activateSparkPlus,
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
