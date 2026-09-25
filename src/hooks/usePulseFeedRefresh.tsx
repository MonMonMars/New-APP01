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

const TOP_OFFSET_THRESHOLD = 16;
/** User must leave the top zone before a scroll-back counts as “return to top”. */
const SCROLLED_DOWN_THRESHOLD = 32;
const TOP_OVERSCROLL_THRESHOLD =
  Platform.OS === 'ios' ? -48 : Platform.OS === 'web' ? -20 : -32;
const TOP_ARRIVAL_DEBOUNCE_MS = Platform.OS === 'web' ? 280 : 120;
/** Scroll stopped at top — backup when drag/momentum end does not fire (common on web). */
const SCROLL_SETTLE_AT_TOP_MS = Platform.OS === 'web' ? 200 : 120;
const TAB_SCROLL_TO_TOP_REFRESH_FALLBACK_MS = Platform.OS === 'web' ? 450 : 340;
/** Prevent overscroll / tab re-press from stacking refreshes and stealing taps on web. */
const REFRESH_COOLDOWN_MS = Platform.OS === 'web' ? 900 : 600;
const TOP_ARRIVAL_REFRESH_COOLDOWN_MS = Platform.OS === 'web' ? 420 : 320;
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
  const refreshingRef = useRef(false);
  const [justUpdated, setJustUpdated] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [pullDistance, setPullDistance] = useState(0);
  const gateRef = useRef(false);
  const listRef = useRef<FlatList | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const scrollOffsetRef = useRef(0);
  const wasScrolledDownRef = useRef(false);
  const topArrivalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollSettleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabScrollToTopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    refreshingRef.current = refreshing;
  }, [refreshing]);

  const clearScrollSettleTimer = useCallback(() => {
    if (scrollSettleTimerRef.current) {
      clearTimeout(scrollSettleTimerRef.current);
      scrollSettleTimerRef.current = null;
    }
  }, []);

  const clearTabScrollToTopTimer = useCallback(() => {
    if (tabScrollToTopTimerRef.current) {
      clearTimeout(tabScrollToTopTimerRef.current);
      tabScrollToTopTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTopArrivalTimer();
      clearScrollSettleTimer();
      clearTabScrollToTopTimer();
      if (persistScrollTimerRef.current) {
        clearTimeout(persistScrollTimerRef.current);
      }
    };
  }, [clearScrollSettleTimer, clearTabScrollToTopTimer, clearTopArrivalTimer]);

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
      if (gateRef.current || refreshingRef.current) {
        return false;
      }
      const sinceLast = Date.now() - lastRefreshFinishedAtRef.current;
      const cooldown =
        mode === 'top' ? TOP_ARRIVAL_REFRESH_COOLDOWN_MS : REFRESH_COOLDOWN_MS;
      if (sinceLast < cooldown) {
        return false;
      }

      gateRef.current = true;
      refreshingRef.current = true;
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
        wasScrolledDownRef.current = false;
        setJustUpdated(true);
        return true;
      } finally {
        setRefreshing(false);
        refreshingRef.current = false;
        setFeedRefreshing(false);
        gateRef.current = false;
        lastRefreshFinishedAtRef.current = Date.now();
      }
    },
    [dismissDisguiseLeaveConfirm, onRefreshed, scrollToTop],
  );

  const refresh = useCallback(() => runRefresh('pull'), [runRefresh]);

  const triggerTopRefresh = useCallback(() => {
    void runRefresh('top');
  }, [runRefresh]);

  const scheduleTopArrivalRefresh = useCallback(() => {
    if (
      !wasScrolledDownRef.current ||
      scrollOffsetRef.current > TOP_OFFSET_THRESHOLD ||
      refreshingRef.current ||
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
        !refreshingRef.current &&
        !gateRef.current
      ) {
        wasScrolledDownRef.current = false;
        void runRefresh('top');
      }
    }, TOP_ARRIVAL_DEBOUNCE_MS);
  }, [clearTopArrivalTimer, runRefresh]);

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

      if (y > SCROLLED_DOWN_THRESHOLD) {
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
        clearScrollSettleTimer();
        scrollSettleTimerRef.current = setTimeout(() => {
          scrollSettleTimerRef.current = null;
          if (
            wasScrolledDownRef.current &&
            scrollOffsetRef.current <= TOP_OFFSET_THRESHOLD &&
            !refreshingRef.current &&
            !gateRef.current
          ) {
            scheduleTopArrivalRefresh();
          }
        }, SCROLL_SETTLE_AT_TOP_MS);
      } else {
        clearTopArrivalTimer();
        clearScrollSettleTimer();
      }

      // Web overscroll pull is handled by PulseFeedRefreshHeader; auto-overscroll here steals taps.
      if (
        Platform.OS !== 'web' &&
        !refreshingRef.current &&
        y <= TOP_OVERSCROLL_THRESHOLD
      ) {
        void runRefresh('pull');
      }
    },
    [
      clearScrollSettleTimer,
      clearTopArrivalTimer,
      onPersistScrollOffset,
      runRefresh,
      scheduleTopArrivalRefresh,
    ],
  );

  const maybeRefreshAfterScrollToTop = useCallback(() => {
    clearTopArrivalTimer();
    clearScrollSettleTimer();
    if (
      wasScrolledDownRef.current &&
      scrollOffsetRef.current <= TOP_OFFSET_THRESHOLD &&
      !refreshingRef.current &&
      !gateRef.current
    ) {
      wasScrolledDownRef.current = false;
      void runRefresh('top');
    }
  }, [clearScrollSettleTimer, clearTopArrivalTimer, runRefresh]);

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
      clearTabScrollToTopTimer();
      tabScrollToTopTimerRef.current = setTimeout(() => {
        tabScrollToTopTimerRef.current = null;
        maybeRefreshAfterScrollToTop();
      }, TAB_SCROLL_TO_TOP_REFRESH_FALLBACK_MS);
      return;
    }
    void runRefresh('top');
  }, [clearTabScrollToTopTimer, maybeRefreshAfterScrollToTop, runRefresh, scrollToTop]);

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
