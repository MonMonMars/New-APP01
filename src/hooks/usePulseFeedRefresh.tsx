import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, RefreshControl } from 'react-native';

import { useDisguiseWorld } from './useDisguiseWorld';
import { refreshPulseLiveNews } from '../services/pulseLiveNews';

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

type RefreshMode = 'pull' | 'end';

export function usePulseScrollRefresh(options: UsePulseScrollRefreshOptions = {}) {
  const { onRefreshed } = options;
  const meta = useDisguiseWorld();
  const [refreshing, setRefreshing] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);
  const gateRef = useRef(false);
  const hasScrolledRef = useRef(false);
  const endReachedDuringMomentumRef = useRef(true);
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

  const runRefresh = useCallback(
    async (mode: RefreshMode): Promise<boolean> => {
      if (gateRef.current || refreshing) {
        return false;
      }
      if (mode === 'end' && !hasScrolledRef.current) {
        return false;
      }

      gateRef.current = true;
      setRefreshing(true);
      try {
        await refreshPulseLiveNews({ force: true });
        bumpPulseFeedRefreshGeneration();
        setJustUpdated(true);
        onRefreshed?.();
        return true;
      } finally {
        setRefreshing(false);
        gateRef.current = false;
      }
    },
    [onRefreshed, refreshing],
  );

  const refresh = useCallback(() => runRefresh('pull'), [runRefresh]);

  const triggerRefresh = useCallback(() => {
    void runRefresh('end');
  }, [runRefresh]);

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

  const handleFlatListEndReached = useCallback(() => {
    if (endReachedDuringMomentumRef.current) {
      return;
    }
    endReachedDuringMomentumRef.current = true;
    triggerRefresh();
  }, [triggerRefresh]);

  const handleFlatListMomentumScrollBegin = useCallback(() => {
    endReachedDuringMomentumRef.current = false;
  }, []);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={() => {
          void refresh();
        }}
        tintColor={meta.accent}
        colors={[meta.accent]}
        progressBackgroundColor="transparent"
      />
    ),
    [meta.accent, refresh, refreshing],
  );

  const flatListProps = {
    onEndReached: handleFlatListEndReached,
    onEndReachedThreshold: 0.12 as const,
    onMomentumScrollBegin: handleFlatListMomentumScrollBegin,
    onScroll: handleFlatListScroll,
    scrollEventThrottle: 16 as const,
    refreshControl,
  };

  const scrollViewProps = {
    onScroll: handleScrollViewScroll,
    scrollEventThrottle: 16 as const,
    refreshControl,
  };

  return {
    refreshing,
    justUpdated,
    refreshGeneration,
    refresh,
    triggerRefresh,
    refreshControl,
    flatListProps,
    scrollViewProps,
  };
}
