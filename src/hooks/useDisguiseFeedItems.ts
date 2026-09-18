import { useMemo, useRef } from 'react';

import { useApp } from '../context/AppContext';
import { FeedItem } from '../data/disguiseFeed';
import { buildDisguiseFeed } from '../utils/buildDisguiseFeed';
import { filterActionedDisguiseFeed } from '../utils/filterActionedDisguiseFeed';
import { filterDisguiseFeed } from '../utils/disguiseFeedFilter';

function disguiseFeedSignature(
  userId: string,
  gender: string | undefined,
  section: string,
  creativeKey: string,
): string {
  return `${section}|${userId}|${gender ?? ''}|${creativeKey}`;
}

/** Pulse feed layout stays cached; liked/passed profiles are hidden without reshuffling slots. */
export function useDisguiseFeedItems(topic?: string): FeedItem[] {
  const { user, disguiseAdCreative, preferences, pulseSocial, likedIds, passedIds, superLikedIds } = useApp();
  const cacheRef = useRef<{ signature: string; base: FeedItem[] } | null>(null);

  const creativeKey = disguiseAdCreative
    ? `${disguiseAdCreative.variant}|${disguiseAdCreative.sourcePhotoUrl}|${disguiseAdCreative.overlayText}`
    : '';

  const signature = disguiseFeedSignature(
    user.id,
    user.gender,
    preferences.sparkSection ?? 'spark',
    creativeKey,
  );

  const baseFeed = useMemo(() => {
    if (cacheRef.current?.signature === signature) {
      return cacheRef.current.base;
    }
    const built = buildDisguiseFeed(user, disguiseAdCreative, preferences.sparkSection);
    cacheRef.current = { signature, base: built };
    return built;
  }, [disguiseAdCreative, preferences.sparkSection, signature, user]);

  return useMemo(() => {
    const filtered = filterDisguiseFeed(baseFeed, topic, user.gender);
    const withoutActioned = filterActionedDisguiseFeed(
      filtered,
      likedIds,
      passedIds,
      superLikedIds,
      preferences.sparkSection,
    );
    return withoutActioned.filter((item) => {
      if (item.type !== 'social') {
        return true;
      }
      if (pulseSocial.reportedPostIds.includes(item.id)) {
        return false;
      }
      const authorHandle = item.handle.trim().toLowerCase();
      return !pulseSocial.mutedAuthors.includes(authorHandle);
    });
  }, [
    baseFeed,
    likedIds,
    passedIds,
    superLikedIds,
    preferences.sparkSection,
    pulseSocial.mutedAuthors,
    pulseSocial.reportedPostIds,
    topic,
    user.gender,
  ]);
}
