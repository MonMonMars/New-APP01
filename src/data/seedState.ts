import { Conversation, Match } from '../types/match';
import {
  getProfileById,
  MUTUAL_MATCH_IDS,
  MUTUAL_SUPER_LIKE_IDS,
  PENDING_LIKE_IDS,
  PRE_MATCHED_IDS,
} from './profiles';

function buildMatch(profileId: string, isSuperMatch = false): Match | null {
  const profile = getProfileById(profileId);
  if (!profile) {
    return null;
  }
  return {
    id: `match-${profileId}`,
    profile,
    matchedAt: new Date(Date.now() - 86400000 * (Number(profileId) % 3 + 1)).toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    isSuperMatch,
  };
}

/** Pre-seeded matches for fresh installs / demo */
export function buildSeedMatches(): Match[] {
  const matches: Match[] = [];
  for (const id of PRE_MATCHED_IDS) {
    const match = buildMatch(id);
    if (match) {
      matches.push(match);
    }
  }
  return matches;
}

/** Pre-seeded conversations — some with messages, some empty new matches */
export function buildSeedConversations(matches: Match[]): Conversation[] {
  const ava = getProfileById('1');
  const sofia = getProfileById('5');
  const amara = getProfileById('15');

  const conversations: Conversation[] = [];

  const avaMatch = matches.find((m) => m.profile.id === '1');
  if (ava && avaMatch) {
    conversations.push({
      id: 'conv-1',
      match: avaMatch,
      messages: [
        {
          id: 'm1',
          text: 'Hey! Love your hiking photos 🏔️',
          sentAt: new Date(Date.now() - 3600000).toISOString(),
          isMine: false,
        },
        {
          id: 'm2',
          text: 'Thanks! Want to grab coffee this weekend?',
          sentAt: new Date(Date.now() - 1800000).toISOString(),
          isMine: true,
        },
      ],
      lastMessage: 'Thanks! Want to grab coffee this weekend?',
      lastMessageAt: new Date(Date.now() - 1800000).toISOString(),
      yourTurn: false,
      unread: false,
    });
  }

  const amaraMatch = matches.find((m) => m.profile.id === '15');
  if (amara && amaraMatch) {
    conversations.push({
      id: 'conv-15',
      match: amaraMatch,
      messages: [
        {
          id: 'm15-1',
          text: 'Your architecture sketches are incredible!',
          sentAt: new Date(Date.now() - 7200000).toISOString(),
          isMine: false,
        },
      ],
      lastMessage: 'Your architecture sketches are incredible!',
      lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
      yourTurn: true,
      unread: true,
    });
  }

  const sofiaMatch = matches.find((m) => m.profile.id === '5');
  if (sofia && sofiaMatch) {
    conversations.push({
      id: 'conv-5',
      match: sofiaMatch,
      messages: [],
      yourTurn: true,
      unread: false,
    });
  }

  return conversations;
}

export type SeedSwipeState = {
  likedIds: string[];
  pendingLikeIds: string[];
  passedIds: string[];
  superLikedIds: string[];
};

/** IDs excluded from discover + pre-populated swipe buckets */
export function buildSeedSwipeState(): SeedSwipeState {
  const likedIds = new Set<string>([...PRE_MATCHED_IDS, ...PENDING_LIKE_IDS]);
  const pendingLikeIds = new Set<string>([...PENDING_LIKE_IDS]);
  const passedIds = new Set<string>(['4', '19', '35']);

  return {
    likedIds: Array.from(likedIds),
    pendingLikeIds: Array.from(pendingLikeIds),
    passedIds: Array.from(passedIds),
    superLikedIds: [],
  };
}

export function isMutualSuperLike(profileId: string): boolean {
  return MUTUAL_SUPER_LIKE_IDS.has(profileId);
}

export function isMutualMatch(profileId: string): boolean {
  return MUTUAL_MATCH_IDS.has(profileId);
}
