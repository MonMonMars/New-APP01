import { useEffect } from 'react';

import { useApp } from '../context/AppContext';
import { subscribeToConversation } from '../services/realtimeChat';

/** Sync chat messages from Supabase Realtime when cloud backend is enabled. */
export function useCloudConversation(conversationId: string | undefined) {
  const { applyCloudConversationUpdate, isSupabaseEnabled } = useApp();

  useEffect(() => {
    if (!conversationId || !isSupabaseEnabled) {
      return undefined;
    }

    return subscribeToConversation(conversationId, (update) => {
      applyCloudConversationUpdate(conversationId, update);
    });
  }, [applyCloudConversationUpdate, conversationId, isSupabaseEnabled]);
}
