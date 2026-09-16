import { Profile } from './profile';

export type Match = {
  id: string;
  profile: Profile;
  matchedAt: string;
  expiresAt?: string;
  /** True when matched via Spark Rose super-like */
  isSuperMatch?: boolean;
};

export type MessageStatus = 'sent' | 'delivered' | 'read';

export type Message = {
  id: string;
  text: string;
  sentAt: string;
  isMine: boolean;
  imageUrl?: string;
  status?: MessageStatus;
  /** Emoji reaction on message bubble */
  reaction?: string;
  isGif?: boolean;
};

export type Conversation = {
  id: string;
  match: Match;
  messages: Message[];
  lastMessage?: string;
  lastMessageAt?: string;
  yourTurn: boolean;
  unread: boolean;
  isTyping?: boolean;
};
