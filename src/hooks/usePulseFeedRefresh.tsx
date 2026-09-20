import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, RefreshControl } from 'react-native';

import { MOTION } from '../motion/presets';
import { useDisguiseWorld } from './useDisguiseWorld';

let refreshGeneration = 0;
let loadMorePages = 0;
const subscribers = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
}

function notifyRefreshSubscribers(): void {
  subscribers.forEach((listener) => listener());
}

function getRefreshGenerationSnapshot(): number {
  return refreshGeneration;
}

function getLoadMorePagesSnapshot(): number {
  return loadMorePages;
}

export function bumpPulseFeedRefreshGeneration(): number {
  refreshGeneration += 1;
  loadMorePages = 0;
  notifyRefreshSubscribers();
  return refreshGeneration;
}

export function bumpPulseFeedLoadMore(): number {
  loadMorePages += 1;
  notifyRefreshSubscribers();
  return loadMorePages;
}

export function resetPulseFeedLoadMorePages(): void {
  if (loadMorePages === 0) {
    return;
  }
  loadMorePages = 0;
  notifyRefreshSubscribers();
}

export function usePulseFeedRefreshGeneration(): number {
  return useSyncExternalStore(subscribe, getRefreshGenerationSnapshot, getRefreshGenerationSnapshot);
}

export function usePulseFeedLoadMorePages(): number {
  return useSyncExternalStore(subscribe, getLoadMorePagesSnapshot, getLoadMorePagesSnapshot);
}

type UsePulseScrollRefreshOptions = {
  onPullRefreshed?: () => void;
  onLoadMore?: () => void;
};

const LOAD_MORE_DELAY_MS = MOTION.duration.slow;
const PULL_REFRESH_DELAY_MS = MOTION.duration.slow;

export function usePulseScrollRefresh(options: UsePulseScrollRefreshOptions = {}) {
  const { onPullRefreshed, onLoadMore } = options;
  const accent = useDisguiseWorld().accent;
  const [pullRefreshing, setPullRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);
  const pullGateRef = useRef(false);
  const loadMoreGateRef = useRef(false);
  const hasScrolledRef = useRef(false);
  const refreshGeneration = usePulseFeedRefreshGeneration();

  useEffect(() => {
    if (!justUpdated) {
      return;
    }
    const timer = setTimeout(() => setJustUpdated(false), 2400);
    return () => clearTimeout(timer);
  }, [justUpdated]);

  const noteScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (event.nativeEvent.contentOffset.y > 24) {
      hasScrolledRef.current = true;
    }
  }, []);

  const runPullRefresh = useCallback(async () => {
    if (pullGateRef.current || pullRefreshing) {
      return false;
    }
    pullGateRef.current = true;
    setPullRefreshing(true);
    bumpPulseFeedRefreshGeneration();

    await new Promise((resolve) => {
      setTimeout(resolve, PULL_REFRESH_DELAY_MS);
    });

    setPullRefreshing(false);
    setJustUpdated(true);
    pullGateRef.current = false;
    onPullRefreshed?.();
    return true;
  }, [onPullRefreshed, pullRefreshing]);

  const runLoadMore = useCallback(async () => {
    if (loadMoreGateRef.current || loadingMore || pullRefreshing) {
      return false;
    }
    if (!hasScrolledRef.current) {
      return false;
    }

    loadMoreGateRef.current = true;
    setLoadingMore(true);
    bumpPulseFeedLoadMore();

    await new Promise((resolve) => {
      setTimeout(resolve, LOAD_MORE_DELAY_MS);
    });

    setLoadingMore(false);
    setJustUpdated(true);
    loadMoreGateRef.current = false;
    onLoadMore?.();
    return true;
  }, [loadingMore, onLoadMore, pullRefreshing]);

  const handlePullRefresh = useCallback(() => {
    void runPullRefresh();
  }, [runPullRefresh]);

  const triggerLoadMore = useCallback(() => {
    void runLoadMore();
  }, [runLoadMore]);

  const handleScrollNearBottom = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      noteScroll(event);
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const distanceFromBottom = contentSize.height - (layoutMeasurement.height + contentOffset.y);
      if (distanceFromBottom <= 120) {
        triggerLoadMore();
      }
    },
    [noteScroll, triggerLoadMore],
  );

  const handleFlatListScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      noteScroll(event);
    },
    [noteScroll],
  );

  const refreshControl = (
    <RefreshControl
      refreshing={pullRefreshing}
      onRefresh={handlePullRefresh}
      tintColor={accent}
      colors={[accent]}
      progressBackgroundColor="#fff"
    />
  );

  const flatListProps = {
    refreshControl,
    onEndReached: triggerLoadMore,
    onEndReachedThreshold: 0.12 as const,
    onScroll: handleFlatListScroll,
    scrollEventThrottle: 16 as const,
  };

  const scrollViewProps = {
    refreshControl,
    onScroll: handleScrollNearBottom,
    scrollEventThrottle: 16 as const,
  };

  return {
    pullRefreshing,
    loadingMore,
    refreshing: pullRefreshing || loadingMore,
    justUpdated,
    refreshGeneration,
    runPullRefresh,
    runLoadMore,
    refreshControl,
    flatListProps,
    scrollViewProps,
  };
}
