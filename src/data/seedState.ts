import { Conversation, Match } from '../types/match';
import {
  getProfileById,
  MUTUAL_MATCH_IDS,
  MUTUAL_SUPER_LIKE_IDS,
  PENDING_LIKE_IDS,
  PRE_MATCHED_IDS,
  SUPER_PRE_MATCHED_IDS,
} from './profiles';

function buildMatch(profileId: string, isSuperMatch = false): Match | null {
  const profile = getProfileById(profileId);
  if (!profile) {
    return null;
  }
  return {
    id: `match-${profileId}`,
    profile,
    matchedAt: new Date(Date.now() - 86400000 * (Number(profileId) % 5 + 1)).toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * (2 + (Number(profileId) % 3))).toISOString(),
    isSuperMatch,
  };
}

/** Pre-seeded matches for fresh installs / demo */
export function buildSeedMatches(): Match[] {
  const matches: Match[] = [];
  for (const id of PRE_MATCHED_IDS) {
    const match = buildMatch(id, SUPER_PRE_MATCHED_IDS.has(id));
    if (match) {
      matches.push(match);
    }
  }
  return matches;
}

function findMatch(matches: Match[], profileId: string): Match | undefined {
  return matches.find((m) => m.profile.id === profileId);
}

/** Pre-seeded conversations — mix of active chats, your turn, and empty new matches */
export function buildSeedConversations(matches: Match[]): Conversation[] {
  const conversations: Conversation[] = [];

  const ava = findMatch(matches, '1');
  if (ava) {
    conversations.push({
      id: 'conv-1',
      match: ava,
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

  const ethan = findMatch(matches, '12');
  if (ethan) {
    conversations.push({
      id: 'conv-12',
      match: ethan,
      messages: [
        {
          id: 'm12-1',
          text: 'That rooftop bar rec was perfect!',
          sentAt: new Date(Date.now() - 5400000).toISOString(),
          isMine: true,
        },
        {
          id: 'm12-2',
          text: 'Right?? We should go back sometime',
          sentAt: new Date(Date.now() - 4800000).toISOString(),
          isMine: false,
        },
      ],
      lastMessage: 'Right?? We should go back sometime',
      lastMessageAt: new Date(Date.now() - 4800000).toISOString(),
      yourTurn: true,
      unread: true,
    });
  }

  const amara = findMatch(matches, '15');
  if (amara) {
    conversations.push({
      id: 'conv-15',
      match: amara,
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

  const ryan = findMatch(matches, '18');
  if (ryan) {
    conversations.push({
      id: 'conv-18',
      match: ryan,
      messages: [
        {
          id: 'm18-1',
          text: 'Still on for trivia Thursday?',
          sentAt: new Date(Date.now() - 900000).toISOString(),
          isMine: false,
        },
      ],
      lastMessage: 'Still on for trivia Thursday?',
      lastMessageAt: new Date(Date.now() - 900000).toISOString(),
      yourTurn: true,
      unread: true,
    });
  }

  const nina = findMatch(matches, '24');
  if (nina) {
    conversations.push({
      id: 'conv-24',
      match: nina,
      messages: [
        {
          id: 'm24-1',
          text: 'Just finished that book you recommended 📚',
          sentAt: new Date(Date.now() - 14400000).toISOString(),
          isMine: true,
        },
      ],
      lastMessage: 'Just finished that book you recommended 📚',
      lastMessageAt: new Date(Date.now() - 14400000).toISOString(),
      yourTurn: false,
      unread: false,
    });
  }

  const sofia = findMatch(matches, '5');
  if (sofia) {
    conversations.push({
      id: 'conv-5',
      match: sofia,
      messages: [],
      yourTurn: true,
      unread: false,
    });
  }

  const isabella = findMatch(matches, '27');
  if (isabella) {
    conversations.push({
      id: 'conv-27',
      match: isabella,
      messages: [],
      yourTurn: true,
      unread: false,
    });
  }

  const camille = findMatch(matches, '30');
  if (camille) {
    conversations.push({
      id: 'conv-30',
      match: camille,
      messages: [
        {
          id: 'm30-1',
          text: 'Super glad we matched! 🌟',
          sentAt: new Date(Date.now() - 600000).toISOString(),
          isMine: false,
        },
      ],
      lastMessage: 'Super glad we matched! 🌟',
      lastMessageAt: new Date(Date.now() - 600000).toISOString(),
      yourTurn: true,
      unread: true,
    });
  }

  const olivia = findMatch(matches, '33');
  if (olivia) {
    conversations.push({
      id: 'conv-33',
      match: olivia,
      messages: [],
      yourTurn: true,
      unread: false,
    });
  }

  const kai = findMatch(matches, '42');
  if (kai) {
    conversations.push({
      id: 'conv-42',
      match: kai,
      messages: [
        {
          id: 'm42-1',
          text: 'Your playlist is dangerously good',
          sentAt: new Date(Date.now() - 10800000).toISOString(),
          isMine: false,
        },
        {
          id: 'm42-2',
          text: 'Haha thanks — I take music very seriously',
          sentAt: new Date(Date.now() - 10200000).toISOString(),
          isMine: true,
        },
      ],
      lastMessage: 'Haha thanks — I take music very seriously',
      lastMessageAt: new Date(Date.now() - 10200000).toISOString(),
      yourTurn: false,
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
  const passedIds = new Set<string>(['4', '19', '35', '52', '55', '56']);

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
