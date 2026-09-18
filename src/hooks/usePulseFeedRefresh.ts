import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

import { MOTION } from '../motion/presets';

let refreshGeneration = 0;
const subscribers = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
}

function getRefreshGenerationSnapshot(): number {
  return refreshGeneration;
}

function notifyRefreshSubscribers(): void {
  subscribers.forEach((listener) => listener());
}

export function bumpPulseFeedRefreshGeneration(): number {
  refreshGeneration += 1;
  notifyRefreshSubscribers();
  return refreshGeneration;
}

export function usePulseFeedRefreshGeneration(): number {
  return useSyncExternalStore(subscribe, getRefreshGenerationSnapshot, getRefreshGenerationSnapshot);
}

type UsePulseScrollRefreshOptions = {
  onRefreshed?: () => void;
};

export function usePulseScrollRefresh(options: UsePulseScrollRefreshOptions = {}) {
  const { onRefreshed } = options;
  const [refreshing, setRefreshing] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);
  const gateRef = useRef(false);
  const readyRef = useRef(false);
  const hasScrolledRef = useRef(false);
  const refreshGeneration = usePulseFeedRefreshGeneration();

  useEffect(() => {
    const timer = setTimeout(() => {
      readyRef.current = true;
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!justUpdated) {
      return;
    }
    const timer = setTimeout(() => setJustUpdated(false), 2400);
    return () => clearTimeout(timer);
  }, [justUpdated]);

  const noteScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (event.nativeEvent.contentOffset.y > 32) {
      hasScrolledRef.current = true;
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!readyRef.current || !hasScrolledRef.current || gateRef.current || refreshing) {
      return false;
    }

    gateRef.current = true;
    setRefreshing(true);
    bumpPulseFeedRefreshGeneration();

    await new Promise((resolve) => {
      setTimeout(resolve, MOTION.duration.slow);
    });

    setRefreshing(false);
    setJustUpdated(true);
    gateRef.current = false;
    onRefreshed?.();
    return true;
  }, [onRefreshed, refreshing]);

  const triggerRefresh = useCallback(() => {
    void refresh();
  }, [refresh]);

  const handleScrollViewScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      noteScroll(event);
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const distanceFromBottom = contentSize.height - (layoutMeasurement.height + contentOffset.y);
      if (distanceFromBottom <= 96) {
        triggerRefresh();
      }
    },
    [noteScroll, triggerRefresh],
  );

  const handleFlatListScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      noteScroll(event);
    },
    [noteScroll],
  );

  const flatListProps = {
    onEndReached: triggerRefresh,
    onEndReachedThreshold: 0.08 as const,
    onScroll: handleFlatListScroll,
    scrollEventThrottle: 16 as const,
  };

  const scrollViewProps = {
    onScroll: handleScrollViewScroll,
    scrollEventThrottle: 16 as const,
  };

  return {
    refreshing,
    justUpdated,
    refreshGeneration,
    refresh,
    triggerRefresh,
    flatListProps,
    scrollViewProps,
  };
}
