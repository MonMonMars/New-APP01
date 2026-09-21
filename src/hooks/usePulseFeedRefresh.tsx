import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  RefreshControl,
  ScrollView,
} from 'react-native';

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

type RefreshMode = 'pull' | 'top';

const TOP_OFFSET_THRESHOLD = 8;
const TOP_OVERSCROLL_THRESHOLD =
  Platform.OS === 'ios' ? -48 : Platform.OS === 'web' ? -20 : -32;
const TOP_ARRIVAL_DEBOUNCE_MS = Platform.OS === 'web' ? 280 : 120;

export function usePulseScrollRefresh(options: UsePulseScrollRefreshOptions = {}) {
  const { onRefreshed } = options;
  const meta = useDisguiseWorld();
  const [refreshing, setRefreshing] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const gateRef = useRef(false);
  const listRef = useRef<FlatList | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const scrollOffsetRef = useRef(0);
  const wasScrolledDownRef = useRef(false);
  const topArrivalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshGeneration = usePulseFeedRefreshGeneration();

  const clearTopArrivalTimer = useCallback(() => {
    if (topArrivalTimerRef.current) {
      clearTimeout(topArrivalTimerRef.current);
      topArrivalTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTopArrivalTimer();
  }, [clearTopArrivalTimer]);

  useEffect(() => {
    if (!justUpdated) {
      return;
    }
    const timer = setTimeout(() => setJustUpdated(false), 2400);
    return () => clearTimeout(timer);
  }, [justUpdated]);

  const scrollToTop = useCallback((animated = true) => {
    if (listRef.current) {
      listRef.current.scrollToOffset({ offset: 0, animated });
      return;
    }
    scrollViewRef.current?.scrollTo({ y: 0, animated });
  }, []);

  const runRefresh = useCallback(
    async (mode: RefreshMode): Promise<boolean> => {
      if (gateRef.current || refreshing) {
        return false;
      }

      gateRef.current = true;
      setRefreshing(true);
      try {
        await refreshPulseLiveNews({ force: true });
        bumpPulseFeedRefreshGeneration();
        setJustUpdated(true);
        scrollToTop(true);
        onRefreshed?.();
        return true;
      } finally {
        setRefreshing(false);
        gateRef.current = false;
      }
    },
    [onRefreshed, refreshing, scrollToTop],
  );

  const refresh = useCallback(() => runRefresh('pull'), [runRefresh]);

  const triggerTopRefresh = useCallback(() => {
    void runRefresh('top');
  }, [runRefresh]);

  const scheduleTopArrivalRefresh = useCallback(() => {
    if (
      !wasScrolledDownRef.current ||
      scrollOffsetRef.current > TOP_OFFSET_THRESHOLD ||
      refreshing ||
      gateRef.current
    ) {
      return;
    }
    clearTopArrivalTimer();
    topArrivalTimerRef.current = setTimeout(() => {
      topArrivalTimerRef.current = null;
      if (
        wasScrolledDownRef.current &&
        scrollOffsetRef.current <= TOP_OFFSET_THRESHOLD &&
        !refreshing &&
        !gateRef.current
      ) {
        wasScrolledDownRef.current = false;
        void runRefresh('top');
      }
    }, TOP_ARRIVAL_DEBOUNCE_MS);
  }, [clearTopArrivalTimer, refreshing, runRefresh]);

  const handleScrollMetrics = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset } = event.nativeEvent;
      const y = contentOffset.y;
      scrollOffsetRef.current = y;
      setIsAtTop(y <= TOP_OFFSET_THRESHOLD);

      if (y > 48) {
        wasScrolledDownRef.current = true;
      }

      if (y <= TOP_OFFSET_THRESHOLD) {
        scheduleTopArrivalRefresh();
      } else {
        clearTopArrivalTimer();
      }

      if (!refreshing && y <= TOP_OVERSCROLL_THRESHOLD) {
        void runRefresh('pull');
      }
    },
    [clearTopArrivalTimer, refreshing, runRefresh, scheduleTopArrivalRefresh],
  );

  const maybeRefreshAfterScrollToTop = useCallback(() => {
    clearTopArrivalTimer();
    if (
      wasScrolledDownRef.current &&
      scrollOffsetRef.current <= TOP_OFFSET_THRESHOLD &&
      !refreshing &&
      !gateRef.current
    ) {
      wasScrolledDownRef.current = false;
      void runRefresh('top');
    }
  }, [clearTopArrivalTimer, refreshing, runRefresh]);

  const handleFlatListScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      handleScrollMetrics(event);
    },
    [handleScrollMetrics],
  );

  const handleScrollViewScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      handleScrollMetrics(event);
    },
    [handleScrollMetrics],
  );

  /** Re-tap the active tab at top → refresh; while scrolled → scroll to top (arrival refresh follows). */
  const handleTabRepress = useCallback(() => {
    if (scrollOffsetRef.current > TOP_OFFSET_THRESHOLD) {
      scrollToTop(true);
      return;
    }
    void runRefresh('top');
  }, [runRefresh, scrollToTop]);

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
    onScroll: handleFlatListScroll,
    onScrollEndDrag: maybeRefreshAfterScrollToTop,
    onMomentumScrollEnd: maybeRefreshAfterScrollToTop,
    scrollEventThrottle: 16 as const,
    refreshControl,
  };

  const scrollViewProps = {
    onScroll: handleScrollViewScroll,
    onScrollEndDrag: maybeRefreshAfterScrollToTop,
    onMomentumScrollEnd: maybeRefreshAfterScrollToTop,
    scrollEventThrottle: 16 as const,
    refreshControl,
  };

  return {
    refreshing,
    justUpdated,
    isAtTop,
    refreshGeneration,
    refresh,
    triggerTopRefresh,
    handleTabRepress,
    handleHomeTabRepress: handleTabRepress,
    scrollToTop,
    listRef,
    scrollViewRef,
    refreshControl,
    flatListProps,
    scrollViewProps,
  };
}
