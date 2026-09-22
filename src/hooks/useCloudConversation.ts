import { useEffect } from 'react';

import { useApp } from '../context/AppContext';
import { fetchConversationUpdate, subscribeToConversation } from '../services/realtimeChat';

/** Sync chat messages from Supabase Realtime when cloud backend is enabled. */
export function useCloudConversation(conversationId: string | undefined) {
  const { applyCloudConversationUpdate, isSupabaseEnabled } = useApp();

  useEffect(() => {
    if (!conversationId || !isSupabaseEnabled) {
      return undefined;
    }

    let cancelled = false;

    void fetchConversationUpdate(conversationId).then((update) => {
      if (!cancelled && update) {
        applyCloudConversationUpdate(conversationId, update);
      }
    });

    const unsubscribe = subscribeToConversation(conversationId, (update) => {
      applyCloudConversationUpdate(conversationId, update);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [applyCloudConversationUpdate, conversationId, isSupabaseEnabled]);
}
