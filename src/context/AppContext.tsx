import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { seedConversations } from '../data/conversations';
import { incomingLikeProfiles, mockProfiles, MUTUAL_MATCH_IDS } from '../data/profiles';
import { Conversation, Match } from '../types/match';
import { Profile, UserProfile } from '../types/profile';

type AppContextValue = {
  hasOnboarded: boolean;
  user: UserProfile;
  discoverQueue: Profile[];
  passedIds: Set<string>;
  likedIds: Set<string>;
  matches: Match[];
  conversations: Conversation[];
  incomingLikes: Profile[];
  completeOnboarding: (user: UserProfile) => void;
  passProfile: (profile: Profile) => void;
  likeProfile: (profile: Profile) => Match | null;
  sendMessage: (conversationId: string, text: string) => void;
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
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [discoverQueue, setDiscoverQueue] = useState<Profile[]>(mockProfiles);
  const [passedIds, setPassedIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [matches, setMatches] = useState<Match[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations);

  const completeOnboarding = useCallback((nextUser: UserProfile) => {
    setUser(nextUser);
    setHasOnboarded(true);
  }, []);

  const passProfile = useCallback((profile: Profile) => {
    setPassedIds((prev) => new Set(prev).add(profile.id));
    setDiscoverQueue((prev) => prev.filter((p) => p.id !== profile.id));
  }, []);

  const likeProfile = useCallback(
    (profile: Profile): Match | null => {
      setLikedIds((prev) => new Set(prev).add(profile.id));
      setDiscoverQueue((prev) => prev.filter((p) => p.id !== profile.id));

      if (!MUTUAL_MATCH_IDS.has(profile.id)) {
        return null;
      }

      const match: Match = {
        id: `match-${profile.id}`,
        profile,
        matchedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      };

      setMatches((prev) => {
        if (prev.some((m) => m.profile.id === profile.id)) {
          return prev;
        }
        return [match, ...prev];
      });

      setConversations((prev) => {
        if (prev.some((c) => c.match.profile.id === profile.id)) {
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
    [],
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

  const value = useMemo<AppContextValue>(
    () => ({
      hasOnboarded,
      user,
      discoverQueue,
      passedIds,
      likedIds,
      matches,
      conversations,
      incomingLikes: incomingLikeProfiles,
      completeOnboarding,
      passProfile,
      likeProfile,
      sendMessage,
    }),
    [
      hasOnboarded,
      user,
      discoverQueue,
      passedIds,
      likedIds,
      matches,
      conversations,
      completeOnboarding,
      passProfile,
      likeProfile,
      sendMessage,
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
