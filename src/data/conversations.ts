import { Conversation } from '../types/match';
import { mockProfiles } from './profiles';

const ava = mockProfiles[0];
const mia = mockProfiles[2];

export const seedConversations: Conversation[] = [
  {
    id: 'conv-1',
    match: {
      id: 'match-1',
      profile: ava,
      matchedAt: new Date(Date.now() - 86400000).toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    },
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
  },
  {
    id: 'conv-2',
    match: {
      id: 'match-2',
      profile: mia,
      matchedAt: new Date(Date.now() - 43200000).toISOString(),
      expiresAt: new Date(Date.now() + 3600000 * 18).toISOString(),
    },
    messages: [
      {
        id: 'm3',
        text: 'What’s your favorite ramen spot?',
        sentAt: new Date(Date.now() - 7200000).toISOString(),
        isMine: false,
      },
    ],
    lastMessage: 'What’s your favorite ramen spot?',
    lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
    yourTurn: true,
    unread: true,
  },
];
