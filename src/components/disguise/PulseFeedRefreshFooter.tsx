import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../../i18n';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';

type PulseFeedRefreshFooterProps = {
  refreshing: boolean;
  justUpdated?: boolean;
};

export function PulseFeedRefreshFooter({ refreshing, justUpdated = false }: PulseFeedRefreshFooterProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const accent = useDisguiseWorld().accent;

  let message = t('disguiseFeed.scrollRefreshHint');
  if (refreshing) {
    message = t('disguiseFeed.refreshingFeed');
  } else if (justUpdated) {
    message = t('disguiseFeed.feedUpdated');
  }

  return (
    <View style={styles.footer}>
      {refreshing ? <ActivityIndicator color={accent} /> : null}
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
