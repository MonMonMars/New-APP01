import { Message } from '../types/match';

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
