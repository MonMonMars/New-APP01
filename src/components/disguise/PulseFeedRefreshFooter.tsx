import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../../i18n';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';

type PulseFeedRefreshFooterProps = {
  refreshing: boolean;
};

export function PulseFeedRefreshFooter({ refreshing }: PulseFeedRefreshFooterProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const accent = useDisguiseWorld().accent;

  return (
    <View style={styles.footer}>
      {refreshing ? (
        <>
          <ActivityIndicator color={accent} />
          <Text style={[styles.text, { color: colors.textMuted }]}>
            {t('disguiseFeed.refreshingProfiles')}
          </Text>
        </>
      ) : (
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          {t('disguiseFeed.scrollRefreshHint')}
        </Text>
      )}
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
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});
