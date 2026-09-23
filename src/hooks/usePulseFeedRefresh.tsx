import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  Platform,
  RefreshControl,
  ScrollView,
  type ViewStyle,
} from 'react-native';

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

export const PULSE_PULL_TRIGGER_PX = 72;
export const PULSE_PULL_MAX_PX = 108;

type UsePulseScrollRefreshOptions = {
  onRefreshed?: () => void;
  /** Spinner tint for native RefreshControl (Pulse accent). */
  refreshTintColor?: string;
};

type RefreshMode = 'pull' | 'top';

const TOP_OFFSET_THRESHOLD = 8;
const SCROLLED_DOWN_THRESHOLD = 48;
/** Prevent overscroll / tab re-press from stacking refreshes and stealing taps on web. */
const REFRESH_COOLDOWN_MS = Platform.OS === 'web' ? 700 : 500;
/** Minimum time the grey reload chrome stays visible (Instagram / YouTube). */
const PULSE_REFRESH_MIN_MS = Platform.OS === 'web' ? 360 : 320;

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

/** Let React commit refreshing state before heavy feed rebuild. */
async function yieldForRefreshChrome(): Promise<void> {
  await waitMs(0);
  await waitNextPaint();
  await waitNextPaint();
}

function deferFeedRebuild(run: () => void): Promise<void> {
  return new Promise((resolve) => {
    const exec = () => {
      run();
      resolve();
    };
    if (Platform.OS === 'web' && typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(exec, { timeout: 80 });
      return;
    }
    setTimeout(exec, 0);
  });
}

export function usePulseScrollRefresh(options: UsePulseScrollRefreshOptions = {}) {
  const { onRefreshed, refreshTintColor = '#1a73e8' } = options;
  const { dismissDisguiseLeaveConfirm } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [pullOffset, setPullOffset] = useState(0);
  const gateRef = useRef(false);
  const listRef = useRef<FlatList | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const scrollOffsetRef = useRef(0);
  const pullOffsetRef = useRef(0);
  const wasScrolledDownRef = useRef(false);
  const topArrivalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRefreshFinishedAtRef = useRef(0);
  const refreshGeneration = usePulseFeedRefreshGeneration();

  const clearTopArrivalTimer = useCallback(() => {
    if (topArrivalTimerRef.current) {
      clearTimeout(topArrivalTimerRef.current);
      topArrivalTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTopArrivalTimer(), [clearTopArrivalTimer]);

  useEffect(() => {
    pullOffsetRef.current = pullOffset;
  }, [pullOffset]);

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
      setPullOffset(0);
      setRefreshing(true);
      setFeedRefreshing(true);
      const startedAt = Date.now();
      try {
        dismissDisguiseLeaveConfirm();
        if (mode === 'top' && scrollOffsetRef.current > TOP_OFFSET_THRESHOLD) {
          scrollToTop(true);
        }
        await yieldForRefreshChrome();
        await deferFeedRebuild(() => {
          bumpPulseFeedRefreshGeneration();
        });
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

  const maybeRefreshAfterArrivingAtTop = useCallback(() => {
    clearTopArrivalTimer();
    if (
      !wasScrolledDownRef.current ||
      scrollOffsetRef.current > TOP_OFFSET_THRESHOLD ||
      refreshing ||
      gateRef.current
    ) {
      return;
    }
    wasScrolledDownRef.current = false;
    void runRefresh('top');
  }, [clearTopArrivalTimer, refreshing, runRefresh]);

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
    const debounceMs = Platform.OS === 'web' ? 90 : 0;
    topArrivalTimerRef.current = setTimeout(() => {
      topArrivalTimerRef.current = null;
      maybeRefreshAfterArrivingAtTop();
    }, debounceMs);
  }, [clearTopArrivalTimer, maybeRefreshAfterArrivingAtTop, refreshing]);

  const handleScrollMetrics = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset } = event.nativeEvent;
      const y = contentOffset.y;
      scrollOffsetRef.current = y;
      setIsAtTop(y <= TOP_OFFSET_THRESHOLD);
      if (y > SCROLLED_DOWN_THRESHOLD) {
        wasScrolledDownRef.current = true;
      }
      if (y <= TOP_OFFSET_THRESHOLD) {
        scheduleTopArrivalRefresh();
      } else {
        clearTopArrivalTimer();
      }
    },
    [clearTopArrivalTimer, scheduleTopArrivalRefresh],
  );

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

  /** Re-tap the active tab: scroll to top when scrolled; refresh when already at top (Instagram / YouTube). */
  const handleTabRepress = useCallback(() => {
    if (scrollOffsetRef.current > TOP_OFFSET_THRESHOLD) {
      wasScrolledDownRef.current = true;
      scrollToTop(true);
      return;
    }
    void runRefresh('top');
  }, [runRefresh, scrollToTop]);

  const webPullWrapperProps = useMemo(() => {
    if (Platform.OS !== 'web') {
      return {};
    }
    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) =>
        isAtTop &&
        !refreshing &&
        !gateRef.current &&
        gesture.dy > 6 &&
        Math.abs(gesture.dy) > Math.abs(gesture.dx) * 1.2,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          setPullOffset(Math.min(PULSE_PULL_MAX_PX, gesture.dy * 0.92));
        }
      },
      onPanResponderRelease: () => {
        const offset = pullOffsetRef.current;
        setPullOffset(0);
        if (offset >= PULSE_PULL_TRIGGER_PX && isAtTop && !refreshing) {
          void runRefresh('pull');
        }
      },
      onPanResponderTerminate: () => {
        setPullOffset(0);
      },
    }).panHandlers;
  }, [isAtTop, refreshing, runRefresh]);

  const feedPullTranslateStyle = useMemo((): ViewStyle | undefined => {
    if (Platform.OS !== 'web' || pullOffset <= 0) {
      return undefined;
    }
    return {
      transform: [{ translateY: pullOffset }],
    };
  }, [pullOffset]);

  const refreshControl = useMemo(() => {
    if (Platform.OS === 'web') {
      return undefined;
    }
    return (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={() => {
          void runRefresh('pull');
        }}
        tintColor={refreshTintColor}
        colors={[refreshTintColor]}
        progressBackgroundColor="#ffffff"
      />
    );
  }, [refreshTintColor, refreshing, runRefresh]);

  const flatListProps = {
    onScroll: handleFlatListScroll,
    onScrollEndDrag: maybeRefreshAfterArrivingAtTop,
    onMomentumScrollEnd: maybeRefreshAfterArrivingAtTop,
    scrollEventThrottle: 16 as const,
  };

  const scrollViewProps = {
    onScroll: handleScrollViewScroll,
    onScrollEndDrag: maybeRefreshAfterArrivingAtTop,
    onMomentumScrollEnd: maybeRefreshAfterArrivingAtTop,
    scrollEventThrottle: 16 as const,
  };

  return {
    refreshing,
    justUpdated,
    isAtTop,
    pullOffset,
    refreshGeneration,
    refresh,
    triggerTopRefresh,
    handleTabRepress,
    handleHomeTabRepress: handleTabRepress,
    scrollToTop,
    listRef,
    scrollViewRef,
    refreshControl,
    webPullWrapperProps,
    feedPullTranslateStyle,
    flatListProps,
    scrollViewProps,
  };
}
