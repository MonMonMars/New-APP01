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
  onPressRefresh?: () => void;
};

export function PulseFeedRefreshFooter({
  refreshing,
  justUpdated = false,
  onPressRefresh,
}: PulseFeedRefreshFooterProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const accent = useDisguiseWorld().accent;

  let message = t('disguiseFeed.scrollRefreshHint');
  if (refreshing) {
    message = t('disguiseFeed.refreshingFeed');
  } else if (justUpdated) {
    message = t('disguiseFeed.feedUpdated');
  }

  const body = (
    <>
      {refreshing ? <ActivityIndicator color={accent} /> : null}
      <Text style={[styles.text, { color: colors.textMuted }]}>{message}</Text>
    </>
  );

  if (!onPressRefresh || refreshing) {
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
