import { Message } from '../types/match';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

type ConversationRow = {
  messages: Message[];
  your_turn: boolean;
  unread: boolean;
  last_message: string | null;
  last_message_at: string | null;
};

export type ConversationRealtimeUpdate = {
  messages: Message[];
  yourTurn: boolean;
  unread: boolean;
  lastMessage?: string;
  lastMessageAt?: string;
};

/** Fetch the latest cloud conversation snapshot before subscribing. */
export async function fetchConversationUpdate(
  conversationId: string,
): Promise<ConversationRealtimeUpdate | null> {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('conversations')
    .select('messages, your_turn, unread, last_message, last_message_at')
    .eq('id', conversationId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as ConversationRow;
  return {
    messages: row.messages ?? [],
    yourTurn: row.your_turn ?? false,
    unread: row.unread ?? false,
    lastMessage: row.last_message ?? undefined,
    lastMessageAt: row.last_message_at ?? undefined,
  };
}

/** Subscribe to cloud conversation updates via Supabase Realtime. */
export function subscribeToConversation(
  conversationId: string,
  onUpdate: (update: ConversationRealtimeUpdate) => void,
): () => void {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) {
    return () => undefined;
  }

  const channel = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
        filter: `id=eq.${conversationId}`,
      },
      (payload) => {
        const row = payload.new as ConversationRow;
        onUpdate({
          messages: row.messages ?? [],
          yourTurn: row.your_turn ?? false,
          unread: row.unread ?? false,
          lastMessage: row.last_message ?? undefined,
          lastMessageAt: row.last_message_at ?? undefined,
        });
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
