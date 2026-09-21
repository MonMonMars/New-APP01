import { ActivityIndicator, PanResponder, StyleSheet, Text, View } from 'react-native';
import { useMemo, useRef, type ReactNode } from 'react';

import { useTranslation } from '../../i18n';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';

const PULL_TRIGGER_PX = 72;

type PulseFeedRefreshHeaderProps = {
  children?: ReactNode;
  refreshing: boolean;
  justUpdated: boolean;
  isAtTop: boolean;
  onPullRefresh: () => void;
};

/** Top-of-feed pull affordance (Instagram / YouTube style) — works on web where RefreshControl is weak. */
export function PulseFeedRefreshHeader({
  children,
  refreshing,
  justUpdated,
  isAtTop,
  onPullRefresh,
}: PulseFeedRefreshHeaderProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const accent = useDisguiseWorld().accent;
  const pullReadyRef = useRef(false);

  const panHandlers = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          isAtTop && !refreshing && gesture.dy > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderMove: (_, gesture) => {
          pullReadyRef.current = gesture.dy >= PULL_TRIGGER_PX;
        },
        onPanResponderRelease: () => {
          if (pullReadyRef.current && isAtTop && !refreshing) {
            onPullRefresh();
          }
          pullReadyRef.current = false;
        },
        onPanResponderTerminate: () => {
          pullReadyRef.current = false;
        },
      }).panHandlers,
    [isAtTop, onPullRefresh, refreshing],
  );

  let status = t('disguiseFeed.pullRefreshHint');
  if (refreshing) {
    status = t('disguiseFeed.refreshingFeed');
  } else if (justUpdated) {
    status = t('disguiseFeed.feedUpdated');
  }

  return (
    <View {...panHandlers}>
      <View style={styles.pullRow} accessibilityLiveRegion="polite">
        {refreshing ? <ActivityIndicator color={accent} size="small" /> : null}
        <Text
          style={[styles.pullText, { color: colors.textMuted }]}
          testID="pulse-feed-refresh-header"
        >
          {status}
        </Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  pullRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    minHeight: 28,
  },
  pullText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
