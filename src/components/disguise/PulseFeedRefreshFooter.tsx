import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../../i18n';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';

type PulseFeedRefreshFooterProps = {
  pullRefreshing?: boolean;
  loadingMore?: boolean;
  /** @deprecated use pullRefreshing + loadingMore */
  refreshing?: boolean;
  justUpdated?: boolean;
};

export function PulseFeedRefreshFooter({
  pullRefreshing = false,
  loadingMore = false,
  refreshing = false,
  justUpdated = false,
}: PulseFeedRefreshFooterProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const accent = useDisguiseWorld().accent;

  const isPull = pullRefreshing || (refreshing && !loadingMore);
  const isMore = loadingMore;

  let message = t('disguiseFeed.scrollRefreshHint');
  if (isPull) {
    message = t('disguiseFeed.pullRefreshingFeed');
  } else if (isMore) {
    message = t('disguiseFeed.loadingMoreFeed');
  } else if (justUpdated) {
    message = t('disguiseFeed.feedUpdated');
  }

  return (
    <View style={styles.footer}>
      {isPull || isMore ? <ActivityIndicator color={accent} /> : null}
      <Text style={[styles.text, { color: colors.textMuted }]}>{message}</Text>
    </View>
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
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
