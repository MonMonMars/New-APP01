import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, Platform, ScrollView } from 'react-native';

import { useApp } from '../context/AppContext';
import { refreshPulseLiveNews } from '../services/pulseLiveNews';

let refreshGeneration = 0;
const subscribers = new Set<() => void>();

let feedRefreshing = false;
const refreshingSubscribers = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
}

function subscribeRefreshing(listener: () => void): () => void {
  refreshingSubscribers.add(listener);
  return () => {
    refreshingSubscribers.delete(listener);
  };
}

function getRefreshGenerationSnapshot(): number {
  return refreshGeneration;
}

function getFeedRefreshingSnapshot(): boolean {
  return feedRefreshing;
}

function notifyRefreshSubscribers(): void {
  subscribers.forEach((listener) => listener());
}

function setFeedRefreshing(next: boolean): void {
  if (feedRefreshing === next) {
    return;
  }
  feedRefreshing = next;
  refreshingSubscribers.forEach((listener) => listener());
}

/** True while any Pulse tab is running a feed reload (dims tab bar + feed). */
export function usePulseFeedRefreshing(): boolean {
  return useSyncExternalStore(
    subscribeRefreshing,
    getFeedRefreshingSnapshot,
    getFeedRefreshingSnapshot,
  );
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
  initialScrollOffset?: number;
  onPersistScrollOffset?: (offsetY: number) => void;
};

type RefreshMode = 'pull' | 'top';

const TOP_OFFSET_THRESHOLD = 8;
const TOP_OVERSCROLL_THRESHOLD =
  Platform.OS === 'ios' ? -48 : Platform.OS === 'web' ? -20 : -32;
const TOP_ARRIVAL_DEBOUNCE_MS = Platform.OS === 'web' ? 280 : 120;
/** Prevent overscroll / tab re-press from stacking refreshes and stealing taps on web. */
const REFRESH_COOLDOWN_MS = Platform.OS === 'web' ? 900 : 600;
/** Visible grey reload — matches Instagram / YouTube pull-to-refresh timing. */
const PULSE_REFRESH_MIN_MS = Platform.OS === 'web' ? 620 : 560;

function waitNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function usePulseScrollRefresh(options: UsePulseScrollRefreshOptions = {}) {
  const { onRefreshed, initialScrollOffset = 0, onPersistScrollOffset } = options;
  const { dismissDisguiseLeaveConfirm } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [pullDistance, setPullDistance] = useState(0);
  const gateRef = useRef(false);
  const listRef = useRef<FlatList | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const scrollOffsetRef = useRef(0);
  const wasScrolledDownRef = useRef(false);
  const topArrivalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRefreshFinishedAtRef = useRef(0);
  const persistScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoredScrollRef = useRef(false);
  const refreshGeneration = usePulseFeedRefreshGeneration();

  useEffect(() => {
    if (restoredScrollRef.current || initialScrollOffset <= 0) {
      return;
    }
    restoredScrollRef.current = true;
    scrollOffsetRef.current = initialScrollOffset;
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: initialScrollOffset, animated: false });
      scrollViewRef.current?.scrollTo({ y: initialScrollOffset, animated: false });
    });
  }, [initialScrollOffset]);

  const clearTopArrivalTimer = useCallback(() => {
    if (topArrivalTimerRef.current) {
      clearTimeout(topArrivalTimerRef.current);
      topArrivalTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTopArrivalTimer();
      if (persistScrollTimerRef.current) {
        clearTimeout(persistScrollTimerRef.current);
      }
    };
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
      const sinceLast = Date.now() - lastRefreshFinishedAtRef.current;
      if (sinceLast < REFRESH_COOLDOWN_MS) {
        return false;
      }

      gateRef.current = true;
      setPullDistance(0);
      setRefreshing(true);
      setFeedRefreshing(true);
      const startedAt = Date.now();
      try {
        dismissDisguiseLeaveConfirm();
        scrollToTop(true);
        await waitNextPaint();
        bumpPulseFeedRefreshGeneration();
        onRefreshed?.();
        void refreshPulseLiveNews({ force: true }).catch(() => undefined);
        const elapsed = Date.now() - startedAt;
        const remain = PULSE_REFRESH_MIN_MS - elapsed;
        if (remain > 0) {
          await waitMs(remain);
        }
        setJustUpdated(true);
        return true;
      } finally {
        setRefreshing(false);
        setFeedRefreshing(false);
        gateRef.current = false;
        lastRefreshFinishedAtRef.current = Date.now();
      }
    },
    [dismissDisguiseLeaveConfirm, onRefreshed, refreshing, scrollToTop],
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
      if (y < 0 && y <= TOP_OFFSET_THRESHOLD) {
        setPullDistance(Math.min(120, -y));
      } else if (y >= 0) {
        setPullDistance(0);
      }

      if (y > 48) {
        wasScrolledDownRef.current = true;
      }

      if (onPersistScrollOffset) {
        if (persistScrollTimerRef.current) {
          clearTimeout(persistScrollTimerRef.current);
        }
        persistScrollTimerRef.current = setTimeout(() => {
          persistScrollTimerRef.current = null;
          onPersistScrollOffset(y);
        }, 350);
      }

      if (y <= TOP_OFFSET_THRESHOLD) {
        scheduleTopArrivalRefresh();
      } else {
        clearTopArrivalTimer();
      }

      // Web overscroll pull is handled by PulseFeedRefreshHeader; auto-overscroll here steals taps.
      if (
        Platform.OS !== 'web' &&
        !refreshing &&
        y <= TOP_OVERSCROLL_THRESHOLD
      ) {
        void runRefresh('pull');
      }
    },
    [clearTopArrivalTimer, onPersistScrollOffset, refreshing, runRefresh, scheduleTopArrivalRefresh],
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

  const flatListProps = {
    onScroll: handleFlatListScroll,
    onScrollEndDrag: maybeRefreshAfterScrollToTop,
    onMomentumScrollEnd: maybeRefreshAfterScrollToTop,
    scrollEventThrottle: 16 as const,
  };

  const scrollViewProps = {
    onScroll: handleScrollViewScroll,
    onScrollEndDrag: maybeRefreshAfterScrollToTop,
    onMomentumScrollEnd: maybeRefreshAfterScrollToTop,
    scrollEventThrottle: 16 as const,
  };

  return {
    refreshing,
    justUpdated,
    isAtTop,
    pullDistance,
    refreshGeneration,
    refresh,
    triggerTopRefresh,
    handleTabRepress,
    handleHomeTabRepress: handleTabRepress,
    scrollToTop,
    listRef,
    scrollViewRef,
    refreshControl: undefined,
    flatListProps,
    scrollViewProps,
  };
}
