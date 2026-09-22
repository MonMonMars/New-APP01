import { Conversation, Match, Message } from '../types/match';
import { Profile } from '../types/profile';
import { buildLocalMatchOpener } from '../services/demoChatLlm';
import {
  getProfileById,
  MUTUAL_MATCH_IDS,
  MUTUAL_SUPER_LIKE_IDS,
  PENDING_LIKE_IDS,
  PRE_MATCHED_IDS,
  SUPER_PRE_MATCHED_IDS,
  EMBER_PENDING_LIKE_IDS,
  EMBER_PRE_MATCHED_IDS,
  EMBER_PASSED_IDS,
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

function demoOpener(profile: Profile, minutesAgo = 8): Message {
  const text = buildLocalMatchOpener(profile);
  return {
    id: `seed-opener-${profile.id}`,
    text,
    sentAt: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
    isMine: false,
  };
}

function newMatchConversation(
  id: string,
  match: Match,
  unread = true,
  minutesAgo = 8,
): Conversation {
  const opener = demoOpener(match.profile, minutesAgo);
  return {
    id,
    match,
    messages: [opener],
    yourTurn: true,
    unread,
    lastMessage: opener.text,
    lastMessageAt: opener.sentAt,
  };
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
    conversations.push(newMatchConversation('conv-5', sofia, true, 12));
  }

  const isabella = findMatch(matches, '27');
  if (isabella) {
    conversations.push(newMatchConversation('conv-27', isabella, true, 6));
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
    conversations.push(newMatchConversation('conv-33', olivia, true, 4));
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

  const jordan = findMatch(matches, '2');
  if (jordan) {
    conversations.push({
      id: 'conv-2',
      match: jordan,
      messages: [
        {
          id: 'm2-1',
          text: 'That taco spot on your profile — is it still open?',
          sentAt: new Date(Date.now() - 2400000).toISOString(),
          isMine: false,
        },
      ],
      lastMessage: 'That taco spot on your profile — is it still open?',
      lastMessageAt: new Date(Date.now() - 2400000).toISOString(),
      yourTurn: true,
      unread: true,
    });
  }

  const mia = findMatch(matches, '3');
  if (mia) {
    conversations.push({
      id: 'conv-3',
      match: mia,
      messages: [
        {
          id: 'm3-1',
          text: 'Okay but what is your actual favorite ramen ranking in the city?',
          sentAt: new Date(Date.now() - 4200000).toISOString(),
          isMine: false,
        },
        {
          id: 'm3-2',
          text: 'Ichiran when I am feeling chaotic, otherwise a tiny place in East Village',
          sentAt: new Date(Date.now() - 3900000).toISOString(),
          isMine: true,
        },
      ],
      lastMessage: 'Ichiran when I am feeling chaotic, otherwise a tiny place in East Village',
      lastMessageAt: new Date(Date.now() - 3900000).toISOString(),
      yourTurn: false,
      unread: false,
    });
  }

  const riley = findMatch(matches, '69');
  if (riley) {
    conversations.push({
      id: 'conv-69',
      match: riley,
      messages: [
        {
          id: 'm69-1',
          text: 'Desert island album? I need your answer before we proceed 😄',
          sentAt: new Date(Date.now() - 1800000).toISOString(),
          isMine: false,
        },
      ],
      lastMessage: 'Desert island album? I need your answer before we proceed 😄',
      lastMessageAt: new Date(Date.now() - 1800000).toISOString(),
      yourTurn: true,
      unread: true,
    });
  }

  const marcus = findMatch(matches, '70');
  if (marcus) {
    conversations.push({
      id: 'conv-70',
      match: marcus,
      messages: [
        {
          id: 'm70-1',
          text: 'Celtics or Knicks? This is important.',
          sentAt: new Date(Date.now() - 3000000).toISOString(),
          isMine: false,
        },
      ],
      lastMessage: 'Celtics or Knicks? This is important.',
      lastMessageAt: new Date(Date.now() - 3000000).toISOString(),
      yourTurn: true,
      unread: true,
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
  const passedIds = new Set<string>(['35', '55', '56']);

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

/** Ember clone — separate matches from Spark */
export function buildEmberSeedMatches(): Match[] {
  const matches: Match[] = [];
  for (const id of EMBER_PRE_MATCHED_IDS) {
    const match = buildMatch(id, id === '11');
    if (match) {
      matches.push(match);
    }
  }
  return matches;
}

export function buildEmberSeedConversations(matches: Match[]): Conversation[] {
  const conversations: Conversation[] = [];

  const priya = findMatch(matches, '11');
  if (priya) {
    conversations.push({
      id: 'conv-11',
      match: priya,
      messages: [
        {
          id: 'e11-1',
          text: 'Evenings after 8 work better for me.',
          sentAt: new Date(Date.now() - 5400000).toISOString(),
          isMine: false,
        },
        {
          id: 'e11-2',
          text: 'Same here — quieter is easier.',
          sentAt: new Date(Date.now() - 4800000).toISOString(),
          isMine: true,
        },
      ],
      lastMessage: 'Same here — quieter is easier.',
      lastMessageAt: new Date(Date.now() - 4800000).toISOString(),
      yourTurn: false,
      unread: false,
    });
  }

  const elena = findMatch(matches, '13');
  if (elena) {
    conversations.push({
      id: 'conv-13',
      match: elena,
      messages: [
        {
          id: 'e13-1',
          text: 'That gallery you mentioned — still on this week?',
          sentAt: new Date(Date.now() - 2400000).toISOString(),
          isMine: false,
        },
      ],
      lastMessage: 'That gallery you mentioned — still on this week?',
      lastMessageAt: new Date(Date.now() - 2400000).toISOString(),
      yourTurn: true,
      unread: true,
    });
  }

  const diego = findMatch(matches, '16');
  if (diego) {
    conversations.push({
      id: 'conv-16',
      match: diego,
      messages: [
        {
          id: 'e16-1',
          text: 'Coffee near the office is easier than dinner.',
          sentAt: new Date(Date.now() - 7200000).toISOString(),
          isMine: true,
        },
        {
          id: 'e16-2',
          text: 'Agreed. There is a quiet spot on 12th.',
          sentAt: new Date(Date.now() - 6600000).toISOString(),
          isMine: false,
        },
      ],
      lastMessage: 'Agreed. There is a quiet spot on 12th.',
      lastMessageAt: new Date(Date.now() - 6600000).toISOString(),
      yourTurn: false,
      unread: false,
    });
  }

  const sam = findMatch(matches, '40');
  if (sam) {
    conversations.push(newMatchConversation('conv-40', sam, true, 10));
  }

  return conversations;
}

export function buildEmberSeedSwipeState(): SeedSwipeState {
  return {
    likedIds: [...EMBER_PRE_MATCHED_IDS, ...EMBER_PENDING_LIKE_IDS],
    pendingLikeIds: [...EMBER_PENDING_LIKE_IDS],
    passedIds: [...EMBER_PASSED_IDS],
    superLikedIds: [],
  };
}
