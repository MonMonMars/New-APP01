import { Profile } from './profile';

export type Match = {
  id: string;
  profile: Profile;
  matchedAt: string;
  expiresAt?: string;
};

export type Message = {
  id: string;
  text: string;
  sentAt: string;
  isMine: boolean;
};

export type Conversation = {
  id: string;
  match: Match;
  messages: Message[];
  lastMessage?: string;
  lastMessageAt?: string;
  yourTurn: boolean;
  unread: boolean;
};
