import { useCallback, useRef, useState, useSyncExternalStore } from 'react';
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
  const gateRef = useRef(false);

  const refresh = useCallback(async () => {
    if (gateRef.current || refreshing) {
      return false;
    }

    gateRef.current = true;
    setRefreshing(true);
    bumpPulseFeedRefreshGeneration();

    await new Promise((resolve) => {
      setTimeout(resolve, MOTION.duration.normal);
    });

    setRefreshing(false);
    gateRef.current = false;
    onRefreshed?.();
    return true;
  }, [onRefreshed, refreshing]);

  const triggerRefresh = useCallback(() => {
    void refresh();
  }, [refresh]);

  const flatListProps = {
    onEndReached: triggerRefresh,
    onEndReachedThreshold: 0.15 as const,
  };

  const handleScrollViewScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const distanceFromBottom = contentSize.height - (layoutMeasurement.height + contentOffset.y);
      if (distanceFromBottom <= 72) {
        triggerRefresh();
      }
    },
    [triggerRefresh],
  );

  const scrollViewProps = {
    onScroll: handleScrollViewScroll,
    scrollEventThrottle: 16 as const,
  };

  return {
    refreshing,
    refresh,
    triggerRefresh,
    flatListProps,
    scrollViewProps,
  };
}
