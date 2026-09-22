import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../../i18n';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme';
import { PULSE_TAB_BAR_HEIGHT } from '../../theme/pulseFeedLayout';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { AnimatedPressable } from '../AnimatedPressable';

type PulseFeedRefreshFooterProps = {
  refreshing: boolean;
  justUpdated?: boolean;
  loadingMore?: boolean;
  /** `loadMore` = infinite scroll footer; `refresh` = tap to reload (profile/settings scroll). */
  variant?: 'loadMore' | 'refresh';
  onPressRefresh?: () => void;
};

export function PulseFeedRefreshFooter({
  refreshing,
  justUpdated = false,
  loadingMore = false,
  variant = 'loadMore',
  onPressRefresh,
}: PulseFeedRefreshFooterProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const accent = useDisguiseWorld().accent;

  let message =
    variant === 'refresh' ? t('disguiseFeed.scrollRefreshHint') : t('disguiseFeed.scrollLoadMoreHint');
  if (refreshing) {
    message = t('disguiseFeed.refreshingFeed');
  } else if (loadingMore) {
    message = t('disguiseFeed.loadingMore');
  } else if (justUpdated) {
    message = t('disguiseFeed.feedUpdated');
  }

  const body = (
    <>
      {refreshing || loadingMore ? <ActivityIndicator color={accent} /> : null}
      <Text style={[styles.text, { color: colors.textMuted }]}>{message}</Text>
    </>
  );

  if (!onPressRefresh || refreshing || loadingMore) {
    return <View style={styles.footer}>{body}</View>;
  }

  return (
    <AnimatedPressable
      style={styles.footer}
      onPress={onPressRefresh}
      accessibilityRole="button"
      accessibilityLabel={t('disguiseFeed.refreshFeedA11y')}
      accessibilityHint={message}
      testID="pulse-feed-refresh-footer"
    >
      {body}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    minHeight: 72,
    marginBottom: PULSE_TAB_BAR_HEIGHT + spacing.sm,
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
