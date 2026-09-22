import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { FeedItem } from '../data/disguiseFeed';
import {
  buildPulseAppendPage,
  trimPulseFeedHeadCache,
} from '../utils/pulseFeedPagination';
import { useDisguiseFeedItems } from './useDisguiseFeedItems';
import { usePulseFeedRefreshGeneration } from './usePulseFeedRefresh';

const LOAD_MORE_COOLDOWN_MS = 500;

function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Pulse For You — paginated feed with head trim and pull/top refresh reset. */
export function usePulsePaginatedFeedItems(topic?: string) {
  const catalog = useDisguiseFeedItems(topic);
  const refreshGeneration = usePulseFeedRefreshGeneration();
  const [appendPages, setAppendPages] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const gateRef = useRef(false);
  const catalogSignatureRef = useRef('');

  const catalogSignature = `${topic ?? ''}|${catalog.length}|${catalog[0]?.id ?? ''}|${refreshGeneration}`;

  useEffect(() => {
    if (catalogSignatureRef.current !== catalogSignature) {
      catalogSignatureRef.current = catalogSignature;
      setAppendPages(0);
    }
  }, [catalogSignature]);

  const feedItems = useMemo(() => {
    const merged: FeedItem[] = [...catalog];
    for (let page = 1; page <= appendPages; page += 1) {
      merged.push(...buildPulseAppendPage(catalog, page, refreshGeneration + page));
    }
    return trimPulseFeedHeadCache(merged);
  }, [appendPages, catalog, refreshGeneration]);

  const loadMore = useCallback(async () => {
    if (gateRef.current || loadingMore || catalog.length === 0) {
      return;
    }
    gateRef.current = true;
    setLoadingMore(true);
    try {
      await waitMs(LOAD_MORE_COOLDOWN_MS);
      setAppendPages((current) => current + 1);
    } finally {
      setLoadingMore(false);
      gateRef.current = false;
    }
  }, [catalog.length, loadingMore]);

  return {
    feedItems,
    loadMore,
    loadingMore,
    canLoadMore: catalog.length > 0,
  };
}
