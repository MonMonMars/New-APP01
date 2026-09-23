import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { PanResponder, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTranslation } from '../../i18n';
import { useTheme } from '../../context/ThemeContext';
import { MOTION } from '../../motion/presets';
import { webClass } from '../../motion/webMotion';
import { spacing } from '../../theme';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { PulseRefreshIndicator } from './PulseRefreshIndicator';

const PULL_TRIGGER_PX = 72;
const PULL_MAX_PX = 120;

type PulseFeedRefreshHeaderProps = {
  children?: ReactNode;
  refreshing: boolean;
  justUpdated: boolean;
  isAtTop: boolean;
  pullDistance?: number;
  refreshGeneration?: number;
  onPullRefresh: () => void;
};

/** Top-of-feed pull affordance (YouTube / Instagram style). */
export function PulseFeedRefreshHeader({
  children,
  refreshing,
  justUpdated,
  isAtTop,
  pullDistance = 0,
  refreshGeneration = 0,
  onPullRefresh,
}: PulseFeedRefreshHeaderProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const accent = useDisguiseWorld().accent;
  const pullReadyRef = useRef(false);
  const [panPull, setPanPull] = useState(0);

  const combinedPull = Math.min(PULL_MAX_PX, Math.max(pullDistance, panPull));
  const pullProgress = Math.min(1, combinedPull / PULL_TRIGGER_PX);

  const pullHeight = useSharedValue(28);
  const contentShift = useSharedValue(0);

  useEffect(() => {
    pullHeight.value = withSpring(
      refreshing ? 44 : 28 + combinedPull * 0.35,
      MOTION.spring.gentle,
    );
    contentShift.value = withTiming(
      refreshing ? 10 : Math.min(combinedPull * 0.42, 52),
      { duration: refreshing ? 220 : 140, easing: Easing.out(Easing.cubic) },
    );
  }, [combinedPull, contentShift, pullHeight, refreshing]);

  const shellStyle = useAnimatedStyle(() => ({
    minHeight: pullHeight.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentShift.value }],
  }));

  const panHandlers = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) =>
          isAtTop && !refreshing && gesture.dy > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderMove: (_, gesture) => {
          const next = Math.max(0, Math.min(PULL_MAX_PX, gesture.dy));
          setPanPull(next);
          pullReadyRef.current = next >= PULL_TRIGGER_PX;
        },
        onPanResponderRelease: () => {
          if (pullReadyRef.current && isAtTop && !refreshing) {
            onPullRefresh();
          }
          pullReadyRef.current = false;
          setPanPull(0);
        },
        onPanResponderTerminate: () => {
          pullReadyRef.current = false;
          setPanPull(0);
        },
      }).panHandlers,
    [isAtTop, onPullRefresh, refreshing],
  );

  let status = t('disguiseFeed.pullRefreshHint');
  if (refreshing) {
    status = t('disguiseFeed.refreshingFeed');
  } else if (justUpdated) {
    status = t('disguiseFeed.feedUpdated');
  } else if (pullProgress >= 1) {
    status = t('disguiseFeed.releaseToRefresh');
  }

  return (
    <View pointerEvents="box-none" style={refreshing ? styles.refreshingHost : undefined}>
      <Animated.View style={[styles.pullShell, shellStyle]}>
        <View
          {...panHandlers}
          style={styles.pullRow}
          accessibilityLiveRegion="polite"
          collapsable={false}
        >
          <PulseRefreshIndicator
            pullProgress={pullProgress}
            refreshing={refreshing}
            color={accent}
          />
          <Text
            style={[
              styles.pullText,
              { color: colors.textMuted },
              justUpdated ? styles.pullTextUpdated : null,
            ]}
            testID="pulse-feed-refresh-header"
          >
            {status}
          </Text>
        </View>
      </Animated.View>
      <Animated.View
        style={contentStyle}
        key={`pulse-feed-header-content-${refreshGeneration}`}
        {...(Platform.OS === 'web' && justUpdated ? webClass('spark-pulse-feed-spring') : {})}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  refreshingHost: {
    zIndex: 2,
  },
  pullShell: {
    overflow: 'visible',
  },
  pullRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs,
  },
  pullText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  pullTextUpdated: {
    fontWeight: '700',
  },
});
