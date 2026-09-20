import { useMemo, useRef } from 'react';

import { useApp } from '../context/AppContext';
import { FeedItem } from '../data/disguiseFeed';
import { resolveAppLocale } from '../types/locale';
import { buildDisguiseFeed } from '../utils/buildDisguiseFeed';
import { filterActionedDisguiseFeed } from '../utils/filterActionedDisguiseFeed';
import { filterDisguiseFeed } from '../utils/disguiseFeedFilter';
import { usePulseContextSection } from './usePulseContextSection';
import { usePulseFeedRefreshGeneration } from './usePulseFeedRefresh';
import { usePulseLiveNewsRevision } from './usePulseLiveNews';

function disguiseFeedSignature(
  userId: string,
  gender: string | undefined,
  section: string,
  creativeKey: string,
): string {
  return `${section}|${userId}|${gender ?? ''}|${creativeKey}`;
}

/** Pulse feed layout stays cached; liked/passed profiles fade into fresh replacements in-place. */
export function useDisguiseFeedItems(topic?: string): FeedItem[] {
  const { user, userId, disguiseAdCreative, preferences, pulseSocial, likedIds, passedIds, superLikedIds } = useApp();
  const pulseSection = usePulseContextSection();
  const refreshGeneration = usePulseFeedRefreshGeneration();
  const liveNewsRevision = usePulseLiveNewsRevision();
  const cacheRef = useRef<{ signature: string; base: FeedItem[] } | null>(null);

  const creativeKey = disguiseAdCreative
    ? `${disguiseAdCreative.variant}|${disguiseAdCreative.sourcePhotoUrl}|${disguiseAdCreative.overlayText}`
    : '';

  const signature = `${disguiseFeedSignature(
    userId ?? 'local-user',
    user.gender,
    pulseSection,
    creativeKey,
  )}|refresh:${refreshGeneration}|news:${liveNewsRevision}`;

  const baseFeed = useMemo(() => {
    if (cacheRef.current?.signature === signature) {
      return cacheRef.current.base;
    }
    const built = buildDisguiseFeed(
      user,
      disguiseAdCreative,
      pulseSection,
      refreshGeneration,
      resolveAppLocale(preferences.appLocale),
    );
    cacheRef.current = { signature, base: built };
    return built;
  }, [disguiseAdCreative, preferences.appLocale, pulseSection, refreshGeneration, signature, user]);

  return useMemo(() => {
    const filtered = filterDisguiseFeed(baseFeed, topic, user.gender);
    const withoutActioned = filterActionedDisguiseFeed(
      filtered,
      likedIds,
      passedIds,
      superLikedIds,
      pulseSection,
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
    pulseSection,
    pulseSocial.mutedAuthors,
    pulseSocial.reportedPostIds,
    topic,
    user.gender,
  ]);
}
