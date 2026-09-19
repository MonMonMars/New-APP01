import { Conversation, Message } from '../types/match';

function messageTimestamp(message: Message): number {
  const parsed = Date.parse(message.sentAt);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Merge cloud and local messages without dropping unsynced optimistic sends. */
export function mergeConversationMessages(local: Message[], remote: Message[]): Message[] {
  if (remote.length === 0) {
    return local;
  }

  const merged = new Map<string, Message>();

  for (const message of remote) {
    merged.set(message.id, message);
  }

  for (const message of local) {
    const existing = merged.get(message.id);
    if (!existing) {
      merged.set(message.id, message);
      continue;
    }
    if (messageTimestamp(message) >= messageTimestamp(existing)) {
      merged.set(message.id, message);
    }
  }

  return [...merged.values()].sort(
    (left, right) => messageTimestamp(left) - messageTimestamp(right),
  );
}

function conversationActivityAt(conversation: Conversation): number {
  const lastAt = conversation.lastMessageAt ?? conversation.messages.at(-1)?.sentAt;
  const parsed = lastAt ? Date.parse(lastAt) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Merge hydrated local conversations with a cloud snapshot. */
export function mergeConversationLists(
  local: Conversation[],
  remote: Conversation[],
): Conversation[] {
  const byId = new Map(local.map((conversation) => [conversation.id, conversation]));

  for (const remoteConversation of remote) {
    const existing = byId.get(remoteConversation.id);
    if (!existing) {
      byId.set(remoteConversation.id, remoteConversation);
      continue;
    }

    byId.set(remoteConversation.id, {
      ...remoteConversation,
      messages: mergeConversationMessages(existing.messages, remoteConversation.messages),
      unread: existing.unread === false ? false : remoteConversation.unread,
      isTyping: existing.isTyping,
    });
  }

  return [...byId.values()].sort(
    (left, right) => conversationActivityAt(right) - conversationActivityAt(left),
  );
}
