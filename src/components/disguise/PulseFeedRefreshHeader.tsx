import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { useTranslation } from '../../i18n';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { PULSE_PULL_TRIGGER_PX } from '../../hooks/usePulseFeedRefresh';

type PulseFeedRefreshHeaderProps = {
  children?: ReactNode;
  refreshing: boolean;
  justUpdated: boolean;
  isAtTop: boolean;
  pullOffset?: number;
  onPullRefresh: () => void;
};

/** Top-of-feed status row — pairs with native RefreshControl or web pull wrapper (Instagram / YouTube). */
export function PulseFeedRefreshHeader({
  children,
  refreshing,
  justUpdated,
  isAtTop,
  pullOffset = 0,
  onPullRefresh: _onPullRefresh,
}: PulseFeedRefreshHeaderProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const accent = useDisguiseWorld().accent;

  const pullReady = pullOffset >= PULSE_PULL_TRIGGER_PX;

  let status = t('disguiseFeed.pullRefreshHint');
  if (refreshing) {
    status = t('disguiseFeed.refreshingFeed');
  } else if (justUpdated) {
    status = t('disguiseFeed.feedUpdated');
  } else if (pullReady && isAtTop) {
    status = t('disguiseFeed.releaseToRefresh');
  } else if (pullOffset > 12 && isAtTop) {
    status = t('disguiseFeed.pullRefreshHint');
  }

  const pullProgress = Math.min(1, pullOffset / PULSE_PULL_TRIGGER_PX);
  const indicatorPadding = refreshing ? spacing.sm : Math.max(spacing.xs, pullOffset * 0.35);

  return (
    <View pointerEvents="box-none" style={refreshing ? styles.refreshingHost : undefined}>
      <View
        style={[styles.pullRow, { paddingTop: indicatorPadding, minHeight: 28 + indicatorPadding }]}
        accessibilityLiveRegion="polite"
        collapsable={false}
      >
        {refreshing || pullOffset > 8 ? (
          <ActivityIndicator
            color={accent}
            size="small"
            animating={refreshing || pullOffset > 8}
            style={{ opacity: refreshing ? 1 : 0.35 + pullProgress * 0.65 }}
          />
        ) : null}
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
  refreshingHost: {
    zIndex: 2,
  },
  pullRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  pullText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
