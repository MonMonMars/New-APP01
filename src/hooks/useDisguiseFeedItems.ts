import { useMemo, useRef } from 'react';

import { useApp } from '../context/AppContext';
import { FeedItem } from '../data/disguiseFeed';
import { resolveAppLocale } from '../types/locale';
import { buildDisguiseFeed } from '../utils/buildDisguiseFeed';
import {
  filterActionedDisguiseFeed,
  mergeSparkLikesWithPulsePostLikes,
} from '../utils/filterActionedDisguiseFeed';
import { filterDisguiseFeed } from '../utils/disguiseFeedFilter';
import { usePulseContextSection } from './usePulseContextSection';
import { usePulseFeedRefreshGeneration } from './usePulseFeedRefresh';
import { usePulseLiveNewsRevision } from './usePulseLiveNews';
import { PulseWorldPoolScope } from '../utils/pulseWorldPool';

function disguiseFeedSignature(
  userId: string,
  gender: string | undefined,
  section: string,
  creativeKey: string,
  showMe: string,
  poolScope: PulseWorldPoolScope,
): string {
  const spark = poolScope.pulseDisplaySpark !== false ? '1' : '0';
  const ember = poolScope.pulseDisplayEmber ? '1' : '0';
  return `${section}|${userId}|${gender ?? ''}|${showMe}|ps${spark}pe${ember}|${creativeKey}`;
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

  const poolScope: PulseWorldPoolScope = {
    sparkSection: preferences.sparkSection,
    pulseDisplaySpark: preferences.pulseDisplaySpark,
    pulseDisplayEmber: preferences.pulseDisplayEmber,
  };

  const signature = `${disguiseFeedSignature(
    userId ?? 'local-user',
    user.gender,
    pulseSection,
    creativeKey,
    preferences.showMe,
    poolScope,
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
      preferences.showMe,
      poolScope,
    );
    cacheRef.current = { signature, base: built };
    return built;
  }, [
    disguiseAdCreative,
    preferences.appLocale,
    preferences.pulseDisplayEmber,
    preferences.pulseDisplaySpark,
    preferences.showMe,
    preferences.sparkSection,
    pulseSection,
    refreshGeneration,
    signature,
    user,
  ]);

  return useMemo(() => {
    const filtered = filterDisguiseFeed(baseFeed, topic, user.gender);
    const likesForSwap = mergeSparkLikesWithPulsePostLikes(
      likedIds,
      pulseSocial.likedPostIds,
      filtered,
      preferences.showMe,
      pulseSection,
      poolScope,
    );
    const withoutActioned = filterActionedDisguiseFeed(
      filtered,
      likesForSwap,
      passedIds,
      superLikedIds,
      pulseSection,
      preferences.showMe,
      poolScope,
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
    pulseSocial.likedPostIds,
    pulseSocial.mutedAuthors,
    pulseSocial.reportedPostIds,
    preferences.pulseDisplayEmber,
    preferences.pulseDisplaySpark,
    preferences.showMe,
    preferences.sparkSection,
    topic,
    user.gender,
  ]);
}
